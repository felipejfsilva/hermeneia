import { useEffect, useState } from 'react'
import { T } from '../theme'
import { listProposals, testProposal, type Proposal, type TestReport } from '../data'

type ScriptCode = 'linear_a' | 'voynich'

export function TestRunner() {
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [report, setReport] = useState<TestReport | null>(null)
  const [proposal, setProposal] = useState<Proposal | null>(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    listProposals()
      .then(ps => {
        setProposals(ps)
        if (ps.length) setSelected(ps[0].slug)
        setLoading(false)
      })
      .catch(e => { setErr(String(e)); setLoading(false) })
  }, [])

  useEffect(() => {
    if (!selected) return
    setReport(null)
    const p = proposals.find(x => x.slug === selected) || null
    setProposal(p)
    testProposal(selected).then(setReport).catch(e => setErr(String(e)))
  }, [selected, proposals])

  if (loading) {
    return (
      <div style={{ flex: 1, padding: 60, textAlign: 'center', color: T.inkMute }}>
        carregando propostas...
      </div>
    )
  }

  if (!proposal) {
    return (
      <div style={{ flex: 1, padding: 60, textAlign: 'center', color: T.inkMute }}>
        nenhuma proposta cadastrada ainda.
      </div>
    )
  }

  const scriptCode = proposal.script_code as ScriptCode
  const scriptHue = T.script[scriptCode]?.hue ?? T.oxblood

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: T.bg }}>
      <div style={{
        maxWidth: 1240, margin: '0 auto',
        padding: '36px 28px 60px',
        display: 'grid', gridTemplateColumns: '280px minmax(0,1fr)', gap: 36,
      }}>
        <aside className="gc-enter">
          <div style={{
            fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.14em',
            color: T.inkMute, fontWeight: 600, marginBottom: 12,
          }}>Proposta a testar <span style={{ color: T.oxblood }}>· {proposals.length} no DB</span></div>

          {proposals.map((p, idx) => {
            const sel = selected === p.slug
            const code = p.script_code as ScriptCode
            const hue = T.script[code]?.hue ?? T.oxblood
            return (
              <button
                key={p.slug}
                onClick={() => setSelected(p.slug)}
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
              >
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
                  <div className="gc-serif" style={{
                    fontSize: '0.92rem', fontWeight: 600, color: T.ink, lineHeight: 1.25,
                  }}>{p.author.split(' ').slice(-1)[0]} {p.year_proposed}</div>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%', background: hue, flexShrink: 0,
                  }} />
                </div>
                <div style={{ marginTop: 4, fontSize: '0.74rem', color: T.inkMute, lineHeight: 1.4 }}>
                  {p.title.slice(0, 60)}{p.title.length > 60 ? '…' : ''}
                </div>
                <div style={{
                  marginTop: 6, display: 'inline-block', fontSize: '0.62rem', fontWeight: 600,
                  padding: '2px 6px', borderRadius: 4,
                  background: p.status === 'refuted' ? T.oxbloodBg : p.status === 'active' ? T.forestBg : T.ochreBg,
                  color: p.status === 'refuted' ? T.oxblood : p.status === 'active' ? T.forest : '#7a5a18',
                  textTransform: 'uppercase', letterSpacing: '0.1em',
                }}>{p.status}</div>
              </button>
            )
          })}
        </aside>

        <section className="gc-enter" key={proposal.slug}>
          <div style={{
            fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.14em',
            color: T.inkMute, fontWeight: 600, marginBottom: 6,
          }}>
            Relatório · {scriptCode === 'linear_a' ? 'Linear A' : 'Voynich'} · computado agora
          </div>
          <h1 className="gc-serif" style={{
            margin: 0, fontSize: '2.2rem', fontWeight: 600,
            letterSpacing: '-0.015em', color: T.ink, lineHeight: 1.15,
          }}>{proposal.title}</h1>
          <div className="gc-serif gc-italic" style={{
            marginTop: 8, fontSize: '1.05rem', color: T.inkMid,
          }}>
            {proposal.author} {proposal.author_affiliation && `· ${proposal.author_affiliation}`} · {proposal.year_proposed}
          </div>

          {report && (
            <div className="gc-enter" style={{
              marginTop: 28, padding: '28px 32px', borderRadius: 12,
              background: T.bgPanel, border: `1px solid ${T.divider}`,
              boxShadow: T.shadowSm,
              display: 'grid', gridTemplateColumns: '180px 1fr', gap: 28, alignItems: 'center',
            }}>
              <div>
                <div style={{
                  fontSize: '0.66rem', textTransform: 'uppercase', letterSpacing: '0.14em',
                  color: T.inkMute, fontWeight: 600, marginBottom: 8,
                }}>Score global</div>
                <ScoreNumber value={report.global_score} hue={scriptHue} />
              </div>
              <div>
                <div className="gc-serif" style={{
                  fontSize: '1.05rem', color: T.ink, lineHeight: 1.6,
                }}>{report.verdict}</div>
                <div style={{ marginTop: 14, display: 'flex', gap: 18, fontSize: '0.78rem', color: T.inkMute }}>
                  <span><strong style={{ color: T.ink, fontWeight: 600 }}>{(proposal.mappings || []).length}</strong> mapeamentos</span>
                  <span><strong style={{ color: T.ink, fontWeight: 600 }}>{Math.round(report.coverage * 100)}%</strong> cobertura</span>
                  <span><strong style={{ color: report.conflicts.length ? T.oxblood : T.forest, fontWeight: 600 }}>{report.conflicts.length}</strong> conflitos</span>
                </div>
              </div>
            </div>
          )}

          <SectionH>Resumo da hipótese</SectionH>
          <div style={{ fontSize: '0.95rem', color: T.inkMid, lineHeight: 1.65 }}>
            {proposal.summary}
          </div>

          {report && (
            <>
              <SectionH>Testes individuais</SectionH>
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14,
              }}>
                <TestCard
                  name="Cobertura do corpus"
                  score={report.coverage}
                  sub={`${Math.round(report.coverage * 100)}% dos signos do corpus mapeados (ponderado por frequência de atestação)`}
                  delay={0}
                />
                <TestCard
                  name="Consistência interna"
                  score={report.internal_consistency}
                  sub={report.conflicts.length === 0
                    ? 'Nenhum signo recebe valores conflitantes dentro do mesmo tipo de mapeamento'
                    : `${report.conflicts.length} signo(s) com valores conflitantes`}
                  delay={70}
                />
                <TestCard
                  name="Plausibilidade fonotática"
                  score={0}
                  sub="Não implementada nesta fase (bloco 3.5 do plano intencional)"
                  delay={140}
                  pending
                />
                <TestCard
                  name="Correlação iconográfica"
                  score={0}
                  sub="Não implementada nesta fase (bloco 4)"
                  delay={210}
                  pending
                />
              </div>
            </>
          )}

          <SectionH>Mapeamentos cadastrados</SectionH>
          {(proposal.mappings || []).length === 0 ? (
            <div style={{ padding: 18, borderRadius: 8, background: T.ochreBg, border: `1px solid ${T.ochreBd}`, color: '#7a5a18', fontSize: '0.9rem' }}>
              Esta hipótese é estrutural/nula — não propõe mapeamentos signo→valor explícitos.
              Sua avaliação científica vem de outras métricas (entropia, distribuição estatística).
            </div>
          ) : (
            <div style={{
              borderRadius: 10, overflow: 'hidden',
              background: T.bgPanel, border: `1px solid ${T.divider}`,
              boxShadow: T.shadowSm,
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${T.divider}` }}>
                    {['Signo', 'Tipo', 'Valor', 'Confiança', 'Evidência'].map(h => (
                      <th key={h} style={{
                        padding: '12px 16px', textAlign: 'left',
                        fontSize: '0.66rem', fontWeight: 700, color: T.inkMute,
                        textTransform: 'uppercase', letterSpacing: '0.12em',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(proposal.mappings || []).map((m, i) => (
                    <tr key={m.sign_id + i} className="gc-enter" style={{
                      borderBottom: `1px solid ${T.divider}`,
                      animationDelay: `${100 + i * 30}ms`,
                    }}>
                      <td className="gc-mono" style={{ padding: '12px 16px', color: scriptHue, fontSize: '1.1rem', fontWeight: 700 }}>{m.sign_id}</td>
                      <td style={{ padding: '12px 16px', color: T.inkMid, fontSize: '0.78rem' }}>{m.mapping_type}</td>
                      <td className="gc-mono" style={{ padding: '12px 16px', color: T.ink, fontWeight: 600 }}>{m.value}</td>
                      <td style={{ padding: '12px 16px' }}>
                        {m.confidence != null && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{
                              width: 56, height: 5, borderRadius: 999, background: T.bgSubtle,
                              overflow: 'hidden',
                            }}>
                              <div className="gc-fade" style={{
                                width: `${m.confidence * 100}%`, height: '100%', background: scriptHue, borderRadius: 999,
                              }} />
                            </div>
                            <span className="gc-mono" style={{ fontWeight: 600, color: T.ink, fontSize: '0.85rem' }}>
                              {Math.round((m.confidence || 0) * 100)}%
                            </span>
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px', color: T.inkMid, fontSize: '0.78rem', maxWidth: 320 }}>{m.evidence_note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {report && report.conflicts.length > 0 && (
            <>
              <SectionH>Conflitos internos detectados</SectionH>
              {report.conflicts.map((c, i) => (
                <div key={c.sign_id + c.mapping_type} className="gc-enter" style={{
                  padding: '14px 18px', marginBottom: 10, borderRadius: 10,
                  background: T.oxbloodBg, border: `1px solid ${T.oxbloodBd}`,
                  animationDelay: `${i * 60}ms`,
                }}>
                  <div className="gc-mono" style={{ fontSize: '0.95rem', color: T.ink }}>
                    <strong>{c.sign_id}</strong> recebeu valores múltiplos como <strong>{c.mapping_type}</strong>: {c.values.join(', ')}
                  </div>
                </div>
              ))}
            </>
          )}

          <div style={{ marginTop: 32, padding: 16, borderRadius: 8, background: T.bgSubtle, fontSize: '0.78rem', color: T.inkMid, lineHeight: 1.6 }}>
            <strong>nota metodológica:</strong> esta avaliação roda apenas duas métricas (cobertura ponderada por frequência e consistência interna),
            como definido no bloco 3 do plano intencional. Plausibilidade fonotática, correlação iconográfica e concordância cross-script ficam pra fases 3.5/4.
            Cobertura é computada sobre os signos catalogados na tabela <code>graphoscodex_signs</code>; consistência detecta valores conflitantes dentro do mesmo
            <code>mapping_type</code> pra um mesmo signo. Hipóteses estruturais (Rugg-style) recebem score zero por não serem avaliáveis por estas métricas.
          </div>

          {err && (
            <div style={{ marginTop: 20, padding: 14, background: '#fee', color: T.oxblood, borderRadius: 8 }}>
              erro: {err}
            </div>
          )}
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

function TestCard({ name, score, sub, delay, pending }: { name: string; score: number; sub: string; delay: number; pending?: boolean }) {
  const kind = pending ? 'pending' : score >= 0.7 ? 'ok' : score >= 0.4 ? 'warn' : 'bad'
  const color = kind === 'pending' ? T.inkMute : kind === 'ok' ? T.forest : kind === 'warn' ? T.ochre : T.oxblood
  const bg    = kind === 'pending' ? T.bgSubtle : kind === 'ok' ? T.forestBg : kind === 'warn' ? T.ochreBg : T.oxbloodBg
  const bd    = kind === 'pending' ? T.divider : kind === 'ok' ? T.forestBd : kind === 'warn' ? T.ochreBd : T.oxbloodBd
  return (
    <div className="gc-enter" style={{
      padding: 18, borderRadius: 10, background: bg, border: `1px solid ${bd}`,
      animationDelay: `${delay}ms`, opacity: pending ? 0.6 : 1,
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <div className="gc-serif" style={{ fontSize: '1rem', fontWeight: 600, color: T.ink, letterSpacing: '-0.005em' }}>{name}</div>
        <div className="gc-serif" style={{ fontSize: '1.4rem', fontWeight: 600, color }}>{pending ? '—' : Math.round(score * 100) + '%'}</div>
      </div>
      <div style={{ marginTop: 10, height: 4, background: 'rgba(28,26,22,0.06)', borderRadius: 999, overflow: 'hidden' }}>
        <div className="gc-fade" style={{ height: '100%', width: `${pending ? 0 : score * 100}%`, background: color, borderRadius: 999 }} />
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
