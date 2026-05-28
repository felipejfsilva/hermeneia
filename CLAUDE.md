# HERMENEIA — Memória do projeto

Auditor filológico de traduções. Recebe (texto original em língua antiga +
tradução existente), alinha token a token, consulta léxicos reais e o consenso
de traduções de referência, e devolve por token: confiança, flags, glosa,
alternativas e citação. **Não é "opinião do modelo": tudo ancorado em dado
verificável.** Esse princípio de honestidade é central — ver "Dívidas".

## Arquitetura
- **API**: FastAPI em `api/main.py`; pipeline em `api/pipeline/`
  (`refine.py` orquestra; `align.py` alinhamento via Claude; `rag.py` léxico +
  consenso; `scoring.py` confiança/flags). Modelos em `api/models/schemas.py`.
- **Frontend**: Vite/React em `frontend/` (`api.ts` lê `VITE_API_URL`).
- **DB**: Supabase (projeto `hbcwsurfdfcgfxxawfhc`), tabelas `hermeneia_*`
  (escopo isolado — o projeto Supabase é COMPARTILHADO com um sistema clínico;
  NUNCA tocar tabelas não-`hermeneia_`).
- **LLM**: Claude (Sonnet pra alinhamento, Haiku por token). Chave em `.env`.
- Branch de trabalho: `claude/affectionate-cannon-ZRee9`.

## Ambiente
- `.venv` (deps core; `requirements.txt` fixa `supabase==2.30.0` — versões
  antigas rejeitam a chave `sb_publishable_`). `betacode`+`pygtrie` instalados
  só no venv (uso de ingestão; a API publicada não precisa).
- `.env`: `ANTHROPIC_API_KEY`, `SUPABASE_URL`, `SUPABASE_KEY` (publishable).
- Rodar pipeline local: `.venv/bin/python test_pipeline.py` (Gênesis 1:1).

## Estado do léxico (DB) — ~149.800 entradas
- **Hebraico**: 60 curados (com `controversy_notes`) + BDB completo = 7.998.
  Fonte BDB: OpenScriptures (auto-baixado por `scripts/lexicons/ingest_bdb.py`).
- **Grego**: LSJ (Perseus, betacode→unicode) = 90.405, sob `classical_greek`
  (koine e clássico compartilham; lookup cobre ambos). `ingest_lsj.py`.
- **Latim**: Lewis & Short (Perseus) = 51.394, sob `latin`. `ingest_ls.py`.

### Decisão de design central: match por lema NORMALIZADO
O lema do alinhamento (Claude) e o headword do léxico divergem em vocalização/
encoding (nikud, acentos gregos vindos de betacode, mácrons/inflexão latina).
`rag.py:lookup_lexicon` tenta match exato e cai num **fallback por chave
normalizada** (`normalized_lemma`): `consonantal` (hebraico), `greek_bare`
(grego), `latin_bare` (folding j→i/v→u). Coluna `lemma_consonantal` (indexada)
guarda essa chave. Mesma função roda na ingestão e no runtime. Homógrafos:
ordena por `attestation_count` (sentido dominante primeiro). Os 60 lemas
curados têm o esqueleto "reservado" — BDB não os encobre.

## Consenso de traduções (`hermeneia_token_consensus`)
- Hebraico: 8 fontes (KJV, NRSV, NJPS, ESV, Alter, Fox, LXX, Vulgata).
- Grego: 8 fontes (NRSV, NASB, KJV, ASV, Tyndale, ESV, NIV, Vulgata).
- Derivado por LLM (`scripts/lexicons/ingest_consensus.py`); pesos vêm de
  `hermeneia_reference_translations` (fonte única). Marcado
  `provenance='llm_derived'` (coluna pronta pra trocar por `verified` na v2).
- Chave `original_token` = lema NORMALIZADO (igual ao léxico); `get_reference_
  consensus` normaliza na consulta. Match de termo: `normalize_term` (stem EN).
- `scoring.py` faz blend `0.6*léxico + 0.4*consenso` e dispara `CONSENSUS_LOW`
  se weighted_score < 0.40.
- Ambos usam lista CURADA de alta frequência (`CURATED_LEMMAS`: 60 lemas NT
  gregos + `TOP_HEBREW_LEMMAS`) — NÃO o léxico inteiro (varrer 7998/90k é
  inviável e ruidoso). Estado: hebraico 94 linhas/54 lemas, grego 69/60.

## Feito nesta sessão (commits na branch)
1. Fix double-encode (`main.py`: segments/summary como JSONB nativo).
2. Consenso hebraico LLM-derivado + re-keying por lema (destravou dead path).
3. BDB XML completo (60→7998) + fallback consonantal.
4. Scaffolding de deploy: `railway.json`, `.python-version`, `frontend/
   vercel.json`, CORS por `ALLOWED_ORIGINS`, `DEPLOY.md`.
5. LSJ grego (90k) + `greek_bare` + lookup cross-dialeto.
6. Lewis & Short latim (51k) + `latin_bare`.
7. Consenso robusto (chave normalizada) + extensão pro grego (8 fontes),
   validado: λόγος→"Word" unânime, ἀγάπη "charity" e σάρξ "sinful nature"
   disparam CONSENSUS_LOW; hebraico re-keado segue casando.

