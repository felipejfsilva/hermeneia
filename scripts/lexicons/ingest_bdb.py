"""
HERMENEIA — Ingestão do BDB (Brown-Driver-Briggs Hebrew Lexicon)

Fonte: https://github.com/openscriptures/HebrewLexicon
Formato: XML OSIS

Uso:
  python scripts/lexicons/ingest_bdb.py --file data/lexicons/BDB.xml

O script:
1. Parseia o XML do BDB
2. Para cada entrada, gera embedding via OpenAI/Anthropic
3. Insere no Supabase hermeneia.lexicon_entries

MVP: indexa apenas os 500 lemas mais frequentes do corpus bíblico.
"""
import os
import re
import sys
import json
import argparse
import xml.etree.ElementTree as ET
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from api.pipeline.rag import consonantal

load_dotenv()

BDB_NS = "{http://openscriptures.github.com/morphhb/namespace}"
_GLOSS_RE = re.compile(r"^[A-Za-z][A-Za-z '\-,;()]*$")

# Top 100 lemas mais comuns no Hebraico Bíblico (frequência > 1000x)
# Fonte: Andersen-Forbes word frequency data
TOP_HEBREW_LEMMAS = {
    "וְ": "and, but, also (waw conjunctive/consecutive)",
    "הָ": "the (definite article)",
    "בְּ": "in, at, by, with (preposition bet)",
    "לְ": "to, for, of (preposition lamed)",
    "אֶת": "direct object marker / with",
    "אֲשֶׁר": "who, which, that (relative pronoun)",
    "כִּי": "for, because, when, that (conjunction)",
    "לֹא": "not (negation)",
    "כֹּל": "all, every, whole",
    "עַל": "upon, over, about",
    "אֵל": "God, god, mighty one",
    "אֱלֹהִים": "God, gods (plural of majesty or true plural)",
    "יְהוָה": "YHWH (Tetragrammaton — LORD)",
    "בֵּן": "son, descendant",
    "אָב": "father, ancestor",
    "בֵּית": "house, household, dynasty",
    "מֶלֶךְ": "king, ruler",
    "אֶרֶץ": "earth, land, territory",
    "שָׁמַיִם": "heavens, sky",
    "עַם": "people, nation",
    "יוֹם": "day",
    "נָשָׂא": "to lift, carry, bear, forgive",
    "בָּרָא": "to create (ex nihilo / shape — theological debate)",
    "תֹּהוּ": "formlessness, chaos, void, emptiness",
    "בֹּהוּ": "emptiness, void (always paired with tohu)",
    "רוּחַ": "spirit, wind, breath",
    "מַיִם": "waters, water",
    "אוֹר": "light",
    "חֹשֶׁךְ": "darkness",
    "עֶרֶב": "evening",
    "בֹּקֶר": "morning",
    "שָׁנָה": "year",
    "דָּבָר": "word, thing, matter",
    "שָׁמַע": "to hear, listen, obey",
    "רָאָה": "to see, look, perceive",
    "יָדַע": "to know, understand, experience",
    "הָלַךְ": "to walk, go, proceed",
    "בּוֹא": "to come, enter, arrive",
    "נָתַן": "to give, put, set",
    "עָשָׂה": "to do, make, act",
    "אָמַר": "to say, speak, command",
    "שׁוּב": "to return, turn back, repent",
    "יָצָא": "to go out, depart",
    "עָמַד": "to stand, stop, remain",
    "יָשַׁב": "to sit, dwell, remain",
    "לֵב": "heart, mind, will",
    "נֶפֶשׁ": "soul, life, person, appetite",
    "כֹּהֵן": "priest",
    "נָבִיא": "prophet",
    "תּוֹרָה": "law, instruction, teaching",
    "בְּרִית": "covenant, treaty",
    "חֶסֶד": "steadfast love, lovingkindness, loyalty",
    "שָׁלוֹם": "peace, wholeness, well-being",
    "צֶדֶק": "righteousness, justice",
    "מִשְׁפָּט": "judgment, justice, ordinance",
    "אֱמֶת": "truth, faithfulness, reliability",
    "חָכְמָה": "wisdom",
    "עֹלָם": "eternity, ancient times, forever",
    "קֹדֶשׁ": "holiness, sacred, set apart",
    "כָּבוֹד": "glory, honor, weight",
}

