# Deploy — HERMENEIA

Arquitetura: **API** (FastAPI) no Railway · **Frontend** (Vite/React) no Vercel ·
**Dados** (léxico BDB + consenso) já persistidos no Supabase. Nenhuma ingestão
roda no deploy — a API só lê do Supabase.

## 1. API → Railway

A raiz do repo já tem `railway.json` (builder Nixpacks, start via `$PORT`,
healthcheck em `/health`) e `.python-version` (3.11).

1. New Project → Deploy from GitHub repo → selecione `felipejfsilva/hermeneia`.
2. Em **Variables**, defina:

   | Variável | Valor |
   |---|---|
   | `ANTHROPIC_API_KEY` | sua chave Anthropic |
   | `SUPABASE_URL` | `https://hbcwsurfdfcgfxxawfhc.supabase.co` |
   | `SUPABASE_SERVICE_KEY` | **service role key** (Supabase → Settings → API → `service_role`). Use só no servidor; bypassa RLS. |
   | `SUPABASE_KEY` | publishable (`sb_publishable_...`) — fallback se faltar a service key |
   | `ALLOWED_ORIGINS` | a URL do frontend no Vercel (ex.: `https://hermeneia.vercel.app`) |
   | `REFINE_RATE_PER_MIN` | (opcional, default `10`) — limite de auditorias por IP por minuto |

   `PORT` é injetado pelo Railway — não defina.
3. Deploy. Confira em `https://<app>.up.railway.app/health` → `{"status":"ok"}`.

> **Modelo de acesso (aberto/anônimo):** qualquer um pode submeter uma análise,
> mas RLS bloqueia leitura/atualização de `hermeneia_analyses`/`manuscripts` na
> chave pública. O servidor lê com a service key. Rate limit é por IP em memória
> (single instance); se escalar horizontal no Railway, trocar por Redis/Upstash.

> `requirements.txt` fixa `supabase==2.30.0`, necessário para aceitar a chave
> `sb_publishable_` (versões antigas a rejeitam).

## 2. Frontend → Vercel

`frontend/vercel.json` já define framework Vite, build e rewrite SPA.

1. New Project → importe o repo.
2. **Root Directory** = `frontend`.
3. Em **Environment Variables**, defina:

   | Variável | Valor |
   |---|---|
   | `VITE_API_URL` | a URL pública da API no Railway (sem barra final) |

4. Deploy. Depois copie a URL final do Vercel de volta para `ALLOWED_ORIGINS`
   no Railway e redeploy a API (fecha o CORS no domínio certo).

## Dev local

```bash
python -m venv .venv && .venv/bin/pip install -r requirements.txt
# .env na raiz com ANTHROPIC_API_KEY, SUPABASE_URL, SUPABASE_KEY
./start.sh   # API :8001 + frontend :5174
```
