# GRAPHOSCODEX — Especificação v3

**GRAPHOSCODEX** — portmanteau de γράφος ("escrito") + *codex* (latim: manuscrito bound, também "código"). Confirmado disponível em 2026: zero conflito de marca em qualquer setor, domínios `.org` / `.com` / `.io` / `.app` livres, GitHub org `graphoscodex` livre, PyPI e npm livres.

**Em uma frase.** Workbench colaborativa, multimodal e versionada para registrar, testar e comparar hipóteses de decifração de scripts antigos não decifrados, integrando texto, iconografia, paleografia, e a história das tentativas anteriores como dado estruturado.

---

## Decisões consolidadas (v3)

1. ✅ **Nome:** **GraphosCodex** — domínios `graphoscodex.org` (acadêmico, primário) + `graphoscodex.com` (defensivo) ambos livres. GitHub org livre.
2. ✅ **Primeiro script:** **Linear A**, com Voynich entrando no lançamento como segundo caso de demonstração
3. ✅ **Iconografia no MVP**, expandindo escopo conforme abaixo
4. ✅ **Contato com INSCRIBE: depois** do protótipo demonstrável
5. ✅ **Domínio próprio** — comprar imediatamente após confirmação final do nome
6. ✅ **Hermeneia continua separada** como ferramenta de auditoria filológica
7. ✅ **Modelo open source / bem comum acadêmico** — sem monetização individual
8. ✅ **Autenticação obrigatória** pra criar hipóteses; público anônimo pode ler

## Por que Linear A primeiro (justificativa registrada)

Decisão informada por achado em literatura recente. *Information* (MDPI, 2024) sobre Linear A computacional articula:

