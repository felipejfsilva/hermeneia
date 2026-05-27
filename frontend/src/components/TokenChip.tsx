import type { TokenAnalysis } from '../types'
import { confidenceBg, confidenceColor, FLAG_COLORS, FLAG_LABELS } from '../utils'

interface Props {
  token: TokenAnalysis
  index: number
  selected: boolean
  onClick: () => void
  rtl: boolean
}

export function TokenChip({ token, selected, onClick, rtl }: Props) {
  const bg     = confidenceBg(token.confidence)
  const border = confidenceColor(token.confidence)
  const hasFlag = token.flags.length > 0
  const changed = token.refined !== token.existing && token.existing !== ''

  return (
    <span
      onClick={onClick}
      style={{
        display: 'inline-block',
        margin: '4px 3px',
        padding: '6px 10px',
        borderRadius: '8px',
        background: selected ? 'rgba(99,102,241,0.18)' : bg,
        border: `2px solid ${selected ? '#6366f1' : border}`,
        cursor: 'pointer',
        transition: 'all 0.15s',
        boxShadow: selected ? '0 0 0 3px rgba(99,102,241,0.25)' : undefined,
        direction: rtl ? 'rtl' : 'ltr',
        position: 'relative',
      }}
    >
      {/* Original token */}
      <span style={{
        display: 'block',
        fontSize: rtl ? '1.3rem' : '1rem',
        fontWeight: 600,
        color: '#f1f5f9',
        lineHeight: 1.2,
        fontFamily: rtl ? '"SBL Hebrew", "Ezra SIL", serif' : 'inherit',
      }}>
        {token.original}
      </span>

      {/* Transliteration */}
      {token.transliteration && (
        <span style={{ display: 'block', fontSize: '0.65rem', color: '#94a3b8', direction: 'ltr' }}>
          {token.transliteration}
        </span>
      )}

      {/* Translation span */}
      <span style={{
        display: 'block',
        fontSize: '0.72rem',
        color: changed ? '#fbbf24' : '#cbd5e1',
        direction: 'ltr',
        fontStyle: changed ? 'italic' : 'normal',
      }}>
        {changed ? token.refined : (token.existing || '∅')}
      </span>

      {/* Confidence bar */}
      <div style={{
        marginTop: '4px',
        height: '3px',
        borderRadius: '2px',
        background: '#1e293b',
        overflow: 'hidden',
      }}>
        <div style={{
          width: `${token.confidence * 100}%`,
          height: '100%',
          background: border,
          transition: 'width 0.3s',
        }} />
      </div>

      {/* Flag dots */}
      {hasFlag && (
        <div style={{ display: 'flex', gap: '2px', marginTop: '3px', justifyContent: 'center' }}>
          {token.flags.slice(0, 3).map(f => (
            <span key={f} style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: FLAG_COLORS[f],
              display: 'inline-block',
            }} title={FLAG_LABELS[f]} />
          ))}
        </div>
      )}
    </span>
  )
}
