"""
HERMENEIA — Ingestão do Lewis & Short (Latin Dictionary)

Fonte: PerseusDL/lexica (TEI XML, 2 arquivos ~77MB). Indexa em
hermeneia_lexicon_entries sob language_id='latin'. A chave de match
(lemma_consonantal) usa latin_bare — a MESMA função do runtime.

Diferente do LSJ, o L&S não marca a glosa em <tr>: a definição inglesa está
no texto corrido, então extraímos o texto excluindo as subárvores de citação
latina (quote/cit/bibl/foreign/author/date) e a morfologia (orth/itype/gen).

Streaming via iterparse para conter memória nos arquivos grandes.

Uso:
  python scripts/lexicons/ingest_ls.py
"""
import os
import re
import sys
import urllib.request
import urllib.error
import xml.etree.ElementTree as ET
from pathlib import Path

from dotenv import load_dotenv
from supabase import create_client

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from api.pipeline.rag import latin_bare

load_dotenv()

LS_DIR = Path("data/lexicons")
LS_URL = ("https://raw.githubusercontent.com/PerseusDL/lexica/master/"
          "CTS_XML_TEI/perseus/pdllex/lat/ls/lat.ls.perseus-eng{n}.xml")

# Descartamos citações latinas/gregas, referências e etimologia (Sânscrito,
# cognatos) — só atrapalham a glosa. Mantemos a definição do texto corrido.
DROP = {"quote", "cit", "bibl", "foreign", "author", "date", "etym"}

# Classe gramatical no cabeçalho (para pular até a definição).
_POS_RE = re.compile(r"\b(?:n|v|adj|adv|f|m|pron|prep|conj|interj|num|part|a|dep|impers)\.")
# Morfologia residual à esquerda da definição ("n. and a. , orig. v. n. ,").
_LEAD_RE = re.compile(r"^(?:and|or|orig\.|sup\.|comp\.|[a-z]{1,6}\.)\s+")
_LBL_RE = re.compile(
    r"^(?:Lit\.|Trop\.|In gen\.:?|In partic\.:?|Esp\.:?|Absol\.:?|Hence,?)",
    re.IGNORECASE)


def _local(tag: str) -> str:
    return tag.rsplit("}", 1)[-1]


def _clean(s: str) -> str:
    return re.sub(r"\s+", " ", s or "").strip(" ,;:.—-")


def _strip_notes(t: str) -> str:
    """Remove notas entre parênteses/colchetes (gramática, etimologia)."""
    prev = None
    while prev != t:
        prev = t
        t = re.sub(r"\([^()]*\)", "", t)
        t = re.sub(r"\[[^\[\]]*\]", "", t)
    return _clean(t)


def _extract_gloss(text: str) -> str:
    """Pula cabeçalho morfológico, etimologia e rótulos (Lit./Trop.) → definição."""
    m = list(_POS_RE.finditer(text[:70]))
    body = text[m[0].end():] if m else text
    prev = None
    while prev != body:  # remove morfologia residual à esquerda
        prev = body
        body = body.lstrip(" .,;:—-")
        body = _LEAD_RE.sub("", body)
        body = _LBL_RE.sub("", body)
    # corta na primeira citação (colunas de ':' onde havia <quote>) ou fim de frase
    body = re.split(r"\s\.\s|\s:|:\s|—", body)[0]
    return _clean(body)


def download_all() -> list[Path]:
    LS_DIR.mkdir(parents=True, exist_ok=True)
    files, n = [], 1
    while n <= 10:
        path = LS_DIR / f"ls{n}.xml"
        if not path.exists():
            try:
                print(f"  baixando eng{n}...")
                urllib.request.urlretrieve(LS_URL.format(n=n), path)
            except urllib.error.HTTPError as e:
                if e.code == 404:
                    break
                raise
        files.append(path)
        n += 1
    return files


def _english_text(elem) -> str:
    """Texto da entrada, descartando só as citações latinas/bibliográficas."""
    parts = []

    def walk(e):
        if _local(e.tag) in DROP:
            if e.tail:
                parts.append(e.tail)
            return
        if e.text:
            parts.append(e.text)
        for c in e:
            walk(c)
        if e.tail:
            parts.append(e.tail)

    for c in elem:
        walk(c)
    return _strip_notes(" ".join(parts))


def parse_entry(e) -> dict | None:
    orth = next((c for c in e.iter() if _local(c.tag) == "orth" and c.text), None)
    headword = orth.text.strip() if orth is not None else (e.get("key") or "")
    headword = re.sub(r"\d+$", "", headword).strip()
    bare = latin_bare(headword)
    if not bare:
        return None

    text = _english_text(e)
    if len(text) < 3:
        return None

    gloss = _extract_gloss(text)
    glosses = [_clean(g) for g in re.split(r"[;,]", gloss) if _clean(g)][:6]
    primary = (glosses[0] if glosses else gloss)[:60]

    return {
        "language_id": "latin",
        "lexicon": "L&S",
        "lemma": headword,
        "lemma_consonantal": bare,
        "transliteration": None,
        "gloss_primary": primary,
        "glosses": glosses,
        "semantic_range": text[:250],
        "attestation_count": None,
        "is_hapax": False,
        "parallel_passages": [],
        "controversy_notes": None,
        "source_citation": "Lewis & Short (1879)",
        "raw_entry": {"id": e.get("id"), "key": e.get("key")},
    }


def parse_file_stream(path: Path) -> list[dict]:
    rows = []
    for _, elem in ET.iterparse(path, events=("end",)):
        if _local(elem.tag) == "entryFree":
            row = parse_entry(elem)
            if row:
                rows.append(row)
            elem.clear()
    return rows


def ingest():
    sb = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_KEY"])
    files = download_all()
    print(f"{len(files)} arquivos L&S.")

    seen: dict[str, dict] = {}
    for path in files:
        rows = parse_file_stream(path)
        for r in rows:
            seen.setdefault(r["lemma"], r)
        print(f"  {path.name}: {len(rows)} entradas (acumulado únicos: {len(seen)})")

    all_rows = list(seen.values())
    print(f"Total {len(all_rows)} lemas L&S únicos. Inserindo...")

    inserted = 0
    for i in range(0, len(all_rows), 200):
        batch = all_rows[i:i + 200]
        try:
            sb.table("hermeneia_lexicon_entries").upsert(
                batch,
                on_conflict="language_id,lexicon,lemma",
                ignore_duplicates=True,
            ).execute()
            inserted += len(batch)
            if inserted % 4000 == 0 or inserted == len(all_rows):
                print(f"  ✓ {inserted}/{len(all_rows)}")
        except Exception as e:
            print(f"  ✗ batch {i}: {e}")

    print(f"✓ Ingestão L&S: {inserted} entradas processadas")


if __name__ == "__main__":
    ingest()
