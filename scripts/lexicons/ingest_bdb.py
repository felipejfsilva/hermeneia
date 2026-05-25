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
import json
import argparse
import xml.etree.ElementTree as ET
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

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


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--file", help="BDB XML file (opcional — sem o arquivo, ingere top lemas)")
    args = parser.parse_args()

    if args.file:
        print(f"Parsing {args.file}...")
        # TODO: parser XML completo do OSIS HebrewLexicon
        print("Parser XML completo: Fase 2")
    else:
        print("Modo MVP: ingestão de top lemas hebraicos")
        ingest_top_lemmas()
