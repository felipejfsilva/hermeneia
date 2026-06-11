import { useState } from 'react'
import { T } from '../theme'

type Script = 'linear_a' | 'voynich'

const SCRIPTS: { code: Script; name: string; era: string; region: string; n: number; tagline: string; anchor: string | null }[] = [
  { code: 'linear_a', name: 'Linear A',  era: 'c. 1800–1450 a.C.', region: 'Creta minóica',     n: 1500, tagline: 'Silabário com sentidos parciais via Linear B. Língua subjacente desconhecida.', anchor: 'Linear B' },
  { code: 'voynich',  name: 'Voynich',   era: 'c. 1404–1438 CE',   region: 'Europa Central',    n:  240, tagline: 'Códice ilustrado em alfabeto único, 600 anos sem leitura aceita.', anchor: null },
]

const INSCRIPTIONS: Record<Script, MockInsc[]> = {
  linear_a: [
    { ref: 'HT 31',   title: 'Tabuinha administrativa',   material: 'argila',  date: '~1450 a.C.', icon: '◊' },
    { ref: 'HT 38',   title: 'Lista de oferendas',         material: 'argila',  date: '~1450 a.C.', icon: '◈' },
    { ref: 'HT 86',   title: 'Inventário de gêneros',      material: 'argila',  date: '~1450 a.C.', icon: '◇' },
    { ref: 'ZA 10',   title: 'Tabuinha de Zakros',         material: 'argila',  date: '~1500 a.C.', icon: '◯' },
    { ref: 'KH 5',    title: 'Khania, fragmento contábil', material: 'argila',  date: '~1450 a.C.', icon: '⬡' },
    { ref: 'AB 80',   title: 'Disco com sinais isolados',  material: 'argila',  date: '~1600 a.C.', icon: '⌬' },
  ],
  voynich: [
    { ref: 'f1r',     title: 'Capa botânica',              material: 'velino',  date: 'c. 1420',    icon: '❋' },
    { ref: 'f33r',    title: 'Planta vermelha',            material: 'velino',  date: 'c. 1420',    icon: '✿' },
    { ref: 'f67r',    title: 'Diagrama astronômico',       material: 'velino',  date: 'c. 1420',    icon: '☼' },
    { ref: 'f86r',    title: 'Folhas das rosetas',         material: 'velino',  date: 'c. 1420',    icon: '✧' },
    { ref: 'f78v',    title: 'Banho coletivo',             material: 'velino',  date: 'c. 1420',    icon: '◐' },
    { ref: 'f116v',   title: 'Fólio final, texto puro',    material: 'velino',  date: 'c. 1420',    icon: '⁂' },
  ],
}

const TIMELINE: Record<Script, MockEvent[]> = {
  linear_a: [
    { year: 1903, who: 'Sir Arthur Evans',         claim: 'Identifica e nomeia Linear A em Cnossos.',                         kind: 'descoberta' },
    { year: 1952, who: 'Michael Ventris',          claim: 'Decifra Linear B. Valores fonéticos informam Linear A parcialmente.', kind: 'marco' },
    { year: 1985, who: 'John G. Younger',          claim: 'Comentários sistemáticos por inscrição — referência canônica.',     kind: 'corpus' },
    { year: 2020, who: 'Salgarella & Castellan',   claim: 'SigLA — base paleográfica aberta.',                                 kind: 'ferramenta' },
    { year: 2024, who: 'Corazza et al.',           claim: 'Cryptanalysis + simulated annealing. Limitações sem língua aparentada.', kind: 'método' },
  ],
  voynich: [
    { year: 1912, who: 'Wilfrid Voynich',          claim: 'Adquire o manuscrito em Villa Mondragone.',                          kind: 'descoberta' },
    { year: 1944, who: 'William F. Friedman',      claim: 'Análise criptanalítica. Estatística sugere língua artificial.',      kind: 'método' },
    { year: 2003, who: 'Gordon Rugg',              claim: 'Hipótese hoax via grades de Cardan.',                                kind: 'hipótese' },
    { year: 2019, who: 'Gerard Cheshire',          claim: 'Proposta "proto-romance". Rejeitada pela comunidade.',               kind: 'hipótese' },
    { year: 2024, who: 'Lindemann',                claim: 'Língua natural codificada. Sem consenso.',                           kind: 'hipótese' },
  ],
}

