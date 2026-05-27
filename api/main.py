"""
HERMENEIA — FastAPI
Auditor de traduções de manuscritos históricos
"""
import os
import uuid
import time
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv(override=True)

from api.models.schemas import RefineRequest, RefineResponse, Language
from api.pipeline.refine import run_pipeline
from api.references import resolve_reference

# ── Supabase client ───────────────────────────────────────────────────────────
from supabase import create_client

def get_supabase():
    return create_client(
        os.environ["SUPABASE_URL"],
        os.environ["SUPABASE_KEY"]
    )


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("HERMENEIA v1 — iniciando")
    yield
    print("HERMENEIA — shutdown")


app = FastAPI(
    title="HERMENEIA",
    description="Auditor computacional de traduções de manuscritos históricos",
    version="1.0.0",
    lifespan=lifespan,
)

# Em produção, defina ALLOWED_ORIGINS com o domínio do frontend (ex.: Vercel),
# separado por vírgula. Em dev, o default "*" libera tudo.
_origins_env = os.environ.get("ALLOWED_ORIGINS", "*").strip()
allow_origins = ["*"] if _origins_env == "*" else [
    o.strip() for o in _origins_env.split(",") if o.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Health ────────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok", "version": "1.0.0"}


# ── Languages ─────────────────────────────────────────────────────────────────

@app.get("/languages")
def list_languages():
    """Lista línguas suportadas e seus léxicos de referência."""
    return {
        "languages": [
            {"id": "biblical_hebrew", "name": "Biblical Hebrew",  "lexicons": ["BDB", "HALOT"], "script": "Hebrew"},
            {"id": "koine_greek",     "name": "Koine Greek",      "lexicons": ["LSJ", "BDAG"],  "script": "Greek"},
            {"id": "classical_greek", "name": "Classical Greek",  "lexicons": ["LSJ"],          "script": "Greek"},
            {"id": "aramaic",         "name": "Aramaic",          "lexicons": ["CAL"],          "script": "Hebrew"},
            {"id": "latin",           "name": "Classical Latin",  "lexicons": ["L&S"],          "script": "Latin"},
            {"id": "coptic",          "name": "Coptic",           "lexicons": ["CED"],          "script": "Coptic"},
        ]
    }


# ── Source text by reference ──────────────────────────────────────────────────

@app.get("/source-text")
def source_text(ref: str, language: str | None = None):
    """
    Busca o texto-fonte de uma referência (ex.: 'John 1:1') nos testemunhos
    disponíveis. O usuário escolhe qual usar como original.
    - hebraico → WLC
    - grego    → SBLGNT (crítico) + TR (Textus Receptus)
    """
    parsed = resolve_reference(ref)
    if not parsed:
        return {"ref": ref, "resolved": None, "witnesses": []}
    book, ch, vs = parsed
    try:
        sb = get_supabase()
        q = sb.table("hermeneia_source_texts").select(
            "witness, witness_name, language_id, text, ref"
        ).eq("book", book).eq("chapter", ch).eq("verse", vs)
        if language:
            q = q.eq("language_id", language)
        rows = q.order("witness").execute().data or []
    except Exception as e:
        raise HTTPException(500, str(e))
    return {
        "ref": f"{book} {ch}:{vs}",
        "resolved": {"book": book, "chapter": ch, "verse": vs},
        "witnesses": rows,
    }


# ── Core endpoint ─────────────────────────────────────────────────────────────

@app.post("/refine", response_model=RefineResponse)
def refine_translation(req: RefineRequest):
    """
    Audita uma tradução existente contra evidência filológica documentada.

    Retorna análise por token com:
    - Score de confiança objetivo (baseado em consensus, léxico, hapax)
    - Flags: HAPAX, SEMANTIC_NARROWING, CONSENSUS_LOW, CONTESTED_SEMANTICS, INTRA_INCONSISTENT
    - Alternativas com citação de fonte
    - Reasoning citado
    - Detecção de inconsistência intra-documento
    """
    if len(req.original_text) > 5000:
        raise HTTPException(400, "Texto original excede 5000 caracteres (MVP limit)")
    if len(req.translation) > 10000:
        raise HTTPException(400, "Tradução excede 10000 caracteres")

    # Salva manuscrito no Supabase
    manuscript_id = str(uuid.uuid4())
    analysis_id   = str(uuid.uuid4())

    try:
        sb = get_supabase()
        sb.table("hermeneia_manuscripts").insert({
            "id": manuscript_id,
            "title": req.manuscript_title or "Sem título",
            "language_id": req.language.value,
            "original_text": req.original_text,
            "source_translation": req.translation,
            "translation_source": req.translation_source,
            "metadata": {"researcher_notes": req.researcher_notes},
        }).execute()

        sb.table("hermeneia_analyses").insert({
            "id": analysis_id,
            "manuscript_id": manuscript_id,
            "status": "running",
        }).execute()
    except Exception as e:
        # Não bloqueia análise se Supabase falhar
        print(f"[WARN] Supabase insert failed: {e}")

    # Roda pipeline
    try:
        result = run_pipeline(
            original_text=req.original_text,
            translation=req.translation,
            language=req.language.value,
            translation_source=req.translation_source,
            researcher_notes=req.researcher_notes,
            output_language=req.output_language,
        )
    except Exception as e:
        # Atualiza status para erro
        try:
            sb.table("hermeneia_analyses").update(
                {"status": "error"}
            ).eq("id", analysis_id).execute()
        except Exception:
            pass
        raise HTTPException(500, f"Pipeline error: {str(e)}")

    # Salva resultado
    try:
        sb = get_supabase()
        sb.table("hermeneia_analyses").update({
            "status": "complete",
            "segments": [t.model_dump(mode="json") for t in result["tokens"]],
            "summary": result["summary"].model_dump(mode="json"),
            "processing_ms": result["processing_ms"],
            "completed_at": "now()",
        }).eq("id", analysis_id).execute()
    except Exception as e:
        print(f"[WARN] Supabase update failed: {e}")

    return RefineResponse(
        analysis_id=analysis_id,
        manuscript_id=manuscript_id,
        language=req.language,
        tokens=result["tokens"],
        summary=result["summary"],
        processing_ms=result["processing_ms"],
    )


@app.get("/analyses/{analysis_id}")
def get_analysis(analysis_id: str):
    """Recupera análise por ID."""
    try:
        sb = get_supabase()
        result = sb.table("hermeneia_analyses").select("*").eq(
            "id", analysis_id
        ).execute()
        if not result.data:
            raise HTTPException(404, "Analysis not found")
        return result.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, str(e))


@app.get("/manuscripts/{manuscript_id}/analyses")
def get_manuscript_analyses(manuscript_id: str):
    """Lista análises de um manuscrito."""
    try:
        sb = get_supabase()
        result = sb.table("hermeneia_analyses").select(
            "id, status, processing_ms, created_at, completed_at, summary"
        ).eq("manuscript_id", manuscript_id).order("created_at", desc=True).execute()
        return {"analyses": result.data}
    except Exception as e:
        raise HTTPException(500, str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api.main:app", host="0.0.0.0", port=8001, reload=True)
