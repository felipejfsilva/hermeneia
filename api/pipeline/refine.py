"""
HERMENEIA — Motor de refinamento (v2 — paralelo)

Pipeline:
  1. align_tokens      → 1 chamada LLM (alinha todos os tokens de uma vez)
  2. analyze_token     → 1 chamada LLM por token (RAG + score + reason juntos)
  3. ThreadPoolExecutor → tokens em paralelo (max_workers=6)

De ~112s → ~15-20s para um verso de 7 tokens.
"""
import time
import os
import json
import re
from concurrent.futures import ThreadPoolExecutor, as_completed
from dotenv import load_dotenv
from anthropic import Anthropic

load_dotenv(override=True)

from api.pipeline.align import tokenize_ancient, align_tokens
from api.pipeline.rag import lookup_lexicon, get_reference_consensus
from api.pipeline.scoring import compute_confidence, compute_consistency_flags
from api.models.schemas import (
    TokenAnalysis, AnalysisSummary, LexiconEvidence,
    AlternativeReading, FlagType, ConsistencyIssue
)

client = Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

LANG_NAMES = {
    "biblical_hebrew": "Biblical Hebrew",
    "koine_greek":     "Koine Greek",
    "classical_greek": "Classical Greek",
    "aramaic":         "Aramaic",
    "latin":           "Classical Latin",
    "coptic":          "Coptic",
}

LEXICON_REFS = {
    "biblical_hebrew": "BDB (Brown-Driver-Briggs) and HALOT",
    "koine_greek":     "LSJ (Liddell-Scott-Jones) and BDAG",
    "classical_greek": "LSJ (Liddell-Scott-Jones)",
    "aramaic":         "CAL (Comprehensive Aramaic Lexicon)",
    "latin":           "Lewis & Short",
    "coptic":          "Coptic Etymological Dictionary",
}


def _parse_json(text: str) -> dict:
    text = text.strip()
    # Remove markdown code fences
    if "```" in text:
        m = re.search(r'\{.*\}', text, re.DOTALL)
        text = m.group(0) if m else text
    # Remove trailing commas before } or ] (common LLM mistake)
    text = re.sub(r',\s*([}\]])', r'\1', text)
    # Remove control characters
    text = re.sub(r'[\x00-\x1f\x7f]', ' ', text)
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        # Extrai apenas até o último } válido
        last_brace = text.rfind('}')
        if last_brace > 0:
            return json.loads(text[:last_brace + 1])
        raise


