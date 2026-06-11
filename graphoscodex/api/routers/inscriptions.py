from fastapi import APIRouter, HTTPException, Query
from ..db import get_supabase
from ..models.schemas import Inscription

router = APIRouter(prefix="/inscriptions", tags=["inscriptions"])


@router.get("", response_model=list[Inscription])
def list_inscriptions(
    script: str = Query(..., description="Código do script (linear_a, voynich, ...)"),
    limit: int = Query(50, le=200),
    offset: int = 0,
):
    try:
        sb = get_supabase()
        q = (sb.table("graphoscodex_inscriptions")
               .select("*")
               .eq("script_code", script)
               .order("ref")
               .range(offset, offset + limit - 1))
        return q.execute().data or []
    except Exception as e:
        raise HTTPException(500, str(e))


@router.get("/{inscription_id}", response_model=Inscription)
def get_inscription(inscription_id: str):
    try:
        sb = get_supabase()
        result = sb.table("graphoscodex_inscriptions").select("*").eq("id", inscription_id).execute()
        if not result.data:
            raise HTTPException(404, f"Inscription {inscription_id} not found")
        return result.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, str(e))
