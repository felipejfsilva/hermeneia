from fastapi import APIRouter, HTTPException, Query
from ..db import get_supabase
from ..models.schemas import Proposal, ProposalMapping, TestReport
from ..tests_engine import compute_hypothesis_fit

router = APIRouter(prefix="/proposals", tags=["proposals"])


@router.get("", response_model=list[Proposal])
def list_proposals(
    script: str | None = Query(None, description="Filtrar por script"),
    status: str | None = Query(None, description="active|refuted|dormant|partial|validated"),
):
    try:
        sb = get_supabase()
        q = sb.table("graphoscodex_proposals").select("*")
        if script:
            q = q.eq("script_code", script)
        if status:
            q = q.eq("status", status)
        rows = q.order("year_proposed", desc=True).execute().data or []
        # mappings carregam por demanda em /{id}, listagem vem leve.
        for r in rows:
            r["mappings"] = []
        return rows
    except Exception as e:
        raise HTTPException(500, str(e))


@router.get("/{proposal_id}", response_model=Proposal)
def get_proposal(proposal_id: str):
    try:
        sb = get_supabase()
        result = sb.table("graphoscodex_proposals").select("*").eq("id", proposal_id).execute()
        if not result.data:
            raise HTTPException(404, f"Proposal {proposal_id} not found")
        prop = result.data[0]
        mappings = (sb.table("graphoscodex_proposal_mappings")
                      .select("*")
                      .eq("proposal_id", proposal_id)
                      .execute().data or [])
        prop["mappings"] = mappings
        return prop
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, str(e))


@router.post("/{proposal_id}/test", response_model=TestReport)
def run_tests(proposal_id: str):
    """
    Roda cobertura + consistência interna sobre o estado atual do DB.
    Plausibilidade fonotática, correlação iconográfica e concordância cross-script
    ficam pra fase 3.5/4 do plano intencional.
    """
    report = compute_hypothesis_fit(proposal_id)
    return TestReport(**report)
