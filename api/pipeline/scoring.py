"""
HERMENEIA — Confidence scoring

O confidence score NÃO é opinião do modelo.
É função de métricas objetivas e verificáveis:

  score = weighted_consensus × hapax_penalty × coverage_factor × controversy_penalty

Cada componente é computado a partir de dados documentados.
"""
from api.models.schemas import FlagType


REFERENCE_TRANSLATIONS = {
    "biblical_hebrew": {
        "KJV":     {"weight": 1.0, "tradition": "religious"},
        "NRSV":    {"weight": 1.3, "tradition": "academic"},
        "NJPS":    {"weight": 1.4, "tradition": "academic"},
        "ESV":     {"weight": 1.0, "tradition": "religious"},
        "Alter":   {"weight": 1.5, "tradition": "literary"},
        "Fox":     {"weight": 1.4, "tradition": "literary"},
        "LXX":     {"weight": 1.5, "tradition": "academic"},
        "Vulgata": {"weight": 1.2, "tradition": "religious"},
    },
    "koine_greek": {
        "NRSV": {"weight": 1.3, "tradition": "academic"},
        "ESV":  {"weight": 1.0, "tradition": "religious"},
        "NASB": {"weight": 1.2, "tradition": "academic"},
        "NIV":  {"weight": 1.0, "tradition": "religious"},
    },
}


_FUNCTION_GLOSSES = {
    "the", "a", "an", "and", "but", "or", "of", "in", "to", "with", "for",
    "on", "at", "from", "by", "as", "this", "that", "these", "those", "who",
    "which", "not", "no", "now", "then", "so", "if", "the following",
}


def _is_function_word(lexicon_data: dict, translation_span: str) -> bool:
    """Token gramatical (artigo, partícula, conjunção, preposição, marcador de
    objeto)? Para esses, 'semantic_narrowing' não se aplica — é ruído."""
    gp = (lexicon_data.get("gloss_primary") or "").strip().lower()
    sp = (translation_span or "").strip().lower().strip(",.;:·")
    if "object marker" in gp or "the following" in gp:
        return True
    gp_clean = gp.strip(",.;:·")
    return gp_clean in _FUNCTION_GLOSSES or sp in _FUNCTION_GLOSSES


def compute_confidence(
    language: str,
    lexicon_data: dict,
    translation_span: str,
    consensus_data: dict | None = None,
) -> tuple[float, list[FlagType], list[dict]]:
    """
    Retorna (confidence_score, flags, alternatives).

    confidence é sempre computável mesmo sem consensus externo —
    cai back para evidência léxica sozinha.
    """
    flags: list[FlagType] = []
    score = 0.80  # base
    alternatives = []

    # ── 1. Hapax penalty ──────────────────────────────────────────────────────
    if lexicon_data.get("is_hapax"):
        score -= 0.25
        flags.append(FlagType.HAPAX)

    # ── 2. Coverage factor ────────────────────────────────────────────────────
    eval_data = lexicon_data.get("translation_evaluation", {})
    if eval_data:
        if not eval_data.get("adequate", True):
            score -= 0.20
        issue = eval_data.get("issue_type")
        if issue == "semantic_narrowing":
            # Suprime ruído: (a) palavras gramaticais não "estreitam" sentido;
            # (b) se o consenso das referências é praticamente unânime (≥85%),
            # é convenção tradutória consolidada — não estreitamento legítimo.
            ws = consensus_data.get("weighted_score", 0) if consensus_data else 0
            if not _is_function_word(lexicon_data, translation_span) and ws < 0.85:
                score -= 0.10
                flags.append(FlagType.SEMANTIC_NARROWING)
        elif issue == "idiomatic_missed":
            score -= 0.15
            flags.append(FlagType.IDIOMATIC)

    # ── 3. Controversy penalty ────────────────────────────────────────────────
    controversy = lexicon_data.get("controversy_notes")
    if controversy:
        score -= 0.08
        flags.append(FlagType.CONTESTED_SEMANTICS)

    # ── 4. Model knowledge penalty (vs. indexed lexicon) ─────────────────────
    if lexicon_data.get("source") == "model_knowledge":
        score -= 0.05  # penalidade pequena — falta citação primária indexada

    # ── 5. Consensus score (quando disponível) ────────────────────────────────
    sources_agreeing = []
    sources_total = 0
    if consensus_data:
        sources_agreeing = consensus_data.get("sources_agreeing", [])
        sources_total    = consensus_data.get("sources_total", 0)
        weighted_score   = consensus_data.get("weighted_score", 0.5)
        if sources_total > 0:
            # Blenda score léxico com consensus externo
            score = 0.6 * score + 0.4 * weighted_score
            if weighted_score < 0.40:
                flags.append(FlagType.CONSENSUS_LOW)

    # ── 6. Alternativas ───────────────────────────────────────────────────────
    glosses = lexicon_data.get("glosses", [])
    gloss_primary = lexicon_data.get("gloss_primary", "")
    for g in glosses:
        if g.lower() != translation_span.lower() and g.lower() != gloss_primary.lower():
            alternatives.append({
                "text": g,
                "support": lexicon_data.get("source_citation", "lexicon"),
                "confidence": max(0.3, score - 0.15),
            })

    score = max(0.05, min(0.98, round(score, 3)))
    return score, flags, alternatives[:3]  # máx 3 alternativas


def compute_consistency_flags(
    token_analyses: list[dict],
) -> list[dict]:
    """
    Detecta o mesmo token original traduzido de formas diferentes no documento.
    Retorna lista de inconsistências.
    """
    from collections import defaultdict

    token_map: dict[str, list] = defaultdict(list)

    for i, ta in enumerate(token_analyses):
        lemma = ta.get("lemma", ta.get("original", ""))
        span  = ta.get("translation_span", "")
        token_map[lemma].append({"span": span, "idx": i})

    issues = []
    for lemma, occurrences in token_map.items():
        unique_spans = list({o["span"] for o in occurrences if o["span"]})
        if len(unique_spans) > 1:
            issues.append({
                "token": lemma,
                "occurrences": len(occurrences),
                "translations_used": unique_spans,
                "locations": [f"token_{o['idx']+1}" for o in occurrences],
            })

    return issues