def analyze_token_single_call(
    original: str,
    lemma: str,
    transliteration: str,
    translation_span: str,
    language: str,
    indexed_entry: dict | None,
) -> dict:
    """
    Uma única chamada LLM que faz tudo para um token:
    - Analisa evidência filológica (se não indexada)
    - Avalia adequação da tradução
    - Gera raciocínio
    - Propõe refinamento

    Se o léxico já está indexado, pula a parte de knowledge extraction
    e vai direto para reasoning — mais rápido.
    """
    lang_display = LANG_NAMES.get(language, language)
    lexicon_ref  = LEXICON_REFS.get(language, "standard lexicons")

    if indexed_entry:
        # Léxico indexado: só precisa de reasoning + refinement
        prompt = f"""You are a philologist auditing a Biblical translation.

Token: {lemma} ({transliteration})
Language: {lang_display}
Existing translation: "{translation_span}"

Lexicon evidence (BDB):
- Primary gloss: {indexed_entry.get('gloss_primary', '')}
- Semantic range: {indexed_entry.get('semantic_range', '')}
- Controversy: {indexed_entry.get('controversy_notes', 'none')}

Respond ONLY with JSON:
{{
  "translation_evaluation": {{
    "adequate": <true/false>,
    "captures_full_range": <true/false>,
    "issue_type": "<null|semantic_narrowing|semantic_broadening|wrong_sense|idiomatic_missed>",
    "issue_description": "<brief explanation>"
  }},
  "reasoning": "<2-3 sentence philological reasoning citing sources>",
  "refined": "<best translation — same as existing if adequate>",
  "alternative_glosses": ["<alt1>", "<alt2>"]
}}"""
    else:
        # Léxico não indexado: extrai knowledge + reasoning em uma chamada
        prompt = f"""You are a specialist in {lang_display} philology with deep knowledge of {lexicon_ref}.

Analyze this token and audit the existing translation:
- Lemma: {lemma}
- Transliteration: {transliteration}
- Language: {lang_display}
- Existing translation: "{translation_span}"

Provide a complete philological analysis. Respond ONLY with JSON:
{{
  "gloss_primary": "<primary gloss from {lexicon_ref.split()[0]}>",
  "glosses": ["<alt1>", "<alt2>", "<alt3>"],
  "semantic_range": "<full semantic range description>",
  "attestation_count": <approximate corpus frequency or null>,
  "is_hapax": <true/false>,
  "parallel_passages": ["<ref1>", "<ref2>"],
  "controversy_notes": "<documented scholarly controversies or null>",
  "source_citation": "<lexicon reference — e.g. BDB p.135>",
  "translation_evaluation": {{
    "adequate": <true/false>,
    "captures_full_range": <true/false>,
    "issue_type": "<null|semantic_narrowing|semantic_broadening|wrong_sense|idiomatic_missed>",
    "issue_description": "<brief explanation>"
  }},
  "reasoning": "<2-3 sentence philological reasoning citing sources>",
  "refined": "<best translation — same as existing if adequate>",
  "alternative_glosses": ["<alt1>", "<alt2>"]
}}"""

    # Até 2 tentativas: Haiku ocasionalmente emite JSON malformado
    # (vírgula faltante, aspas não escapadas). Na 2ª, reforça a instrução.
    data = None
    last_err: Exception | None = None
    for attempt in range(2):
        msgs = [{"role": "user", "content": prompt}]
        if attempt > 0:
            msgs.append({
                "role": "user",
                "content": "Your previous response was not valid JSON. "
                           "Respond again with ONLY a single minified JSON object — "
                           "no prose, no code fences, all string quotes escaped.",
            })
        response = client.messages.create(
            model="claude-haiku-4-5",   # Haiku: mais rápido, suficiente para análise estruturada
            max_tokens=1200,
            messages=msgs,
        )
        try:
            data = _parse_json(response.content[0].text)
            break
        except (json.JSONDecodeError, ValueError) as e:
            last_err = e
    if data is None:
        raise ValueError(f"JSON parse failed after retry: {last_err}")

    # Se veio de indexed_entry, mescla com dados do banco
    if indexed_entry:
        data["gloss_primary"]    = indexed_entry.get("gloss_primary", "")
        data["glosses"]          = indexed_entry.get("glosses", [])
        data["semantic_range"]   = indexed_entry.get("semantic_range", "")
        data["attestation_count"]= indexed_entry.get("attestation_count")
        data["is_hapax"]         = indexed_entry.get("is_hapax", False)
        data["parallel_passages"]= indexed_entry.get("parallel_passages", [])
        data["controversy_notes"]= indexed_entry.get("controversy_notes")
        data["source_citation"]  = indexed_entry.get("source_citation", "")
        data["source"]           = "indexed_lexicon"
        data["lexicon"]          = indexed_entry.get("lexicon", "BDB")
    else:
        data["source"] = "model_knowledge"
        data["lexicon"] = lexicon_ref.split(" ")[0]

    return data


def process_token(item: dict, language: str) -> TokenAnalysis:
    """Processa um único token. Chamado em paralelo pelo ThreadPoolExecutor."""
    original   = item["original"]
    lemma      = item.get("lemma", original)
    translit   = item.get("transliteration", "")
    trans_span = item.get("translation_span", "")

    # RAG: busca léxico indexado (rápido, Supabase)
    indexed = lookup_lexicon(lemma, language)
    indexed_entry = indexed[0] if indexed else None

    # Consensus cacheado
    consensus = get_reference_consensus(original, trans_span, language)

    # Chamada LLM única por token
    try:
        lex_data = analyze_token_single_call(
            original, lemma, translit, trans_span, language, indexed_entry
        )
    except Exception:
        # LLM/JSON falhou. Se temos entrada indexada, degradamos para os
        # dados do banco (sem reasoning do LLM) em vez de perder tudo.
        if not indexed_entry:
            raise
        lex_data = {
            "gloss_primary":     indexed_entry.get("gloss_primary", ""),
            "glosses":           indexed_entry.get("glosses", []),
            "semantic_range":    indexed_entry.get("semantic_range", ""),
            "attestation_count": indexed_entry.get("attestation_count"),
            "is_hapax":          indexed_entry.get("is_hapax", False),
            "parallel_passages": indexed_entry.get("parallel_passages", []),
            "controversy_notes": indexed_entry.get("controversy_notes"),
            "source_citation":   indexed_entry.get("source_citation", ""),
            "source":            "indexed_lexicon",
            "lexicon":           indexed_entry.get("lexicon", "BDB"),
            "refined":           trans_span,
            "alternative_glosses": [],
            "reasoning": f"Lexicon evidence from {indexed_entry.get('lexicon', 'BDB')} "
                         "(LLM reasoning unavailable for this token).",
            "translation_evaluation": {},
        }

    # Scoring objetivo (sem LLM)
    confidence, flags, alts_from_score = compute_confidence(language, lex_data, trans_span, consensus)

    # Alternativas: combina scoring + glosses do LLM
    alt_glosses = lex_data.get("alternative_glosses", [])
    alternatives = []
    seen = {trans_span.lower()}
    for g in (alt_glosses + [a["text"] for a in alts_from_score]):
        if g and g.lower() not in seen:
            seen.add(g.lower())
            alternatives.append(AlternativeReading(
                text=g,
                support=lex_data.get("source_citation", lex_data.get("lexicon", "lexicon")),
                confidence=max(0.3, confidence - 0.15),
            ))
        if len(alternatives) >= 3:
            break

    lex_evidence = LexiconEvidence(
        lexicon=lex_data.get("lexicon", "unknown"),
        lemma=lemma,
        gloss_primary=lex_data.get("gloss_primary", ""),
        glosses=lex_data.get("glosses", []),
        semantic_range=lex_data.get("semantic_range"),
        attestation_count=lex_data.get("attestation_count"),
        is_hapax=lex_data.get("is_hapax", False),
        parallel_passages=lex_data.get("parallel_passages", []),
        controversy_notes=lex_data.get("controversy_notes"),
        source_citation=lex_data.get("source_citation"),
    )

    return TokenAnalysis(
        original=original,
        transliteration=translit,
        existing=trans_span,
        refined=lex_data.get("refined", trans_span),
        confidence=confidence,
        flags=flags,
        alternatives=alternatives,
        lexicon_evidence=[lex_evidence],
        reasoning=lex_data.get("reasoning", ""),
        sources_agreeing=consensus.get("sources_agreeing", []) if consensus else [],
        sources_total=consensus.get("sources_total", 0) if consensus else 0,
    )


