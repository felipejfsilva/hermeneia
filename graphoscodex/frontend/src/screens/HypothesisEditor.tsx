import { useState } from 'react'
import { T } from '../theme'

type Mapping = { id: number; sign: string; type: string; value: string; confidence: number }

const INITIAL: Mapping[] = [
  { id: 1, sign: 'AB80',  type: 'phoneme',  value: '/ku/',         confidence: 0.7 },
  { id: 2, sign: 'AB81',  type: 'phoneme',  value: '/ro/',         confidence: 0.6 },
  { id: 3, sign: 'AB02',  type: 'semantic', value: 'oil (rosin)',  confidence: 0.4 },
  { id: 4, sign: 'AB28',  type: 'phoneme',  value: '/i/',          confidence: 0.85 },
]

export function HypothesisEditor() {
  const [script, setScript] = useState('linear_a')
  const [type, setType] = useState('phonetic')
  const [mappings, setMappings] = useState<Mapping[]>(INITIAL)

  function addRow() {
    setMappings([...mappings, { id: Date.now(), sign: '', type: 'phoneme', value: '', confidence: 0.5 }])
  }
  function update(id: number, key: keyof Mapping, val: any) {
    setMappings(mappings.map(m => m.id === id ? { ...m, [key]: val } : m))
  }
  function remove(id: number) {
    setMappings(mappings.filter(m => m.id !== id))
  }

  return (
    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 360px', overflow: 'hidden' }}>
      {/* CENTRO — formulário + mapeamentos */}
      <section style={{ overflowY: 'auto', padding: '24px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 4 }}>
          <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
            Registrar hipótese
          </h1>
          <span style={{ fontSize: '0.72rem', color: T.textMute }}>· rascunho não publicado</span>
        </div>
        <p style={{ marginTop: 6, marginBottom: 24, fontSize: '0.82rem', color: T.textMid, maxWidth: 640 }}>
          Sua hipótese é uma entidade citável, atribuída a você, testável contra o corpus inteiro.
          Quanto mais específica (signo → valor + escopo + evidência), mais útil pra próxima geração de pesquisadores.
        </p>

        {/* metadados */}
        <Field label="Script">
          <select value={script} onChange={e => setScript(e.target.value)} style={inputStyle}>
            <option value="linear_a">Linear A (Bronze Age Crete)</option>
            <option value="voynich">Voynich (15c CE)</option>
          </select>
        </Field>

        <Field label="Título da hipótese">
          <input placeholder='ex.: "Linear A sílabas com paralelo anatoliano"' style={inputStyle} />
        </Field>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Field label="Tipo de proposta">
            <select value={type} onChange={e => setType(e.target.value)} style={inputStyle}>
              <option value="phonetic">Fonética</option>
              <option value="semantic">Semântica</option>
              <option value="structural">Estrutural</option>
              <option value="cipher">Cifra</option>
              <option value="hoax">Hoax</option>
              <option value="mixed">Mista</option>
            </select>
          </Field>
          <Field label="Status">
            <select style={inputStyle}>
              <option value="active">Ativa</option>
              <option value="partial">Parcial</option>
              <option value="dormant">Dormente</option>
            </select>
          </Field>
        </div>

        <Field label="Resumo (2-3 frases)">
          <textarea
            rows={3}
            placeholder="Tese central da hipótese, em prosa concisa. Evite jargão."
            style={{ ...inputStyle, fontFamily: 'inherit', resize: 'vertical' }}
          />
        </Field>

        <Field label="Evidência">
          <textarea
            rows={4}
            placeholder="Cite passagens, paralelos, evidência paleográfica, estatísticas internas, etc."
            style={{ ...inputStyle, fontFamily: 'inherit', resize: 'vertical' }}
          />
        </Field>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Field label="Citação (paper ou livro)">
            <input placeholder='ex.: "Younger 2020"' style={inputStyle} />
          </Field>
          <Field label="URL externa">
            <input placeholder='https://...' style={inputStyle} />
          </Field>
        </div>

        {/* mapeamentos */}
        <div style={{ marginTop: 28, marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: T.text }}>
              Mapeamentos · signo → valor
            </div>
            <div style={{ fontSize: '0.7rem', color: T.textMute, marginTop: 2 }}>
              Cada linha é uma predição testável. Confiança própria do autor (0–1).
            </div>
          </div>
          <button onClick={addRow} style={btnGhost}>+ adicionar linha</button>
        </div>

        <div style={{ background: T.bgPanel, border: `1px solid ${T.border}`, borderRadius: 10, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${T.border}` }}>
                {['Signo', 'Tipo', 'Valor proposto', 'Confiança', ''].map(h => (
                  <th key={h} style={{
                    padding: '10px 12px', textAlign: 'left',
                    fontSize: '0.66rem', fontWeight: 700, color: T.textMute,
                    textTransform: 'uppercase', letterSpacing: '0.08em',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mappings.map(m => (
                <tr key={m.id} style={{ borderBottom: `1px solid ${T.border}` }}>
                  <td style={{ padding: '8px 12px' }}>
                    <input value={m.sign} onChange={e => update(m.id, 'sign', e.target.value)}
                      style={{ ...inputStyle, padding: '6px 8px', fontFamily: 'ui-monospace, monospace' }} />
                  </td>
                  <td style={{ padding: '8px 12px' }}>
                    <select value={m.type} onChange={e => update(m.id, 'type', e.target.value)}
                      style={{ ...inputStyle, padding: '6px 8px' }}>
                      <option value="phoneme">fonema</option>
                      <option value="semantic">semântico</option>
                      <option value="morpheme">morfema</option>
                      <option value="name">nome</option>
                      <option value="number">número</option>
                    </select>
                  </td>
                  <td style={{ padding: '8px 12px' }}>
                    <input value={m.value} onChange={e => update(m.id, 'value', e.target.value)}
                      style={{ ...inputStyle, padding: '6px 8px' }} />
                  </td>
                  <td style={{ padding: '8px 12px' }}>
                    <input
                      type="number" min={0} max={1} step={0.05}
                      value={m.confidence}
                      onChange={e => update(m.id, 'confidence', parseFloat(e.target.value))}
                      style={{ ...inputStyle, padding: '6px 8px', width: 80 }}
                    />
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
        <div style={{ marginTop: 24, display: 'flex', gap: 10 }}>
          <button style={btnPrimary}>Salvar rascunho</button>
          <button style={btnGhost}>Rodar testes →</button>
          <button style={btnGhost}>Publicar (gera DOI-like)</button>
        </div>
      </section>

      {/* DIREITA — feedback ao vivo + provenance */}
      <aside style={{
        borderLeft: `1px solid ${T.border}`,
        padding: '20px 18px', overflowY: 'auto',
        background: T.bgPanel,
      }}>
        <Hint label="Cobertura prevista" value="62%" sub={`${mappings.length} sinais mapeados de ~150 no corpus de Linear A`} kind="ok" />
        <Hint label="Conflito com hipóteses cadastradas" value="2" sub="Younger 2020 (em AB80) · Davis 2014 (em AB02)" kind="warn" />
        <Hint label="Predições novas geradas" value="14" sub="Sequências derivadas que ninguém testou ainda" kind="ok" />

        <SectionLabel>Provenance</SectionLabel>
        <div style={{ fontSize: '0.78rem', color: T.textMid, lineHeight: 1.6 }}>
          Toda hipótese aqui carrega <strong>autor, data, evidência</strong>. Publicar gera ID
          permanente citável. Não é opinião do modelo: é seu trabalho atribuído a você, comparável
          com o de Cheshire, Pelling, Younger, Davis e todos os outros cadastrados.
        </div>
      </aside>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '8px 10px', borderRadius: 8,
  background: T.bg, border: `1px solid ${T.border}`,
  color: T.text, fontSize: '0.85rem', boxSizing: 'border-box',
}
const btnPrimary: React.CSSProperties = {
  padding: '9px 18px', borderRadius: 8, background: T.gradient,
  border: 'none', color: '#fff', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
}
const btnGhost: React.CSSProperties = {
  padding: '9px 18px', borderRadius: 8, background: T.accentBg,
  border: `1px solid ${T.accentBd}`, color: T.accent,
  fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
}
const btnRemove: React.CSSProperties = {
  width: 28, height: 28, borderRadius: 6,
  background: 'transparent', border: `1px solid ${T.border}`,
  color: T.textMute, fontSize: '1rem', cursor: 'pointer', lineHeight: 1,
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{
        display: 'block', marginBottom: 6, fontSize: '0.7rem',
        color: T.textMute, fontWeight: 600,
        textTransform: 'uppercase', letterSpacing: '0.06em',
      }}>{label}</label>
      {children}
    </div>
  )
}

function Hint({ label, value, sub, kind }: { label: string; value: string; sub: string; kind: 'ok' | 'warn' | 'bad' }) {
  const color = kind === 'ok' ? T.ok : kind === 'warn' ? T.warn : T.bad
  const bg    = kind === 'ok' ? T.okBg : kind === 'warn' ? T.warnBg : T.badBg
  const bd    = kind === 'ok' ? T.okBd : kind === 'warn' ? T.warnBd : T.badBd
  return (
    <div style={{
      padding: 14, borderRadius: 10, marginBottom: 12,
      background: bg, border: `1px solid ${bd}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <div style={{ fontSize: '0.7rem', color: T.textMid, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>{label}</div>
        <div style={{ fontSize: '1.1rem', fontWeight: 700, color }}>{value}</div>
      </div>
      <div style={{ marginTop: 6, fontSize: '0.74rem', color: T.textMid }}>{sub}</div>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: '0.66rem', color: T.textMute, textTransform: 'uppercase',
      letterSpacing: '0.1em', fontWeight: 700, margin: '18px 0 8px',
    }}>{children}</div>
  )
}
