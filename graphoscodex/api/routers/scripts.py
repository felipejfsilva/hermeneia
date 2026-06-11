from fastapi import APIRouter, HTTPException
from ..db import get_supabase
from ..models.schemas import Script

router = APIRouter(prefix="/scripts", tags=["scripts"])


@router.get("", response_model=list[Script])
def list_scripts():
    """Lista todos os scripts cobertos pelo GraphosCodex."""
    try:
        sb = get_supabase()
        result = sb.table("graphoscodex_scripts").select("*").order("code").execute()
        return result.data or []
    except Exception as e:
        raise HTTPException(500, str(e))


@router.get("/{code}", response_model=Script)
def get_script(code: str):
    try:
        sb = get_supabase()
        result = sb.table("graphoscodex_scripts").select("*").eq("code", code).execute()
        if not result.data:
            raise HTTPException(404, f"Script '{code}' not found")
        return result.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, str(e))
