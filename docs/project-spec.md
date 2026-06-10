# Especificação do projeto (working title: PROJETO X)

**Propósito deste documento.** Responder com compromisso, não com hipótese, as oito perguntas estratégicas levantadas. Cada seção é um compromisso provisório — sujeito a revisão, mas concreto o bastante pra ser avaliado, criticado, refinado. Sem isso, qualquer construção é subjeção e obscuridade. Antes disso, qualquer execução é prematura.

Companion document: `docs/decipherment-base.md` (estado do campo).

---

## 0. O que é, em uma frase

**Uma workbench colaborativa, multimodal e versionada para registrar, testar e comparar hipóteses de decifração de scripts antigos não decifrados, integrando texto, iconografia, paleografia, som reconstruído e a história das tentativas anteriores como dado estruturado.**

Não substitui transcrição (INSCRIBE/SigLA fazem) nem reconhecimento (DESCRYPT/AI-EPIGRAPHY fazem). **Opera sobre os outputs deles**, fornecendo a camada de síntese e validação que não existe hoje.

Analogia operacional: **GitHub da decifração**. Cada hipótese é um "commit"; cada inscrição é um "arquivo"; cada predição é um "test case"; cada revisão é um "PR".

---

## 1. Como vai funcionar

**Fluxo do usuário-pesquisador:**

1. Faz login (autenticação obrigatória — atribuição acadêmica importa).
2. Escolhe um script (Voynich, Linear A, Indus...) ou consulta o histórico geral.
3. Navega o corpus — inscrições + imagens + transcrições + linha do tempo das tentativas de decifração sobre cada peça.
4. Registra uma hipótese (forma estruturada): signo X → fonema /ka/, signo Y → conceito "água", etc. Pode ser parcial (10 signos) ou ampla (sistema completo).
5. Sistema executa **testes cross-modal** automaticamente:
   - **Cobertura**: qual fração do corpus a hipótese cobre?
   - **Consistência interna**: as ocorrências do signo predizem outras ocorrências?
   - **Plausibilidade fonotática**: o som gerado é compatível com famílias linguísticas conhecidas?
   - **Iconografia**: as palavras propostas correlacionam com as imagens adjacentes?
   - **Historiografia**: como se compara com hipóteses anteriores cadastradas?
6. Recebe relatório estruturado: pontos fortes, conflitos, predições novas testáveis em fragmentos não usados na construção.
7. Pode comparar hipóteses lado a lado (sua vs Cheshire vs Pelling).
8. Pode publicar a hipótese com DOI-like permanente. Citável.
9. Pode propor revisão de hipótese alheia (PR).
10. Pode baixar laudo PDF da hipótese pra circulação acadêmica.

**Fluxo do usuário-público:**
- Navega corpus, lê hipóteses cadastradas, compara, lê laudos. Não cadastra hipóteses.

---

## 2. O que pretende responder

**Pergunta-mãe:**
> Dado um script não decifrado, qual hipótese (ou combinação) melhor explica os padrões observados em texto + iconografia + paleografia + registro historiográfico — e onde cada hipótese quebra?

**Sub-perguntas operacionais:**
- Para o Voynich: as anomalias estruturais (entropia baixa, repetições tipo `daiin daiin`, distribuição de tamanho de palavra) são explicáveis por alguma hipótese atual?
- Para Linear A: quais correspondências com Linear B produzem leituras parciais consistentes? Onde a correspondência quebra?
- Para Indus: as hipóteses fonéticas recentes (Transformer 2025) batem com os padrões iconográficos?
- Geral: validação multimodal distingue hipótese sólida de hipótese frágil?

**Métricas de sucesso do projeto** (o que tornaria um paper publicável):
1. Reproduzimos quantitativamente o consenso entre hipóteses históricas?
2. Geramos predições novas testáveis por outros pesquisadores?
3. Identificamos a hipótese mais robusta em cada script segundo critério multimodal?
4. Servimos como infraestrutura citada por >10 pesquisadores em 18 meses?

---

## 3. Onde entra (positioning)

**O gap exato:**

