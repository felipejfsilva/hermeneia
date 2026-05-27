export type FlagType =
  | 'hapax'
  | 'semantic_narrowing'
  | 'consensus_low'
  | 'intra_inconsistent'
  | 'contested_semantics'
  | 'lacuna'
  | 'idiomatic'

export interface AlternativeReading {
  text: string
  support: string
  confidence: number
  tradition?: string
}

export interface LexiconEvidence {
  lexicon: string
  lemma: string
  gloss_primary: string
  glosses: string[]
  semantic_range?: string
  attestation_count?: number
  is_hapax: boolean
  parallel_passages: string[]
  controversy_notes?: string
  source_citation?: string
}

export interface TokenAnalysis {
  original: string
  transliteration?: string
  existing: string
  refined: string
  confidence: number
  flags: FlagType[]
  alternatives: AlternativeReading[]
  lexicon_evidence: LexiconEvidence[]
  reasoning: string
  sources_agreeing: string[]
  sources_total: number
}

export interface ConsistencyIssue {
  token: string
  occurrences: number
  translations_used: string[]
  locations: string[]  // e.g. "v.2", "v.14"
}

export interface AnalysisSummary {
  total_tokens: number
  tokens_flagged: number
  avg_confidence: number
  flags_breakdown: Record<string, number>
  consistency_issues: ConsistencyIssue[]
  high_confidence_pct: number
  low_confidence_pct: number
  narrative?: string
}

export interface RefineResponse {
  analysis_id: string
  manuscript_id: string
  language: string
  tokens: TokenAnalysis[]
  summary: AnalysisSummary
  processing_ms: number
}

export interface Language {
  id: string
  name: string
  lexicons: string[]
  script: string
}
