"""
GRAPHOSCODEX — FastAPI
Workbench colaborativa pra decifração de scripts antigos.

Skeleton — fase 1 / bloco 2. Os endpoints de scripts/inscriptions/proposals já
servem dados reais das tabelas graphoscodex_* no Supabase. Testes automáticos
(/proposals/{id}/test) são stub: implementação real no bloco 3.
"""
import os
from collections import defaultdict
from contextlib import asynccontextmanager
from datetime import datetime, timedelta, timezone
import time

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv(override=True)

from .routers import scripts, inscriptions, proposals
from .db import get_supabase


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("GRAPHOSCODEX — iniciando")
    yield
    print("GRAPHOSCODEX — shutdown")


app = FastAPI(
    title="GraphosCodex",
    description="Workbench colaborativa, multimodal e versionada para hipóteses de decifração de scripts antigos.",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS configurável por env (mesmo padrão da Hermeneia).
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


# ── Rate limit por IP (defesa básica anti-abuso) ──────────────────────────────
_RL_WINDOW_SEC = 60
_RL_MAX_PER_IP = int(os.environ.get("GC_RATE_PER_MIN", "30"))
_rl_buckets: dict[str, list[float]] = defaultdict(list)


def _client_ip(request: Request) -> str:
    fwd = request.headers.get("x-forwarded-for")
    if fwd:
        return fwd.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


@app.middleware("http")
async def rate_limit_mw(request: Request, call_next):
    # Endpoints que NÃO contam (descobrir/listar/info estática)
    path = request.url.path
    if path in {"/", "/health", "/usage", "/openapi.json", "/docs", "/redoc"}:
        return await call_next(request)
    ip = _client_ip(request)
    now = time.time()
    bucket = [t for t in _rl_buckets[ip] if now - t < _RL_WINDOW_SEC]
    if len(bucket) >= _RL_MAX_PER_IP:
        from fastapi.responses import JSONResponse
        return JSONResponse(
            {"detail": f"Rate limit: {_RL_MAX_PER_IP}/min por IP. Tente em instantes."},
            status_code=429,
        )
    bucket.append(now)
    _rl_buckets[ip] = bucket
    return await call_next(request)


# ── Endpoints de saúde/uso ────────────────────────────────────────────────────
@app.get("/")
def root():
    return {
        "name": "GraphosCodex",
        "version": "0.1.0",
        "phase": "1 / bloco 2 — skeleton com schema vivo, lógica de testes pendente",
        "docs": "/docs",
    }


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/usage")
def usage():
    """Consumo das últimas 24h (propostas criadas + testes rodados)."""
    try:
        sb = get_supabase()
        since = (datetime.now(timezone.utc) - timedelta(hours=24)).isoformat()
        props = sb.table("graphoscodex_proposals").select("id", count="exact").gte("created_at", since).execute()
        return {
            "proposals_last_24h": props.count or 0,
            "rate_per_ip_per_min": _RL_MAX_PER_IP,
        }
    except Exception:
        return {"proposals_last_24h": None, "rate_per_ip_per_min": _RL_MAX_PER_IP}


# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(scripts.router)
app.include_router(inscriptions.router)
app.include_router(proposals.router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("graphoscodex.api.main:app", host="0.0.0.0", port=8002, reload=True)
