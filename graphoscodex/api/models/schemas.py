"""
GRAPHOSCODEX — Pydantic schemas
Espelham as tabelas graphoscodex_* no Supabase.
"""
from pydantic import BaseModel, Field
from typing import Optional, Literal


class Script(BaseModel):
    code: str
    name: str
    description: Optional[str] = None
    period_start: Optional[int] = None
    period_end: Optional[int] = None
    region: Optional[str] = None
    status: Literal["undeciphered", "partial", "deciphered", "contested"]
    anchor_code: Optional[str] = None
    corpus_size: Optional[int] = None


class Inscription(BaseModel):
    id: str
    script_code: str
    ref: str
    title: Optional[str] = None
    description: Optional[str] = None
    material: Optional[str] = None
    date_estimate: Optional[str] = None
    holding_institution: Optional[str] = None
    transcription: Optional[str] = None
    transcription_format: Optional[str] = None
    image_url: Optional[str] = None
    thumbnail_url: Optional[str] = None


class Sign(BaseModel):
    id: str
    script_code: str
    sign_id: str
    normalized_form: Optional[str] = None
    image_url: Optional[str] = None
    attestation_count: int = 0
    source: Optional[str] = None


class ProposalMapping(BaseModel):
    sign_id: str
    mapping_type: Literal["phoneme", "semantic", "morpheme", "name", "number", "undecided"]
    value: str
    confidence: Optional[float] = Field(default=None, ge=0, le=1)
    evidence_note: Optional[str] = None


class Proposal(BaseModel):
    id: Optional[str] = None
    script_code: str
    slug: str
    title: str
    author: str
    author_affiliation: Optional[str] = None
    year_proposed: Optional[int] = None
    proposal_type: Literal["phonetic", "semantic", "structural", "cipher", "hoax", "mixed"]
    summary: Optional[str] = None
    evidence: Optional[str] = None
    citation: Optional[str] = None
    url: Optional[str] = None
    status: Literal["active", "refuted", "dormant", "partial", "validated"] = "active"
    provenance: Literal["hypothesis", "tested", "validated_external"] = "hypothesis"
    mappings: list[ProposalMapping] = []


class ProposalPrediction(BaseModel):
    proposal_id: str
    inscription_ref: str
    predicted_reading: Optional[str] = None
    actual_observed: Optional[str] = None
    match_score: Optional[float] = Field(default=None, ge=0, le=1)
    tested: bool = False
    test_method: Optional[str] = None


class TestReport(BaseModel):
    """Relatório consolidado de testes pra uma proposta."""
    proposal_id: str
    coverage: float = Field(ge=0, le=1)
    internal_consistency: float = Field(ge=0, le=1)
    phonotactic_plausibility: Optional[float] = Field(default=None, ge=0, le=1)
    iconographic_correlation: Optional[float] = Field(default=None, ge=0, le=1)
    cross_script_concordance: Optional[float] = Field(default=None, ge=0, le=1)
    global_score: float = Field(ge=0, le=1)
    predictions: list[ProposalPrediction] = []
    conflicts: list[dict] = []
    verdict: Optional[str] = None


class IconographyAnnotation(BaseModel):
    id: Optional[str] = None
    inscription_id: str
    bbox: dict  # {x, y, w, h} normalizado 0-1
    annotation_type: Literal["botanical", "animal", "human_figure", "astronomical",
                              "architectural", "symbol", "sign", "tool", "unknown"]
    description: Optional[str] = None
    proposed_meaning: Optional[str] = None
    linked_text_offset_start: Optional[int] = None
    linked_text_offset_end: Optional[int] = None
    confidence: Optional[float] = Field(default=None, ge=0, le=1)
