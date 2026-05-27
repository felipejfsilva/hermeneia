"""
HERMENEIA — Ingestão de consenso de traduções de referência (LLM-derivado)

Popula hermeneia_token_consensus. Para cada lema indexado, deriva como cada
tradução de referência (KJV, NRSV, NJPS, Alter, Fox, LXX, Vulgata, ESV) o
renderiza e computa, por termo, a fração de autoridade ponderada que concorda.

MVP: a derivação vem da memória do modelo → as linhas são gravadas com
provenance='llm_derived'. A v2.0 substitui por corpus alinhado real
(provenance='verified'). Os PESOS vêm da tabela hermeneia_reference_translations
(fonte única de verdade), não hardcoded.

Uso:
  python scripts/lexicons/ingest_consensus.py
  python scripts/lexicons/ingest_consensus.py --language biblical_hebrew --batch 12
"""
import os
import sys
import json
import re
import argparse
from pathlib import Path

from dotenv import load_dotenv
from anthropic import Anthropic
from supabase import create_client

# Permite importar a normalização canônica do pipeline (mesma usada na consulta)
sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from api.pipeline.rag import normalize_term, normalized_lemma
from scripts.lexicons.ingest_bdb import TOP_HEBREW_LEMMAS

load_dotenv(override=True)

client = Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

# O consenso roda sobre lemas de ALTA FREQUÊNCIA curados — não sobre o léxico
# inteiro (BDB/LSJ têm dezenas de milhares; varrer tudo é inviável e ruidoso).
CURATED_LEMMAS = {
    "biblical_hebrew": list(TOP_HEBREW_LEMMAS.keys()),
    "koine_greek": [
        "θεός", "λόγος", "κύριος", "πνεῦμα", "πίστις", "ἀγάπη", "χάρις",
        "ἁμαρτία", "σάρξ", "ψυχή", "ζωή", "θάνατος", "κόσμος", "δικαιοσύνη",
        "νόμος", "ἔργον", "σῶμα", "αἷμα", "υἱός", "πατήρ", "βασιλεία",
        "ἐκκλησία", "εὐαγγέλιον", "ἀλήθεια", "φῶς", "σκότος", "δόξα",
        "εἰρήνη", "ἐλπίς", "σωτηρία", "ἄγγελος", "διάβολος", "προφήτης",
        "ἀπόστολος", "μαθητής", "ἀρχή", "τέλος", "αἰών", "οὐρανός", "γῆ",
        "ἄρτος", "ἄνθρωπος", "καρδία", "ὁδός", "θύρα", "ἀμνός", "σταυρός",
        "ἀνάστασις", "βάπτισμα", "μετάνοια", "παράκλητος", "σοφία",
        "γνῶσις", "μυστήριον", "παρουσία", "κρίσις", "ἔλεος", "χαρά",
        "δοῦλος", "ἐντολή",
    ],
}

LANG_NAMES = {
    "biblical_hebrew": "Biblical Hebrew",
    "koine_greek":     "Koine Greek",
    "classical_greek": "Classical Greek",
    "aramaic":         "Aramaic",
    "latin":           "Classical Latin",
    "coptic":          "Coptic",
}


def get_supabase():
    return create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_KEY"])


def _parse_json(text: str) -> dict:
    text = text.strip()
    if "```" in text:
        m = re.search(r"\{.*\}", text, re.DOTALL)
        text = m.group(0) if m else text
    text = re.sub(r",\s*([}\]])", r"\1", text)
    return json.loads(text)


def fetch_lemmas(sb, language: str) -> list[dict]:
    res = sb.table("hermeneia_lexicon_entries").select(
        "lemma, gloss_primary"
    ).eq("language_id", language).execute()
    # Dedup por lemma preservando ordem
    seen, out = set(), []
    for r in res.data or []:
        if r["lemma"] not in seen:
            seen.add(r["lemma"])
            out.append(r)
    return out


def fetch_weights(sb, language: str) -> dict[str, float]:
    res = sb.table("hermeneia_reference_translations").select(
        "source_key, authority_weight"
    ).eq("language_id", language).execute()
    return {r["source_key"]: float(r["authority_weight"]) for r in (res.data or [])}


