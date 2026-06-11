from fastapi import APIRouter, HTTPException, Query
from ..db import get_supabase
from ..models.schemas import Proposal, ProposalMapping, TestReport

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
    STUB. Vai rodar (em fase 3 do plano intencional):
      - cobertura
      - consistência interna
      - plausibilidade fonotática
      - correlação iconográfica
      - concordância cross-script (se houver âncora)
    Por ora devolve placeholder pra contrato da API estar de pé.
    """
    return TestReport(
        proposal_id=proposal_id,
        coverage=0.0,
        internal_consistency=0.0,
        global_score=0.0,
        verdict="Test pipeline não implementado (fase 3 / bloco 3).",
    )
