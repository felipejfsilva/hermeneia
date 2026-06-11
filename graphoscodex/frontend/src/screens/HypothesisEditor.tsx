import { useState } from 'react'
import { T } from '../theme'

type Mapping = { id: number; sign: string; type: string; value: string; confidence: number }

const INITIAL: Mapping[] = [
  { id: 1, sign: 'AB80', type: 'fonema',   value: '/ku/',         confidence: 0.70 },
  { id: 2, sign: 'AB81', type: 'fonema',   value: '/ro/',         confidence: 0.60 },
  { id: 3, sign: 'AB02', type: 'semântico', value: 'óleo (rosin)', confidence: 0.40 },
  { id: 4, sign: 'AB28', type: 'fonema',   value: '/i/',          confidence: 0.85 },
]

export function HypothesisEditor() {
  const [script, setScript] = useState<'linear_a' | 'voynich'>('linear_a')
  const [mappings, setMappings] = useState<Mapping[]>(INITIAL)
  const scriptHue = T.script[script].hue

  function addRow() {
    setMappings([...mappings, { id: Date.now(), sign: '', type: 'fonema', value: '', confidence: 0.5 }])
  }
  function update(id: number, key: keyof Mapping, val: any) {
    setMappings(mappings.map(m => m.id === id ? { ...m, [key]: val } : m))
  }
  function remove(id: number) {
    setMappings(mappings.filter(m => m.id !== id))
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: T.bg }}>
      <div style={{
        maxWidth: 1080, margin: '0 auto',
        padding: '36px 28px 60px',
        display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 280px', gap: 36,
      }}>
        {/* centro — compor */}
        <div className="gc-enter">
          <div style={{
            fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.14em',
            color: T.inkMute, fontWeight: 600, marginBottom: 6,
          }}>Compor uma hipótese</div>

          <h1 className="gc-serif" style={{
            margin: 0, fontSize: '2.4rem', fontWeight: 600,
            letterSpacing: '-0.015em', color: T.ink, lineHeight: 1.1,
          }}>
            Toda hipótese é uma <span style={{ fontStyle: 'italic' }}>entidade citável</span>.
          </h1>
          <p className="gc-serif gc-italic" style={{
            marginTop: 14, marginBottom: 28, fontSize: '1.05rem',
            color: T.inkMid, lineHeight: 1.55, maxWidth: 620,
          }}>
            Atribuída a você, testável contra o corpus inteiro, comparável com Cheshire,
            Pelling, Younger, Ventris-era. Quanto mais específica, mais útil.
          </p>

          {/* título da hipótese — input grande */}
          <input
            placeholder="Título da hipótese (ex.: Linear A com paralelo anatoliano)"
            className="gc-serif"
            style={{
              width: '100%', padding: '10px 0',
              border: 'none', borderBottom: `1px solid ${T.divider}`,
              background: 'transparent', color: T.ink,
              fontSize: '1.4rem', fontWeight: 500, letterSpacing: '-0.01em',
              outline: 'none', marginBottom: 26,
            }}
          />

          {/* metadados em linha */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18,
            marginBottom: 28,
          }}>
            <Field label="Script">
              <select value={script} onChange={e => setScript(e.target.value as any)} style={inputStyle}>
                <option value="linear_a">Linear A</option>
                <option value="voynich">Voynich</option>
              </select>
            </Field>
            <Field label="Tipo">
              <select style={inputStyle}>
                <option>Fonética</option>
                <option>Semântica</option>
                <option>Estrutural</option>
                <option>Cifra</option>
                <option>Mista</option>
              </select>
            </Field>
            <Field label="Status">
              <select style={inputStyle}>
                <option>Ativa</option>
                <option>Parcial</option>
                <option>Dormente</option>
              </select>
            </Field>
          </div>

          {/* resumo */}
          <Field label="Resumo — duas ou três frases">
            <textarea
              rows={3}
              placeholder="A tese central da hipótese, em prosa. Evite jargão. Imagine que vai ler uma pesquisadora de outro campo daqui a 50 anos."
              style={{ ...inputStyle, fontFamily: T.fontSerif, fontSize: '1rem', lineHeight: 1.6, resize: 'vertical' }}
            />
          </Field>

          <Field label="Evidência">
            <textarea
              rows={4}
              placeholder="Cite passagens, paralelos linguísticos, evidência paleográfica, estatísticas internas."
              style={{ ...inputStyle, fontFamily: T.fontSerif, fontSize: '1rem', lineHeight: 1.6, resize: 'vertical' }}
            />
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
            <Field label="Citação (paper, livro)">
              <input placeholder='ex.: "Younger 2020"' style={inputStyle} />
            </Field>
            <Field label="URL externa (opcional)">
              <input placeholder='https://...' style={inputStyle} />
            </Field>
          </div>

          {/* mapeamentos */}
          <div style={{
            paddingTop: 24, borderTop: `1px solid ${T.divider}`,
            display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
          }}>
            <div>
              <h2 className="gc-serif" style={{ margin: 0, fontSize: '1.4rem', fontWeight: 600, letterSpacing: '-0.01em' }}>
                Mapeamentos
              </h2>
              <div className="gc-serif gc-italic" style={{
                marginTop: 4, fontSize: '0.95rem', color: T.inkMid,
              }}>
                Cada linha é uma predição testável.
              </div>
            </div>
            <button onClick={addRow} style={btnGhost}>+ linha</button>
          </div>

          <div style={{
            marginTop: 16, borderRadius: 10, overflow: 'hidden',
            background: T.bgPanel, border: `1px solid ${T.divider}`,
            boxShadow: T.shadowSm,
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${T.divider}` }}>
                  {['Signo', 'Tipo', 'Valor proposto', 'Confiança', ''].map((h, i) => (
                    <th key={h} style={{
                      padding: '12px 14px', textAlign: 'left',
                      fontSize: '0.66rem', fontWeight: 700, color: T.inkMute,
                      textTransform: 'uppercase', letterSpacing: '0.12em',
                      width: i === 4 ? 32 : undefined,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mappings.map((m, idx) => (
                  <tr key={m.id} className="gc-enter" style={{
                    borderBottom: `1px solid ${T.divider}`,
                    animationDelay: `${idx * 40}ms`,
                  }}>
                    <td style={{ padding: '8px 14px' }}>
                      <input value={m.sign} onChange={e => update(m.id, 'sign', e.target.value)}
                        className="gc-mono"
                        style={{ ...rowInput, fontWeight: 600, color: scriptHue }} />
                    </td>
                    <td style={{ padding: '8px 14px' }}>
                      <select value={m.type} onChange={e => update(m.id, 'type', e.target.value)} style={rowInput}>
                        <option>fonema</option>
                        <option>semântico</option>
                        <option>morfema</option>
                        <option>nome</option>
                        <option>número</option>
                      </select>
                    </td>
                    <td style={{ padding: '8px 14px' }}>
                      <input value={m.value} onChange={e => update(m.id, 'value', e.target.value)}
                        className="gc-serif" style={{ ...rowInput, fontStyle: 'italic' }} />
                    </td>
                    <td style={{ padding: '8px 14px', width: 110 }}>
                      <ConfBar value={m.confidence} hue={scriptHue}
                        onChange={v => update(m.id, 'confidence', v)} />
                    </td>
                    <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                      <button onClick={() => remove(m.id)} style={btnRemove}>×</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ações */}
          <div style={{ marginTop: 28, display: 'flex', gap: 12 }}>
            <button style={btnPrimary}>Salvar rascunho</button>
            <button style={btnGhost}>Rodar testes →</button>
            <button style={btnGhost}>Publicar com DOI</button>
          </div>
        </div>

        {/* direita — provenance + dicas */}
        <aside className="gc-enter" style={{ animationDelay: '120ms' }}>
          <Card>
            <div style={{
              fontSize: '0.66rem', textTransform: 'uppercase', letterSpacing: '0.14em',
              color: T.inkMute, fontWeight: 600, marginBottom: 10,
            }}>Provenance</div>
            <p className="gc-serif" style={{
              margin: 0, fontSize: '0.95rem', color: T.inkMid, lineHeight: 1.6,
            }}>
              Toda hipótese carrega <strong style={{ color: T.ink, fontWeight: 600 }}>autor, data, evidência</strong>.
              Publicar gera ID permanente citável. Não é opinião do modelo —
              é seu trabalho, atribuído a você, comparável com toda a tradição.
            </p>
          </Card>

          <Card style={{ marginTop: 16 }}>
            <div style={{
              fontSize: '0.66rem', textTransform: 'uppercase', letterSpacing: '0.14em',
              color: T.inkMute, fontWeight: 600, marginBottom: 12,
            }}>Diagnóstico em tempo real</div>

            <Diag label="Cobertura prevista"  value="62%" sub={`${mappings.length} sinais de ~150`} kind="ok" />
            <Diag label="Conflito com cadastradas" value="2"    sub="Younger 2020 · Davis 2014"    kind="warn" />
            <Diag label="Predições novas"          value="14"   sub="ainda não testadas pelo campo" kind="ok" />
          </Card>
        </aside>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{
        display: 'block', marginBottom: 6, fontSize: '0.66rem',
        color: T.inkMute, fontWeight: 700,
        textTransform: 'uppercase', letterSpacing: '0.12em',
      }}>{label}</label>
      {children}
    </div>
  )
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      padding: 20, borderRadius: 10,
      background: T.bgPanel, border: `1px solid ${T.divider}`,
      boxShadow: T.shadowSm,
      ...style,
    }}>{children}</div>
  )
}

function Diag({ label, value, sub, kind }: { label: string; value: string; sub: string; kind: 'ok' | 'warn' | 'bad' }) {
  const color = kind === 'ok' ? T.forest : kind === 'warn' ? T.ochre : T.oxblood
  return (
    <div style={{
      padding: '10px 0', borderTop: `1px solid ${T.divider}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <div style={{ fontSize: '0.78rem', color: T.inkMid, fontWeight: 500 }}>{label}</div>
        <div className="gc-serif" style={{ fontSize: '1.25rem', fontWeight: 600, color }}>{value}</div>
      </div>
      <div style={{ marginTop: 2, fontSize: '0.72rem', color: T.inkMute }}>{sub}</div>
    </div>
  )
}

