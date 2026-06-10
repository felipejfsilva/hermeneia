# GraphosCodex — O que é, como funciona, objetivos, focos

Resumo executivo do projeto. Pra compartilhar com colaboradores, futuros advisors, possíveis grant officers, ou qualquer um que pergunte. Versão sintética da `project-spec.md`.

---

## O que é

**GraphosCodex é uma workbench colaborativa pra estudar e testar hipóteses de decifração de escritas antigas que ninguém ainda conseguiu ler** — Linear A, o Voynich, o Indus, Rongorongo, Cypro-Minoan.

Concretamente: um ambiente único onde pesquisadores cadastram hipóteses ("esse signo é o fonema /ka/", "essa sequência significa 'água, irrigação'") de forma estruturada e citável, e o sistema **testa automaticamente** essas hipóteses contra o corpus inteiro de inscrições, mostra onde se sustentam e onde quebram, compara com hipóteses concorrentes e gera relatórios reproduzíveis.

Não é tentativa de decifrar — é o **instrumento** que torna a tentativa sistemática. Champollion não decifrou hieróglifos inventando ferramentas; ele integrou copta + grego + ilustração + 20 anos de tentativas anteriores. GraphosCodex é a versão coletiva e moderna desse instrumento de integração.

## Como vai funcionar

**Pesquisador autenticado:**

1. Loga (ORCID, Google, GitHub).
2. Escolhe um script. No lançamento: Linear A e Voynich.
3. Navega o corpus — inscrição por inscrição, imagem em alta resolução, transcrição alinhada, e uma **linha do tempo** de quem propôs o quê sobre aquela peça desde 1900.
4. Registra sua hipótese: mapeamento glifo → significado/fonema, escopo, evidência.
5. Sistema roda **testes automáticos cross-modal**:
   - **Cobertura**: que fração do corpus a hipótese explica?
   - **Consistência**: as ocorrências previstas batem com as observadas?
   - **Iconografia**: as palavras propostas correlacionam com os desenhos adjacentes? (relevante pro Voynich e selos do Indus)
   - **Comparativo**: onde concorda ou conflita com hipóteses já cadastradas?
6. Recebe relatório estruturado com pontuação multimodal e predições novas testáveis.
7. Compara sua hipótese lado a lado com a de Cheshire, Pelling, Lindemann, etc.
8. Publica com **ID citável permanente** — quando alguém citar sua hipótese, pode apontar pro link estável.

**Leitor anônimo (público):** navega tudo, lê tudo, vê comparações, baixa laudos — sem cadastrar nada.

## Objetivos

**Curto prazo (4-5 meses, MVP):**
- Linear A + Voynich funcionando ponta-a-ponta
- ~30 hipóteses históricas estruturadas e cadastradas
- 5-10 pesquisadores beta convidados (Bologna, Lund, independentes)

**Médio prazo (12-18 meses):**
- Paper publicado em venue sério (SCiL ou ALP @ EMNLP — workshops específicos pra essa área)
- Indus, Rongorongo, Cypro-Minoan adicionados
- Citado por >10 pesquisadores de campo
- Conversa formal aberta com INSCRIBE (Bologna) ou DESCRYPT (Lund)

**Longo prazo (3-5 anos):**
- Vira a infraestrutura de referência pra decifração computacional do campo
- Grant da NEH (EUA) / Mellon Foundation / ERC (Europa) — US$ 50-300k em ciclos de 2-3 anos
- Possibilita que uma decifração bem-sucedida — sua, nossa ou de outra pessoa — aconteça **dentro do GraphosCodex**, com toda a metodologia documentada e reproduzível

## Focos

**Foca em:**
- Síntese cross-modal — texto + iconografia + paleografia + historiografia juntos
- Versionamento e citabilidade — cada hipótese é uma entidade rastreável
- Comunidade pequena e séria — filólogos, classicistas, epigrafistas (não público geral)
- Open access total — código aberto, dados abertos, hipóteses atribuídas mas livres pra leitura
- Validação por critérios objetivos — não opinião do modelo

**Não faz / não é:**
- **Não tenta decifrar nada por si só.** Somos infraestrutura, não decifradores.
- **Não substitui** INSCRIBE, DESCRYPT, SigLA, AI-EPIGRAPHY. **Integra** com eles, consome dados deles, devolve análise.
- **Não monetiza.** Bem-comum acadêmico, custo absorvido inicialmente, grant depois.
- **Não é pra leitor casual.** Densidade técnica intencional.
- **Não promete decifrar Voynich/Linear A.** Promete metodologia disciplinada que torna a tentativa séria.

## Posicionamento numa frase

> *"GraphosCodex é o GitHub da decifração — um ambiente versionado, multimodal e colaborativo onde hipóteses sobre scripts antigos viram entidades estruturadas, testáveis, comparáveis e citáveis."*

---

## Documentos relacionados

- `docs/decipherment-base.md` — estado do campo de decifração em 2026 (corpora, ferramentas, projetos)
- `docs/project-spec.md` — especificação técnica detalhada (arquitetura, custos, cronograma, decisões)

## Status atual (jun/2026)

- ✅ Nome confirmado (GraphosCodex, zero conflito de marca)
- ✅ GitHub Organization criada em `github.com/graphoscodex`
- ✅ README público de apresentação
- ✅ `graphoscodex.com` registrado no Cloudflare
- ⏳ `graphoscodex.org` pendente
- ⬜ Esboços visuais das telas principais
- ⬜ Código (não começou — começa após esboços aprovados)

_Documento vivo. Atualizar quando estado material mudar._