| Atores | Cobrem | Não cobrem |
|---|---|---|
| INSCRIBE (Bologna) | paleografia, SigLA, 3D | síntese cross-hipótese, geração, historiografia |
| DESCRYPT (Lund) | recognition, OCR, IA generativa de imagem | multi-script comparativo, versionamento colaborativo |
| AI-EPIGRAPHY (HCI 2024) | tool interativa pra Indus | escala pra outros scripts |
| voynich.nu / Zandbergen | transcrição Voynich | análise generativa, hipóteses estruturadas |
| Mahadevan / Wells / Ferrara | catalogação | infraestrutura pra trabalho coletivo |
| Papers individuais de hipóteses | proposta isolada | testes automáticos, comparação cross-hipótese |

**Você entra como camada de cima de tudo isso.** Consome os dados deles, devolve análise integrada. Não compete; complementa superiormente.

**Modelo de relação:**
- **INSCRIBE**: consumir SigLA, citar, oferecer integração reversa (eles podem importar nossas hipóteses pra dashboard deles). Contato inicial: Silvia Ferrara.
- **DESCRYPT**: complementar (eles fazem reconhecimento, nós fazemos síntese). Contato inicial: equipe Lund.
- **AI-EPIGRAPHY**: nossa generalização do que eles fizeram pra Indus → todos os scripts.
- **Pesquisadores individuais (Cheshire, Pelling, Lindemann, Pozdniakov...)**: convidados a importar suas hipóteses como dataset estruturado, ganham citabilidade.

**Quando estiver maduro, vale propor-se como sub-projeto de INSCRIBE** (capítulo "Digital Humanities") — não absorve o nome, vira braço deles. Reduz risco de "concorrência" pra "colaboração formal".

---

## 4. Corpus necessário

Em camadas, do mais essencial ao mais ambicioso:

### Tier 1 — Corpus de inscrições (público, ingestão direta)
| Script | Fonte | Tamanho |
|---|---|---|
| Voynich | EVA2 do Zenodo + IVTFF do Zandbergen | ~38k tokens, transcrição completa |
| Linear A | SigLA + Younger commentaries | ~7000 sinais, ~1500 inscrições |
| Indus | Mahadevan 1977 + Wells 2009 | ~5000 inscrições curtas |
| Rongorongo | rongopy + Barthel + Échancrée 3D | ~14k glifos |
| Cypro-Minoan | Ferrara 2012 vol. 2 | 243 inscrições |

**Total Tier 1:** ~50 MB texto estruturado + ~500 MB imagens base. Trivial em armazenamento.

### Tier 2 — Banco de hipóteses históricas (construção nova)
Catalogação estruturada de **toda proposta de decifração desde 1850 até hoje** para cada script:
- Proponente, data, contexto institucional
- Tipo de proposta (fonética, semântica, estrutural, cifra, hoax)
- Mapeamentos específicos (signo → valor)
- Evidência apresentada
- Recepção (referências a refutações, validações)
- Status atual (ativo, refutado, dormente, validado)

**Voynich tem ~30-50 propostas dignas de cadastro.** Linear A: ~20. Indus: ~40 (campo super ativo). Rongorongo: ~15. Cypro-Minoan: ~10. **Total ~115-135 hipóteses estruturadas.**

Construção: ~2 semanas de leitura curatorial sistemática por script. Total: ~10 semanas pra primeira passada completa.

### Tier 3 — Imagens dos artefatos (público + alguma curadoria)
- Voynich: Beinecke (yale.edu) tem todos os fólios em alta resolução, CC0 ou Public Domain.
- Linear A: SigLA já tem fotos de cada signo.
- Indus: Harappa.com + arquivos do Mahadevan.
- Rongorongo: 26 inscrições, várias instituições (Smithsonian, Vaticano, etc.). Algumas baixa qualidade.
- Cypro-Minoan: museus diversos. Mais difícil.

**Total Tier 3:** ~10-20 GB de imagens de boa resolução. Hospedagem em Supabase Storage ou S3.

### Tier 4 — Paleografia estruturada
Importar SigLA-style data: para cada inscrição, classificação de mão (scribe identification), data estimada, contexto arqueológico. Existe parcialmente, vale aumentar.