> *"Useful for generating and evaluating hypotheses, not for producing translations. When applied to Linear A without a known related language, the proposals multiply without being reducible to a single verifiable answer."* ([mdpi.com/2078-2489/15/2/73](https://www.mdpi.com/2078-2489/15/2/73))

Esse é literalmente o gap que o GraphosCodex preenche. O campo já se articulou demandando nossa categoria de ferramenta. Linear A:
- Tem âncora (Linear B decifrado) → permite **validação parcial** das predições do framework
- Tem comunidade acadêmica estabelecida → **legitimidade de saída**
- Tem SigLA / Younger / INSCRIBE → **dados estruturados pra consumir**
- Trabalho ativo em 2024-25 → **momento certo**

Voynich entra no lançamento como segunda demonstração. Vantagens combinadas: legitimidade acadêmica (Linear A) + atenção pública (Voynich) na mesma porta.

---

## 1. Como vai funcionar

**Fluxo do pesquisador (autenticado):**

1. Login (Supabase Auth: ORCID priorizado, Google, GitHub, email institucional).
2. Escolhe script (Linear A no MVP; Voynich segundo; Indus/Rongorongo/Cypro-Minoan depois).
3. Navega corpus: inscrições + imagens em alta resolução + transcrições + **timeline historiográfica** das tentativas sobre cada peça.
4. Registra hipótese (form estruturado):
   - mapeamento signo→fonema OU signo→significado
   - escopo (signos individuais, sequências, sistema todo)
   - evidência (citação interna ou externa)
   - tipo (fonética, semântica, estrutural, cifra...)
5. Sistema executa **testes cross-modal automáticos**:
   - **Cobertura**: fração do corpus que a hipótese cobre
   - **Consistência interna**: ocorrências do signo predizem outras?
   - **Plausibilidade fonotática**: som gerado bate com famílias linguísticas conhecidas?
   - **Iconografia**: palavras propostas correlacionam com imagens adjacentes? *(novo no MVP graças à decisão 4)*
   - **Comparação cross-hipótese**: onde concorda/diverge das hipóteses cadastradas
6. Recebe **relatório estruturado** com pontuação multimodal + flags + predições novas.
7. Compara N hipóteses lado a lado.
8. Publica hipótese com **ID permanente citável** (DOI-style).
9. Pode revisar hipótese alheia (PR-style).
10. Baixa **laudo PDF** pra circulação acadêmica (mesmo motor da Hermeneia, adaptado).

**Fluxo do público anônimo:** navega tudo, lê tudo, não cadastra.

---

## 2. O que pretende responder

**Pergunta-mãe:**
> Dado um script não decifrado, qual hipótese (ou combinação) melhor explica os padrões observados em texto + iconografia + paleografia + registro historiográfico — e onde cada hipótese quebra?

**Sub-perguntas operacionais:**
- **Linear A**: quais correspondências com Linear B produzem leituras parciais consistentes? Quais hipóteses sobre família linguística (anatoliana? semítica? isolado?) sobrevivem ao teste cross-modal?
- **Voynich**: anomalias estruturais (entropia baixa, padrões `daiin daiin`) são explicáveis por alguma hipótese atual? Iconografia das plantas se correlaciona com a transcrição?
- **Geral**: validação multimodal distingue hipótese sólida de hipótese frágil de forma reproduzível?

**Métricas de sucesso do projeto:**
1. Reproduzimos quantitativamente o consenso entre hipóteses históricas para cada script?
2. Geramos predições novas testáveis por outros pesquisadores?
3. Identificamos a hipótese mais robusta em cada script segundo critério multimodal?
4. Servimos como infraestrutura citada por >10 pesquisadores em 18 meses?

---

## 3. Onde entra (positioning)

| Atores existentes | Cobrem | Não cobrem |
|---|---|---|
| INSCRIBE / SigLA | paleografia, dados estruturados sobre signos | síntese cross-hipótese, geração, historiografia |
| DESCRYPT | recognition, OCR, IA generativa de imagem | multi-script comparativo, versionamento colaborativo |
| AI-EPIGRAPHY | ferramenta interativa pra Indus | escala pra outros scripts |
| voynich.nu / Zandbergen | transcrição Voynich | análise generativa, hipóteses estruturadas |
| Mahadevan/Wells/Ferrara | catalogação | infraestrutura pra trabalho coletivo |
| Papers individuais | proposta isolada | testes automáticos, comparação cross-hipótese |

**Posicionamento do GraphosCodex: camada de síntese ACIMA de tudo isso.** Não compete; **complementa superiormente** — consome dados deles, devolve análise integrada.

**Analogia operacional**: GitHub da decifração. Cada hipótese é "commit", cada inscrição é "arquivo", cada predição é "test case", cada revisão é "PR".

**Relação com INSCRIBE (decisão registrada: contatar depois):**
- Após MVP demonstrável, contatar **Silvia Ferrara (Bologna)** propondo GraphosCodex como camada complementar.
- Eventual proposta: GraphosCodex como sub-projeto formal do INSCRIBE (capítulo "Digital Humanities"). Reduz risco de "concorrência" pra "colaboração formal".

---

## 4. Corpus necessário (atualizado)

### Tier 1 — Corpus de inscrições (Linear A prioritário no MVP)
| Script | Fonte primária | Status |
|---|---|---|
| **Linear A** (prioridade 1) | SigLA + Younger + Linear A Digital Corpus | ~1500 inscrições; **ingestar no MVP** |
| **Voynich** (prioridade 2) | EVA2 Zenodo + Zandbergen IVTFF | ~38k tokens; **ingestar no MVP pra lançamento conjunto** |
| Indus | Mahadevan 1977 + Wells 2009 | ~5000 inscrições; v1 pós-lançamento |
| Rongorongo | rongopy + Barthel + Échancrée 3D | ~14k glifos; v1.5 |
| Cypro-Minoan | Ferrara 2012 vol. 2 | 243 inscrições; v1.5 |

**Total MVP:** Linear A + Voynich → ~50 MB texto, ~5 GB imagens iniciais.

### Tier 2 — Banco de hipóteses históricas
**MVP:** Linear A com ~15-20 hipóteses cadastradas (Younger, Ventris-era partial readings, propostas anatolianas, semíticas, computacionais 2024). Voynich com ~10-15 (Cheshire, Pelling, Rugg, Lindemann, Tucker, Bowern, Stojanov...).

**Trabalho de curadoria:** ~4 semanas pra Linear A, ~3 pra Voynich. Total 6-8 semanas dentro do cronograma MVP.

### Tier 3 — Imagens dos artefatos (público + curadoria)
- **Linear A**: SigLA tem fotos de cada signo + algumas tabuinhas completas. Aegean Society tem mais. **~5 GB no MVP**.
- **Voynich**: Beinecke (yale.edu) → todos os fólios em alta resolução, Public Domain. **~3 GB no MVP**.

### Tier 4 — Paleografia estruturada
**Linear A**: importar diretamente do SigLA (formato bem definido). **Voynich**: classificação de mãos de escriba (Currier, Davis) já existe. Cadastrar como dado estruturado.

### Tier 5 — Iconografia estruturada (NOVO NO MVP)
*Decisão expandida conforme aprovação de iconografia no MVP:*

- **Voynich**: anotação das ~300 ilustrações botânicas, ~50 astronômicas, ~100 "bath" figures.
  - Cada elemento icônico: bounding box + classificação tentativa (planta-tipo, motivo, símbolo)
  - Link explícito ao trecho textual adjacente
  - Hipótese sobre função (decorativo, ilustrativo, semântico)
- **Linear A**: tabuinhas administrativas têm sinalética + signos. Anotar a sinalética (tipo de produto, símbolo de quantidade) cruzando com texto.

**Trabalho:** ~6 semanas pra Voynich (botânica histórica tem prévio: Tucker & Janick, etc.), ~3 pra Linear A (escopo menor). **9 semanas adicionais no MVP.**

**Aumento de escopo total do MVP:** ~30% (de 3-4 meses pra 4-5 meses focados).

---

## 5. Cérebro (compute + IA)

Quatro camadas, custo crescente:

### 5.1 Lookup e versionamento (custo trivial)
Postgres + pgvector. $0-25/mês.

### 5.2 Embeddings cross-modal (custo baixo)
- Texto: OpenAI ada-002 ou Voyage AI
- Imagem: CLIP, DINOv2 (open weights, inferência local)
- **Cross-modal (CLIP)**: essencial pra correlacionar iconografia ↔ texto. Mainstream em 2024-25.

**Custo:** ~$0.10/1M tokens. Corpus MVP: $1-2 inicial + $0.05/hipótese nova.

### 5.3 LLM reasoning (custo moderado)
Cada teste de hipótese chama Sonnet/Opus pra:
- Avaliar consistência interna
- Comparar com hipóteses cadastradas
- Gerar relatório estruturado
- Sugerir testes adicionais

**Custo:** $0.30-1.50 por teste. Pesquisador ativo testando 20-50/mês: $10-50/mês por usuário ativo.

### 5.4 Geração (custo alto — fica pra v2, fora do MVP)
- TTS condicional ao som reconstruído
- Renderização paleográfica
- Completação iconográfica

### Custo total estimado (MVP → escala)
- **MVP (10-20 pesquisadores beta):** $50-150/mês
- **Crescimento (100 ativos):** $300-800/mês
- **Escala referência (1000+):** $2000-5000/mês → ponto de buscar grant (NEH/Mellon/ERC)

---

## 6. Hospedagem

| Camada | Provedor | Custo MVP |
|---|---|---|
| Frontend | Vercel Hobby → Pro | $0-20/mo |
| API | Railway Hobby | $5/mo |
| Banco + Auth | Supabase Pro | $25/mo |
| Storage imagens | Supabase Storage / Backblaze B2 | $5-20/mo |
| LLM | Anthropic API | variável |
| Embeddings | OpenAI / Voyage | variável |
| Domínio | `graphoscodex.org` + `graphoscodex.com` | ~$30/ano |

**Fixo mensal MVP:** $35-70 + variável de inferência.

**Continuidade com Hermeneia:** exata mesma stack. Zero curva nova. Reaproveita know-how operacional.

---

## 7. Quem vai usar

**Tier A (pesquisadores autenticados):** target principal.
- ORCID priorizado, Google/GitHub fallback, email institucional aceito
- Podem criar hipóteses, rodar testes, baixar laudos, comparar
- DOI-like ID por hipótese
- Histórico visível
- **Base estimada:** 200-2000 pessoas globalmente

**Tier B (estudantes/perifericos):** mesmo cadastro.
- Podem propor hipóteses em modo "tentativa" → revisão moderada
- Acesso completo de leitura

**Tier C (público anônimo):**
- Navega tudo, lê tudo
- Cada hipótese tem página pública citável (SEO + permalink)
- Não comenta, não cadastra

---

## 8. Apresentação

### 8.1 Site público
Hero sóbrio + exemplo concreto (Linear A SigLA AB80 com 3 hipóteses lado a lado: semítica, anatoliana, isolado) + painel "scripts cobertos" + CTA bipartido ("Pesquisador: registre hipótese" / "Visitante: navegue").

URL primária: **`graphoscodex.org`** (acadêmico) + **`graphoscodex.com`** (defensivo/redirect).

### 8.2 Workbench do pesquisador (3 painéis)
**Esquerda:** corpus browser. Lista scripts → inscrições → fólio/peça → imagem em alta resolução + transcrição alinhada + timeline historiográfica.

**Centro:** ambiente de hipótese. Editor estruturado, visualização das predições, output dos testes em tempo real, comparação side-by-side.

**Direita:** contexto histórico. Linha do tempo das tentativas, hipóteses concorrentes ativas, citações cruzadas, conflitos sinalizados.

**Funcionalidades MVP:**
- Inscription viewer (imagem zoom + transcrição alinhada)
- Hypothesis editor (form estruturado pra cadastrar signo→valor)
- Test runner (botão "Rodar testes nessa hipótese" → relatório multimodal)
- Comparison view (selecionar 2-3 hipóteses → diff visual de mapeamentos + concordância/conflito)
- Timeline view (todas as tentativas pra X script em linha do tempo)
- Iconography annotator (bounding box + tag + link textual) — **novo MVP**
- Export (laudo PDF/MD + dataset CSV + JSON estruturado)

### 8.3 API REST + GraphQL
- `GET /scripts` — lista
- `GET /scripts/{id}/inscriptions` — paginação
- `GET /inscriptions/{id}` — texto + imagem + paleografia + iconografia
- `GET /hypotheses?script=&author=` — filtros
- `POST /hypotheses` — cria (auth)
- `POST /hypotheses/{id}/test` — roda testes
- `GET /comparisons?ids=...` — compara N
- Dataset dumps em Zenodo periódicos (citáveis com DOI)

---

## 9. Cronograma revisado (com iconografia no MVP)

**Total MVP: 4-5 meses focados** (vs 3-4 da v1, expandido pela iconografia)

- **Mês 1:** schema + ingestão Tier 1 (Linear A + Voynich corpus) + adaptação backend Hermeneia → GraphosCodex
- **Mês 2:** workbench básico + cadastro Tier 2 (hipóteses Linear A primeiro)
- **Mês 3:** testes automáticos + comparison view + cadastro Tier 2 Voynich
- **Mês 4:** anotação iconográfica (Voynich plantas + Linear A administrativa) + cross-modal CLIP integration
- **Mês 5:** polimento + lançamento beta restrito (5-10 pesquisadores convidados, Linear A + Voynich vivos)

**v1 pública**: meses 6-8 (feedback do beta + paper submetido + scripts adicionais).
**v2 com geração (som, imagem, paleografia)**: 6-12 meses pós v1.

---

## 10. Riscos honestos

1. **Nome:** zero colisão confirmada — incluindo com Apollo GraphOS (que usa "GraphOS"). "GraphosCodex" é etimologicamente distinto e ortograficamente exclusivo. Sem mitigação necessária.
2. **Adoção lenta em humanidades.** Conferências certas (SCiL, ALP @ EMNLP, DH), contato direto com INSCRIBE no momento certo.
3. **Curadoria histórica é trabalho duro.** Começar focado (Linear A + Voynich), expandir incrementalmente.
4. **Iconografia anotada é gargalo.** Começar com Voynich plantas (tem trabalho prévio sólido em botânica histórica) + Linear A sinalética administrativa (menor escopo).
5. **Você sozinho até MVP.** Arrastar pelo menos 1 advisor acadêmico cedo (após MVP, Linear A scholar via INSCRIBE).
6. **Modelo de IA evolui.** Arquitetura modular permite troca subjacente.
7. **Conflito de marca GraphosCodex com Apollo.** Não é colisão direta (epigrafia vs GraphQL), mas afeta buscabilidade no Google. Aceitar e mitigar.

---

## 11. O que isso NÃO é

- **Não é tentativa de decifrar** Linear A/Voynich. É infraestrutura pra tornar as tentativas sistemáticas.
- **Não é SaaS.** Não cobramos.
- **Não é catálogo passivo.** Tem geração e validação.
- **Não é pra leitor casual.** Audiência especializada.
- **Não substitui** INSCRIBE/DESCRYPT/AI-EPIGRAPHY. **Integra com.**
- **Não promete decifração.** Promete metodologia disciplinada.
- **Não é código fechado.** Tudo aberto: código, dados, hipóteses, dumps periódicos em Zenodo.

---

## 12. Próximo passo (após confirmação final do nome)

1. **Comprar domínios** `graphoscodex.org` + `graphoscodex.com` — imediatamente. Custo total ~US$ 30/ano. Registrar via Namecheap, Cloudflare Registrar, ou Google Domains (atual Squarespace).
2. **Esboços de UI** das 4 telas principais (corpus browser, hypothesis editor, test runner output, comparison view) — Figma ou wireframes simples em código.
3. **Conta GitHub Organization** `graphos-decipherment` ou similar — disponível?
4. **Reservar handles sociais** Twitter/Mastodon/Bluesky → `@graphos`, `@graphostools`
5. Especificação + esboços + reservas = base sólida pra levar a terceiros (advisor acadêmico, futuro grant officer, potencial colaborador) **antes** de gastar tempo construindo código novo.

Sem essas reservas e esboços, qualquer linha de código nova é prematura.

---

_Especificação viva. Revisar conforme nome final confirma-se e escopo refina._
