// GraphosCodex — paleta de papel/tinta com sotaque por script.
// Inspirações: Distill.pub (rigor tipográfico), The Pudding (motion sóbrio),
// e-codices (manuscrito como protagonista), Are.na (grid explorativo).

export const T = {
  // Substrato — papel envelhecido, sem branco gélido
  bg:        '#FAF8F3',
  bgSubtle:  '#F2EEE3',
  bgPanel:   '#FFFFFF',
  bgInk:     '#1C1A16',

  // Tinta
  ink:       '#1C1A16',
  inkMid:    '#5C5648',
  inkMute:   '#8B847A',
  inkFaint:  '#B8B0A0',
  inkVeryFaint: '#D8D1C0',

  // Divisores e bordas finas
  divider:   '#E0D9C5',
  dividerStrong: '#C9C1B0',

  // Acentos — vermelhos de tinta de manuscrito, verde-floresta de erudição
  oxblood:    '#8B2635',
  oxbloodBg:  '#F4E8E7',
  oxbloodBd:  '#E8C4C1',

  forest:     '#4A6741',
  forestBg:   '#EAEEDF',
  forestBd:   '#C8D0B0',

  ochre:      '#B5832A',
  ochreBg:    '#F5EBCC',
  ochreBd:    '#E2CB85',

  navy:       '#1F3A5F',
  navyBg:     '#E5EBF2',
  navyBd:     '#B8C5D5',

  // Acento neutro pra UI chrome (botões secundários, links)
  accent:     '#5C5648',
  accentBg:   '#EAE4D2',

  // Por script (cada um carrega um pigmento próprio na navegação)
  script: {
    linear_a: { hue: '#1F3A5F', label: 'Egean azul-noite' },  // mar Egeu
    voynich:  { hue: '#8B2635', label: 'Oxblood iluminura' },  // tinta vermelha medieval
    indus:    { hue: '#B5832A', label: 'Ocre terracota' },
    rongorongo:{ hue: '#4A6741', label: 'Verde-musgo Rapa Nui' },
    cypro_minoan: { hue: '#7A5C3F', label: 'Argila cipriota' },
  },

  // Animação tokens
  ease:       'cubic-bezier(.2,.7,.2,1)',
  easeOut:    'cubic-bezier(.16,1,.3,1)',
  fast:       '180ms',
  med:        '320ms',
  slow:       '520ms',

  // Tipografia
  fontSerif:  '"EB Garamond", "Source Serif Pro", Georgia, serif',
  fontSans:   '"Inter", system-ui, -apple-system, sans-serif',
  fontMono:   '"IBM Plex Mono", "JetBrains Mono", ui-monospace, monospace',

  // Sombras sutis — papel sobre papel
  shadowSm:   '0 1px 2px rgba(28,26,22,0.04), 0 1px 4px rgba(28,26,22,0.04)',
  shadowMd:   '0 2px 8px rgba(28,26,22,0.06), 0 4px 16px rgba(28,26,22,0.04)',
  shadowLg:   '0 8px 24px rgba(28,26,22,0.08), 0 16px 40px rgba(28,26,22,0.05)',
}