### Tier 5 — Iconografia estruturada (gap maior, novidade)
Para cada inscrição com imagem associada (plantas no Voynich, animais nos selos do Indus, figuras nas tabuinhas):
- Anotação de elementos icônicos (planta-tipo X, animal-tipo Y)
- Coordenadas dentro da imagem
- Hipóteses sobre função (decorativo, ilustrativo, semântico)
- Links pra trechos textuais adjacentes

**Construção nova.** ~6-12 meses de trabalho de anotação distribuída (crowdsource? grant pra estudantes?). MVP pode começar com Voynich (plantas botânicas são bem-documentadas).

---

## 5. Tamanho do cérebro (compute + IA)

Quatro camadas de inteligência, custo crescente:

### 5.1 Lookup e versionamento (custo trivial)
Postgres + pgvector. Buscas estruturadas, joins, versionamento de hipóteses. $0-20/mês independente de escala.

### 5.2 Embeddings + similaridade (custo baixo)
- Embeddings textuais (OpenAI ada-002 ou Voyage AI) pra cada token de cada hipótese.
- Embeddings de imagem (CLIP, DINOv2) pra cada inscrição.
- Embeddings cross-modal pra correlacionar texto-imagem.

**Custo:** ~$0.10/1M tokens. Para todo o corpus público (~10M tokens): **$1 inicial + ~$0.05/hipótese nova.**

### 5.3 LLM reasoning (custo moderado)
Cada teste de hipótese chama Claude/GPT pra:
- Avaliar consistência interna
- Comparar com hipóteses adjacentes
- Gerar relatório estruturado
- Sugerir testes adicionais

**Custo:** ~$0.30-1.50 por teste completo de hipótese (Sonnet, ~30-60k tokens contexto + ~5k saída). Para um pesquisador ativo testando 20-50 hipóteses/mês: **$10-50/mês por usuário ativo.**

### 5.4 Geração (custo alto, opcional na v1)
- **TTS condicional** (som reconstruído): ElevenLabs custom voice ou Coqui local. $50-100/mês fixo.
- **Imagem generativa** (renderização de hipóteses, completação de lacunas): Stable Diffusion fine-tuned. $200-500 setup + $0.10-0.50 por geração.
- **Modelo paleográfico próprio**: fine-tune visual model em sign-style. ~$500-2000 single training, depois inferência barata.

**Decisão v1:** Camadas 5.1, 5.2, 5.3 obrigatórias. Camada 5.4 pula pra v2 (a tese se sustenta sem geração, e geração de som/imagem dobra custo e complexidade).

### Custo total estimado
- **Base infra + inferência básica:** $50-150/mês com ~10 usuários ativos.
- **Crescimento moderado** (100 usuários ativos): $300-800/mês.
- **Escala "infraestrutura de referência do campo"** (1000+ pesquisadores, uso pesado): $2000-5000/mês.

A primeira faixa é absorvível pessoalmente. A segunda exige grant (NEH/Mellon/ERC têm exatamente esse perfil; Hermeneia + sua experiência publicada o tornariam candidato real). A terceira exige institucionalização.

---

## 6. Onde fica hospedado

Stack proposto (continuidade com Hermeneia, custos e operação semelhantes):

| Camada | Provedor | Plano | Custo MVP |
|---|---|---|---|
| Frontend (React/Vite) | Vercel | Hobby grátis → Pro $20/mo quando escalar | $0-20 |
| API (FastAPI/Python) | Railway | Hobby $5/mo | $5 |
| Banco principal | Supabase | Pro $25/mo (mantém escala) | $25 |
| Storage imagens | Supabase Storage / Backblaze B2 | Pago por GB usado | $5-20 |
| Vector DB | pgvector (dentro do Supabase) | Incluído | $0 |
| LLM inferência | Anthropic API | Pay-as-you-go | variável (ver 5.3) |
| Embeddings | OpenAI / Voyage | Pay-as-you-go | variável (ver 5.2) |
| Imagem gen (v2) | Replicate / HuggingFace | Pay-as-you-go | adiar |

**Total fixo mensal MVP:** $35-70 + variável de inferência. Comportável.

