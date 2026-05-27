import type { AnalysisSummary } from '../types'
import { FLAG_COLORS, FLAG_LABELS } from '../utils'

interface Props {
  summary: AnalysisSummary
  processingMs: number
}

export function SummaryBar({ summary, processingMs }: Props) {
  const pct = summary.avg_confidence * 100

  return (
    <div style={{
      background: '#0f172a',
      border: '1px solid #1e293b',
      borderRadius: '10px',
      padding: '14px 18px',
      display: 'flex',
      gap: '24px',
      flexWrap: 'wrap',
      alignItems: 'center',
      marginBottom: '16px',
    }}>
      {/* Confidence gauge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ position: 'relative', width: '48px', height: '48px' }}>
          <svg viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1e293b" strokeWidth="3" />
            <circle
              cx="18" cy="18" r="15.9" fill="none"
              stroke={pct >= 75 ? '#22c55e' : pct >= 50 ? '#f59e0b' : '#ef4444'}
              strokeWidth="3"
              strokeDasharray={`${pct} ${100 - pct}`}
              strokeLinecap="round"
            />
          </svg>
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.65rem', fontWeight: 700, color: '#f1f5f9',
          }}>
            {Math.round(pct)}%
          </div>
        </div>
        <div>
          <div style={{ color: '#94a3b8', fontSize: '0.7rem' }}>Confiança média</div>
          <div style={{ color: '#f1f5f9', fontSize: '0.85rem', fontWeight: 600 }}>
            {summary.tokens_flagged}/{summary.total_tokens} tokens flagados
          </div>
        </div>
      </div>

      {/* Confidence distribution */}
      <div style={{ flex: 1, minWidth: '140px' }}>
        <div style={{ fontSize: '0.7rem', color: '#475569', marginBottom: '4px' }}>Distribuição</div>
        <div style={{ display: 'flex', height: '8px', borderRadius: '4px', overflow: 'hidden', gap: '2px' }}>
          <div style={{ flex: summary.high_confidence_pct, background: '#22c55e', borderRadius: '4px' }} title={`Alta: ${summary.high_confidence_pct}%`} />
          <div style={{ flex: 100 - summary.high_confidence_pct - summary.low_confidence_pct, background: '#f59e0b', borderRadius: '4px' }} />
          <div style={{ flex: summary.low_confidence_pct, background: '#ef4444', borderRadius: '4px' }} title={`Baixa: ${summary.low_confidence_pct}%`} />
        </div>
        <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
          {[
            { label: `Alta ${summary.high_confidence_pct.toFixed(0)}%`, color: '#22c55e' },
            { label: `Baixa ${summary.low_confidence_pct.toFixed(0)}%`, color: '#ef4444' },
          ].map(({ label, color }) => (
            <span key={label} style={{ fontSize: '0.65rem', color }}>{label}</span>
          ))}
        </div>
      </div>

      {/* Flags breakdown */}
      {Object.keys(summary.flags_breakdown).length > 0 && (
        <div>
          <div style={{ fontSize: '0.7rem', color: '#475569', marginBottom: '4px' }}>Flags</div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {Object.entries(summary.flags_breakdown).map(([flag, count]) => (
              <span key={flag} style={{
                padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem',
                background: `${FLAG_COLORS[flag as keyof typeof FLAG_COLORS]}22`,
                color: FLAG_COLORS[flag as keyof typeof FLAG_COLORS],
                border: `1px solid ${FLAG_COLORS[flag as keyof typeof FLAG_COLORS]}44`,
              }}>
                {FLAG_LABELS[flag as keyof typeof FLAG_LABELS]} ×{count}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Consistency issues */}
      {summary.consistency_issues.length > 0 && (
        <div style={{
          padding: '6px 10px', borderRadius: '6px',
          background: 'rgba(59,130,246,0.1)',
          border: '1px solid rgba(59,130,246,0.3)',
          fontSize: '0.75rem', color: '#93c5fd',
        }}>
          ⇄ {summary.consistency_issues.length} inconsistência{summary.consistency_issues.length > 1 ? 's' : ''} intra-documento
        </div>
      )}

      {/* Time */}
      <div style={{ color: '#334155', fontSize: '0.7rem', marginLeft: 'auto' }}>
        {(processingMs / 1000).toFixed(1)}s
      </div>
    </div>
  )
}
