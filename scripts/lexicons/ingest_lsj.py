"""
HERMENEIA — Ingestão do LSJ (Liddell-Scott-Jones Greek Lexicon)

Fonte: PerseusDL/lexica (TEI XML, headwords em beta code).
Converte beta code → grego unicode e indexa em hermeneia_lexicon_entries
sob language_id='classical_greek' (koine e clássico compartilham o LSJ; o
lookup cobre ambos). A chave de match (lemma_consonantal) usa greek_bare —
a MESMA função aplicada no runtime — garantindo casamento.

Dependência só-de-ingestão: betacode (+ pygtrie). A API publicada não precisa.

Uso:
  python scripts/lexicons/ingest_lsj.py
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
from betacode import conv

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from api.pipeline.rag import greek_bare

load_dotenv()

LSJ_DIR = Path("data/lexicons/lsj")
LSJ_URL = ("https://raw.githubusercontent.com/PerseusDL/lexica/master/"
           "CTS_XML_TEI/perseus/pdllex/grc/lsj/grc.lsj.perseus-eng{n}.xml")


def download_all() -> list[Path]:
    """Baixa eng1..engN até dar 404. Pula os já baixados."""
    LSJ_DIR.mkdir(parents=True, exist_ok=True)
    files = []
    n = 1
    while True:
        path = LSJ_DIR / f"lsj{n}.xml"
        if not path.exists():
            url = LSJ_URL.format(n=n)
            try:
                print(f"  baixando eng{n}...")
                urllib.request.urlretrieve(url, path)
            except urllib.error.HTTPError as e:
                if e.code == 404:
                    break
                raise
        files.append(path)
        n += 1
        if n > 30:  # guarda contra loop infinito
            break
    return files


def _clean(s: str) -> str:
    return re.sub(r"\s+", " ", s or "").strip()


def parse_entry(e) -> dict | None:
    key = (e.get("key") or "").strip().rstrip("0123456789")
    if not key:
        return None
    try:
        lemma = conv.beta_to_uni(key)
    except Exception:
        return None
    bare = greek_bare(lemma)
    if not bare:
        return None

    glosses = []
    for tr in e.findall(".//tr"):
        t = _clean("".join(tr.itertext()))
        if t and re.search(r"[A-Za-z]", t) and len(t) <= 60:
            glosses.append(t)
        if len(glosses) >= 6:
            break
    if not glosses:
        return None  # sem glosa inglesa clara → baixo valor, descarta

    pos_el = e.find(".//pos") or e.find(".//gen") or e.find(".//itype")
    pos = _clean(pos_el.text) if pos_el is not None and pos_el.text else None

    return {
        "language_id": "classical_greek",
        "lexicon": "LSJ",
        "lemma": lemma,
        "lemma_consonantal": bare,
        "transliteration": None,
        "gloss_primary": glosses[0],
        "glosses": glosses,
        "semantic_range": "; ".join(glosses),
        "attestation_count": None,
        "is_hapax": False,
        "parallel_passages": [],
        "controversy_notes": None,
        "source_citation": "LSJ (Liddell-Scott-Jones)",
        "raw_entry": {"id": e.get("id"), "key": key, "pos": pos},
    }


def parse_file(path: Path) -> list[dict]:
    root = ET.parse(path).getroot()
    rows = []
    for e in root.findall(".//entryFree"):
        row = parse_entry(e)
        if row:
            rows.append(row)
    return rows


def ingest():
    sb = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_KEY"])
    files = download_all()
    print(f"{len(files)} arquivos LSJ.")

    seen: dict[str, dict] = {}
    for path in files:
        rows = parse_file(path)
        for r in rows:
            seen.setdefault(r["lemma"], r)  # dedup por lema; mantém o primeiro
        print(f"  {path.name}: {len(rows)} entradas (acumulado únicos: {len(seen)})")

    all_rows = list(seen.values())
    print(f"Total {len(all_rows)} lemas LSJ únicos. Inserindo...")

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
            if inserted % 2000 == 0 or inserted == len(all_rows):
                print(f"  ✓ {inserted}/{len(all_rows)}")
        except Exception as e:
            print(f"  ✗ batch {i}: {e}")

    print(f"✓ Ingestão LSJ: {inserted} entradas processadas")


if __name__ == "__main__":
    ingest()
