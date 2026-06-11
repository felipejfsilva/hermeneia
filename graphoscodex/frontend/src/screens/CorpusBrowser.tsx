import { useEffect, useState } from 'react'
import { T } from '../theme'
import { listScripts, listInscriptions, type Script as DBScript, type Inscription } from '../data'

type Script = 'linear_a' | 'voynich'

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
    { year: 2024, who: 'Lindemann & Bowern',       claim: 'Análise bayesiana — perfil estatístico de língua natural.',          kind: 'hipótese' },
  ],
}

type MockEvent = { year: number; who: string; claim: string; kind: string }

function sectionIcon(section: string | undefined): string {
  switch (section) {
    case 'botanical': return '✿'
    case 'astronomical': return '☼'
    case 'biological': return '◐'
    case 'pharmaceutical': return '⚗'
    case 'recipes_stars': return '✧'
    case 'rosettes': return '✱'
    default: return '◊'
  }
}

export function CorpusBrowser() {
  const [scripts, setScripts] = useState<DBScript[]>([])
  const [script, setScript] = useState<Script>('voynich')
  const [inscriptions, setInscriptions] = useState<Inscription[]>([])
  const [insc, setInsc] = useState<Inscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    listScripts().then(setScripts).catch(e => setErr(String(e)))
  }, [])

  useEffect(() => {
    setLoading(true)
    setInsc(null)
    listInscriptions(script)
      .then(rs => { setInscriptions(rs); setLoading(false) })
      .catch(e => { setErr(String(e)); setLoading(false) })
  }, [script])

  const cur = scripts.find(s => s.code === script)
  const scriptHue = T.script[script].hue

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: T.bg }}>
      <div style={{ maxWidth: 1320, margin: '0 auto', padding: '32px 28px 60px' }}>

        <section className="gc-enter" style={{ marginBottom: 36 }}>
          <div style={{
            fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.14em',
            color: T.inkMute, fontWeight: 600, marginBottom: 10,
          }}>
            Scripts cobertos {!loading && <span style={{ color: T.oxblood, marginLeft: 8 }}>· dados ao vivo do Supabase</span>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16 }}>
            {scripts.map((s, i) => {
              const code = s.code as Script
              const active = script === code
              const hue = T.script[code]?.hue ?? T.oxblood
              return (
                <button
                  key={s.code}
                  onClick={() => setScript(code)}
                  className="gc-enter"
                  style={{
                    textAlign: 'left',
                    background: active ? T.bgPanel : 'transparent',
                    border: `1px solid ${active ? hue : T.divider}`,
                    borderRadius: 12, padding: '22px 22px 20px',
                    cursor: 'pointer',
                    boxShadow: active ? T.shadowMd : 'none',
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
                    }}>{s.name}</h2>
                    <div style={{
                      width: 14, height: 14, borderRadius: '50%', background: hue,
                      boxShadow: active ? `0 0 0 4px ${hue}22` : 'none',
                      transition: `box-shadow ${T.fast} ${T.ease}`,
                    }} />
                  </div>
                  <div className="gc-serif gc-italic" style={{
                    marginTop: 6, fontSize: '0.95rem', color: T.inkMid,
                  }}>
                    {s.period_start && s.period_end
                      ? `${Math.abs(s.period_start)}${s.period_start < 0 ? ' a.C.' : ''} – ${Math.abs(s.period_end)}${s.period_end < 0 ? ' a.C.' : ' CE'}`
                      : '—'} · {s.region}
                  </div>
                  <p style={{
                    marginTop: 12, marginBottom: 0, fontSize: '0.88rem',
                    color: T.inkMid, lineHeight: 1.55,
                  }}>{s.description || '—'}</p>
                  <div style={{
                    marginTop: 16, display: 'flex', gap: 18,
                    fontSize: '0.74rem', color: T.inkMute,
                  }}>
                    <span><strong style={{ color: T.ink, fontWeight: 600 }}>{(s.corpus_size ?? 0).toLocaleString('pt-BR')}</strong> inscrições/tokens</span>
                    {s.anchor_code && <span>âncora: <strong style={{ color: T.ink, fontWeight: 600 }}>{s.anchor_code}</strong></span>}
                    {!s.anchor_code && <span style={{ color: T.oxblood, fontWeight: 600 }}>sem âncora conhecida</span>}
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        <section className="gc-enter" style={{ animationDelay: '120ms' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 360px', gap: 36 }}>
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
                    Inscrições — {cur?.name ?? '...'}
                    <span style={{ color: scriptHue, marginLeft: 8 }}>
                      ({inscriptions.length} no DB)
                    </span>
                  </div>
                  <h3 className="gc-serif gc-italic" style={{
                    margin: 0, fontSize: '1.15rem', color: T.inkMid, fontWeight: 500,
                  }}>
                    Clique pra abrir o fólio. Transcrição real (FSG/Reeds 1994) carregada do Supabase.
                  </h3>
                </div>
              </div>

              {loading && (
                <div style={{ padding: 40, color: T.inkMute, textAlign: 'center' }}>
                  carregando corpus...
                </div>
              )}
              {err && (
                <div style={{ padding: 20, color: T.oxblood, background: '#fee', borderRadius: 8 }}>
                  erro: {err}
                </div>
              )}

              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14,
              }}>
                {inscriptions.map((i, idx) => {
                  const sel = insc?.ref === i.ref
                  const sec = i.metadata?.section
                  const icon = sectionIcon(sec)
                  return (
                    <button
                      key={i.ref}
                      onClick={() => setInsc(i)}
                      className="gc-enter"
                      style={{
                        textAlign: 'left', padding: 0, cursor: 'pointer',
                        background: 'transparent', border: 'none',
                        animationDelay: `${160 + idx * 30}ms`,
                      }}
                    >
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
                        }}>{icon}</div>
                        <div style={{
                          position: 'absolute', top: 10, left: 10,
                          fontSize: '0.66rem', fontWeight: 700,
                          color: scriptHue, fontFamily: T.fontMono,
                          letterSpacing: '0.06em',
                        }}>{i.ref}</div>
                        {i.metadata?.lines && (
                          <div style={{
                            position: 'absolute', bottom: 10, right: 10,
                            fontSize: '0.62rem', color: T.inkMute,
                            fontFamily: T.fontMono,
                          }}>{i.metadata.lines}L</div>
                        )}
                      </div>
                      <div style={{ marginTop: 10 }}>
                        <div className="gc-serif" style={{
                          fontSize: '0.92rem', fontWeight: 600, color: T.ink, lineHeight: 1.3,
                        }}>{i.title}</div>
                        <div style={{ marginTop: 3, fontSize: '0.72rem', color: T.inkMute }}>
                          {i.material} · {i.date_estimate}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>

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
                      {cur?.name} · {insc.material} · {insc.date_estimate} · {insc.holding_institution}
                    </span>
                  </div>
                  <h2 className="gc-serif" style={{
                    margin: '4px 0 0', fontSize: '1.6rem', fontWeight: 600,
                    letterSpacing: '-0.01em', color: T.ink,
                  }}>{insc.title}</h2>

                  <div style={{ marginTop: 20 }}>
                    <div style={{
                      fontSize: '0.66rem', textTransform: 'uppercase', letterSpacing: '0.14em',
                      color: T.inkMute, fontWeight: 600, marginBottom: 8,
                    }}>Transcrição ({insc.transcription_format})</div>
                    <div className="gc-mono" style={{
                      padding: 16, borderRadius: 8,
                      background: T.bg, border: `1px solid ${T.divider}`,
                      fontSize: '0.85rem', color: T.ink, lineHeight: 1.7,
                      maxHeight: 240, overflowY: 'auto',
                      whiteSpace: 'pre-wrap', wordBreak: 'break-all',
                    }}>{insc.transcription}</div>
                    <div style={{ fontSize: '0.72rem', color: T.inkFaint, marginTop: 8, fontStyle: 'italic' }}>
                      fonte: {insc.metadata?.source ?? '—'}
                      {insc.metadata?.truncated && <span style={{ color: T.oxblood }}> · transcrição truncada na ingestão (corpus completo no Beinecke)</span>}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <aside>
              <div style={{
                fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.14em',
                color: T.inkMute, fontWeight: 600, marginBottom: 10,
              }}>Linha do tempo</div>
              <div style={{ position: 'relative', paddingLeft: 22 }}>
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
