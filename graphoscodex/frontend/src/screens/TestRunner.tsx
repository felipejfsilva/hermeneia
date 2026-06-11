import { useEffect, useState } from 'react'
import { T } from '../theme'

const PROPOSALS = [
  { id: 'younger-20',   name: 'Sílabas Linear A · análise sistemática',     short: 'Younger 2020',  script: 'linear_a' as const, author: 'John G. Younger' },
  { id: 'cheshire-19',  name: 'Voynich como proto-romance',                 short: 'Cheshire 2019', script: 'voynich' as const,  author: 'Gerard Cheshire' },
  { id: 'lindemann-24', name: 'Voynich · língua natural codificada',        short: 'Lindemann 2024', script: 'voynich' as const,  author: 'Lindemann' },
  { id: 'rugg-03',      name: 'Voynich · hoax via grades de Cardan',        short: 'Rugg 2003',     script: 'voynich' as const,  author: 'Gordon Rugg' },
]

const TESTS = [
  { name: 'Cobertura',                  score: 0.62, sub: '93 de 150 sinais mapeados',                                          kind: 'ok' as const },
  { name: 'Consistência interna',       score: 0.74, sub: 'Predições batem com 74% das ocorrências',                            kind: 'ok' as const },
  { name: 'Plausibilidade fonotática',  score: 0.41, sub: 'Anatoliana possível; semítica improvável',                           kind: 'warn' as const },
  { name: 'Correlação iconográfica',    score: 0.55, sub: '17 de 31 anotações correlacionam',                                   kind: 'warn' as const },
  { name: 'Concordância com Linear B',  score: 0.81, sub: '21 de 26 valores propostos coincidem',                               kind: 'ok' as const },
]

const PREDICTIONS = [
  { ref: 'HT 31, l.3', predicted: 'ku-ro-i-pa-i',  observed: 'ku-ro-i-pa-i', match: 1.0  },
  { ref: 'HT 38, l.1', predicted: 'da-ku-ru-ne',   observed: 'da-?-ru-ne',   match: 0.75 },
  { ref: 'HT 86, l.2', predicted: 'pa-i-to',       observed: 'pa-i-ta',      match: 0.5  },
  { ref: 'ZA 10, l.1', predicted: 'i-do-mi-ne',    observed: 'i-do-mi-ne',   match: 1.0  },
  { ref: 'KH 5,  l.1', predicted: 'ku-ka-ni',      observed: 'ku-pa-ni',     match: 0.33 },
]

const CONFLICTS = [
  { hyp: 'Davis 2014',      on: 'AB02 = "óleo" vs "vinho"',     severity: 'high' as const },
  { hyp: 'Salgarella 2021', on: 'AB81 fonema diverge',           severity: 'low'  as const },
]

const GLOBAL_SCORE = 0.63
const VERDICT = 'Cobertura razoável, consistência interna alta, plausibilidade fonotática mediana. Concordância com Linear B reforça a hipótese parcial.'