## Textos-fonte por referência (`hermeneia_source_texts`)
- Usuário digita uma referência ("John 1:1") e escolhe o testemunho-base.
- 39.097 versículos: **WLC** (hebraico, scrollmapper), **TR** (grego, scrollmapper)
  e **SBLGNT** (grego crítico, morphgnt). Bizantino fica pra depois (caminho
  instável). Ingestão: `scripts/sources/ingest_source_texts.py` (idempotente).
- Nomes de livro canônicos = padrão scrollmapper ("I Corinthians",
  "Revelation of John"). `api/references.py:resolve_reference` faz o parse
  (aliases jn/Mt/1 Cor, prefixo, 1↔I). Endpoint `GET /source-text?ref=&language=`.
- Frontend: bloco "Fetch original by reference" → cards de testemunho clicáveis
  que preenchem o original.

## Laudo (entregável final, bilíngue)
- `RefineRequest.output_language` ('pt'|'en', default 'pt') controla:
  - `generate_narrative` → veredito em prosa (1 chamada Sonnet); SINTETIZA os
    achados, não introduz afirmações fora dos dados.
  - `generate_corrected_translation` → texto corrido sugerido (1 chamada Sonnet)
    aplicando SOMENTE as correções sinalizadas, no MESMO idioma da tradução
    auditada (não é reescrita livre). Pulado se não há correções.
  - rótulos do laudo (PT/EN).
- `frontend/src/laudo.ts`: `buildLaudo` (Markdown, fonte única) + `buildLaudoHtml`
  via `_mdToHtml` (mesmo conteúdo, estilizado A4) + `printLaudoPdf` (abre janela
  e dispara o Salvar-como-PDF do navegador — Unicode grego/hebraico renderiza
  certo, texto fica selecionável). `downloadLaudo` baixa `.md`.
- Estrutura: cabeçalho · Veredito · Síntese · Análise por token · Metodologia
  · `---` · **ORIGINAL** / **TRADUÇÃO** / **CORREÇÕES SUGERIDAS** + texto
  corrido sugerido. Botões "↓ PDF" e "↓ .md" no painel de resultados.
- Correções sugeridas seguem regra principiada: SÓ tokens sinalizados, sugestão
  limpa (`_cleanSuggestion`) ≠ existente, não-artigo, dedup por lema sem
  pontuação (mesma regra em `laudo.ts` e `refine.py:flagged_corrections`).

## Scoring com guards (`scoring.py`)
- `semantic_narrowing` é SUPRIMIDO em dois casos (evita ruído):
  - **Palavras gramaticais** (artigo, conjunção, preposição, marcador de
    objeto direto) — detectado pela glosa/renderização ser uma function word.
  - **Consenso quase-unânime** (`weighted_score ≥ 0.85`, ~7/8) — convenção
    tradutória consolidada (ex.: πίστις→"faith"/"fé" 8/8 não dispara).
- `CONSENSUS_LOW`: `weighted_score < 0.40`. Blend final: `0.6·léxico + 0.4·consenso`.

## Consenso bilíngue (suporta auditar traduções não-inglesas)
- Os termos do consenso são ancorados em inglês ("love", "faith", "hope"...).
- `analyze_token_single_call` retorna `existing_in_english` (uma palavra padrão
  de léxico para a rendição do usuário); `process_token` casa o consenso por
  esse equivalente — assim "amor"/"fé"/"esperança" da Almeida casam com
  "love"/"faith"/"hope" e param de tomar falso `CONSENSUS_LOW`.
- `refined` (sugestão por token) preserva forma gramatical (número/tempo/grau)
  e SAI no idioma da tradução auditada (não vaza inglês em audit PT).

## Pendente
- **Deploy real** (Railway API + Vercel frontend) — depende das contas do
  usuário; passo a passo em `DEPLOY.md`. Não há PR aberto (não foi pedido).
- Consenso para latim (sem traduções de referência seeded ainda).
- Bizantino como 3º testemunho grego (`byztxt` resistiu; achar fonte alternativa).

## Dívidas de honestidade / limitações conhecidas (importante)
- Consenso é `llm_derived` (memória do modelo, não corpus alinhado real). v2:
  substituir por corpus e marcar `verified`.
- Fallback de match por esqueleto pode pegar o homógrafo errado (mitigado por
  ordenar por frequência, mas existe).
- Glosa do Lewis & Short é extraída heuristicamente (~85% limpa; resto lidera
  com variante de forma). `semantic_range` é bom em todos.
- LSJ é léxico CLÁSSICO: glosa de termo NT diverge (λόγος→"reckoning"), gera
  `semantic_narrowing` legítimo. Upgrade koiné = BDAG (copyright).
- RLS: `hermeneia_analyses`/`manuscripts` são `USING(true)` (sem isolamento por
  usuário) — decidir antes de expor URL pública. Léxico/consenso abertos = ok.

## Convenções
- Mensagens de commit: "HERMENEIA — <descrição>" em pt-BR, sem acento no corpo.
- Scripts de ingestão são idempotentes; XMLs de fonte ficam em `data/lexicons/`
  (gitignored, auto-baixados).
