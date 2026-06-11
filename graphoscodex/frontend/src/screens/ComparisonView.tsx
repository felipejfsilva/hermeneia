import { useState } from 'react'
import { T } from '../theme'

const ALL_PROPOSALS = [
  { id: 'cheshire-19',   name: 'Cheshire 2019',  short: 'Cheshire', year: 1919, color: '#f59e0b' },
  { id: 'pelling-22',    name: 'Pelling 2022',   short: 'Pelling',  year: 2022, color: '#22c55e' },
  { id: 'rugg-03',       name: 'Rugg 2003',      short: 'Rugg',     year: 2003, color: '#ef4444' },
  { id: 'lindemann-24',  name: 'Lindemann 2024', short: 'Lindemann',year: 2024, color: '#a855f7' },
  { id: 'tucker-18',     name: 'Tucker 2018',    short: 'Tucker',   year: 2018, color: '#06b6d4' },
]

// Mock: signos de Voynich e o que cada hipótese diz sobre eles
const SIGN_GRID = [
  { sign: 'EVA-o',      cheshire: 'o (latin)',    pelling: '/ko/',      rugg: '?',        lindemann: '/o/',    tucker: 'cipher' },
  { sign: 'EVA-t',      cheshire: 't (latin)',    pelling: '/te/',      rugg: '?',        lindemann: '/t/',    tucker: 'cipher' },
  { sign: 'EVA-y',      cheshire: 'i/y',          pelling: 'word-final',rug: 'filler',    lindemann: '/i/',    tucker: 'cipher' },
  { sign: 'EVA-daiin',  cheshire: 'word',         pelling: 'common N',  rugg: 'noise',    lindemann: '"and"',  tucker: 'cipher run' },
  { sign: 'EVA-qo',     cheshire: 'qu (latin)',   pelling: '/kʷo/',     rugg: '?',        lindemann: '/qo/',   tucker: 'cipher' },
  { sign: 'EVA-cheey',  cheshire: 'cycle',        pelling: 'noun stem', rugg: 'noise',    lindemann: 'plant',  tucker: 'cipher' },
]

