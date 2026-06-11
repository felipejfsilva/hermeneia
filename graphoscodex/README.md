# GraphosCodex — código

Workbench colaborativa pra decifração de scripts antigos. Subdiretório do repo
Hermeneia por restrição operacional (acesso GitHub fixado em
`felipejfsilva/hermeneia`). Quando o repo próprio `graphoscodex/graphoscodex`
estiver pronto pra receber, migrar este diretório inteiro com `git mv`.

## Estrutura

```
graphoscodex/
├── api/                    FastAPI backend
│   ├── main.py             entrypoint
│   ├── models/             pydantic schemas
│   └── routers/            endpoints por entidade
├── frontend/               Vite/React app
│   └── src/
│       ├── screens/        4 telas principais (Corpus/Editor/TestRunner/Compare)
│       └── components/     reuso
├── scripts/
│   └── ingestion/          carregamento de corpora (SigLA, Voynich EVA2, ...)
└── docs/                   específico do código (links pros docs gerais ficam em /docs/)
```

## Stack

- **DB:** Supabase, prefixo `graphoscodex_*`. Schema em
  `supabase/migrations/.../graphoscodex_schema_v0.sql` (aplicado via MCP).
- **API:** FastAPI + Python 3.11, mesma stack da Hermeneia. Reaproveita padrões.
- **Frontend:** Vite + React + TypeScript, tema escuro consistente com Hermeneia.
- **LLM:** Anthropic Claude (Sonnet pra raciocínio sobre hipóteses, Haiku pra
  testes em massa). Mesmo `.env` da Hermeneia.

## Estado atual

Fase 1 / bloco 1 (schema) ✅ — bloco 2 (estrutura) ✅ — bloco 3 (esboço frontend) em andamento.

Ver `CLAUDE.md` na raiz e `docs/` na raiz pros planos vivos.

## Convenções herdadas da Hermeneia

- Provenance é inegociável: toda hipótese tem autor + data + evidência.
- Não é opinião do modelo: tudo ancorado em dado verificável.
- Scripts de ingestão são idempotentes.
- Bem comum: código aberto, dados abertos, hipóteses atribuídas mas livres.