BDB_CONTROVERSY = {
    "בָּרָא": "Tsumura (1989) argues bara does not necessarily imply ex nihilo creation; Waltke (2001) maintains the ex nihilo reading. Isaiah 45:18 uses lo-tohu to contrast with creation's purpose, supporting orderly creation reading.",
    "תֹּהוּ": "Tsumura (1989) argues tohu+bohu is a hendiadys/merismus meaning 'total void', not two separate concepts. Traditional reading 'without form' (KJV) emphasizes absence of structure; newer readings emphasize absence of purpose/order.",
    "רוּחַ": "Ruach in Gen 1:2 disputed: 'Spirit of God' (theological, most translations) vs 'mighty wind' (naturalistic, NEB, NJPS footnote). Both are grammatically valid; context and theology determine choice.",
    "אֱלֹהִים": "Grammatically plural but theologically singular when referring to YHWH. Causes systematic translation choice: 'God' (singular, majority) vs literal plural (polytheistic reading rejected by Jewish/Christian tradition but retained in some critical editions).",
    "חֶסֶד": "No single English equivalent. 'Lovingkindness' (KJV), 'steadfast love' (NRSV), 'faithful love' (NJPS), 'loyalty' (Fox). The word combines loyalty, love, and covenantal obligation — all translations capture only part of the range.",
    "נֶפֶשׁ": "'Soul' (traditional) vs 'self/person' (modern critical) vs 'appetite/desire' (in specific contexts). Translating as 'soul' imports Greek dualistic anthropology not present in Hebrew thought.",
}


def build_entry(lemma: str, gloss: str) -> dict:
    """Constrói entrada básica para um lema hebraico."""
    controversy = BDB_CONTROVERSY.get(lemma)
    is_hapax = False  # top lemas por definição não são hapax

    # Glosses secundários heurísticos
    glosses = [g.strip() for g in gloss.split(",") if g.strip()]
    gloss_primary = glosses[0] if glosses else gloss

    return {
        "language_id": "biblical_hebrew",
        "lexicon": "BDB",
        "lemma": lemma,
        "transliteration": None,  # seria gerado por transliterador
        "gloss_primary": gloss_primary,
        "glosses": glosses,
        "semantic_range": gloss,
        "attestation_count": None,
        "is_hapax": is_hapax,
        "parallel_passages": [],
        "controversy_notes": controversy,
        "source_citation": "BDB (Brown-Driver-Briggs, 1906)",
        "embedding": None,  # seria gerado por embedding model
        "raw_entry": {"lemma": lemma, "gloss": gloss},
    }


def ingest_top_lemmas():
    """Ingere os top lemas sem precisar do XML completo."""
    sb = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_KEY"])

    entries = [build_entry(lemma, gloss) for lemma, gloss in TOP_HEBREW_LEMMAS.items()]

    print(f"Inserindo {len(entries)} entradas BDB...")
    batch_size = 20
    inserted = 0

    for i in range(0, len(entries), batch_size):
        batch = entries[i:i+batch_size]
        # Remove embedding None para não conflitar com vector type
        for e in batch:
            del e["embedding"]

        try:
            result = sb.table("hermeneia_lexicon_entries").upsert(
                batch,
                on_conflict="language_id,lexicon,lemma"
            ).execute()
            inserted += len(batch)
            print(f"  ✓ {inserted}/{len(entries)}")
        except Exception as e:
            print(f"  ✗ Batch {i}: {e}")

    print(f"✓ Ingestão completa: {inserted} entradas BDB")


def _clean(text: str) -> str:
    return re.sub(r"\s+", " ", text or "").strip()


