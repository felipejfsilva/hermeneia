"""
HERMENEIA — Pydantic schemas
"""
from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class Language(str, Enum):
    BIBLICAL_HEBREW = "biblical_hebrew"
    KOINE_GREEK     = "koine_greek"
    CLASSICAL_GREEK = "classical_greek"
    ARAMAIC         = "aramaic"
    LATIN           = "latin"
    COPTIC          = "coptic"
    UNKNOWN         = "unknown"


class FlagType(str, Enum):
    HAPAX               = "hapax"              # word appears only once in corpus
    SEMANTIC_NARROWING  = "semantic_narrowing"  # translation captures only part of range
    CONSENSUS_LOW       = "consensus_low"       # <50% of ref translations agree
    INTRA_INCONSISTENT  = "intra_inconsistent"  # same token translated differently in doc
    CONTESTED_SEMANTICS = "contested_semantics"  # documented scholarly disagreement
    LACUNA              = "lacuna"              # missing/damaged text
    IDIOMATIC           = "idiomatic"           # idiom not translated as unit


class AlternativeReading(BaseModel):
    text: str
    support: str                    # "NRSV, NJPS" or "Tsumura 1989"
    confidence: float = Field(ge=0, le=1)
    tradition: Optional[str] = None # "academic", "literary", "religious"


class LexiconEvidence(BaseModel):
    lexicon: str                    # "BDB", "LSJ", "HALOT"
    lemma: str
    gloss_primary: str
    glosses: list[str] = []
    semantic_range: Optional[str] = None
    attestation_count: Optional[int] = None
    is_hapax: bool = False
    parallel_passages: list[str] = []
    controversy_notes: Optional[str] = None
    source_citation: Optional[str] = None


class TokenAnalysis(BaseModel):
    original: str                   # token no original
    transliteration: Optional[str]  # romanização
    existing: str                   # como foi traduzido
    refined: str                    # tradução refinada (= existing se ok)
    confidence: float = Field(ge=0, le=1)
    flags: list[FlagType] = []
    alternatives: list[AlternativeReading] = []
    lexicon_evidence: list[LexiconEvidence] = []
    reasoning: str                  # explicação da análise
    consensus_score: Optional[float] = None  # n_agreeing/n_total ponderado
    sources_agreeing: list[str] = []
    sources_total: int = 0


class ConsistencyIssue(BaseModel):
    token: str
    occurrences: int
    translations_used: list[str]
    locations: list[str]            # "v.2", "v.14"


class BPEValidation(BaseModel):
    """Ponte com o RESON — valida estrutura morfológica"""
    vmml: Optional[float] = None
    bc: Optional[float] = None
    language_expected_vmml_range: Optional[tuple[float, float]] = None
    morphologically_plausible: Optional[bool] = None
    note: str = ""


class AnalysisSummary(BaseModel):
    total_tokens: int
    tokens_flagged: int
    avg_confidence: float
    flags_breakdown: dict[str, int]  # {flag_type: count}
    consistency_issues: list[ConsistencyIssue]
    bpe_validation: Optional[BPEValidation] = None
    high_confidence_pct: float       # % tokens com confidence > 0.75
    low_confidence_pct: float        # % tokens com confidence < 0.50
    narrative: Optional[str] = None  # parecer em prosa, sintetizado dos achados
    corrected_translation: Optional[str] = None  # texto corrido sugerido (mesma língua da tradução)


# ── Request / Response ─────────────────────────────────────────────────────────

class RefineRequest(BaseModel):
    original_text: str = Field(
        description="Texto original na língua antiga",
        examples=["בְּרֵאשִׁית בָּרָא אֱלֹהִים אֵת הַשָּׁמַיִם וְאֵת הָאָרֶץ"]
    )
    translation: str = Field(
        description="Tradução existente a ser auditada",
        examples=["In the beginning God created the heavens and the earth"]
    )
    language: Language = Field(
        description="Língua do texto original"
    )
    translation_source: Optional[str] = Field(
        default=None,
        description="Fonte da tradução ('KJV', 'NRSV', 'custom'...)",
        examples=["KJV"]
    )
    manuscript_title: Optional[str] = None
    researcher_notes: Optional[str] = Field(
        default=None,
        description="Notas do pesquisador sobre o trecho (período, corpus, contexto)"
    )
    output_language: str = Field(
        default="pt",
        description="Idioma do parecer/laudo: 'pt' (português) ou 'en' (inglês)"
    )


class RefineResponse(BaseModel):
    analysis_id: str
    manuscript_id: str
    language: Language
    tokens: list[TokenAnalysis]
    summary: AnalysisSummary
    processing_ms: int
