import { useState } from 'react'
import { T } from '../theme'

const ALL = [
  { id: 'cheshire',  name: 'Cheshire',  year: 2019, hue: T.script.voynich.hue, init: 'GC' },
  { id: 'pelling',   name: 'Pelling',   year: 2022, hue: T.forest,             init: 'NP' },
  { id: 'rugg',      name: 'Rugg',      year: 2003, hue: T.oxblood,            init: 'GR' },
  { id: 'lindemann', name: 'Lindemann', year: 2024, hue: T.navy,               init: 'KL' },
  { id: 'tucker',    name: 'Tucker',    year: 2018, hue: T.ochre,              init: 'AT' },
]

type Row = { sign: string; cheshire?: string; pelling?: string; rugg?: string; lindemann?: string; tucker?: string }

const GRID: Row[] = [
  { sign: 'EVA-o',     cheshire: 'o (latin)',  pelling: '/ko/',      rugg: '?',     lindemann: '/o/',   tucker: 'cipher' },
  { sign: 'EVA-t',     cheshire: 't (latin)',  pelling: '/te/',      rugg: '?',     lindemann: '/t/',   tucker: 'cipher' },
  { sign: 'EVA-y',     cheshire: 'i/y',        pelling: 'word-final',rugg: 'filler',lindemann: '/i/',   tucker: 'cipher' },
  { sign: 'EVA-daiin', cheshire: 'palavra',    pelling: 'sub. comum',rugg: 'ruído', lindemann: '"and"', tucker: 'cipher run' },
  { sign: 'EVA-qo',    cheshire: 'qu (latin)', pelling: '/kʷo/',     rugg: '?',     lindemann: '/qo/',  tucker: 'cipher' },
  { sign: 'EVA-cheey', cheshire: 'ciclo',      pelling: 'stem nominal',rugg: 'ruído', lindemann: 'planta',tucker: 'cipher' },
]

