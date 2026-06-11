"""
GRAPHOSCODEX — Test engine (fase 1, bloco 3)

Implementa em fase MVP:
  - coverage: fração de signos do corpus cobertos pelos mapeamentos da proposta,
              ponderada por attestation_count (cobertura "real" de leitura).
  - internal_consistency: 1 - taxa de signos com mapeamentos contraditórios.
              Para uma proposta única, mede se nenhum signo recebeu 2+ valores
              incompatíveis em um mesmo mapping_type.
  - global_score: blend ponderado (0.6 * coverage + 0.4 * consistency).

Não implementa ainda (fases posteriores):
  - phonotactic plausibility (fase 3.5)
  - cross-script anchor (Linear B pra Linear A; fase 4)
  - iconographic correlation (bloco 4)
"""
from typing import Optional
from .db import get_supabase


def _verdict(coverage: float, consistency: float, n_mappings: int, n_signs: int) -> str:
    if n_mappings == 0:
        return "Hipótese sem mapeamentos signo→valor (estrutural/nula). Não testável por cobertura."
    parts = []
    if coverage < 0.30:
        parts.append(f"Cobertura baixa ({coverage:.0%} dos signos do corpus, ponderada por frequência)")
    elif coverage < 0.60:
        parts.append(f"Cobertura parcial ({coverage:.0%} dos signos)")
    else:
        parts.append(f"Cobertura ampla ({coverage:.0%} dos signos)")

    if consistency < 0.7:
        parts.append(f"consistência interna baixa ({consistency:.0%}) — mapeamentos conflitantes")
    elif consistency < 0.95:
        parts.append(f"consistência interna razoável ({consistency:.0%})")
    else:
        parts.append("consistência interna alta")
    return "; ".join(parts) + f". {n_mappings} mapeamentos sobre {n_signs} signos catalogados."


def compute_hypothesis_fit(proposal_id: str) -> dict:
    """
    Calcula coverage + consistency a partir do estado real do DB.
    Retorna dict compatível com TestReport.
    """
    sb = get_supabase()

    prop = sb.table("graphoscodex_proposals").select("script_code,proposal_type").eq("id", proposal_id).execute().data
    if not prop:
        return {
            "proposal_id": proposal_id,
            "coverage": 0.0, "internal_consistency": 0.0, "global_score": 0.0,
            "verdict": "Proposta não encontrada.",
        }
    script_code = prop[0]["script_code"]
    proposal_type = prop[0]["proposal_type"]

    mappings = sb.table("graphoscodex_proposal_mappings") \
        .select("sign_id,mapping_type,value,confidence") \
        .eq("proposal_id", proposal_id).execute().data or []

    signs = sb.table("graphoscodex_signs") \
        .select("sign_id,attestation_count") \
        .eq("script_code", script_code).execute().data or []

    total_attest = sum(s["attestation_count"] or 0 for s in signs) or 1
    n_signs = len(signs)

    # Coverage ponderado por frequência
    mapped_ids = {m["sign_id"] for m in mappings}
    covered_attest = sum(
        (s["attestation_count"] or 0) for s in signs if s["sign_id"] in mapped_ids
    )
    coverage = covered_attest / total_attest if total_attest else 0.0

    # Internal consistency: por signo, dentro de cada mapping_type, valor único?
    by_sign_type: dict[tuple[str, str], set[str]] = {}
    for m in mappings:
        key = (m["sign_id"], m["mapping_type"])
        by_sign_type.setdefault(key, set()).add(m["value"])
    conflicts = [
        {"sign_id": s, "mapping_type": t, "values": sorted(v)}
        for (s, t), v in by_sign_type.items() if len(v) > 1
    ]
    consistency = 1.0 if not by_sign_type else 1.0 - (len(conflicts) / len(by_sign_type))

    # Hipóteses estruturais (Rugg-style) não são testáveis por cobertura
    if proposal_type == "hoax" and not mappings:
        coverage = 0.0
        consistency = 1.0
        global_score = 0.0
    else:
        global_score = 0.6 * coverage + 0.4 * consistency

    return {
        "proposal_id": proposal_id,
        "coverage": round(coverage, 3),
        "internal_consistency": round(consistency, 3),
        "phonotactic_plausibility": None,
        "iconographic_correlation": None,
        "cross_script_concordance": None,
        "global_score": round(global_score, 3),
        "predictions": [],
        "conflicts": conflicts,
        "verdict": _verdict(coverage, consistency, len(mappings), n_signs),
    }
