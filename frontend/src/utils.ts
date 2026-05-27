import type { FlagType } from './types'

export function confidenceColor(c: number): string {
  if (c >= 0.75) return '#22c55e'   // green-500
  if (c >= 0.50) return '#f59e0b'   // amber-500
  return '#ef4444'                   // red-500
}

export function confidenceBg(c: number): string {
  if (c >= 0.75) return 'rgba(34,197,94,0.15)'
  if (c >= 0.50) return 'rgba(245,158,11,0.15)'
  return 'rgba(239,68,68,0.18)'
}

export function confidenceLabel(c: number): string {
  if (c >= 0.75) return 'Alta'
  if (c >= 0.50) return 'Média'
  return 'Baixa'
}

export const FLAG_LABELS: Record<FlagType, string> = {
  hapax:              '⚡ Hapax',
  semantic_narrowing: '◈ Narrowing',
  consensus_low:      '⊗ Consenso baixo',
  intra_inconsistent: '⇄ Inconsistente',
  contested_semantics:'⚑ Contestado',
  lacuna:             '░ Lacuna',
  idiomatic:          '∿ Idiomático',
}

export const FLAG_COLORS: Record<FlagType, string> = {
  hapax:              '#a855f7',
  semantic_narrowing: '#f59e0b',
  consensus_low:      '#ef4444',
  intra_inconsistent: '#3b82f6',
  contested_semantics:'#ec4899',
  lacuna:             '#6b7280',
  idiomatic:          '#14b8a6',
}

export function isRTL(script: string): boolean {
  return ['hebrew', 'arabic', 'aramaic'].includes(script.toLowerCase())
}