def run_pipeline(
    original_text: str,
    translation: str,
    language: str,
    translation_source: str | None = None,
    researcher_notes: str | None = None,
    max_workers: int = 6,
) -> dict:
    """
    Pipeline principal com paralelismo por token.
    """
    t0 = time.time()

    # ── 1. Tokenizar e alinhar (1 chamada LLM para todos os tokens) ───────────
    original_tokens = tokenize_ancient(original_text, language)
    aligned = align_tokens(original_text, translation, language, original_tokens)

    # ── 2. Processar tokens em paralelo ───────────────────────────────────────
    token_analyses_out: list[TokenAnalysis] = [None] * len(aligned)

    with ThreadPoolExecutor(max_workers=min(max_workers, len(aligned))) as executor:
        futures = {
            executor.submit(process_token, item, language): i
            for i, item in enumerate(aligned)
        }
        for future in as_completed(futures):
            idx = futures[future]
            try:
                token_analyses_out[idx] = future.result()
            except Exception as e:
                # Token falhou — cria análise de fallback
                item = aligned[idx]
                token_analyses_out[idx] = TokenAnalysis(
                    original=item["original"],
                    transliteration=item.get("transliteration", ""),
                    existing=item.get("translation_span", ""),
                    refined=item.get("translation_span", ""),
                    confidence=0.5,
                    flags=[],
                    alternatives=[],
                    lexicon_evidence=[],
                    reasoning=f"Analysis failed: {str(e)}",
                    sources_agreeing=[],
                    sources_total=0,
                )

    # ── 3. Consistency check (sem LLM) ────────────────────────────────────────
    token_analyses_raw = [
        {"original": a["original"], "lemma": a.get("lemma", a["original"]),
         "translation_span": a.get("translation_span", "")}
        for a in aligned
    ]
    consistency_issues = compute_consistency_flags(token_analyses_raw)

    # ── 4. Summary ────────────────────────────────────────────────────────────
    n = len(token_analyses_out)
    flags_all = [f for ta in token_analyses_out for f in ta.flags]
    flags_breakdown = {}
    for f in flags_all:
        flags_breakdown[f.value] = flags_breakdown.get(f.value, 0) + 1

    confidences = [ta.confidence for ta in token_analyses_out]
    avg_conf = sum(confidences) / n if n else 0
    high_pct = sum(1 for c in confidences if c > 0.75) / n * 100 if n else 0
    low_pct  = sum(1 for c in confidences if c < 0.50) / n * 100 if n else 0

    ci_objects = [ConsistencyIssue(**ci) for ci in consistency_issues]

    from api.models.schemas import AnalysisSummary
    summary = AnalysisSummary(
        total_tokens=n,
        tokens_flagged=sum(1 for ta in token_analyses_out if ta.flags),
        avg_confidence=round(avg_conf, 3),
        flags_breakdown=flags_breakdown,
        consistency_issues=ci_objects,
        bpe_validation=None,
        high_confidence_pct=round(high_pct, 1),
        low_confidence_pct=round(low_pct, 1),
    )

    processing_ms = int((time.time() - t0) * 1000)

    return {
        "tokens": token_analyses_out,
        "summary": summary,
        "processing_ms": processing_ms,
    }
