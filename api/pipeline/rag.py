"""
HERMENEIA — RAG: busca em léxicos especializados

Duas camadas:
1. Busca exata por lemma (rápida, quando o lemma está indexado)
2. Busca vetorial por similaridade semântica (quando lemma não existe ainda)

Para o MVP: se o léxico não está indexado, Claude extrai conhecimento
filológico diretamente do seu treinamento — mas com nota de que não
é citação de léxico indexado.
"""
import os
from dotenv import load_dotenv
from anthropic import Anthropic
from supabase import create_client

load_dotenv(override=True)
client = Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))


def get_supabase():
    return create_client(
        os.environ["SUPABASE_URL"],
        os.environ["SUPABASE_KEY"]
    )


_HEB_FINALS = {"ך": "כ", "ם": "מ", "ן": "נ", "ף": "פ", "ץ": "צ"}


def consonantal(lemma: str) -> str:
    """Esqueleto consonantal: só letras-base hebraicas, sem nikud/cantilação,
    com formas finais dobradas (ך→כ). Forma comum para casar vocalizações
    divergentes entre o BDB e o lema produzido pelo alinhamento."""
    out = []
    for ch in lemma or "":
        if 0x05D0 <= ord(ch) <= 0x05EA:  # álef..tav (inclui finais)
            out.append(_HEB_FINALS.get(ch, ch))
    return "".join(out)


_GREEK_LANGS = {"koine_greek", "classical_greek"}


def greek_bare(lemma: str) -> str:
    """Forma 'nua' do grego: só letras minúsculas, sem acentos/espíritos/iota
    subscrito, com sigma final normalizado (ς→σ). Casa a vocalização do LSJ
    com o lema produzido pelo alinhamento."""
    import unicodedata
    out = []
    for ch in unicodedata.normalize("NFD", (lemma or "").lower()):
        if unicodedata.combining(ch):
            continue
        if 0x03B1 <= ord(ch) <= 0x03C9:  # α..ω
            out.append("σ" if ch == "ς" else ch)
    return "".join(out)


def latin_bare(lemma: str) -> str:
    """Forma 'nua' do latim: minúsculas, sem mácrons/breves, com folding
    clássico j→i e v→u (variação ortográfica entre L&S e o lema)."""
    import unicodedata
    s = unicodedata.normalize("NFD", (lemma or "").lower())
    s = "".join(c for c in s if not unicodedata.combining(c))
    s = s.replace("j", "i").replace("v", "u")
    return "".join(c for c in s if "a" <= c <= "z")


def normalized_lemma(lemma: str, language: str) -> str:
    """Chave de match tolerante à vocalização, por família de língua."""
    if language in _GREEK_LANGS:
        return greek_bare(lemma)
    if language == "latin":
        return latin_bare(lemma)
    return consonantal(lemma)


def lookup_lexicon(lemma: str, language: str) -> list[dict]:
    """
    Busca entrada de léxico por lemma.

    1. match exato pela forma vocalizada (preserva os lemas curados)
    2. fallback pela chave normalizada (consonantal p/ hebraico, nua p/ grego),
       ordenado por frequência de atestação — tolera vocalização divergente.

    Grego: koine e clássico compartilham o LSJ, então a busca cobre ambos.
    """
    langs = list(_GREEK_LANGS) if language in _GREEK_LANGS else [language]
    try:
        sb = get_supabase()
        result = sb.table("hermeneia_lexicon_entries").select("*").in_(
            "language_id", langs
        ).eq("lemma", lemma).execute()
        if result.data:
            return result.data

        norm = normalized_lemma(lemma, language)
        if not norm:
            return []
        result = sb.table("hermeneia_lexicon_entries").select("*").in_(
            "language_id", langs
        ).eq("lemma_consonantal", norm).order(
            "attestation_count", desc=True, nullsfirst=False
        ).execute()
        return result.data or []
    except Exception:
        return []


_TERM_STOPWORDS = {
    "the", "a", "an", "of", "in", "on", "at", "by", "to", "and",
    "for", "with", "upon", "from", "as", "is", "was",
}


def _stem(w: str) -> str:
    """Stem conservador para inflexões regulares do inglês.

    Reduz plural e flexão verbal regular ao mesmo radical para que
    "created"/"create", "heavens"/"heaven", "waters"/"water" colidam.
    Verbos irregulares (make/made, see/saw) não são tratados.
    """
    if len(w) > 5 and w.endswith("ing"):
        w = w[:-3]
    elif len(w) > 4 and w.endswith("ed"):
        w = w[:-2]
    elif len(w) > 4 and w.endswith("es"):
        w = w[:-2]
    elif len(w) > 3 and w.endswith("s") and not w.endswith("ss"):
        w = w[:-1]
    if len(w) > 4 and w.endswith("e"):
        w = w[:-1]
    return w


