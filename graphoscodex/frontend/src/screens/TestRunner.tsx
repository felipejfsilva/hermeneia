import { useState } from 'react'
import { T } from '../theme'

const PROPOSALS = [
  { id: 'younger-2020',  name: 'Younger 2020 · sílabas Linear A',           script: 'Linear A', author: 'John G. Younger' },
  { id: 'cheshire-2019', name: 'Cheshire 2019 · proto-romance Voynich',     script: 'Voynich',  author: 'Gerard Cheshire' },
  { id: 'lindemann-24',  name: 'Lindemann 2024 · língua natural codificada',script: 'Voynich',  author: 'Lindemann' },
  { id: 'rugg-2003',     name: 'Rugg 2003 · hoax via grades de Cardan',     script: 'Voynich',  author: 'Gordon Rugg' },
]

const TESTS = [
  { name: 'Cobertura',                      score: 0.62, sub: '93 de 150 sinais mapeados (Linear A)',                                          kind: 'ok' as const },
  { name: 'Consistência interna',           score: 0.74, sub: 'Predições da hipótese batem com 74% das ocorrências',                          kind: 'ok' as const },
  { name: 'Plausibilidade fonotática',      score: 0.41, sub: 'Distribuição sugere família anatoliana possível, semítica improvável',         kind: 'warn' as const },
  { name: 'Correlação iconográfica',        score: 0.55, sub: '17 de 31 anotações iconográficas correlacionam com texto adjacente',           kind: 'warn' as const },
  { name: 'Concordância com Linear B',      score: 0.81, sub: '21 de 26 valores propostos coincidem com cognatos Linear B atestados',          kind: 'ok' as const },
]

const PREDICTIONS = [
  { ref: 'HT 31, linha 3',  predicted: 'ku-ro-i-pa-i',     observed: 'ku-ro-i-pa-i',       match: 1.0  },
  { ref: 'HT 38, linha 1',  predicted: 'da-ku-ru-ne',      observed: 'da-?-ru-ne',         match: 0.75 },
  { ref: 'HT 86, linha 2',  predicted: 'pa-i-to',          observed: 'pa-i-ta',            match: 0.5  },
  { ref: 'ZA 10, linha 1',  predicted: 'i-do-mi-ne',       observed: 'i-do-mi-ne',         match: 1.0  },
  { ref: 'KH 5, linha 1',   predicted: 'ku-ka-ni',         observed: 'ku-pa-ni',           match: 0.33 },
]

const CONFLICTS = [
  { hyp: 'Davis 2014', conflictsOn: 'AB02 = "oil" vs "wine"',      severity: 'high' as const },
  { hyp: 'Salgarella 2021', conflictsOn: 'AB81 fonema diverge',    severity: 'low' as const  },
]

