# Cérebro do projeto

Memória persistente de **dois legados relacionados**, na mesma branch de trabalho (`claude/affectionate-cannon-ZRee9`). Ambos compartilham raiz arquitetural; permanecem produtos separados.

- **LEGADO HERMENEIA** — auditor filológico de traduções (operacional, validado, código vivo)
- **LEGADO GRAPHOSCODEX** — workbench de decifração de scripts antigos (especificado, identidade registrada, código a iniciar)

---

# LEGADO HERMENEIA

**O que é.** Auditor filológico de traduções. Recebe (texto original em língua antiga + tradução existente), alinha token a token, consulta léxicos reais e o consenso de traduções de referência, e devolve por token: confiança, flags, glosa, alternativas e citação. **Não é "opinião do modelo": tudo ancorado em dado verificável.** Esse princípio de honestidade é central — ver "Dívidas".

## Arquitetura
- **API**: FastAPI em `api/main.py`; pipeline em `api/pipeline/` (`refine.py` orquestra; `align.py` alinhamento via Claude; `rag.py` léxico + consenso; `scoring.py` confiança/flags). Modelos em `api/models/schemas.py`.
- **Frontend**: Vite/React em `frontend/` (`api.ts` lê `VITE_API_URL`). Landing em `Landing.tsx`, app em `App.tsx`; alterna via `#audit` hash sem router.
- **DB**: Supabase (projeto `hbcwsurfdfcgfxxawfhc`), tabelas `hermeneia_*` (escopo isolado — o projeto Supabase é COMPARTILHADO com um sistema clínico; NUNCA tocar tabelas não-`hermeneia_`).
- **LLM**: Claude (Sonnet pra alinhamento, Haiku por token). Chave em `.env`.

## Ambiente
- `.venv` (deps core; `requirements.txt` fixa `supabase==2.30.0` — versões antigas rejeitam a chave `sb_publishable_`). `betacode`+`pygtrie` instalados só no venv (uso de ingestão; a API publicada não precisa).
- `.env`: `ANTHROPIC_API_KEY`, `SUPABASE_URL`, `SUPABASE_KEY` (publishable) **+** `SUPABASE_SERVICE_KEY` (servidor; bypassa RLS).
- Rodar pipeline local: `.venv/bin/python test_pipeline.py` (Gênesis 1:1).

## Estado do léxico (DB) — ~149.800 entradas
- **Hebraico**: 60 curados (com `controversy_notes`) + BDB completo = 7.998. Fonte BDB: OpenScriptures (auto-baixado por `scripts/lexicons/ingest_bdb.py`).
- **Grego**: LSJ (Perseus, betacode→unicode) = 90.405, sob `classical_greek` (koine e clássico compartilham; lookup cobre ambos). `ingest_lsj.py`.
- **Latim**: Lewis & Short (Perseus) = 51.394, sob `latin`. `ingest_ls.py`.

### Decisão de design central: match por lema NORMALIZADO
O lema do alinhamento (Claude) e o headword do léxico divergem em vocalização/encoding (nikud, acentos gregos vindos de betacode, mácrons/inflexão latina). `rag.py:lookup_lexicon` tenta match exato e cai num **fallback por chave normalizada** (`normalized_lemma`): `consonantal` (hebraico), `greek_bare` (grego), `latin_bare` (folding j→i/v→u). Coluna `lemma_consonantal` (indexada) guarda essa chave. Mesma função roda na ingestão e no runtime. Homógrafos: ordena por `attestation_count`. Os 60 lemas curados têm o esqueleto "reservado" — BDB não os encobre.

## Consenso de traduções (`hermeneia_token_consensus`)
- Hebraico: 8 fontes (KJV, NRSV, NJPS, ESV, Alter, Fox, LXX, Vulgata).
- Grego: 8 fontes (NRSV, NASB, KJV, ASV, Tyndale, ESV, NIV, Vulgata).
- Derivado por LLM (`scripts/lexicons/ingest_consensus.py`); pesos vêm de `hermeneia_reference_translations` (fonte única). Marcado `provenance='llm_derived'`.
- Chave `original_token` = lema NORMALIZADO; `get_reference_consensus` normaliza na consulta. Match de termo: `normalize_term` (stem EN).
- `scoring.py` faz blend `0.6·léxico + 0.4·consenso` e dispara `CONSENSUS_LOW` se weighted_score < 0.40.
- Ambos usam lista CURADA de alta frequência — NÃO o léxico inteiro. Estado: hebraico 94 linhas/54 lemas, grego 69/60.