Domínio próprio: ~$15/ano.

**Vantagem do stack:** é exatamente o que você já operou na Hermeneia. Zero curva de aprendizado nova.

---

## 7. Quem vai poder usar (modelo de usuário)

Três tiers:

### Tier A — Pesquisadores autenticados (target principal)
- Login obrigatório (Supabase Auth: Google, ORCID, email institucional, GitHub).
- Podem criar hipóteses, rodar testes, baixar laudos, comparar.
- Atribuição acadêmica permanente (DOI-like ID por hipótese).
- Histórico de contribuição visível.

**Quem são, concretamente:**
- Membros de INSCRIBE/DESCRYPT/grupos similares.
- Pesquisadores independentes (você, Lindemann, Pelling, etc.).
- Pós-graduandos em linguística histórica, epigrafia, paleografia.
- Estimativa: **base mundial real entre 200-2000 pessoas**. Comunidade pequena mas distinguível.

### Tier B — Estudantes / interessados sérios (perifericos)
- Login obrigatório, mesma porta.
- Podem propor hipóteses tentativas que entram em moderação.
- Acesso completo a leitura, laudos, comparações.
- Espaço pra praticar metodologia.

### Tier C — Público anônimo (visitante)
- Sem login, navega corpus, lê hipóteses cadastradas, vê laudos públicos.
- Não cadastra nada, não comenta.
- SEO-friendly. Cada hipótese tem página pública citável.

**Modelo de monetização:** zero. **Bem comum acadêmico.** Custo absorvido pessoalmente até virar grant. Se viralizar pra além do absorvível, conversão pra grant é canalizada (ver §5).

Não há plano de cobrança individual. Não vira SaaS. Vira infraestrutura.

---

## 8. Como será apresentado (interfaces)

Três superfícies:

### 8.1 Site público (landing + browse)
Estilo similar à landing da Hermeneia mas com escala maior. Hero, exemplo concreto (Voynich Cheshire vs Lindemann lado a lado), painel "scripts cobertos", call-to-action "Registre uma hipótese / Navegue como leitor". Linguagem sóbria, acadêmica.

URL pública: `decipherment.[domínio].xx` ou domínio próprio TBD.

### 8.2 Workbench do pesquisador
Logado, três painéis:
- **Esquerda:** corpus browser (script → inscrição → fólio/peça → imagem + transcrição)
- **Centro:** ambiente de trabalho (registrar/editar hipótese, visualizar predições, ver testes rodando)
- **Direita:** histórico (timeline historiográfica, hipóteses concorrentes, citações, conflitos)

**Funcionalidades-chave do MVP:**
- Inscription viewer (imagem zoom + transcrição alinhada)
- Hypothesis editor (form estruturado pra cadastrar signo→valor)
- Test runner (botão "Rodar testes nessa hipótese" → relatório estruturado)
- Comparison view (selecionar 2-3 hipóteses → diff visual de mapeamentos)
- Timeline view (todas as tentativas pra X script em linha do tempo)
- Export (laudo PDF/MD + dataset CSV pra download)

### 8.3 API REST + GraphQL
Pra pesquisadores integrarem com suas ferramentas próprias:
- `GET /scripts` — lista scripts cobertos
- `GET /scripts/{id}/inscriptions` — paginação
- `GET /inscriptions/{id}` — texto + imagem + paleografia
- `GET /hypotheses?script=&author=` — filtros
- `POST /hypotheses` — cria nova (auth obrigatória)
- `POST /hypotheses/{id}/test` — roda testes, retorna relatório
- `GET /comparisons?ids=...` — compara N hipóteses
- Dataset dumps em Zenodo periódicos (citáveis com DOI)

---

## 9. Cronograma e custo total

### MVP (3 scripts: Voynich + Linear A + Indus; texto + iconografia + historiografia; sem geração)
- **Mês 1:** schema + ingestão Tier 1 (corpora) + adaptação backend Hermeneia
- **Mês 2:** cadastro Tier 2 (hipóteses) — Voynich primeiro
- **Mês 3:** workbench básico no frontend + testes automáticos
- **Mês 4:** Linear A + Indus + polimento + lançamento beta restrito (5-10 pesquisadores convidados)