export function TestRunner() {
  const [selected, setSelected] = useState(PROPOSALS[0].id)
  const proposal = PROPOSALS.find(p => p.id === selected)!
  const scriptHue = T.script[proposal.script].hue

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: T.bg }}>
      <div style={{
        maxWidth: 1240, margin: '0 auto',
        padding: '36px 28px 60px',
        display: 'grid', gridTemplateColumns: '260px minmax(0,1fr)', gap: 36,
      }}>
        {/* esquerda — picker */}
        <aside className="gc-enter">
          <div style={{
            fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.14em',
            color: T.inkMute, fontWeight: 600, marginBottom: 12,
          }}>Proposta a testar</div>

          {PROPOSALS.map((p, idx) => {
            const sel = selected === p.id
            const hue = T.script[p.script].hue
            return (
              <button
                key={p.id}
                onClick={() => setSelected(p.id)}
                className="gc-enter"
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '12px 14px', marginBottom: 8, borderRadius: 8,
                  background: sel ? T.bgPanel : 'transparent',
                  border: `1px solid ${sel ? hue : T.divider}`,
                  cursor: 'pointer',
                  boxShadow: sel ? T.shadowSm : 'none',
                  transition: `transform ${T.fast} ${T.ease}, border-color ${T.fast} ${T.ease}, box-shadow ${T.fast} ${T.ease}`,
                  animationDelay: `${idx * 50}ms`,
                }}
                onMouseEnter={e => { if (!sel) e.currentTarget.style.borderColor = T.dividerStrong }}
                onMouseLeave={e => { if (!sel) e.currentTarget.style.borderColor = T.divider }}
              >
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
                  <div className="gc-serif" style={{
                    fontSize: '0.92rem', fontWeight: 600, color: T.ink, lineHeight: 1.25,
                  }}>{p.short}</div>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%', background: hue, flexShrink: 0,
                  }} />
                </div>
                <div style={{ marginTop: 4, fontSize: '0.74rem', color: T.inkMute, lineHeight: 1.4 }}>
                  {p.author}
                </div>
              </button>
            )
          })}
        </aside>

        {/* centro — relatório */}
        <section className="gc-enter" key={proposal.id}>
          <div style={{
            fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.14em',
            color: T.inkMute, fontWeight: 600, marginBottom: 6,
          }}>
            Relatório · {proposal.script === 'linear_a' ? 'Linear A' : 'Voynich'} · gerado agora
          </div>
          <h1 className="gc-serif" style={{
            margin: 0, fontSize: '2.2rem', fontWeight: 600,
            letterSpacing: '-0.015em', color: T.ink, lineHeight: 1.15,
          }}>
            {proposal.name}
          </h1>
          <div className="gc-serif gc-italic" style={{
            marginTop: 8, fontSize: '1.05rem', color: T.inkMid,
          }}>
            {proposal.author}
          </div>

          {/* veredito */}
          <div style={{
            marginTop: 28, padding: '28px 32px', borderRadius: 12,
            background: T.bgPanel, border: `1px solid ${T.divider}`,
            boxShadow: T.shadowSm,
            display: 'grid', gridTemplateColumns: '180px 1fr', gap: 28, alignItems: 'center',
          }}>
            <div>
              <div style={{
                fontSize: '0.66rem', textTransform: 'uppercase', letterSpacing: '0.14em',
                color: T.inkMute, fontWeight: 600, marginBottom: 8,
              }}>Score multimodal</div>
              <ScoreNumber value={GLOBAL_SCORE} hue={scriptHue} />
            </div>
            <div>
              <div className="gc-serif" style={{
                fontSize: '1.05rem', color: T.ink, lineHeight: 1.6,
              }}>
                {VERDICT}
              </div>
              <div style={{ marginTop: 14, display: 'flex', gap: 18, fontSize: '0.78rem', color: T.inkMute }}>
                <span><strong style={{ color: T.ink, fontWeight: 600 }}>5</strong> testes rodados</span>
                <span><strong style={{ color: T.ink, fontWeight: 600 }}>14</strong> predições</span>
                <span><strong style={{ color: T.oxblood, fontWeight: 600 }}>2</strong> conflitos</span>
              </div>
            </div>
          </div>

          {/* testes individuais */}
          <SectionH>Testes</SectionH>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14,
          }}>
            {TESTS.map((t, i) => <TestCard key={t.name} {...t} delay={i * 70} />)}
          </div>

          {/* predições */}
          <SectionH>Predições e observação</SectionH>
          <div style={{
            borderRadius: 10, overflow: 'hidden',
            background: T.bgPanel, border: `1px solid ${T.divider}`,
            boxShadow: T.shadowSm,
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${T.divider}` }}>
                  {['Inscrição', 'Predição', 'Observado', 'Match'].map(h => (
                    <th key={h} style={{
                      padding: '12px 16px', textAlign: 'left',
                      fontSize: '0.66rem', fontWeight: 700, color: T.inkMute,
                      textTransform: 'uppercase', letterSpacing: '0.12em',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PREDICTIONS.map((p, i) => {
                  const color = p.match >= 0.75 ? T.forest : p.match >= 0.5 ? T.ochre : T.oxblood
                  return (
                    <tr key={p.ref} className="gc-enter" style={{
                      borderBottom: `1px solid ${T.divider}`,
                      animationDelay: `${100 + i * 50}ms`,
                    }}>
                      <td className="gc-mono" style={{ padding: '12px 16px', color: scriptHue, fontSize: '0.84rem', fontWeight: 600 }}>{p.ref}</td>
                      <td className="gc-mono" style={{ padding: '12px 16px', color: T.inkMid }}>{p.predicted}</td>
                      <td className="gc-mono" style={{ padding: '12px 16px', color: T.inkMid }}>{p.observed}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 56, height: 5, borderRadius: 999, background: T.bgSubtle,
                            overflow: 'hidden',
                          }}>
                            <div className="gc-fade" style={{
                              width: `${p.match * 100}%`, height: '100%', background: color, borderRadius: 999,
                            }} />
                          </div>
                          <span className="gc-mono" style={{ fontWeight: 600, color, fontSize: '0.85rem' }}>
                            {Math.round(p.match * 100)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* conflitos */}
          <SectionH>Conflitos com hipóteses adjacentes</SectionH>
          {CONFLICTS.map((c, i) => (
            <div key={c.hyp} className="gc-enter" style={{
              padding: '14px 18px', marginBottom: 10, borderRadius: 10,
              background: c.severity === 'high' ? T.oxbloodBg : T.ochreBg,
              border: `1px solid ${c.severity === 'high' ? T.oxbloodBd : T.ochreBd}`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              animationDelay: `${i * 60}ms`,
            }}>
              <div>
                <div className="gc-serif" style={{ fontSize: '1rem', fontWeight: 600, color: T.ink }}>
                  {c.hyp}
                </div>
                <div style={{ marginTop: 2, fontSize: '0.85rem', color: T.inkMid }}>
                  {c.on}
                </div>
              </div>
              <span style={{
                fontSize: '0.66rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em',
                color: c.severity === 'high' ? T.oxblood : '#7a5a18',
              }}>
                severidade {c.severity === 'high' ? 'alta' : 'baixa'}
              </span>
            </div>
          ))}

          {/* ações */}
          <div style={{ marginTop: 32, display: 'flex', gap: 12 }}>
            <button style={btnPrimary}>Baixar laudo PDF</button>
            <button style={btnGhost}>Comparar com outras →</button>
            <button style={btnGhost}>Re-rodar testes</button>
          </div>
        </section>
      </div>
    </div>
  )
}

function ScoreNumber({ value, hue }: { value: number; hue: string }) {
  const [n, setN] = useState(0)
  useEffect(() => {
    let raf = 0
    const start = performance.now()
    const dur = 900
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur)
      // easeOutCubic
      const eased = 1 - Math.pow(1 - p, 3)
      setN(value * eased)
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value])
  return (
    <div className="gc-serif" style={{
      fontSize: '3.4rem', fontWeight: 600, color: T.ink,
      letterSpacing: '-0.02em', lineHeight: 1,
      display: 'flex', alignItems: 'baseline', gap: 8,
    }}>
      <span style={{ color: hue }}>{n.toFixed(2)}</span>
      <span style={{ fontSize: '1.1rem', color: T.inkMute, fontStyle: 'italic', fontWeight: 500 }}>/ 1.00</span>
    </div>
  )
}

function TestCard({ name, score, sub, kind, delay }: { name: string; score: number; sub: string; kind: 'ok' | 'warn' | 'bad'; delay: number }) {
  const color = kind === 'ok' ? T.forest : kind === 'warn' ? T.ochre : T.oxblood
  const bg    = kind === 'ok' ? T.forestBg : kind === 'warn' ? T.ochreBg : T.oxbloodBg
  const bd    = kind === 'ok' ? T.forestBd : kind === 'warn' ? T.ochreBd : T.oxbloodBd
  return (
    <div className="gc-enter" style={{
      padding: 18, borderRadius: 10, background: bg, border: `1px solid ${bd}`,
      animationDelay: `${delay}ms`,
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <div className="gc-serif" style={{ fontSize: '1rem', fontWeight: 600, color: T.ink, letterSpacing: '-0.005em' }}>{name}</div>
        <div className="gc-serif" style={{ fontSize: '1.4rem', fontWeight: 600, color }}>{Math.round(score * 100)}%</div>
      </div>
      <div style={{ marginTop: 10, height: 4, background: 'rgba(28,26,22,0.06)', borderRadius: 999, overflow: 'hidden' }}>
        <div className="gc-fade" style={{ height: '100%', width: `${score * 100}%`, background: color, borderRadius: 999 }} />
      </div>
      <div style={{ marginTop: 10, fontSize: '0.78rem', color: T.inkMid, lineHeight: 1.5 }}>{sub}</div>
    </div>
  )
}

function SectionH({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="gc-serif" style={{
      marginTop: 36, marginBottom: 16,
      fontSize: '1.45rem', fontWeight: 600,
      letterSpacing: '-0.01em',
      borderBottom: `1px solid ${T.divider}`, paddingBottom: 8,
    }}>{children}</h2>
  )
}

const btnPrimary: React.CSSProperties = {
  padding: '11px 24px', borderRadius: 999,
  background: T.ink, border: `1px solid ${T.ink}`,
  color: T.bg, fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
  transition: `transform ${T.fast} ${T.ease}`,
}
const btnGhost: React.CSSProperties = {
  padding: '11px 22px', borderRadius: 999,
  background: 'transparent', border: `1px solid ${T.dividerStrong}`,
  color: T.ink, fontSize: '0.83rem', fontWeight: 600, cursor: 'pointer',
}