export function TestRunner() {
  const [selected, setSelected] = useState(PROPOSALS[0].id)
  const proposal = PROPOSALS.find(p => p.id === selected)!

  return (
    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '280px 1fr', overflow: 'hidden' }}>
      {/* esquerda — selecionar proposta */}
      <aside style={{ borderRight: `1px solid ${T.border}`, padding: '14px 12px', overflowY: 'auto' }}>
        <div style={{ fontSize: '0.66rem', color: T.textMute, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginBottom: 10 }}>
          Proposta a testar
        </div>
        {PROPOSALS.map(p => (
          <button
            key={p.id}
            onClick={() => setSelected(p.id)}
            style={{
              width: '100%', textAlign: 'left', padding: '10px 12px',
              marginBottom: 6, borderRadius: 8, cursor: 'pointer',
              background: selected === p.id ? T.accentBg : 'transparent',
              border: `1px solid ${selected === p.id ? T.accentBd : T.border}`,
              color: T.text,
            }}
          >
            <div style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: 3 }}>{p.name}</div>
            <div style={{ fontSize: '0.7rem', color: T.textMute }}>{p.script} · {p.author}</div>
          </button>
        ))}
      </aside>

      {/* direita — relatório */}
      <section style={{ overflowY: 'auto', padding: '24px 32px' }}>
        <div style={{ fontSize: '0.72rem', color: T.textMute, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: 6 }}>
          Relatório · {proposal.script}
        </div>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.01em' }}>{proposal.name}</h1>
        <div style={{ marginTop: 6, fontSize: '0.85rem', color: T.textMid }}>
          {proposal.author} · provisional · gerado agora
        </div>

        {/* veredito */}
        <div style={{
          marginTop: 24, padding: 20, borderRadius: 12,
          background: T.accentBg, border: `1px solid ${T.accentBd}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
            <div>
              <div style={{ fontSize: '0.7rem', color: T.accent, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                Score multimodal global
              </div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: T.text, lineHeight: 1, marginTop: 6 }}>
                0.63
              </div>
              <div style={{ fontSize: '0.8rem', color: T.textMid, marginTop: 4 }}>
                Cobertura razoável, consistência interna alta, plausibilidade fonotática mediana.
                Concordância com Linear B reforça hipótese parcial.
              </div>
            </div>
          </div>
        </div>

        {/* testes individuais */}
        <SectionLabel>Testes</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
          {TESTS.map(t => (
            <TestCard key={t.name} {...t} />
          ))}
        </div>

        {/* predições */}
        <SectionLabel>Predições e observação</SectionLabel>
        <div style={{ background: T.bgPanel, border: `1px solid ${T.border}`, borderRadius: 10, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${T.border}` }}>
                {['Inscrição', 'Predição', 'Observado', 'Match'].map(h => (
                  <th key={h} style={{
                    padding: '10px 14px', textAlign: 'left',
                    fontSize: '0.66rem', fontWeight: 700, color: T.textMute,
                    textTransform: 'uppercase', letterSpacing: '0.08em',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PREDICTIONS.map(p => {
                const color = p.match >= 0.75 ? T.ok : p.match >= 0.5 ? T.warn : T.bad
                return (
                  <tr key={p.ref} style={{ borderBottom: `1px solid ${T.border}` }}>
                    <td style={{ padding: '10px 14px', color: T.accent, fontFamily: 'ui-monospace, monospace' }}>{p.ref}</td>
                    <td style={{ padding: '10px 14px', fontFamily: 'ui-monospace, monospace', color: T.textMid }}>{p.predicted}</td>
                    <td style={{ padding: '10px 14px', fontFamily: 'ui-monospace, monospace', color: T.textMid }}>{p.observed}</td>
                    <td style={{ padding: '10px 14px', fontWeight: 700, color }}>{Math.round(p.match * 100)}%</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* conflitos */}
        <SectionLabel>Conflitos com hipóteses adjacentes</SectionLabel>
        <div>
          {CONFLICTS.map(c => (
            <div key={c.hyp} style={{
              padding: '10px 14px', marginBottom: 8, borderRadius: 8,
              background: c.severity === 'high' ? T.badBg : T.warnBg,
              border: `1px solid ${c.severity === 'high' ? T.badBd : T.warnBd}`,
            }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                <span style={{ color: T.accent }}>{c.hyp}</span>
                <span style={{ color: T.textMid }}> — {c.conflictsOn}</span>
              </div>
              <div style={{ marginTop: 4, fontSize: '0.7rem', color: T.textMute, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                severidade {c.severity}
              </div>
            </div>
          ))}
        </div>

        {/* ações */}
        <div style={{ marginTop: 24, display: 'flex', gap: 10 }}>
          <button style={btnPrimary}>Baixar laudo PDF</button>
          <button style={btnGhost}>Comparar com outras →</button>
          <button style={btnGhost}>Re-rodar testes</button>
        </div>
      </section>
    </div>
  )
}

function TestCard({ name, score, sub, kind }: { name: string; score: number; sub: string; kind: 'ok' | 'warn' | 'bad' }) {
  const color = kind === 'ok' ? T.ok : kind === 'warn' ? T.warn : T.bad
  const bg    = kind === 'ok' ? T.okBg : kind === 'warn' ? T.warnBg : T.badBg
  const bd    = kind === 'ok' ? T.okBd : kind === 'warn' ? T.warnBd : T.badBd
  return (
    <div style={{ padding: 14, borderRadius: 10, background: bg, border: `1px solid ${bd}` }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <div style={{ fontSize: '0.78rem', fontWeight: 700 }}>{name}</div>
        <div style={{ fontSize: '1.1rem', fontWeight: 800, color }}>{Math.round(score * 100)}%</div>
      </div>
      {/* barra */}
      <div style={{ marginTop: 8, height: 4, background: T.bg, borderRadius: 999, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${score * 100}%`, background: color, borderRadius: 999 }} />
      </div>
      <div style={{ marginTop: 8, fontSize: '0.72rem', color: T.textMid, lineHeight: 1.5 }}>{sub}</div>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: '0.66rem', color: T.textMute, textTransform: 'uppercase',
      letterSpacing: '0.1em', fontWeight: 700, margin: '24px 0 10px',
    }}>{children}</div>
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
