# GraphosCodex — Visão de longo prazo

Documento de norte. Define o destino de 10 anos que justifica a workbench de hoje.

---

## A visão articulada

GraphosCodex evolui de uma workbench colaborativa para **um sistema de inteligência especializado em línguas antigas, mortas e não decifradas** — usado por linguistas, historiadores, filólogos, epigrafistas, paleógrafos, e eventualmente o público que quiser entender textos cuja tradução não existe ou está em disputa.

Nessa fase madura, ele:

- **Compreende multimodalmente** scripts antigos (signo + imagem + iconografia + contexto)
- **Gera texto** em línguas mortas com corpus (Latim, Grego, Hebraico, Sânscrito, Hitita, Acádio...)
- **Propõe leituras candidatas** pra inscrições não decifradas, ranqueando por evidência
- **Executa hipóteses comparativas em escala** — não uma por uma, mas dezenas ou centenas
- **Reconstrói** proto-línguas com confiança graduada e justificativa explícita
- **Reescreve** texto moderno em forma antiga (e vice-versa, com qualidade calibrada)
- **Co-pilota** pesquisador: sugere experimentos, escreve relatórios reproduzíveis, mantém ledger historiográfico vivo

## Por que essa visão é factível (e não fantasia)

- **Frontier models melhoram drasticamente em línguas antigas a cada geração.** Claude 4 já escreve Latim defensável. Daqui a 5 anos, Latim/Grego/Hebraico estarão em paridade com inglês moderno em qualidade.
- **Multimodal models maduros** (Claude 4+ vision, Gemini, GPT-5+) já lidam com imagens de inscrições. A pesquisa em vision-language está se aprofundando.
- **Decifração assistida por ML** já é campo ativo: Sproat (MIT), transformer paper TACL 2025 sobre Indus, AI-EPIGRAPHY 2024.
- **Reconstrução de proto-línguas** computacional (List, Jäger) é trabalho real, embora ainda embrionário em usabilidade.

O que **não** é factível pra um projeto pessoal/acadêmico médio: treinar foundation model do zero. Custo US$ 1-10M, equipe técnica grande, e obsolescência rápida.

## A trajetória — 5 fases

| Fase | Quê é | Quando | Esforço |
|---|---|---|---|
| **1. Workbench** (atual) | Plataforma colaborativa pra hipóteses | 0-1 ano | Você + advisor |
| **2. Assistente** | LLM frontier integrado ao workbench (gera predições, ranqueia hipóteses) | 1-2 anos | + 1 dev ML |
| **3. Co-piloto** | Geração condicionada (completar Voynich, propor Linear A) via fine-tunes em frontier models | 2-4 anos | + grant médio US$50-200k |
| **4. Agente** | Sistema autônomo: propõe direções, executa testes, escreve relatórios publicáveis | 4-7 anos | + grant grande US$500k-2M, equipe |
| **5. Foundation** | Modelo próprio especializado, ou parceria estratégica com lab frontier | 7-15 anos | Capital sério |

**Cada fase empilha sobre a anterior.** Fase 1 nunca para de ser substrato — ela continua sendo a workbench, mas com inteligência crescente embutida.

## O posicionamento sustentável

A tentação errada: tentar virar foundation model. Caminho de US$ 5M+, equipe pesada, alta chance de obsolescência.

O caminho certo: **ser a camada de método + dado curado + validação + comunidade — em cima dos foundation models que a fronteira está produzindo de qualquer forma.**

Quando Claude 6, GPT-7, Gemini 4 estiverem rodando, e cada lab grande quiser ter sua "AI pra clássicos", **quem cuidou da curadoria de dado, da metodologia de validação, e da credibilidade comunitária vira o lugar onde a inteligência é aplicada.**

A tese da Hermeneia/GraphosCodex (conhecimento humano estruturado é complementar à escala estatística) **se fortalece quanto mais poderosos os modelos ficam**. Mais inteligência sem ground truth é mais perigosa, não menos.

## Casos de uso na fase madura (3-4)

- **Linguista de Hitita** consulta: *"GraphosCodex, gere 10 exemplos de aspecto perfectivo em Hitita Antigo consistentes com o corpus de Hattusa, ranqueados por frequência atestada."*
- **Historiador epígrafa**: faz upload de foto de inscrição danificada, GraphosCodex propõe 5 leituras candidatas, ranqueia por contexto arqueológico e paleográfico, cita evidência.
- **Pesquisador de PIE** compara: *"Mostra onde Beekes e Pokorny divergem na reconstrução de *deh3-, quais cognatos cada um cita, e qual evidência foi descoberta desde a publicação."*
- **Estudante** pede: *"Reescreve esse texto português em Latim ciceroniano e em Latim vulgar do séc. VI, com confiança calibrada e diferenças explicadas."*
- **Conlanger** pede ajuda: *"Mantenha consistência interna desse meu sistema de declinações ao gerar 200 novas palavras, simulando 500 anos de mudança fonética."*
- **Decifrador** trabalhando no Voynich: *"Compara minha hipótese com Cheshire, Pelling, Lindemann. Gera predições novas testáveis nos fólios 86-95 que diferenciem entre nossas teorias."*

## Por que isso não muda nada na decisão de hoje

A workbench (fase 1) que estamos planejando **é exatamente o substrato** dessas fases seguintes. Sem ela:
- Não há dado curado pra fase 2 aprender em cima
- Não há validação pra fase 3 calibrar contra
- Não há comunidade pra fase 4 servir
- Não há legitimidade pra fase 5 negociar parcerias com labs frontier

**Construir bem a fase 1 é o que torna possível a fase 5.** Cada decisão hoje (provenance, citabilidade, open access, validação cross-modal) está construindo as fundações.

## O risco honesto

**Tempo do usuário.** Essa visão é trabalho de 10-15 anos sério. Não dá pra fazer paralelo a 3 outros projetos. Em algum ponto entre fase 2 e 3, exige escolha: é isso ou outra coisa.

Não precisa decidir agora. Mas a workbench (fase 1) ja é trabalho real de 4-5 meses focados, e isso é o que define se as portas pras fases seguintes ficam abertas.

## Distinção entre Hermeneia e GraphosCodex nessa visão

- **Hermeneia** é exemplo aplicado do método — auditoria de tradução. Caso fechado, demonstra o princípio.
- **GraphosCodex** é a aplicação ambiciosa do mesmo método ao domínio mais difícil (línguas sem tradução estabelecida).

A relação não é "Hermeneia evolui em GraphosCodex". É: **mesma arquitetura subjacente, dois domínios distintos.** Hermeneia continua sendo útil pra tradução de hebraico/grego/latim. GraphosCodex constrói algo radicalmente novo no domínio adjacente.

Em fase 4-5, talvez o ecossistema todo se chame algo maior (GraphosCodex Foundation, ou nome ainda a inventar), com Hermeneia como produto específico nele. Mas isso é especulação distante.

---

_Documento de norte. Releitura anual. Revisão se o campo de IA mudar de forma significativa (provavelmente vai)._