def normalize_term(term: str) -> str:
    """Forma canônica de um termo de tradução para comparação.

    Minúsculas, sem artigos/preposições, palavras de conteúdo reduzidas a
    radical — para que "In the beginning"≈"beginning" e "created"≈"create".
    """
    import re

    words = re.findall(r"[a-z]+", (term or "").lower())
    content = [_stem(w) for w in words if w not in _TERM_STOPWORDS]
    return " ".join(content)


def _terms_match(user_term: str, ref_term: str) -> bool:
    """Match lenient: igualdade normalizada ou contenção de conjunto de palavras."""
    u, r = normalize_term(user_term), normalize_term(ref_term)
    if not u or not r:
        return False
    if u == r:
        return True
    us, rs = set(u.split()), set(r.split())
    return us <= rs or rs <= us


def get_reference_consensus(
    lemma: str,
    translation_term: str,
    language: str
) -> dict:
    """
    Busca o consenso das traduções de referência para um lema.

    Chaveado pela forma NORMALIZADA do lema (consonantal/nua/folding latino),
    a mesma usada no léxico — robusto a divergências de vocalização/encoding
    entre o lema do alinhamento e o que foi indexado.

    - lema sem dados de consenso  → None (cai no scoring só-léxico)
    - lema com dados, termo casa  → linha correspondente (suporte real)
    - lema com dados, termo diverge → consenso sintético com weighted_score=0
      (o usuário usou uma leitura que nenhuma referência usa → CONSENSUS_LOW)
    """
    key = normalized_lemma(lemma, language) or lemma
    try:
        sb = get_supabase()
        result = sb.table("hermeneia_token_consensus").select("*").eq(
            "language_id", language
        ).eq("original_token", key).execute()
    except Exception:
        return None

    rows = result.data or []
    if not rows:
        return None

    for row in rows:
        if _terms_match(translation_term, row.get("translation_term", "")):
            return row

    # Lema conhecido, mas a tradução do usuário não bate com nenhuma referência.
    return {
        "language_id": language,
        "original_token": key,
        "translation_term": translation_term,
        "sources_agreeing": [],
        "sources_total": rows[0].get("sources_total", 0),
        "weighted_score": 0.0,
        "provenance": rows[0].get("provenance", "llm_derived"),
    }


def extract_philological_knowledge(
    lemma: str,
    transliteration: str,
    language: str,
    translation_span: str
) -> dict:
    """
    Quando o léxico não está indexado no Supabase, usa Claude para
    extrair conhecimento filológico do seu treinamento.

    IMPORTANTE: output marcado como source='model_knowledge' (não léxico indexado).
    Confidence penalizada em 0.10 por não ter fonte primária indexada.
    """
    lang_names = {
        "biblical_hebrew": "Biblical Hebrew",
        "koine_greek":     "Koine Greek",
        "classical_greek": "Classical Greek",
        "aramaic":         "Aramaic",
        "latin":           "Classical Latin",
        "coptic":          "Coptic",
    }
    lang_display = lang_names.get(language, language)

    lexicons = {
        "biblical_hebrew": "BDB (Brown-Driver-Briggs) and HALOT",
        "koine_greek":     "LSJ (Liddell-Scott-Jones) and BDAG",
        "classical_greek": "LSJ (Liddell-Scott-Jones)",
        "aramaic":         "CAL (Comprehensive Aramaic Lexicon)",
        "latin":           "Lewis & Short",
        "coptic":          "Coptic Etymological Dictionary",
    }
    lexicon_ref = lexicons.get(language, "standard lexicons")

    prompt = f"""You are a specialist in {lang_display} philology with deep knowledge of {lexicon_ref}.

Analyze this token:
- Lemma: {lemma}
- Transliteration: {transliteration}
- Language: {lang_display}
- Current translation: "{translation_span}"

Provide a structured philological analysis based on your knowledge of {lexicon_ref}.
Respond ONLY with JSON:
{{
  "gloss_primary": "<primary gloss>",
  "glosses": ["<alt1>", "<alt2>", "<alt3>"],
  "semantic_range": "<description of full semantic range>",
  "attestation_count": <approximate number in corpus, or null>,
  "is_hapax": <true/false>,
  "parallel_passages": ["<ref1>", "<ref2>"],
  "controversy_notes": "<documented scholarly controversies, or null>",
  "source_citation": "<BDB p.X or LSJ X.Y.a — approximate>",
  "translation_evaluation": {{
    "adequate": <true/false>,
    "captures_full_range": <true/false>,
    "issue_type": "<null|semantic_narrowing|semantic_broadening|wrong_sense|idiomatic_missed>",
    "issue_description": "<explanation if issue exists>"
  }}
}}"""

    response = client.messages.create(
        model="claude-sonnet-4-5",
        max_tokens=1000,
        messages=[{"role": "user", "content": prompt}]
    )

    import json, re
    text = response.content[0].text.strip()
    if "```" in text:
        m = re.search(r'\{.*\}', text, re.DOTALL)
        text = m.group(0) if m else text

    data = json.loads(text)
    data["source"] = "model_knowledge"  # não é léxico indexado
    data["lexicon"] = lexicon_ref.split(" ")[0]  # "BDB", "LSJ", etc.
    return data