export function ComparisonView() {
  const [selected, setSelected] = useState<string[]>(['cheshire', 'pelling', 'lindemann'])
  const [hoverRow, setHoverRow] = useState<number | null>(null)

  function toggle(id: string) {
    setSelected(
      selected.includes(id)
        ? selected.filter(x => x !== id)
        : selected.length < 4 ? [...selected, id] : selected
    )
  }
  const active = ALL.filter(p => selected.includes(p.id))

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: T.bg }}>
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '36px 28px 60px' }}>

        {/* topo — intro */}
        <div className="gc-enter">
          <div style={{
            fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.14em',
            color: T.inkMute, fontWeight: 600, marginBottom: 6,
          }}>Comparar hipóteses · Voynich</div>
          <h1 className="gc-serif" style={{
            margin: 0, fontSize: '2.2rem', fontWeight: 600, letterSpacing: '-0.015em',
            color: T.ink, lineHeight: 1.15,
          }}>
            Onde os <span style={{ fontStyle: 'italic' }}>decifradores</span> concordam,
            onde divergem.
          </h1>
          <p className="gc-serif gc-italic" style={{
            marginTop: 12, marginBottom: 0, fontSize: '1.05rem',
            color: T.inkMid, lineHeight: 1.55, maxWidth: 720,
          }}>
            Selecione duas a quatro propostas. O grid abaixo mostra como cada uma trata cada signo —
            onde calam, onde falam, e onde uma predição cruzada nasce.
          </p>
        </div>

        {/* picker — chips */}
        <div className="gc-enter" style={{
          marginTop: 24, display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center',
        }}>
          {ALL.map((p, i) => {
            const on = selected.includes(p.id)
            return (
              <button
                key={p.id}
                onClick={() => toggle(p.id)}
                className="gc-enter"
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '7px 14px 7px 8px', borderRadius: 999,
                  background: on ? T.bgPanel : 'transparent',
                  border: `1px solid ${on ? p.hue : T.divider}`,
                  cursor: 'pointer',
                  boxShadow: on ? T.shadowSm : 'none',
                  transform: 'translateY(0)',
                  transition: `transform ${T.fast} ${T.ease}, box-shadow ${T.fast} ${T.ease}, border-color ${T.fast} ${T.ease}`,
                  animationDelay: `${i * 60}ms`,
                }}
                onMouseEnter={e => {
                  if (!on) e.currentTarget.style.borderColor = T.dividerStrong
                }}
                onMouseLeave={e => {
                  if (!on) e.currentTarget.style.borderColor = T.divider
                }}
              >
                <span style={{
                  width: 22, height: 22, borderRadius: '50%',
                  background: on ? p.hue : T.bgSubtle,
                  color: on ? T.bg : T.inkMute,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.04em',
                  fontFamily: T.fontSans,
                }}>{p.init}</span>
                <span className="gc-serif" style={{
                  fontSize: '0.92rem', fontWeight: 600,
                  color: on ? T.ink : T.inkMid,
                }}>{p.name}</span>
                <span style={{
                  fontSize: '0.72rem', color: T.inkMute, fontFamily: T.fontSans,
                }}>{p.year}</span>
              </button>
            )
          })}
        </div>

        {/* métricas */}
        <div className="gc-enter" style={{
          marginTop: 28, padding: '18px 24px', borderRadius: 12,
          background: T.bgPanel, border: `1px solid ${T.divider}`,
          boxShadow: T.shadowSm,
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 24,
          animationDelay: '120ms',
        }}>
          <Metric label="Sinais comparados"    value={String(GRID.length)} />
          <Metric label="Concordância total"   value="1"  sub="EVA-o → /o/-like" kind="ok" />
          <Metric label="Discordância forte"   value="3"  sub="Rugg vs Lindemann em 3/6" kind="warn" />
          <Metric label="Só uma silencia"      value="2"  sub="Rugg em EVA-cheey, EVA-qo" />
        </div>

        {/* grid de comparação */}
        <div className="gc-enter" style={{
          marginTop: 24, borderRadius: 12, overflow: 'hidden',
          background: T.bgPanel, border: `1px solid ${T.divider}`,
          boxShadow: T.shadowSm, animationDelay: '180ms',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.92rem' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${T.divider}`, background: T.bgSubtle }}>
                <th style={thStyle}>Signo</th>
                {active.map(p => (
                  <th key={p.id} style={thStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{
                        width: 8, height: 8, borderRadius: '50%', background: p.hue,
                      }} />
                      <span style={{ color: p.hue }}>{p.name}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {GRID.map((row, i) => {
                const hovered = hoverRow === i
                return (
                  <tr
                    key={row.sign}
                    onMouseEnter={() => setHoverRow(i)}
                    onMouseLeave={() => setHoverRow(null)}
                    style={{
                      borderBottom: `1px solid ${T.divider}`,
                      background: hovered ? T.bgSubtle : 'transparent',
                      transition: `background ${T.fast} ${T.ease}`,
                    }}
                  >
                    <td className="gc-mono" style={{
                      padding: '14px 18px', color: T.ink, fontWeight: 600,
                      fontSize: '0.88rem',
                      borderRight: `1px solid ${T.divider}`,
                    }}>{row.sign}</td>
                    {active.map(p => {
                      const v = (row as any)[p.id]
                      const missing = !v || v === '?'
                      return (
                        <td key={p.id} style={{
                          padding: '14px 18px',
                          color: missing ? T.inkFaint : T.inkMid,
                          fontStyle: missing ? 'italic' : 'normal',
                          fontFamily: missing ? T.fontSerif : T.fontSans,
                          transition: `color ${T.fast} ${T.ease}`,
                        }}>{v ?? '—'}</td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* insight */}
        <div className="gc-enter" style={{
          marginTop: 28, padding: '24px 28px', borderRadius: 12,
          background: T.bgPanel, border: `1px solid ${T.divider}`,
          boxShadow: T.shadowSm, animationDelay: '260ms',
        }}>
          <div style={{
            fontSize: '0.66rem', textTransform: 'uppercase', letterSpacing: '0.14em',
            color: T.inkMute, fontWeight: 600, marginBottom: 10,
          }}>Insight gerado</div>
          <p className="gc-serif" style={{
            margin: 0, fontSize: '1.05rem', color: T.ink, lineHeight: 1.65, fontWeight: 400,
          }}>
            As três propostas convergem em uma leitura vocálica de{' '}
            <code style={mono}>EVA-o</code> (Cheshire <em>"o latin"</em>, Pelling <em>"/ko/"</em>,
            Lindemann <em>"/o/"</em>) e divergem em{' '}
            <code style={mono}>EVA-daiin</code>, onde Cheshire trata como palavra inteira,
            Pelling como substantivo comum, e Lindemann propõe valor semântico (<em>"and"</em>).
          </p>
          <div style={{
            marginTop: 16, padding: '12px 16px', borderRadius: 8,
            background: T.oxbloodBg, border: `1px solid ${T.oxbloodBd}`,
          }}>
            <div style={{
              fontSize: '0.66rem', textTransform: 'uppercase', letterSpacing: '0.14em',
              color: T.oxblood, fontWeight: 700, marginBottom: 6,
            }}>Predição testável nova</div>
            <p className="gc-serif" style={{ margin: 0, fontSize: '0.95rem', color: T.ink, lineHeight: 1.55 }}>
              Se Lindemann estiver certo, <code style={mono}>EVA-daiin</code> deve aparecer
              <em> ligando substantivos </em> no fólio f86r. Verificação ainda pendente —
              é o tipo de teste que ninguém tinha articulado antes.
            </p>
          </div>
        </div>

        {/* ações */}
        <div style={{ marginTop: 28, display: 'flex', gap: 12 }}>
          <button style={btnPrimary}>Exportar comparação PDF</button>
          <button style={btnGhost}>Gerar predições novas</button>
          <button style={btnGhost}>Compartilhar link permanente</button>
        </div>
      </div>
    </div>
  )
}

function Metric({ label, value, sub, kind }: { label: string; value: string; sub?: string; kind?: 'ok' | 'warn' | 'bad' }) {
  const color = kind === 'ok' ? T.forest : kind === 'warn' ? T.ochre : kind === 'bad' ? T.oxblood : T.ink
  return (
    <div>
      <div style={{
        fontSize: '0.66rem', textTransform: 'uppercase', letterSpacing: '0.14em',
        color: T.inkMute, fontWeight: 700, marginBottom: 6,
      }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <span className="gc-serif" style={{ fontSize: '1.75rem', fontWeight: 600, color, letterSpacing: '-0.01em' }}>{value}</span>
        {sub && <span style={{ fontSize: '0.75rem', color: T.inkMute }}>{sub}</span>}
      </div>
    </div>
  )
}

const thStyle: React.CSSProperties = {
  padding: '14px 18px', textAlign: 'left',
  fontSize: '0.66rem', fontWeight: 700, color: T.inkMute,
  textTransform: 'uppercase', letterSpacing: '0.12em',
}

const mono: React.CSSProperties = {
  fontFamily: T.fontMono, fontSize: '0.88em',
  padding: '1px 6px', background: T.bgSubtle,
  border: `1px solid ${T.divider}`, borderRadius: 4,
  color: T.ink,
}

const btnPrimary: React.CSSProperties = {
  padding: '12px 24px', borderRadius: 999,
  background: T.ink, border: `1px solid ${T.ink}`,
  color: T.bg, fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
}
const btnGhost: React.CSSProperties = {
  padding: '12px 22px', borderRadius: 999,
  background: 'transparent', border: `1px solid ${T.dividerStrong}`,
  color: T.ink, fontSize: '0.83rem', fontWeight: 600, cursor: 'pointer',
}
