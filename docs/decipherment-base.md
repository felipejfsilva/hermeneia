# Base documental — Decifração de scripts não decifrados

**Propósito.** Antes de escolher direção, mapear (a) o que já existe publicamente em corpora, hipóteses, ferramentas; (b) o que do trabalho já feito na Hermeneia é reaproveitável pra uma virada em direção à decifração. Documento de referência, não de produto.

Estado em 2026-05.

---

## 1. Estado por script

### 1.1 Voynich (séc. XV, ~240 fólios, ~38k tokens)

**Corpus.** Manuscrito MS 408 da Beinecke Library (Yale), totalmente digitalizado em alta resolução. Texto + ilustrações de plantas, astronomia, banhos, receitas. Estado físico: bom. Corpus interno: ~38.000 tokens, ~8000 tipos. Alfabeto: 20-30 glifos (depende da segmentação).

**Transcrições.**
- **EVA (Extensible Voynich Alphabet)** — Currier+Zandbergen+Takahashi. O padrão de fato. Atualizada em 2025 com correções (remoção de loci espúrios em f89v2 e f1r) ([voynich.nu/transcr.html](https://www.voynich.nu/transcr.html)).
- **Zandbergen archive** — formato IVTFF, alinhado a Takahashi.
- **Voynich Manuscript - Full Dataset v2.0** (Zenodo 2024) — Excel estruturado por fólio/linha com EVA2 ([zenodo.org/records/18215102](https://zenodo.org/records/18215102)).
- **Datasets analíticos** — vmevarand (frequências), eva27sim (n-grams) no Internet Archive.

**Hipóteses ativas (2023-2025).**
- **Cifra/abjad** (Tucker 2018, Bowern 2022). Persistente, sem prova.
- **Proto-romance** (Cheshire 2019). Comunidade rejeitou rapidamente.
- **Hoax estatístico** (Rugg 2003 — grades de Cardan). Resiste a entropia mas ignora morfologia.
- **Língua natural codificada** (Lindemann 2024) — mais recente, sem consenso.

**Propriedades estatísticas conhecidas.**
- Word-length distribution: language-like, próxima a turco/hebraico/árabe (binomial inflada).
- Entropia: baixa (~3 bits/char), anomalamente estruturada.
- Zipf: aproximadamente normal.
- Repetição: tipo `daiin daiin daiin` aparece literalmente — anomalia que distingue Voynich de línguas naturais.
- Estrutura paragráfica: existe.

**Comunidade.** Pequena (~50-200 ativos), fragmentada. Listas de discussão, fóruns (voynich.ninja), GitHub esparso. Cada pesquisador mantém planilha própria de hipóteses sem versionamento compartilhado. **Esse é o gap exato que ferramenta pode preencher.**

**Tratabilidade.** Corpus grande e bom, mas **sem âncora comparativa**. Nenhum bilíngue, nenhuma escrita-irmã segura, nenhuma equivalência histórica documentada. Statisticamente atacável, semanticamente intratável sem novo dado.

---

### 1.2 Linear A (Creta, ~1800-1450 a.C., ~1500 inscrições)

**Corpus.** ~1500 inscrições, ~7000 sinais. Tabuinhas administrativas (maioria) + objetos rituais. Material principalmente de Hagia Triada.

**Transcrições e ferramentas.**
- **SigLA — The Signs of Linear A** (Salgarella & Castellan, Cambridge/Roma 2020). Banco paleográfico aberto, foto + tracing + classificação de cada signário. ([sigla.phis.me](https://sigla.phis.me/paper.html), [unibo.it/inscribe/linear-a-sigla](https://site.unibo.it/inscribe/en/linear-a-sigla))
- **Linear A Explorer** ([lineara.xyz](https://lineara.xyz/)) — ferramenta web pra navegar inscrições + comentários de John Younger. Código aberto ([github.com/mwenge/lineara.xyz](https://github.com/mwenge/lineara.xyz)).
- **Linear A Digital Corpus** (Corazza et al. 2015, paper na ACL Workshop sobre Computational Approaches to Greek) ([aclanthology.org/W15-3715.pdf](https://aclanthology.org/W15-3715.pdf)).
- **John Younger's commentaries** — referência canônica em transliteração.

**Status.** Valores fonéticos de muitos sinais conhecidos por sobreposição com Linear B (decifrado, Ventris 1952). **Língua subjacente desconhecida.** Não é grego (Linear B sim, é micênico). Provavelmente uma família isolada.

**Tratabilidade.** Alta relativamente. Tem âncora (Linear B), corpus organizado, comunidade ativa. O trabalho de SigLA é o mais próximo do que precisaríamos construir — paleografia sistemática + comparação cruzada. Vale ESTUDAR a UX deles antes de propor algo novo.

---

### 1.3 Indus (Harappan, ~2600-1900 a.C., ~5000 inscrições curtas)

**Corpus.** Mahadevan 1977 (419 sinais), Joshi-Parpola (Corpus of Indus Seals and Inscriptions, vários volumes, Helsinki), Wells W09IMSc 2009 (3896 artefatos, 695 sinais). Inscrições MÉDIA ~5 sinais, mediana ~4. **Curtíssimas** — esse é o problema central.

**Bases públicas.**
- **Interactive Concordance of Indus Texts** ([indus.epigraphica.de](https://www.indus.epigraphica.de/))
- **Mahadevan 1977** integral no Internet Archive ([archive.org/details/TheIndusScript.TextConcordanceAndTablesIravathanMahadevan](https://archive.org/details/TheIndusScript.TextConcordanceAndTablesIravathanMahadevan))
- **Catalog of Indus Signs** (academia.edu) — versão mais recente.

**Debate central.** Farmer, Sproat & Witzel 2004 propuseram que **NÃO é escrita** — é sistema de símbolos não-linguísticos. Rao et al. 2009 (Science) contra-argumentaram com entropia condicional comparada a línguas vs não-línguas: Indus se comporta como língua. Debate continua ([arxiv.org/pdf/1005.4997](https://arxiv.org/pdf/1005.4997)).

**Trabalho ML ativo.**
- **Palaniappan & Adhikari 2017** — deep learning pra reconhecimento de signos a partir de imagens.
- **AI-EPIGRAPHY 2024** (HCI 2024) — ferramenta interativa pra decifração computacional do Indus ([dl.acm.org/doi/10.1145/3768633.3770145](https://dl.acm.org/doi/10.1145/3768633.3770145)).
- **Transformer models** pra decifração fonética do Indus — TACL 2025.

**Tratabilidade.** Inscrições curtas demais, contexto cultural limitado (selos comerciais? marcas administrativas? amuletos?), debate aberto sobre se é língua. Difícil mesmo com ferramentas.

---

### 1.4 Rongorongo (Rapa Nui, séc. XIX, ~14k glifos)

**Corpus.** 26 inscrições conhecidas em madeira. Total ~14.000 glifos. Pequeno. Sinais ~600 distintos (controverso).

**Transcrições.**
- **Barthel 1958** — fundacional, catalogação por linhas.
- **Fischer 1997** — linha de desenho atualizada.
- **Pozdniakov & Pozdniakov 2007** — questiona se catálogo de Barthel é definitivo. Mostra que padrões "encontrados" por Fischer (1995, criação/sexual) eram artefatos da estrutura interna do script, não específicos a sua tradução.
- **3D Échancrée tablet** — modelo público via fotogrametria + structured light.
- **Modelling the Rongorongo tablets** (Davletshin & Wieczorek, Digital Scholarship in the Humanities 2022) — transcrição renovada.

**GitHub.** **[github.com/jgregoriods/rongopy](https://github.com/jgregoriods/rongopy)** — ideias pra decifração, código aberto. Pequeno mas existe.

**Status.** Corpus minúsculo, contexto cultural conhecido (Rapa Nui pré-contato), mas chocou com colonização — falantes nativos perderam a tradição oral antes de cifras serem mapeadas. Tentativa de "decifração" mais recente (Mejia/Lindemann 2024) ([academia.edu/128174983](https://www.academia.edu/128174983/Deciphering_Rongorongo_as_a_Polynesian_Syllabary_Linguistic_and_Statistical_Validation)) — contestada.

**Tratabilidade.** Corpus pequeno demais pra estatística robusta. Polynesian languages are well-documented (âncora externa exists), but the script-to-language mapping resists.

---

### 1.5 Cypro-Minoan (Chipre, ~1500-1050 a.C., 243 inscrições)

**Corpus.** Olivier 2007 (HoChyMin) — edição crítica de 217 inscrições. Ferrara 2012-2013 (vol. 2) — corpus completo de 243 objetos ([bmcr.brynmawr.edu/2013/2013.02.04](https://bmcr.brynmawr.edu/2013/2013.02.04)). Dividido em CM1, CM2, CM3 (Masson).

**Status.** Não decifrado. Provável ancestral do silabário cipriota (decifrado), parente colateral de Linear A. Inscrições demasiado curtas pra ataque estatístico isolado, mas a **conexão estrutural com Linear A e cipriota dá âncora**.

**Tratabilidade.** Pequeno corpus, mas posição genealógica privilegiada. Trabalho de Ferrara é a referência.

---

### 1.6 Outros candidatos (cobertura mais leve)

- **Olmeca / Cascajal Block** — uma única tablete encontrada 2006 (62 sinais). Insuficiente.
- **Phaistos Disc** — peça única, 241 sinais. Provavelmente intratável.
- **Dispilio tablet, Vinča** — discutível se são "escrita".
- **Meroítico** — fonético conhecido (Griffith 1909), semântico parcial.
- **Etrusco** — não "não decifrado", é "lemos mas não entendemos vocabulário".

---

## 2. Projetos modernos relevantes

### INSCRIBE (Bologna, ERC StG, Silvia Ferrara)
Guarda-chuva acadêmico sobre invenção e início de escritas. Hospeda SigLA (Linear A), modelos 3D, série de seminários SCRIBO ([site.unibo.it/inscribe](https://site.unibo.it/inscribe/en)). **Principal player europeu nesse espaço**. Modelo a estudar antes de propor qualquer coisa nova.

### DESCRYPT (Lund University)
Projeto recente (2024+) financiado pra decifração de manuscritos com escritas raras ou desconhecidas. Aplica linguística computacional, IA e processamento de imagem ([portal.research.lu.se](https://portal.research.lu.se/en/publications/decipherment-of-historical-manuscripts-with-unknown-or-rare-writi/)). **Concorrente direto da direção que estamos considerando** — vale entender em detalhe.

### AI-EPIGRAPHY (HCI 2024)
Ferramenta interativa específica pra Indus, recém-publicada. Mostra que o nicho existe e que paper em venue HCI é viável.

### Frontiers in AI (2025) — Lipa et al.
"On automatic decipherment of lost ancient scripts relying on combinatorial optimisation and coupled simulated annealing" ([frontiersin.org/articles/10.3389/frai.2025.1581129](https://www.frontiersin.org/journals/artificial-intelligence/articles/10.3389/frai.2025.1581129/full)). Approach algorítmica. Estado da arte do que se publica no campo agora.

### Transformer Models for Indus (TACL 2025)
Modelos transformer aplicados ao Indus. Indica que o campo está absorvendo arquitetura moderna, mas ainda em paper, não em ferramenta.

---

## 3. O que da Hermeneia se reaproveita (mapeamento componente-a-componente)

### Alta reusabilidade (arquitetura mesma, dados mudam)

| Componente Hermeneia | Equivalente decifração |
|---|---|
| `hermeneia_lexicon_entries` (lema + glosa + citação) | `script_signs` (signário + valores propostos + autor da proposta) |
| `lemma_consonantal` (chave normalizada cross-encoding) | `sign_normalized` (chave normalizada cross-variação paleográfica) |
| `lookup_lexicon` (match exato → fallback normalizado) | `sign_lookup` (match exato → fallback paleográfico tolerante) |
| `hermeneia_token_consensus` (term + sources_agreeing + weighted_score) | `hypothesis_consensus` (signo+valor + autores_concordando + weighted_score) |
| `hermeneia_reference_translations` + pesos de autoridade | `decipherment_proposals` + pesos por critério acadêmico |
| `process_token` (LLM analisa um token com contexto) | `analyze_inscription_chunk` (LLM analisa um trecho com hipóteses cadastradas) |
| `compute_confidence` (blend léxico + consenso + flags) | `compute_hypothesis_fit` (blend predição interna + consistência cruzada + flags) |
| `flagged_corrections` (regra principiada) | `flagged_inconsistencies` (onde a hipótese quebra a predição) |
| `generate_narrative` (síntese honesta dos achados) | `generate_status_report` (estado da hipótese, predições, taxa de match) |
| `generate_corrected_translation` (aplica só correções fundamentadas) | `apply_hypothesis` (renderiza o corpus sob a hipótese atual, marca quebras) |
| Provenance `llm_derived` vs `verified` | Provenance `hypothesis` vs `tested` vs `validated_external` |
| Laudo em .md + PDF | Submissão científica reproduzível |
| Reference parser (jn/Mt/1 Cor → canonical) | Inscription locator (HT 31, P9, f86r4 → canonical) |
| Source texts table (39k versículos) | Inscriptions table (corpus por script) |

### Reusabilidade média (padrão arquitetural, código novo)

- **API FastAPI estrutura geral** — endpoints, CORS, RLS, rate limit por IP, teto diário. Tudo aplicável.
- **Frontend React/Vite estrutura** — tabela token-a-token vira tabela signo-a-signo. Heatmap de confidence funciona idêntico. Witness picker vira "hypothesis picker".
- **Stack Supabase + Anthropic + Vercel + Railway** — sobe inteira.

### Não reaproveita (precisa construir do zero)

- **Léxicos linguísticos** (BDB/LSJ/L&S) — não existem pra scripts não decifrados.
- **Traduções de referência humanas** — não existem; substituídas por propostas de decifração concorrentes.
- **Alinhamento token-token via LLM bem-treinado** — Claude/GPT não foram treinados em Voynich/Linear A. Vai precisar de inferência mais cuidadosa, possivelmente embeddings dedicados.
- **Avaliação de "estreitamento semântico"** — sem semântica conhecida, conceito não aplica.

### Resumo honesto

**~80% da arquitetura é reaproveitável.** O Supabase, FastAPI, scoring framework, laudo, PDF, provenance — tudo serve. O que muda é o domínio de dados (signos em vez de lemas) e o tipo de "verdade" comparativa (consenso de pesquisadores em vez de consenso de tradutores).

A grande boa notícia: a engenharia mais difícil **já está feita**. Adaptar é menos trabalho que começar zero.

---

## 4. O que faltaria construir

Caso a direção seja confirmada, o caminho mínimo até protótipo:

1. **Schema novo no Supabase** — `script_signs`, `script_inscriptions`, `decipherment_proposals`, `hypothesis_predictions`, `hypothesis_tests`. ~1-2 dias.

2. **Ingestão de corpora abertos**:
   - Voynich EVA2 do Zenodo. ~1 dia.
   - SigLA (Linear A) do Cambridge. ~2-3 dias (formato menos amigável que JSON).
   - Mahadevan (Indus) do Internet Archive. ~2 dias.
   - rongopy/Barthel (Rongorongo). ~1 dia.

3. **Adaptação do scoring** — `compute_hypothesis_fit` em vez de `compute_confidence`. Métricas: taxa de match das predições, consistência interna, conflitos com hipóteses concorrentes. ~3-5 dias.

4. **Cadastro de hipóteses concorrentes** — ingerir 3-5 propostas históricas pro Voynich (Cheshire, Pelling, Rugg, Lindemann, Tucker) num formato estruturado: glifo → fonema OU glifo → significado. ~3-5 dias por hipótese. Pode ser parcial.

5. **Frontend novo** — adapta tabela token-a-token pra tabela signo-a-signo + visualizador do fólio original. ~1-2 semanas.

6. **Laudo decifração** — "Estado da hipótese X em DD/MM/AAAA. Predições: N. Match: x%. Conflitos: M. Inconsistências: ..." Reaproveita 80% do generator atual. ~3 dias.

**Estimativa de protótipo funcional: 4-6 semanas focadas.**

---

## 5. Decisões em aberto (pra você marcar antes de seguir)

1. **Por qual script começar?** Voynich é o que você está vivendo. Linear A é o mais tratável e tem âncora (Linear B). Indus é o mais quente em debate atual. *Recomendação minha: Voynich primeiro (você tem expertise acumulada + comunidade isolada que precisa da ferramenta), Linear A em paralelo se quiser legitimidade acadêmica.*

2. **Que relação com INSCRIBE / DESCRYPT?** Concorrente, complementar, contribuição? Vale entrar em contato (Ferrara em Bologna, Lund team) antes de duplicar trabalho. INSCRIBE é o player a respeitar.

3. **Open source ou produto?** Decifração é território de bem comum acadêmico. Fechar é improvável de funcionar. Aberto + reputação >> tentativa de monetizar.

4. **Hermeneia continua existindo separada?** Vira o primeiro caso fechado de demonstração do método ("nossa primeira aplicação foi auditoria de tradução; arquitetura subjacente é a mesma usada agora pra decifração") ou some?

---

## 6. Fontes

### Voynich
- [voynich.nu/transcr.html](https://www.voynich.nu/transcr.html) — Zandbergen transcrições EVA atualizadas 2025
- [zenodo.org/records/18215102](https://zenodo.org/records/18215102) — Voynich Full Dataset v2.0
- [archive.org/details/vmevarand](https://archive.org/details/vmevarand) — datasets analíticos

### Linear A
- [sigla.phis.me](https://sigla.phis.me/paper.html) — SigLA database
- [site.unibo.it/inscribe/en/linear-a-sigla](https://site.unibo.it/inscribe/en/linear-a-sigla) — INSCRIBE SigLA
- [lineara.xyz](https://lineara.xyz/) + [github.com/mwenge/lineara.xyz](https://github.com/mwenge/lineara.xyz)
- [aclanthology.org/W15-3715.pdf](https://aclanthology.org/W15-3715.pdf) — Linear A Digital Corpus (Corazza et al.)

### Indus
- [archive.org/details/TheIndusScript...Mahadevan](https://archive.org/details/TheIndusScript.TextConcordanceAndTablesIravathanMahadevan) — Mahadevan 1977 integral
- [indus.epigraphica.de](https://www.indus.epigraphica.de/) — Interactive Concordance
- [academia.edu/103538728](https://www.academia.edu/103538728/A_Catalog_of_Indus_Signs) — Catalog of Indus Signs
- [arxiv.org/pdf/1005.4997](https://arxiv.org/pdf/1005.4997) — Network analysis (Rao et al.)
- [dl.acm.org/doi/10.1145/3768633.3770145](https://dl.acm.org/doi/10.1145/3768633.3770145) — AI-EPIGRAPHY 2024

### Rongorongo
- [en.wikipedia.org/wiki/Rongorongo](https://en.wikipedia.org/wiki/Rongorongo) — overview e referências
- [github.com/jgregoriods/rongopy](https://github.com/jgregoriods/rongopy) — código aberto
- [academic.oup.com/dsh/article/37/2/497/6387816](https://academic.oup.com/dsh/article/37/2/497/6387816) — transcrição Échancrée renovada

### Cypro-Minoan
- [bmcr.brynmawr.edu/2013/2013.02.04](https://bmcr.brynmawr.edu/2013/2013.02.04) — review Ferrara vol. 1
- [mnamon.sns.it/...id=34&lang=en](https://mnamon.sns.it/index.php?page=Scrittura&id=34&lang=en) — Mnamon entry

### Projetos / metodologia
- [site.unibo.it/inscribe/en](https://site.unibo.it/inscribe/en) — INSCRIBE Bologna
- [descrypt.org](https://descrypt.org/) — DESCRYPT Lund
- [frontiersin.org/.../frai.2025.1581129](https://www.frontiersin.org/journals/artificial-intelligence/articles/10.3389/frai.2025.1581129/full) — Lipa et al. 2025

---

_Documento de referência. Atualizar quando dado novo aparecer._