**Total trabalho focado: 3-4 meses.**
**Custo direto: $200-800 total** (LLM + infra ramping up).
**Custo pessoal: tempo + ~$50-200/mês operacional após beta.**

### v1 (lançamento público, papers escritos)
- **Mês 5-6:** absorver feedback do beta, melhorias UX, primeiro paper submetido (SCiL / EMNLP Workshop).
- **Mês 7-8:** abertura pública, Rongorongo e Cypro-Minoan adicionados.

### v2 (geração multimodal)
- Som reconstruído (TTS condicional)
- Renderização paleográfica
- Completação iconográfica
- 6-12 meses adicionais.

### v3 (institucionalização)
- Parceria formal com INSCRIBE / universidade
- Grant submetido (NEH ~$50-300k / Mellon similar / ERC StG €1.5M)
- Equipe expande pra 3-5 pessoas

---

## 10. O que isso NÃO é (importante)

- **Não é tentativa de decifrar Voynich/Linear A/Indus em si.** É a ferramenta que torna as tentativas sistemáticas.
- **Não é SaaS.** Não cobramos.
- **Não é catálogo passivo.** Tem componentes ativos (testes, geração).
- **Não é pra leitor casual.** Audiência é especializada.
- **Não substitui** INSCRIBE/DESCRYPT/AI-EPIGRAPHY. **Integra** com.
- **Não promete decifração.** Promete metodologia disciplinada.
- **Não é open source de código fechado.** Tudo aberto: código, dados, hipóteses.

---

## 11. Riscos honestos

1. **Adoção lenta em humanidades.** Cultura acadêmica conservadora. Resposta: ir nos eventos certos (SCiL, ALP — Ancient Language Processing workshop @ EMNLP, DH conferences), contato direto com INSCRIBE.
2. **Curadoria de hipóteses históricas é trabalho duro.** Resposta: começar com Voynich (você tem expertise), expandir incrementalmente.
3. **Iconografia anotada é gargalo.** Resposta: começar com Voynich (plantas têm trabalho prévio em botânica histórica).
4. **Você fica sozinho construindo.** Resposta: arrastar gente cedo. Pelo menos 1 pesquisador de campo no advisory.
5. **Grant não sai.** Resposta: custo MVP é absorvível pessoalmente; viabilidade não depende de grant.
6. **Modelo de IA evolui e parte vira obsoleta.** Resposta: arquitetura modular permite trocar modelo subjacente sem reescrever a camada de hipóteses.

---

## 12. Decisões em aberto pra você marcar

Estas precisam de resposta sua antes de execução:

1. **Nome do projeto.** *Sugestões:* Palaeographos, Champollion (ousado), Stele, Glossa, ou algo novo. Hermeneia fica pra ferramenta de tradução.
2. **Primeiro script.** Voynich (expertise sua, comunidade carente) ou Linear A (tratabilidade maior, prestígio acadêmico)?
3. **Contato com INSCRIBE.** Iniciar agora (mostrar plano), depois do MVP (mostrar funcionamento), ou só depois de paper publicado (mostrar legitimidade)?
4. **Iconografia no MVP** ou v2? Botar agora dobra escopo; tirar diminui poder de demonstração.
5. **Domínio próprio.** Comprar agora ou usar subdomínio Vercel até estabilizar?

---

## 13. Próximo passo proposto

**Se você aprovar essa especificação como base** (mesmo com refinamentos), o próximo passo concreto é:

> **Esboço de telas e fluxos no Figma** (ou simples wireframes em código) pro workbench. Tela 1: corpus browser. Tela 2: hypothesis editor. Tela 3: test runner output. Tela 4: comparison view.

Esboço visual + esta especificação juntos = base sólida pra você levar pra terceiros (potenciais colaboradores acadêmicos, futuros co-fundadores, possível grant officer) e ganhar julgamento externo antes de qualquer linha de código nova.

Sem essa aprovação prévia da especificação, não vale tocar em código novo.

---

_Especificação viva. Atualizar conforme escopo se refina._