## Textos-fonte por referência (`hermeneia_source_texts`)
- Usuário digita uma referência ("John 1:1") e escolhe o testemunho-base.
- 39.097 versículos: **WLC** (hebraico, scrollmapper), **TR** (grego, scrollmapper), **SBLGNT** (grego crítico, morphgnt).
- `api/references.py:resolve_reference` (aliases jn/Mt/1 Cor, prefixo, 1↔I). Endpoint `GET /source-text?ref=&language=`.
- Frontend: bloco "Fetch original by reference" → cards de testemunho clicáveis.

## Laudo (entregável final, bilíngue)
- `RefineRequest.output_language` ('pt'|'en', default 'pt') controla:
  - `generate_narrative` → veredito em prosa (1 chamada Sonnet).
  - `generate_corrected_translation` → texto corrido sugerido aplicando SOMENTE correções sinalizadas, no mesmo idioma da tradução auditada.
  - rótulos do laudo.
- `frontend/src/laudo.ts`: `buildLaudo` (Markdown), `buildLaudoHtml` via `_mdToHtml`, `printLaudoPdf` (abre janela e dispara Salvar-como-PDF do navegador). `downloadLaudo` baixa `.md`.
- Estrutura: cabeçalho · Veredito · Síntese · Análise por token · Metodologia · `---` · **ORIGINAL** / **TRADUÇÃO** / **CORREÇÕES SUGERIDAS** + texto corrido sugerido.

## Scoring com guards (`scoring.py`)
- `semantic_narrowing` SUPRIMIDO em dois casos:
  - **Palavras gramaticais** (artigo, conjunção, preposição, marcador de objeto direto).
  - **Consenso quase-unânime** (`weighted_score ≥ 0.85`) — convenção tradutória consolidada.
- `CONSENSUS_LOW`: `weighted_score < 0.40`. Blend: `0.6·léxico + 0.4·consenso`.

## Consenso bilíngue
- `analyze_token_single_call` retorna `existing_in_english`; `process_token` casa o consenso por esse equivalente — "amor"/"fé"/"esperança" da Almeida casam com "love"/"faith"/"hope".
- `refined` preserva forma gramatical (número/tempo/grau) e sai no idioma da tradução auditada.

## Deploy: modo aberto/anônimo
- **RLS endurecido** em `hermeneia_analyses`/`manuscripts`: INSERT aberto pra anon (qualquer um submete), SELECT/UPDATE/DELETE só com `SUPABASE_SERVICE_KEY` (servidor).
- **Rate limit por IP**: 10 análises/min (configurável `REFINE_RATE_PER_MIN`).
- **Teto diário global**: 500 análises/24h (configurável `REFINE_DAILY_CAP`) — defesa de budget Anthropic.
- **Endpoint `/usage`**: `{used_last_24h, daily_cap, rate_per_ip_per_min}` pra monitorar.
- **Scaffolding**: `railway.json`, `.python-version`, `frontend/vercel.json`, CORS por `ALLOWED_ORIGINS`, `DEPLOY.md`.
- **Estado real do deploy**: não está no ar. Configs prontas; usuário decidiu fazer só o frontend no Vercel (sem API), aceitando que audit não funciona até hostear a API.

## Pendente Hermeneia
- Deploy real (API no Railway/Render + frontend no Vercel) — depende do usuário.
- Consenso para latim (sem traduções de referência seeded ainda).
- Bizantino como 3º testemunho grego (`byztxt` resistiu; achar fonte alternativa).

## Dívidas de honestidade
- Consenso é `llm_derived` (memória do modelo, não corpus alinhado real). v2: substituir por corpus e marcar `verified`.
- Fallback de match por esqueleto pode pegar o homógrafo errado.
- Glosa do Lewis & Short é extraída heuristicamente (~85% limpa).
- LSJ é léxico CLÁSSICO: glosa de termo NT diverge (λόγος→"reckoning"). Upgrade koiné = BDAG (copyright).

## Convenções
- Mensagens de commit: "HERMENEIA — <descrição>" em pt-BR, sem acento no corpo.
- Scripts de ingestão são idempotentes; XMLs de fonte ficam em `data/lexicons/` (gitignored, auto-baixados).