export function ComparisonView() {
  const [selected, setSelected] = useState<string[]>(['cheshire-19', 'pelling-22', 'lindemann-24'])

  function toggle(id: string) {
    setSelected(selected.includes(id)
      ? selected.filter(x => x !== id)
      : selected.length < 4 ? [...selected, id] : selected)
  }

  const active = ALL_PROPOSALS.filter(p => selected.includes(p.id))

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* topo — picker */}
      <div style={{ padding: '18px 28px', borderBottom: `1px solid ${T.border}` }}>
        <div style={{ fontSize: '0.72rem', color: T.textMute, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: 4 }}>
          Comparar propostas · Voynich
        </div>
        <div style={{ marginBottom: 12, fontSize: '0.82rem', color: T.textMid }}>
          Selecione 2 a 4 hipóteses. O grid abaixo mostra como cada uma trata cada signo —
          onde concordam, onde divergem, onde uma cala e a outra fala.
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {ALL_PROPOSALS.map(p => {
            const on = selected.includes(p.id)
            return (
              <button
                key={p.id}
                onClick={() => toggle(p.id)}
                style={{
                  padding: '6px 12px', borderRadius: 999, cursor: 'pointer',
                  background: on ? p.color + '22' : T.bgPanel,
                  border: `1px solid ${on ? p.color : T.border}`,
                  color: on ? p.color : T.textMid,
                  fontSize: '0.78rem', fontWeight: 600,
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                {on && <span style={{ width: 6, height: 6, borderRadius: 999, background: p.color }} />}
                {p.name}
              </button>
            )
          })}
        </div>
      </div>

      {/* sumário de concordância */}
      <div style={{ padding: '14px 28px', borderBottom: `1px solid ${T.border}`, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
        <Metric label="Sinais comparados" value={String(SIGN_GRID.length)} />
        <Metric label="Concordância total" value="1" sub={`em ${SIGN_GRID.length} (EVA-o → /o/-like)`} />
        <Metric label="Discordância forte"  value="3" sub="Rugg vs Lindemann em 3/6" kind="warn" />
        <Metric label="Onde só uma cala"    value="2" sub="Rugg silencia em EVA-cheey e EVA-qo" />
      </div>

      {/* grid de comparação */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px' }}>
        <div style={{ background: T.bgPanel, border: `1px solid ${T.border}`, borderRadius: 10, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${T.border}`, background: T.bg }}>
                <th style={thStyle}>Signo</th>
                {active.map(p => (
                  <th key={p.id} style={{ ...thStyle, color: p.color }}>{p.short}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SIGN_GRID.map(row => (
                <tr key={row.sign} style={{ borderBottom: `1px solid ${T.border}` }}>
                  <td style={{ padding: '12px 14px', fontFamily: 'ui-monospace, monospace', color: T.accent, fontWeight: 600 }}>{row.sign}</td>
                  {active.map(p => {
                    const v = (row as any)[p.id.split('-')[0]] ?? '—'
                    return (
                      <td key={p.id} style={{ padding: '12px 14px', color: v === '?' ? T.textFaint : T.textMid }}>
                        {v}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* insight gerado */}
        <div style={{
          marginTop: 20, padding: 16, borderRadius: 10,
          background: T.accentBg, border: `1px solid ${T.accentBd}`,
        }}>
          <div style={{ fontSize: '0.7rem', color: T.accent, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: 6 }}>
            Insight automático
          </div>
          <div style={{ fontSize: '0.85rem', color: T.textMid, lineHeight: 1.6 }}>
            As três propostas convergem em uma leitura vocálica de <code style={mono}>EVA-o</code>
            (Cheshire "o latin", Pelling "/ko/", Lindemann "/o/") e divergem em
            <code style={mono}>EVA-daiin</code>, onde Cheshire trata como palavra inteira,
            Pelling como substantivo comum, e Lindemann propõe valor semântico ("and").
            <strong style={{ color: T.text }}> Predição testável:</strong> se Lindemann estiver
            certo, <code style={mono}>EVA-daiin</code> deve aparecer ligando substantivos no
            fólio f86r. Verificação está pendente.
          </div>
        </div>

        {/* ações */}
        <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
          <button style={btnPrimary}>Exportar comparação PDF</button>
          <button style={btnGhost}>Gerar predições testáveis novas</button>
          <button style={btnGhost}>Compartilhar link permanente</button>
        </div>
      </div>
    </div>
  )
}

const thStyle: React.CSSProperties = {
  padding: '12px 14px', textAlign: 'left',
  fontSize: '0.68rem', fontWeight: 700, color: T.textMute,
  textTransform: 'uppercase', letterSpacing: '0.08em',
}
const mono: React.CSSProperties = {
  fontFamily: 'ui-monospace, monospace', fontSize: '0.85em',
  padding: '1px 5px', background: T.bgPanel,
  border: `1px solid ${T.border}`, borderRadius: 4, margin: '0 2px',
}

function Metric({ label, value, sub, kind }: { label: string; value: string; sub?: string; kind?: 'ok' | 'warn' | 'bad' }) {
  const color = kind === 'warn' ? T.warn : kind === 'bad' ? T.bad : T.accent
  return (
    <div style={{ padding: 10, borderRadius: 8, background: T.bgPanel, border: `1px solid ${T.border}` }}>
      <div style={{ fontSize: '0.65rem', color: T.textMute, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>{label}</div>
      <div style={{ marginTop: 4, display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{ fontSize: '1.4rem', fontWeight: 800, color }}>{value}</span>
        {sub && <span style={{ fontSize: '0.7rem', color: T.textMute }}>{sub}</span>}
      </div>
    </div>
  )
}

const btnPrimary: React.CSSProperties = {
  padding: '10px 20px', borderRadius: 8, background: T.gradient,
  border: 'none', color: '#fff', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
}
const btnGhost: React.CSSProperties = {
  padding: '10px 18px', borderRadius: 8, background: T.accentBg,
  border: `1px solid ${T.accentBd}`, color: T.accent,
  fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
}
