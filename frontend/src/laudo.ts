import type { RefineResponse } from './types'

export interface LaudoMeta {
  languageName: string
  original: string
  translation: string
  source?: string
  title?: string
}

const FLAG_LABEL: Record<string, string> = {
  hapax: 'Hapax legomenon',
  semantic_narrowing: 'Estreitamento semântico',
  consensus_low: 'Baixo consenso',
  intra_inconsistent: 'Inconsistência intra-documento',
  contested_semantics: 'Semântica contestada',
  lacuna: 'Lacuna',
  idiomatic: 'Idiomático',
}

const LEXICON_BY_LANG: Record<string, string> = {
  'Biblical Hebrew': 'BDB (Brown-Driver-Briggs)',
  'Koine Greek': 'LSJ (Liddell-Scott-Jones)',
  'Classical Greek': 'LSJ (Liddell-Scott-Jones)',
  'Classical Latin': 'Lewis & Short',
}

function esc(s: string): string {
  return (s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ')
}

export function buildLaudo(meta: LaudoMeta, r: RefineResponse): string {
  const s = r.summary
  const date = new Date().toISOString().slice(0, 16).replace('T', ' ')
  const lex = LEXICON_BY_LANG[meta.languageName] ?? 'léxico de referência'

  const L: string[] = []
  L.push(`# Laudo Filológico — ${meta.title || 'Passagem sem título'}`)
  L.push('')
  L.push(`- **Idioma:** ${meta.languageName}`)
  L.push(`- **Texto original${meta.source ? ` (${meta.source})` : ''}:** ${meta.original}`)
  L.push(`- **Tradução auditada${meta.source ? ` — ${meta.source}` : ''}:** ${meta.translation}`)
  L.push(`- **Data:** ${date}`)
  L.push(`- **Processamento:** ${r.processing_ms} ms · análise ${r.analysis_id}`)
  L.push('')

  L.push('## Veredito')
  L.push(s.narrative?.trim() || '_(veredito não gerado)_')
  L.push('')

  L.push('## Síntese')
  L.push(`- Tokens analisados: **${s.total_tokens}** · sinalizados: **${s.tokens_flagged}**`)
  L.push(`- Confiança média: **${(s.avg_confidence * 100).toFixed(0)}%** · alta (>75%): ${s.high_confidence_pct}% · baixa (<50%): ${s.low_confidence_pct}%`)
  const fb = Object.entries(s.flags_breakdown)
  L.push(`- Flags: ${fb.length ? fb.map(([k, v]) => `${FLAG_LABEL[k] ?? k} (${v})`).join(' · ') : 'nenhuma'}`)
  L.push('')

  if (s.consistency_issues.length) {
    L.push('## Inconsistências intra-documento')
    for (const ci of s.consistency_issues) {
      L.push(`- \`${ci.token}\` (${ci.occurrences}×) traduzido como: ${ci.translations_used.map(t => `"${t}"`).join(', ')}`)
    }
    L.push('')
  }

  L.push('## Análise por token')
  L.push('| # | Original | Translit. | Existente | Refinada | Conf. | Flags | Léxico (citação) | Consenso |')
  L.push('|---|----------|-----------|-----------|----------|-------|-------|------------------|----------|')
  r.tokens.forEach((t, i) => {
    const ev = t.lexicon_evidence?.[0]
    const cite = ev ? `${esc(ev.gloss_primary)} [${esc(ev.source_citation || ev.lexicon)}]` : '—'
    const cons = t.sources_total ? `${t.sources_agreeing.length}/${t.sources_total}` : '—'
    const refined = t.refined && t.refined !== t.existing ? esc(t.refined) : '='
    const flags = t.flags.length ? t.flags.map(f => FLAG_LABEL[f] ?? f).join(', ') : '✓'
    L.push(`| ${i + 1} | ${esc(t.original)} | ${esc(t.transliteration || '')} | ${esc(t.existing || '∅')} | ${refined} | ${(t.confidence * 100).toFixed(0)}% | ${flags} | ${cite} | ${cons} |`)
  })
  L.push('')

  L.push('## Metodologia e limites')
  L.push(`- **Léxico:** ${lex}. Cada glosa traz citação verificável.`)
  L.push('- **Consenso:** fração de autoridade ponderada das traduções de referência que concordam com cada rendição. **Provisório (derivado por LLM)** — a ser substituído por corpus alinhado verificado.')
  L.push('- **Confiança:** métrica objetiva (léxico + consenso + hapax + controvérsia), não opinião do modelo.')
  L.push('- O veredito sintetiza os achados acima; não introduz afirmações fora deles.')
  L.push('')
  L.push('_Gerado por HERMENEIA — auditor filológico de traduções._')

  return L.join('\n')
}

export function downloadLaudo(meta: LaudoMeta, r: RefineResponse) {
  const md = buildLaudo(meta, r)
  const slug = (meta.title || 'laudo').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `laudo-${slug || 'hermeneia'}.md`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