type MockInsc = { ref: string; title: string; material: string; date: string; icon: string }
type MockEvent = { year: number; who: string; claim: string; kind: string }

export function CorpusBrowser() {
  const [script, setScript] = useState<Script>('linear_a')
  const [insc, setInsc] = useState<MockInsc | null>(null)
  const cur = SCRIPTS.find(s => s.code === script)!
  const scriptHue = T.script[script].hue

  return (
    <div style={{
      flex: 1, overflowY: 'auto',
      background: T.bg,
    }}>
      <div style={{ maxWidth: 1320, margin: '0 auto', padding: '32px 28px 60px' }}>

        {/* HERO — script selector */}
        <section className="gc-enter" style={{ marginBottom: 36 }}>
          <div style={{
            fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.14em',
            color: T.inkMute, fontWeight: 600, marginBottom: 10,
          }}>
            Scripts cobertos
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16,
          }}>
            {SCRIPTS.map((s, i) => {
              const active = script === s.code
              const hue = T.script[s.code].hue
              return (
                <button
                  key={s.code}
                  onClick={() => { setScript(s.code); setInsc(null) }}
                  className="gc-enter"
                  style={{
                    textAlign: 'left',
                    background: active ? T.bgPanel : 'transparent',
                    border: `1px solid ${active ? hue : T.divider}`,
                    borderRadius: 12, padding: '22px 22px 20px',
                    cursor: 'pointer',
                    boxShadow: active ? T.shadowMd : 'none',
                    transform: 'translateY(0)',
                    transition: `transform ${T.fast} ${T.ease}, box-shadow ${T.fast} ${T.ease}, border-color ${T.fast} ${T.ease}, background ${T.fast} ${T.ease}`,
                    animationDelay: `${i * 80}ms`,
                  }}
                  onMouseEnter={e => {
                    if (active) return
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = T.shadowSm
                    e.currentTarget.style.borderColor = hue
                  }}
                  onMouseLeave={e => {
                    if (active) return
                    e.currentTarget.style.transform = ''
                    e.currentTarget.style.boxShadow = ''
                    e.currentTarget.style.borderColor = T.divider
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
                    <h2 className="gc-serif" style={{
                      margin: 0, fontSize: '1.8rem', fontWeight: 600,
                      letterSpacing: '-0.01em', color: T.ink,
                    }}>
                      {s.name}
                    </h2>
                    <div style={{
                      width: 14, height: 14, borderRadius: '50%',
                      background: hue,
                      boxShadow: active ? `0 0 0 4px ${hue}22` : 'none',
                      transition: `box-shadow ${T.fast} ${T.ease}`,
                    }} />
                  </div>
                  <div className="gc-serif gc-italic" style={{
                    marginTop: 6, fontSize: '0.95rem', color: T.inkMid,
                  }}>
                    {s.era} · {s.region}
                  </div>
                  <p style={{
                    marginTop: 12, marginBottom: 0, fontSize: '0.88rem',
                    color: T.inkMid, lineHeight: 1.55,
                  }}>
                    {s.tagline}
                  </p>
                  <div style={{
                    marginTop: 16, display: 'flex', gap: 18,
                    fontSize: '0.74rem', color: T.inkMute,
                  }}>
                    <span><strong style={{ color: T.ink, fontWeight: 600 }}>{s.n.toLocaleString('pt-BR')}</strong> inscrições</span>
                    {s.anchor && <span>âncora: <strong style={{ color: T.ink, fontWeight: 600 }}>{s.anchor}</strong></span>}
                    {!s.anchor && <span style={{ color: T.oxblood, fontWeight: 600 }}>sem âncora conhecida</span>}
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        {/* SCRIPT ATIVO — gallery + timeline lado a lado */}
        <section className="gc-enter" style={{ animationDelay: '120ms' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 360px', gap: 36,
          }}>
            {/* esquerda: gallery */}
            <div>
              <div style={{
                display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
                marginBottom: 18, paddingBottom: 14, borderBottom: `1px solid ${T.divider}`,
              }}>
                <div>
                  <div style={{
                    fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.14em',
                    color: T.inkMute, fontWeight: 600, marginBottom: 4,
                  }}>
                    Inscrições — {cur.name}
                  </div>
                  <h3 className="gc-serif gc-italic" style={{
                    margin: 0, fontSize: '1.15rem', color: T.inkMid, fontWeight: 500,
                  }}>
                    Clique pra abrir o fólio. Cada um carrega imagem, transcrição e iconografia anotada.
                  </h3>
                </div>
                <a style={{
                  fontSize: '0.78rem', color: scriptHue, fontWeight: 600,
                  textDecoration: 'none', borderBottom: `1px solid ${scriptHue}55`,
                  paddingBottom: 1,
                }} href="#">ver corpus completo →</a>
              </div>

              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14,
              }}>
                {INSCRIPTIONS[script].map((i, idx) => {
                  const sel = insc?.ref === i.ref
                  return (
                    <button
                      key={i.ref}
                      onClick={() => setInsc(i)}
                      className="gc-enter"
                      style={{
                        textAlign: 'left', padding: 0, cursor: 'pointer',
                        background: 'transparent', border: 'none',
                        animationDelay: `${160 + idx * 50}ms`,
                      }}
                    >
                      {/* "imagem" — placeholder com textura de papel envelhecido */}
                      <div style={{
                        aspectRatio: '3/4', borderRadius: 8,
                        background: `linear-gradient(135deg, ${T.bgSubtle} 0%, ${T.bgPanel} 100%)`,
                        border: `1px solid ${sel ? scriptHue : T.divider}`,
                        position: 'relative', overflow: 'hidden',
                        boxShadow: sel ? T.shadowMd : T.shadowSm,
                        transform: sel ? 'scale(1.02)' : 'scale(1)',
                        transition: `transform ${T.fast} ${T.ease}, box-shadow ${T.fast} ${T.ease}, border-color ${T.fast} ${T.ease}`,
                      }}
                      onMouseEnter={e => {
                        if (sel) return
                        e.currentTarget.style.transform = 'translateY(-2px)'
                        e.currentTarget.style.boxShadow = T.shadowMd
                      }}
                      onMouseLeave={e => {
                        if (sel) return
                        e.currentTarget.style.transform = ''
                        e.currentTarget.style.boxShadow = T.shadowSm
                      }}>
                        {/* textura sutil de papel: linhas finas */}
                        <div style={{
                          position: 'absolute', inset: 0,
                          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 13px, ${T.dividerStrong}33 13px, ${T.dividerStrong}33 14px)`,
                          opacity: 0.5,
                        }} />
                        <div style={{
                          position: 'absolute', inset: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '3.5rem', color: `${scriptHue}66`,
                          fontFamily: T.fontSerif,
                        }}>{i.icon}</div>
                        {/* marca d'água do ref */}
                        <div style={{
                          position: 'absolute', top: 10, left: 10,
                          fontSize: '0.66rem', fontWeight: 700,
                          color: scriptHue, fontFamily: T.fontMono,
                          letterSpacing: '0.06em',
                        }}>{i.ref}</div>
                      </div>
                      <div style={{ marginTop: 10 }}>
                        <div className="gc-serif" style={{
                          fontSize: '0.95rem', fontWeight: 600, color: T.ink, lineHeight: 1.3,
                        }}>{i.title}</div>
                        <div style={{ marginTop: 3, fontSize: '0.72rem', color: T.inkMute }}>
                          {i.material} · {i.date}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* detalhe expandido */}
              {insc && (
                <div className="gc-enter-scale" style={{
                  marginTop: 32, padding: 28, borderRadius: 12,
                  background: T.bgPanel, border: `1px solid ${T.divider}`,
                  boxShadow: T.shadowSm,
                }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 4 }}>
                    <span style={{
                      fontSize: '0.72rem', fontFamily: T.fontMono, color: scriptHue,
                      fontWeight: 700, letterSpacing: '0.06em',
                    }}>{insc.ref}</span>
                    <span style={{ fontSize: '0.72rem', color: T.inkMute }}>
                      {cur.name} · {insc.material} · {insc.date}
                    </span>
                  </div>
                  <h2 className="gc-serif" style={{
                    margin: '4px 0 0', fontSize: '1.6rem', fontWeight: 600,
                    letterSpacing: '-0.01em', color: T.ink,
                  }}>{insc.title}</h2>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 22 }}>
                    {/* "imagem grande" */}
                    <div style={{
                      aspectRatio: '4/5', borderRadius: 8,
                      background: `linear-gradient(135deg, ${T.bgSubtle} 0%, ${T.bgPanel} 100%)`,
                      border: `1px solid ${T.divider}`,
                      position: 'relative', overflow: 'hidden',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <div style={{
                        position: 'absolute', inset: 0,
                        backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 16px, ${T.dividerStrong}33 16px, ${T.dividerStrong}33 17px)`,
                      }} />
                      <div className="gc-serif gc-italic" style={{
                        position: 'relative', color: T.inkMute, fontSize: '0.85rem',
                        textAlign: 'center', maxWidth: 220, lineHeight: 1.5,
                      }}>
                        Imagem alta resolução de {insc.ref}<br />
                        <span style={{ fontSize: '0.75rem', color: T.inkFaint }}>
                          (Beinecke Library · SigLA Cambridge)
                        </span>
                      </div>
                    </div>

                    {/* transcrição + iconografia */}
                    <div>
                      <div style={{
                        fontSize: '0.66rem', textTransform: 'uppercase', letterSpacing: '0.14em',
                        color: T.inkMute, fontWeight: 600, marginBottom: 8,
                      }}>Transcrição</div>
                      <div className="gc-mono" style={{
                        padding: 14, borderRadius: 8,
                        background: T.bg, border: `1px solid ${T.divider}`,
                        fontSize: '0.9rem', color: T.ink, lineHeight: 1.8,
                      }}>
                        {script === 'linear_a'
                          ? <>𐘀𐘂𐘄 𐘅𐘇 · 𐘉𐘊𐘌𐘎 · 𐘐𐘒𐘔</>
                          : <>otol dain kchedy daiin · qokeey shedy lkar</>
                        }
                        <div style={{ fontSize: '0.72rem', color: T.inkFaint, fontFamily: T.fontSans, marginTop: 8, fontStyle: 'italic' }}>
                          padrão {script === 'voynich' ? 'EVA' : 'SigLA'} · mock
                        </div>
                      </div>

                      <div style={{
                        fontSize: '0.66rem', textTransform: 'uppercase', letterSpacing: '0.14em',
                        color: T.inkMute, fontWeight: 600, marginTop: 18, marginBottom: 8,
                      }}>Iconografia anotada</div>
                      <div style={{ fontSize: '0.85rem', color: T.inkMid, lineHeight: 1.55 }}>
                        {script === 'voynich'
                          ? <>3 elementos botânicos identificados · 0 figuras humanas.</>
                          : <>1 sinal administrativo cognato de Linear B.</>}{' '}
                        <a style={{ color: scriptHue, fontWeight: 600 }}>Anotar mais →</a>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* direita: timeline */}
            <aside>
              <div style={{
                fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.14em',
                color: T.inkMute, fontWeight: 600, marginBottom: 10,
              }}>Linha do tempo</div>
              <div style={{
                position: 'relative', paddingLeft: 22,
              }}>
                <div style={{
                  position: 'absolute', left: 5, top: 8, bottom: 8,
                  width: 1, background: T.divider,
                }} />
                {TIMELINE[script].map((ev, i) => (
                  <div key={ev.year + ev.who} className="gc-enter" style={{
                    position: 'relative', marginBottom: 22,
                    animationDelay: `${200 + i * 70}ms`,
                  }}>
                    <div style={{
                      position: 'absolute', left: -22, top: 6,
                      width: 11, height: 11, borderRadius: '50%',
                      background: T.bg, border: `2px solid ${scriptHue}`,
                    }} />
                    <div className="gc-serif" style={{
                      fontSize: '1.05rem', color: T.ink, fontWeight: 600,
                      letterSpacing: '-0.01em',
                    }}>{ev.year}</div>
                    <div style={{
                      fontSize: '0.85rem', color: T.ink, fontWeight: 500, marginTop: 2,
                    }}>{ev.who}</div>
                    <div style={{
                      fontSize: '0.78rem', color: T.inkMid, lineHeight: 1.55, marginTop: 4,
                    }}>{ev.claim}</div>
                    <div style={{
                      marginTop: 6, fontSize: '0.64rem', color: T.inkMute,
                      textTransform: 'uppercase', letterSpacing: '0.1em',
                    }}>{ev.kind}</div>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </section>
      </div>
    </div>
  )
}