function ConfBar({ value, hue, onChange }: { value: number; hue: string; onChange: (v: number) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{
        flex: 1, height: 6, borderRadius: 999,
        background: T.bgSubtle, position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0, width: `${value * 100}%`,
          background: hue, borderRadius: 999,
          transition: `width ${T.med} ${T.easeOut}`,
        }} />
      </div>
      <input
        type="number" min={0} max={1} step={0.05} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="gc-mono"
        style={{
          width: 50, padding: '4px 6px', borderRadius: 6,
          background: T.bg, border: `1px solid ${T.divider}`,
          color: T.ink, fontSize: '0.78rem', textAlign: 'right',
        }}
      />
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px', borderRadius: 8,
  background: T.bgPanel, border: `1px solid ${T.divider}`,
  color: T.ink, fontSize: '0.92rem',
  fontFamily: T.fontSans, boxSizing: 'border-box',
  transition: `border-color ${T.fast} ${T.ease}`,
}
const rowInput: React.CSSProperties = {
  width: '100%', padding: '5px 8px', borderRadius: 6,
  background: 'transparent', border: `1px solid transparent`,
  color: T.ink, fontSize: '0.88rem',
  fontFamily: T.fontSans,
}
const btnPrimary: React.CSSProperties = {
  padding: '10px 22px', borderRadius: 999,
  background: T.ink, border: `1px solid ${T.ink}`,
  color: T.bg, fontSize: '0.84rem', fontWeight: 600,
  transition: `transform ${T.fast} ${T.ease}, box-shadow ${T.fast} ${T.ease}`,
}
const btnGhost: React.CSSProperties = {
  padding: '10px 20px', borderRadius: 999,
  background: 'transparent', border: `1px solid ${T.dividerStrong}`,
  color: T.ink, fontSize: '0.82rem', fontWeight: 600,
  transition: `border-color ${T.fast} ${T.ease}, background ${T.fast} ${T.ease}`,
}
const btnRemove: React.CSSProperties = {
  width: 26, height: 26, borderRadius: 6,
  background: 'transparent', border: `1px solid ${T.divider}`,
  color: T.inkMute, fontSize: '1rem', lineHeight: 1, cursor: 'pointer',
  transition: `color ${T.fast} ${T.ease}, border-color ${T.fast} ${T.ease}`,
}
