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


def lookup_lexicon(lemma: str, language: str) -> list[dict]:
    """
    Busca entrada de léxico por lemma exato.
    Retorna lista de entradas (pode ter BDB + HALOT para mesmo lemma).
    """
    try:
        sb = get_supabase()
        result = sb.table("hermeneia_lexicon_entries").select("*").eq(
            "language_id", language
        ).eq("lemma", lemma).execute()
        return result.data or []
    except Exception:
        return []


def get_reference_consensus(
    original_token: str,
    translation_term: str,
    language: str
) -> dict:
    """
    Busca consensus score cacheado.
    Se não existe, retorna None (será computado pelo scoring.py).
    """
    try:
        sb = get_supabase()
        result = sb.table("hermeneia_token_consensus").select("*").eq(
            "language_id", language
        ).eq("original_token", original_token).eq(
            "translation_term", translation_term
        ).execute()
        if result.data:
            return result.data[0]
    except Exception:
        pass
    return None


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