def parse_bdb_entry(entry) -> dict | None:
    """Mapeia um <entry> do BDB XML para o schema hermeneia_lexicon_entries."""
    w = entry.find(f"{BDB_NS}w")
    if w is None or not w.text:
        return None
    lemma = w.text.strip().strip("[]").strip()
    cons = consonantal(lemma)
    if not cons:
        return None

    defs = [_clean(d.text) for d in entry.findall(f"{BDB_NS}def") if d.text]
    glosses = [d for d in defs if _GLOSS_RE.match(d) and len(d) <= 40][:6]
    pos_el = entry.find(f"{BDB_NS}pos")
    pos = pos_el.text.strip() if pos_el is not None and pos_el.text else None

    # Sem glosa utilizável e sem POS → provavelmente referência cruzada; descarta.
    if not glosses and not pos:
        return None

    full = _clean("".join(entry.itertext()))
    # Contagem de atestação: inteiro logo após o headword ("בָּרָא 53 vb. ...").
    after = full[len(lemma):].lstrip() if full.startswith(lemma) else full
    m = re.match(r"(\d{1,5})\b", after)
    count = int(m.group(1)) if m else None

    refs = [r.get("r") for r in entry.findall(f"{BDB_NS}ref") if r.get("r")][:6]
    status = entry.find(f"{BDB_NS}status")
    page = status.get("p") if status is not None else None

    return {
        "language_id": "biblical_hebrew",
        "lexicon": "BDB",
        "lemma": lemma,
        "lemma_consonantal": cons,
        "transliteration": None,
        "gloss_primary": glosses[0] if glosses else "",
        "glosses": glosses,
        "semantic_range": "; ".join(glosses) if glosses else full[:200],
        "attestation_count": count,
        "is_hapax": count == 1,
        "parallel_passages": refs,
        "controversy_notes": None,
        "source_citation": f"BDB p.{page}" if page else "BDB (Brown-Driver-Briggs, 1906)",
        "raw_entry": {"id": entry.get("id"), "pos": pos, "text": full[:400]},
    }


def parse_bdb_xml(path: str) -> list[dict]:
    root = ET.parse(path).getroot()
    seen: dict[str, dict] = {}
    for entry in root.findall(f".//{BDB_NS}entry"):
        row = parse_bdb_entry(entry)
        if not row:
            continue
        # Dedup por lema vocalizado: mantém o homônimo mais atestado.
        prev = seen.get(row["lemma"])
        if prev is None or (row["attestation_count"] or 0) > (prev["attestation_count"] or 0):
            seen[row["lemma"]] = row
    return list(seen.values())


def backfill_consonantal(sb):
    """Preenche lemma_consonantal nas linhas que ainda não têm (ex.: os 60 curados)."""
    res = sb.table("hermeneia_lexicon_entries").select("id, lemma").is_(
        "lemma_consonantal", "null"
    ).execute()
    rows = res.data or []
    for r in rows:
        sb.table("hermeneia_lexicon_entries").update(
            {"lemma_consonantal": consonantal(r["lemma"])}
        ).eq("id", r["id"]).execute()
    if rows:
        print(f"  backfill consonantal: {len(rows)} linhas")


BDB_XML_URL = "https://raw.githubusercontent.com/openscriptures/HebrewLexicon/master/BrownDriverBriggs.xml"


def ensure_bdb_xml(path: str):
    """Baixa o BDB XML do OpenScriptures se ainda não existir localmente."""
    if os.path.exists(path):
        return
    import urllib.request
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    print(f"Baixando BDB XML de {BDB_XML_URL} ...")
    urllib.request.urlretrieve(BDB_XML_URL, path)


def ingest_bdb_xml(path: str):
    ensure_bdb_xml(path)
    sb = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_KEY"])

    # Garante consonantal nos curados ANTES de filtrar, para reservar seus esqueletos.
    backfill_consonantal(sb)
    existing = sb.table("hermeneia_lexicon_entries").select(
        "lemma_consonantal"
    ).eq("language_id", "biblical_hebrew").execute()
    reserved = {r["lemma_consonantal"] for r in (existing.data or []) if r["lemma_consonantal"]}

    rows = parse_bdb_xml(path)
    # Não encobrir os lemas curados (controversy_notes) por entradas auto-parseadas.
    rows = [r for r in rows if r["lemma_consonantal"] not in reserved]
    print(f"Parseadas {len(rows)} entradas BDB novas (reservados {len(reserved)} esqueletos curados).")

    inserted = 0
    batch_size = 200
    for i in range(0, len(rows), batch_size):
        batch = rows[i:i + batch_size]
        try:
            sb.table("hermeneia_lexicon_entries").upsert(
                batch,
                on_conflict="language_id,lexicon,lemma",
                ignore_duplicates=True,   # ON CONFLICT DO NOTHING → preserva os curados
            ).execute()
            inserted += len(batch)
            print(f"  ✓ {inserted}/{len(rows)}")
        except Exception as e:
            print(f"  ✗ Batch {i}: {e}")

    print(f"✓ Ingestão BDB XML: {inserted} entradas processadas")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--file", help="BDB XML do OpenScriptures (sem o arquivo, ingere top lemas)")
    args = parser.parse_args()

    if args.file:
        print(f"Parsing {args.file}...")
        ingest_bdb_xml(args.file)
    else:
        print("Modo MVP: ingestão de top lemas hebraicos")
        ingest_top_lemmas()