---

# LEGADO GRAPHOSCODEX

**Workbench colaborativa, multimodal e versionada para registrar, testar e comparar hipóteses de decifração de scripts antigos não decifrados** — Linear A, Voynich, Indus, Rongorongo, Cypro-Minoan. Posicionamento: **"GitHub da decifração"**. Camada de síntese **acima** de INSCRIBE / DESCRYPT / SigLA / AI-EPIGRAPHY (consome dados deles, devolve análise integrada).

**Hermeneia continua existindo separadamente** — vira o primeiro caso fechado de demonstração do método (auditoria de tradução). GraphosCodex aplica a mesma arquitetura subjacente ao domínio da decifração. ~80% reaproveitável.

## Estado atual (jun/2026)

- ✅ **Nome confirmado:** GraphosCodex (γράφος + codex). Zero conflito de marca em qualquer setor.
- ✅ **GitHub Organization**: [github.com/graphoscodex](https://github.com/graphoscodex) com `.github/profile/README.md` público.
- ✅ **Domínio**: `graphoscodex.com` registrado no Cloudflare (felipejfsilva@gmail.com, auto-renew ON, WHOIS privacy, até jun/2027, $10.46/ano). **Decisão de Felipe (jun/2026): `.com` é suficiente; `.org` NÃO será registrado.** Não voltar a sugerir o `.org`.
- ⬜ **Esboços visuais das 4 telas** (corpus browser, hypothesis editor, test runner, comparison view) — próximo passo lógico, sem urgência.
- ⬜ **Código**: zero linha escrita. Não começa antes dos esboços aprovados.

## Decisões consolidadas

1. **Primeiro script**: **Linear A** (legitimidade acadêmica, âncora Linear B, paper MDPI 2024 articulando o gap), com **Voynich** entrando no lançamento como segundo caso (expertise do usuário + apelo público).
2. **Iconografia incluída no MVP** — sem isso o framework perde metade da força. Escopo MVP expandido 30%.
3. **Contato com INSCRIBE (Bologna, Silvia Ferrara)**: depois do MVP demonstrável. Não antes.
4. **Open source / bem comum acadêmico**: zero monetização. Custo absorvido pessoalmente; grant depois (NEH/Mellon/ERC).
5. **Autenticação obrigatória** pra criar hipóteses; público anônimo pode ler.
6. **Stack**: mesma da Hermeneia (FastAPI + Supabase + React/Vite + Vercel + Railway). Zero curva nova.

## Documentos de referência (em `docs/`)

| Documento | Conteúdo |
|---|---|
| `docs/what-is-graphoscodex.md` | Resumo executivo. Pra compartilhar em 2 min. |
| `docs/project-spec.md` | Especificação técnica detalhada v3. Arquitetura, custos, cronograma, decisões. |
| `docs/decipherment-base.md` | Estado do campo em 2026 (corpora, ferramentas, projetos existentes). |

## Reaproveitamento da Hermeneia (≈80%)

| Hermeneia (atual) | GraphosCodex (planejado) |
|---|---|
| `hermeneia_lexicon_entries` (lema + glosa + citação) | `script_signs` (signário + valores propostos + autor) |
| `lemma_consonantal` (chave normalizada) | `sign_normalized` (chave normalizada paleográfica) |
| `lookup_lexicon` (exato → fallback normalizado) | `sign_lookup` (exato → fallback paleográfico tolerante) |
| `hermeneia_token_consensus` (term + sources_agreeing + weighted_score) | `hypothesis_consensus` (signo+valor + autores_concordando + weighted_score) |
| `hermeneia_reference_translations` + pesos | `decipherment_proposals` + pesos por critério acadêmico |
| `process_token` (LLM analisa token) | `analyze_inscription_chunk` (LLM analisa trecho com hipóteses) |
| `compute_confidence` (blend léxico + consenso + flags) | `compute_hypothesis_fit` (blend predição interna + consistência cruzada + flags) |
| `generate_narrative` (síntese honesta) | `generate_status_report` (estado da hipótese, predições, taxa de match) |
| Provenance `llm_derived` vs `verified` | Provenance `hypothesis` vs `tested` vs `validated_external` |
| Laudo `.md` + PDF | Submissão científica reproduzível |

## Próximo passo (quando o usuário voltar à frente GraphosCodex)

Decisões registradas que NÃO precisam mais voltar:
- Domínio: `.com` é suficiente (decisão jun/2026); `.org` descartado, não sugerir.

Pendente antes (ou em paralelo com) novo código:
1. Esboços visuais das 4 telas — já existem como wireframe React em `graphoscodex/frontend/` (jun/2026); refinar quando Felipe quiser.
2. Releitura calma de `docs/project-spec.md` pra marcar refinos.

Princípio explícito do usuário: *"não podemos começar na subjeção e obscuridade."* Os esboços (frontend wireframes) já existem; código continua sob o critério de marcos verificáveis.

## Cronograma indicativo (depois de iniciado)

- **MVP (4-5 meses focados)**: Linear A + Voynich rodando ponta-a-ponta com texto + iconografia + historiografia + comparação cross-hipótese. ~30 hipóteses históricas estruturadas.
- **v1 (mês 5-8)**: paper submetido (SCiL ou ALP @ EMNLP), abertura pública, Rongorongo/Cypro-Minoan adicionados.
- **v2 (6-12 meses após v1)**: geração multimodal (TTS de fonemas reconstruídos, renderização paleográfica).

## PLANO INTENCIONAL FASE 1 — Workbench MVP

> Não é aspiração nem estimativa. É plano com escopo rígido, ordem operacional definida, marcos binariamente verificáveis, e gatilho explícito de parada ou pivô. Construído pra dizer "feito" ou "falhou" — sem zona cinza.

### Tese da fase 1

Provar que a metodologia funciona em **DOIS scripts genuinamente distintos** — Linear A (com âncora Linear B) e Voynich (sem âncora) — com pelo menos UMA hipótese histórica de cada um cadastrada de forma estruturada, testada cross-modal, e comparada com pelo menos UMA hipótese concorrente. Se a fase 1 provar isso reproduzivelmente, as fases 2-5 ficam atraíveis pra advisors, grants e colaboradores. Se não provar, o projeto pivota ou para.

### Escopo INCLUÍDO

- 2 scripts: **Linear A + Voynich**, corpora completos ingeridos
- Camada de signos: signário catalogado + paleografia importada (SigLA pra Linear A; Currier/Davis pra Voynich)
- Camada de inscrições: imagens alta-res + transcrições alinhadas + linha do tempo historiográfica
- Camada de hipóteses: ~15-20 cadastradas por script (signo→valor + escopo + evidência + autor + data + status)
- Camada de iconografia: anotação manual + correlação automática texto↔imagem (Voynich plantas, Linear A sinalética administrativa)
- Camada de testes automáticos: cobertura, consistência interna, plausibilidade fonotática, comparação cross-hipótese, correlação iconográfica
- Camada de geração: relatório estruturado por hipótese (PDF + Markdown), comparação side-by-side de N hipóteses
- API REST + dumps periódicos em Zenodo com DOI
- Autenticação obrigatória pra cadastrar; público anônimo lê
- Beta restrito: 5-10 pesquisadores convidados (Bologna, Lund, independentes)

### Escopo EXCLUÍDO (não-metas)

- Geração de som (TTS de fonemas reconstruídos) → **fase 2**
- Geração de imagens (renderização paleográfica, completação de lacunas) → **fase 2**
- Modelos próprios fine-tuned → **fase 3**
- Tutorial / documentação pra leigos → fase 2
- Indus, Rongorongo, Cypro-Minoan → **fase 1.5** (rápido depois do MVP)
- App mobile → talvez nunca
- Monetização → **nunca**

### Sequência operacional (ordem rígida)

**Bloco 0 — Identidade e infraestrutura** *(em curso/pendente):*
- ✅ Nome confirmado
- ✅ GitHub Org + README público
- ✅ `graphoscodex.com` registrado (Felipe decidiu: `.com` único, sem `.org`)
- ⬜ Esboços visuais das 4 telas aprovados
- ⬜ Conta Cloudflare Pages criada

**Bloco 1 — Substrato de dado** *(mês 1):*
- Schema Supabase: `script_signs`, `script_inscriptions`, `decipherment_proposals`, `hypothesis_predictions`
- Ingestão SigLA + Linear A Digital Corpus
- Ingestão Voynich EVA2 do Zenodo
- Ingestão imagens (Beinecke pra Voynich; SigLA pra Linear A)

**Bloco 2 — Camada de hipóteses** *(mês 2):*
- Schema pra hipóteses estruturadas + versionamento
- Cadastro de ~10 hipóteses Linear A (Younger, computacional 2024, anatoliana, semítica, isolado)
- Cadastro de ~10 hipóteses Voynich (Cheshire, Pelling, Rugg, Lindemann, Tucker, Bowern, Stojanov)

**Bloco 3 — Testes automáticos** *(mês 3):*
- `compute_hypothesis_fit`: cobertura, consistência, plausibilidade
- `generate_status_report`: relatório estruturado
- Comparação cross-hipótese (diff visual de mapeamentos)

**Bloco 4 — Iconografia + cross-modal** *(mês 4):*
- Anotação de ~300 ilustrações botânicas do Voynich
- Anotação de sinalética administrativa no Linear A
- Correlação automática via CLIP texto-imagem

**Bloco 5 — Frontend** *(mês 4-5):*
- Adaptação do app Hermeneia: tabela token-token vira signo-signo
- Corpus browser (esquerda) + Hypothesis editor/test runner (centro) + Timeline historiográfica/comparação (direita)
- Iconography annotator (novo módulo)

**Bloco 6 — Lançamento beta** *(mês 5):*
- Convite a 5-10 pesquisadores
- Feedback loop estruturado
- Iteração focada

### Marcos binariamente verificáveis

- **M1** (fim mês 1): visitante anônimo navega corpus de Linear A + Voynich com imagens
- **M2** (fim mês 2): pesquisador autenticado cadastra e visualiza hipótese estruturada
- **M3** (fim mês 3): sistema gera relatório de fit pra UMA hipótese cadastrada
- **M4** (fim mês 4): comparação side-by-side de DUAS hipóteses Linear A funciona
- **M5** (fim mês 5): cinco pesquisadores beta cadastrados estão usando ativamente

### Critérios de sucesso (binários, sem zona cinza)

1. ✓ Pelo menos UM pesquisador externo (não o usuário) cadastrou hipótese, rodou teste, baixou laudo
2. ✓ Pelo menos UMA comparação cross-hipótese gerou insight novo (predição testável que ninguém tinha articulado antes)
3. ✓ Sistema rodando estável por 4+ semanas com >5 usuários ativos
4. ✓ Pelo menos UM laboratório/grupo (INSCRIBE, DESCRYPT, AI-EPIGRAPHY, ou similar) demonstrou interesse formal

**Se NÃO atingir os 4 em 6 meses do início → fase 1 falhou. Decisão: pivotar ou parar. Sem zona cinza.**

### Princípios operacionais da fase 1

- **Construir bem, não rapidamente.** Substrato podre não sustenta fases 2-5.
- **Cada hipótese cadastrada é propaganda da metodologia.** Curadoria > volume. Recusar entrada se evidência for fraca.
- **INSCRIBE/DESCRYPT como aliados potenciais, não concorrentes.** Citar, integrar, abrir conversa após M3.
- **Iconografia é DIFERENCIAL.** Não pular nem simplificar mesmo sob pressão de cronograma.
- **Provenance é INEGOCIÁVEL.** Toda hipótese tem autor, data, evidência. Toda predição tem origem. Toda validação tem método.
- **Hermeneia continua viva e separada.** Não desmontar, não absorver. Vira primeiro caso aplicado citável do método.

### Gatilho para fase 2 (decisão consciente, não automática)

Após atingir os 4 critérios, decisão deliberada entre:
- **Continuar** (fase 2 = camada generativa: TTS, renderização paleográfica, completação)
- **Pivotar** (aprender com fase 1 e mudar direção)
- **Pausar** (publicar paper da fase 1, aguardar grant ou colaborador)
- **Parar** (admitir que não vale)

Sem decisão consciente: fase 1 vira "mais um projeto que ficou ativo mas parou de evoluir" — risco real, evitar deliberadamente.

## Princípios herdados da Hermeneia

- **Não é opinião do modelo** — todo achado ancorado em dado verificável (signo no corpus, hipótese cadastrada, predição testável).
- **Provenance explícita** — distingue hipótese humana de teste estatístico de validação externa.
- **Bem-comum** — código aberto, dados abertos, hipóteses atribuídas mas livres.
- **Não substitui pesquisador** — somos instrumento de síntese, não decifradores.
