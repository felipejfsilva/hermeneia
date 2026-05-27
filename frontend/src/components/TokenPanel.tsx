import type { TokenAnalysis } from '../types'
import { confidenceColor, confidenceLabel, FLAG_COLORS, FLAG_LABELS } from '../utils'

interface Props {
  token: TokenAnalysis
  onClose: () => void
  rtl: boolean
}

export function TokenPanel({ token, onClose, rtl }: Props) {
  const conf = token.confidence
  const color = confidenceColor(conf)
  const changed = token.refined !== token.existing && token.existing !== ''
  const lex = token.lexicon_evidence[0]

  return (
    <div style={{
      background: '#0f172a',
      border: '1px solid #1e293b',
      borderRadius: '12px',
      padding: '20px',
      height: '100%',
      overflowY: 'auto',
      boxSizing: 'border-box',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div>
          <div style={{
            fontSize: rtl ? '2rem' : '1.5rem',
            fontWeight: 700,
            color: '#f1f5f9',
            direction: rtl ? 'rtl' : 'ltr',
            fontFamily: rtl ? '"SBL Hebrew", "Ezra SIL", serif' : 'inherit',
          }}>
            {token.original}
          </div>
          {token.transliteration && (
            <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '2px' }}>
              {token.transliteration}
            </div>
          )}
        </div>
        <button onClick={onClose} style={{
          background: 'none', border: 'none', color: '#64748b',
          fontSize: '1.2rem', cursor: 'pointer', padding: '4px',
        }}>✕</button>
      </div>

      {/* Confidence */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '10px 14px', borderRadius: '8px',
        background: 'rgba(255,255,255,0.04)', marginBottom: '16px',
      }}>
        <div style={{
          width: '48px', height: '48px', borderRadius: '50%',
          border: `3px solid ${color}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.85rem', fontWeight: 700, color,
        }}>
          {Math.round(conf * 100)}%
        </div>
        <div>
          <div style={{ color, fontWeight: 600, fontSize: '0.9rem' }}>
            Confiança {confidenceLabel(conf)}
          </div>
          <div style={{ color: '#64748b', fontSize: '0.78rem' }}>
            {token.sources_total > 0
              ? `${token.sources_agreeing.length}/${token.sources_total} traduções de referência concordam`
              : 'Baseado em evidência léxica'}
          </div>
        </div>
      </div>

      {/* Translation comparison */}
      <Section title="Tradução">
        <Row label="Atual" value={token.existing || '∅ (omitido)'} muted={!token.existing} />
        {changed && <Row label="Refinado" value={token.refined} highlight />}
        {!changed && <Row label="Status" value="Adequada — sem alteração sugerida" muted />}
      </Section>

      {/* Flags */}
      {token.flags.length > 0 && (
        <Section title="Flags">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {token.flags.map(f => (
              <span key={f} style={{
                padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem',
                background: `${FLAG_COLORS[f]}22`,
                color: FLAG_COLORS[f],
                border: `1px solid ${FLAG_COLORS[f]}44`,
                fontWeight: 500,
              }}>
                {FLAG_LABELS[f]}
              </span>
            ))}
          </div>
        </Section>
      )}

      {/* Lexicon evidence */}
      {lex && (
        <Section title={`Léxico (${lex.lexicon})`}>
          {lex.is_hapax && (
            <div style={{
              padding: '6px 10px', borderRadius: '6px', marginBottom: '8px',
              background: 'rgba(168,85,247,0.12)', color: '#a855f7',
              fontSize: '0.78rem', fontWeight: 600,
            }}>
              ⚡ Hapax legomenon — palavra única no corpus
            </div>
          )}
          <Row label="Gloss primário" value={lex.gloss_primary} />
          {lex.glosses.length > 1 && (
            <Row label="Range semântico" value={lex.glosses.join(' · ')} />
          )}
          {lex.attestation_count && (
            <Row label="Atestações no corpus" value={`~${lex.attestation_count}×`} />
          )}
          {lex.source_citation && (
            <Row label="Referência" value={lex.source_citation} muted />
          )}
          {lex.parallel_passages.length > 0 && (
            <Row label="Passagens paralelas" value={lex.parallel_passages.join(', ')} />
          )}
          {lex.controversy_notes && (
            <div style={{
              marginTop: '8px', padding: '8px 10px', borderRadius: '6px',
              background: 'rgba(236,72,153,0.08)',
              borderLeft: '3px solid #ec4899',
              fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.5,
            }}>
              <span style={{ color: '#ec4899', fontWeight: 600 }}>⚑ Controvérsia: </span>
              {lex.controversy_notes}
            </div>
          )}
        </Section>
      )}

      {/* Alternatives */}
      {token.alternatives.length > 0 && (
        <Section title="Alternativas">
          {token.alternatives.map((a, i) => (
            <div key={i} style={{
              padding: '8px 10px', borderRadius: '6px',
              background: 'rgba(255,255,255,0.03)',
              marginBottom: '6px', border: '1px solid #1e293b',
            }}>
              <div style={{ color: '#f1f5f9', fontWeight: 600, fontSize: '0.9rem' }}>
                "{a.text}"
              </div>
              <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '2px' }}>
                {a.support}
                {a.tradition && ` · ${a.tradition}`}
                <span style={{ float: 'right', color: confidenceColor(a.confidence) }}>
                  {Math.round(a.confidence * 100)}%
                </span>
              </div>
            </div>
          ))}
        </Section>
      )}

      {/* Reasoning */}
      <Section title="Análise filológica">
        <p style={{
          color: '#94a3b8', fontSize: '0.82rem', lineHeight: 1.65,
          margin: 0, fontStyle: 'italic',
        }}>
          {token.reasoning}
        </p>
      </Section>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{
        fontSize: '0.7rem', fontWeight: 700, color: '#475569',
        textTransform: 'uppercase', letterSpacing: '0.08em',
        marginBottom: '8px',
      }}>
        {title}
      </div>
      {children}
    </div>
  )
}

function Row({ label, value, highlight, muted }: {
  label: string; value: string; highlight?: boolean; muted?: boolean
}) {
  return (
    <div style={{ display: 'flex', gap: '8px', marginBottom: '4px', alignItems: 'flex-start' }}>
      <span style={{ color: '#475569', fontSize: '0.78rem', minWidth: '110px', flexShrink: 0 }}>
        {label}
      </span>
      <span style={{
        color: highlight ? '#fbbf24' : muted ? '#475569' : '#cbd5e1',
        fontSize: '0.82rem',
        fontWeight: highlight ? 600 : 400,
      }}>
        {value}
      </span>
    </div>
  )
}