def derive_renderings(lemmas: list[dict], language: str, sources: list[str]) -> dict:
    """Uma chamada LLM para um lote de lemas → {lemma: {source: rendering}}."""
    lang_display = LANG_NAMES.get(language, language)
    lemma_lines = "\n".join(
        f'{i+1}. {l["lemma"]}  (sense: {l.get("gloss_primary","")})'
        for i, l in enumerate(lemmas)
    )
    src_list = ", ".join(sources)

    prompt = f"""You are a {lang_display} translation scholar. For each lemma below,
state the single PRIMARY English rendering used by each reference translation,
in the lemma's most common sense.

Translations: {src_list}
- For LXX (Greek) and Vulgata (Latin), give the English gloss of their rendering.
- One or two words per rendering. If a source has no standalone rendering
  (e.g. a particle it leaves untranslated), use null.

Lemmas ({lang_display}):
{lemma_lines}

Respond ONLY with a JSON object keyed by the exact lemma string:
{{
  "<lemma>": {{ {", ".join(f'"{s}": "<rendering|null>"' for s in sources)} }},
  ...
}}"""

    resp = client.messages.create(
        model="claude-sonnet-4-5",
        max_tokens=4000,
        messages=[{"role": "user", "content": prompt}],
    )
    return _parse_json(resp.content[0].text)


def build_rows(lemma: str, renderings: dict, weights: dict, language: str) -> list[dict]:
    """Agrupa renderizações por termo normalizado e computa weighted_score."""
    present = {
        src: txt for src, txt in renderings.items()
        if src in weights and txt and str(txt).lower() != "null"
    }
    if not present:
        return []

    total_weight = sum(weights[s] for s in present)
    if total_weight <= 0:
        return []

    groups: dict[str, dict] = {}
    for src, txt in present.items():
        key = normalize_term(txt)
        if not key:
            continue
        g = groups.setdefault(key, {"sources": [], "weight": 0.0})
        g["sources"].append(src)
        g["weight"] += weights[src]

    key = normalized_lemma(lemma, language) or lemma
    rows = []
    for term, g in groups.items():
        rows.append({
            "language_id": language,
            "original_token": key,
            "translation_term": term,
            "sources_agreeing": sorted(g["sources"]),
            "sources_total": len(present),
            "weighted_score": round(g["weight"] / total_weight, 4),
            "provenance": "llm_derived",
        })
    return rows


def ingest(language: str, batch_size: int):
    sb = get_supabase()
    if language in CURATED_LEMMAS:
        lemmas = [{"lemma": l, "gloss_primary": ""} for l in CURATED_LEMMAS[language]]
    else:
        lemmas = fetch_lemmas(sb, language)
    weights = fetch_weights(sb, language)

    if not lemmas:
        print(f"Nenhum lema para {language}. Rode a ingestão de léxico antes ou adicione lista curada.")
        return
    if not weights:
        print(f"Nenhuma tradução de referência para {language}.")
        return

    sources = list(weights.keys())
    print(f"{len(lemmas)} lemas · {len(sources)} fontes ({', '.join(sources)})")

    all_rows: list[dict] = []
    for i in range(0, len(lemmas), batch_size):
        batch = lemmas[i:i + batch_size]
        print(f"  derivando {i+1}-{i+len(batch)}/{len(lemmas)}...")
        try:
            derived = derive_renderings(batch, language, sources)
        except Exception as e:
            print(f"    ✗ batch falhou: {e}")
            continue
        for l in batch:
            lemma = l["lemma"]
            rend = derived.get(lemma)
            if not isinstance(rend, dict):
                print(f"    ⚠ sem renderização para {lemma}")
                continue
            all_rows.extend(build_rows(lemma, rend, weights, language))

    if not all_rows:
        print("Nada para inserir.")
        return

    # Idempotente: limpa o consenso do idioma e reinsere (chaves normalizadas).
    sb.table("hermeneia_token_consensus").delete().eq(
        "language_id", language
    ).execute()

    inserted = 0
    for i in range(0, len(all_rows), 50):
        chunk = all_rows[i:i + 50]
        sb.table("hermeneia_token_consensus").upsert(
            chunk, on_conflict="language_id,original_token,translation_term",
            ignore_duplicates=True,
        ).execute()
        inserted += len(chunk)
        print(f"  ✓ {inserted}/{len(all_rows)} linhas")

    n_lemmas = len({r["original_token"] for r in all_rows})
    print(f"✓ Consenso ingerido: {inserted} linhas para {n_lemmas} lemas")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--language", default="biblical_hebrew")
    parser.add_argument("--batch", type=int, default=12)
    args = parser.parse_args()
    ingest(args.language, args.batch)
