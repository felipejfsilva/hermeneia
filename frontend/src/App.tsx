import { useState, useEffect } from 'react'
import { refineTranslation, getLanguages, fetchSourceText, type SourceWitness } from './api'
import { TokenChip } from './components/TokenChip'
import { TokenPanel } from './components/TokenPanel'
import { SummaryBar } from './components/SummaryBar'
import { isRTL } from './utils'
import { downloadLaudo, printLaudoPdf, type LaudoLang } from './laudo'
import type { TokenAnalysis, RefineResponse } from './types'

interface Language {
  id: string
  name: string
  script: string
  family: string
}

const EXAMPLES: Record<string, { original: string; translation: string; source: string; title: string }> = {
  biblical_hebrew: {
    original: 'בְּרֵאשִׁית בָּרָא אֱלֹהִים אֵת הַשָּׁמַיִם וְאֵת הָאָרֶץ',
    translation: 'In the beginning God created the heaven and the earth.',
    source: 'KJV',
    title: 'Genesis 1:1',
  },
  koine_greek: {
    original: 'Ἐν ἀρχῇ ἦν ὁ λόγος καὶ ὁ λόγος ἦν πρὸς τὸν θεόν καὶ θεὸς ἦν ὁ λόγος',
    translation: 'In the beginning was the Word, and the Word was with God, and the Word was God.',
    source: 'KJV',
    title: 'John 1:1',
  },
  latin: {
    original: 'Arma virumque cano Troiae qui primus ab oris Italiam fato profugus Laviniaque venit litora',
    translation: 'I sing of arms and the man, who first from the shores of Troy, exiled by fate, came to Italy and the Lavinian shores.',
    source: 'Dryden',
    title: 'Aeneid I.1–3',
  },
}

export default function App() {
  const [languages, setLanguages] = useState<Language[]>([])
  const [language, setLanguage] = useState('biblical_hebrew')
  const [original, setOriginal] = useState('')
  const [translation, setTranslation] = useState('')
  const [source, setSource] = useState('')
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<RefineResponse | null>(null)
  const [selected, setSelected] = useState<TokenAnalysis | null>(null)
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null)
  const [refQuery, setRefQuery] = useState('')
  const [witnesses, setWitnesses] = useState<SourceWitness[]>([])
  const [refLoading, setRefLoading] = useState(false)
  const [refError, setRefError] = useState<string | null>(null)
  const [laudoLang, setLaudoLang] = useState<LaudoLang>('pt')

  useEffect(() => {
    getLanguages().then(setLanguages).catch(() => {})
  }, [])

  const rtl = isRTL(languages.find(l => l.id === language)?.script ?? '')

  function loadExample() {
    const ex = EXAMPLES[language]
    if (!ex) return
    setOriginal(ex.original)
    setTranslation(ex.translation)
    setSource(ex.source)
    setTitle(ex.title)
    setResult(null)
    setSelected(null)
    setSelectedIdx(null)
  }

  async function handleSubmit() {
    if (!original.trim() || !translation.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)
    setSelected(null)
    setSelectedIdx(null)
    try {
      const data = await refineTranslation({
        original_text: original,
        translation,
        language,
        translation_source: source || undefined,
        manuscript_title: title || undefined,
        output_language: laudoLang,
      })
      setResult(data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'API error')
    } finally {
      setLoading(false)
    }
  }

  async function handleFetchRef() {
    if (!refQuery.trim()) return
    setRefLoading(true)
    setRefError(null)
    setWitnesses([])
    try {
      const data = await fetchSourceText(refQuery, language)
      if (!data.resolved || data.witnesses.length === 0) {
        setRefError(`Referência não encontrada para ${language}: "${refQuery}"`)
      } else {
        setWitnesses(data.witnesses)
        setTitle(data.ref)
      }
    } catch {
      setRefError('Erro ao buscar referência')
    } finally {
      setRefLoading(false)
    }
  }

  function pickWitness(w: SourceWitness) {
    setOriginal(w.text)
    setSource(w.witness)
    setResult(null)
  }

  function selectToken(t: TokenAnalysis, i: number) {
    if (selectedIdx === i) {
      setSelected(null)
      setSelectedIdx(null)
    } else {
      setSelected(t)
      setSelectedIdx(i)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#020617',
      color: '#f1f5f9',
      fontFamily: '"Inter", system-ui, sans-serif',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <header style={{
        borderBottom: '1px solid #1e293b',
        padding: '14px 28px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}>
        <div style={{
          width: '32px', height: '32px', borderRadius: '8px',
          background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1rem',
        }}>𓂀</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '1rem', letterSpacing: '-0.01em' }}>Hermeneia</div>
          <div style={{ fontSize: '0.72rem', color: '#475569' }}>Philological Translation Audit</div>
        </div>
        <div style={{ marginLeft: 'auto', fontSize: '0.72rem', color: '#334155' }}>
          MVP · {languages.length} languages indexed
        </div>
      </header>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', gap: 0, overflow: 'hidden' }}>

        {/* LEFT PANEL — Input */}
        <div style={{
          width: '320px',
          minWidth: '280px',
          borderRight: '1px solid #1e293b',
          padding: '20px 18px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}>
          {/* Language */}
          <div>
            <label style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              Language
            </label>
            <select
              value={language}
              onChange={e => { setLanguage(e.target.value); setResult(null); setSelected(null); setSelectedIdx(null); setWitnesses([]); setRefError(null) }}
              style={{
                width: '100%', padding: '8px 10px', borderRadius: '8px',
                background: '#0f172a', border: '1px solid #1e293b',
                color: '#f1f5f9', fontSize: '0.85rem', cursor: 'pointer',
              }}
            >
              {languages.map(l => (
                <option key={l.id} value={l.id}>{l.name} ({l.script})</option>
              ))}
              {languages.length === 0 && (
                <>
                  <option value="biblical_hebrew">Biblical Hebrew</option>
                  <option value="koine_greek">Koine Greek</option>
                  <option value="latin">Latin (Classical)</option>
                </>
              )}
            </select>
          </div>

          {/* Manuscript title */}
          <div>
            <label style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              Manuscript / Passage
            </label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Genesis 1:1"
              style={{
                width: '100%', padding: '8px 10px', borderRadius: '8px',
                background: '#0f172a', border: '1px solid #1e293b',
                color: '#f1f5f9', fontSize: '0.85rem', boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Fetch original by reference */}
          <div>
            <label style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              Fetch original by reference
            </label>
            <div style={{ display: 'flex', gap: '6px' }}>
              <input
                value={refQuery}
                onChange={e => setRefQuery(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleFetchRef() }}
                placeholder="e.g. John 1:1, Gen 1:1"
                style={{
                  flex: 1, padding: '8px 10px', borderRadius: '8px',
                  background: '#0f172a', border: '1px solid #1e293b',
                  color: '#f1f5f9', fontSize: '0.82rem', boxSizing: 'border-box',
                }}
              />
              <button
                onClick={handleFetchRef}
                disabled={refLoading || !refQuery.trim()}
                style={{
                  padding: '8px 12px', borderRadius: '8px',
                  background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)',
                  color: '#a5b4fc', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 500,
                  whiteSpace: 'nowrap',
                }}
              >
                {refLoading ? '…' : 'Fetch'}
              </button>
            </div>
            {refError && (
              <div style={{ marginTop: '6px', fontSize: '0.72rem', color: '#fca5a5' }}>{refError}</div>
            )}
            {witnesses.length > 0 && (
              <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ fontSize: '0.68rem', color: '#475569' }}>
                  Choose a textual witness:
                </div>
                {witnesses.map(w => (
                  <button
                    key={w.witness}
                    onClick={() => pickWitness(w)}
                    style={{
                      textAlign: 'left', padding: '8px 10px', borderRadius: '8px',
                      background: original === w.text ? 'rgba(99,102,241,0.14)' : '#0f172a',
                      border: `1px solid ${original === w.text ? 'rgba(99,102,241,0.45)' : '#1e293b'}`,
                      color: '#cbd5e1', cursor: 'pointer',
                    }}
                  >
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#818cf8', marginBottom: '3px' }}>
                      {w.witness} · {w.witness_name}
                    </div>
                    <div style={{
                      fontSize: rtl ? '1rem' : '0.78rem', color: '#94a3b8',
                      direction: rtl ? 'rtl' : 'ltr', lineHeight: 1.5,
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}>
                      {w.text}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Original text */}
          <div>
            <label style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              Original Text
            </label>
            <textarea
              value={original}
              onChange={e => setOriginal(e.target.value)}
              placeholder="Paste ancient text here…"
              rows={5}
              style={{
                width: '100%', padding: '10px', borderRadius: '8px',
                background: '#0f172a', border: '1px solid #1e293b',
                color: '#f1f5f9', fontSize: rtl ? '1.2rem' : '0.9rem',
                direction: rtl ? 'rtl' : 'ltr',
                fontFamily: rtl ? '"SBL Hebrew", "Ezra SIL", serif' : 'inherit',
                resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.7,
              }}
            />
          </div>

          {/* Translation */}
          <div>
            <label style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              Existing Translation
            </label>
            <textarea
              value={translation}
              onChange={e => setTranslation(e.target.value)}
              placeholder="Paste the translation to audit…"
              rows={5}
              style={{
                width: '100%', padding: '10px', borderRadius: '8px',
                background: '#0f172a', border: '1px solid #1e293b',
                color: '#f1f5f9', fontSize: '0.9rem',
                resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.6,
              }}
            />
          </div>

          {/* Source */}
          <div>
            <label style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              Translation Source
            </label>
            <input
              value={source}
              onChange={e => setSource(e.target.value)}
              placeholder="e.g. KJV, RSV, NIV…"
              style={{
                width: '100%', padding: '8px 10px', borderRadius: '8px',
                background: '#0f172a', border: '1px solid #1e293b',
                color: '#f1f5f9', fontSize: '0.85rem', boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Laudo language */}
          <div>
            <label style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              Laudo / Verdict
            </label>
            <div style={{ display: 'flex', gap: '6px' }}>
              {(['pt', 'en'] as LaudoLang[]).map(lg => (
                <button
                  key={lg}
                  onClick={() => setLaudoLang(lg)}
                  style={{
                    flex: 1, padding: '7px', borderRadius: '8px',
                    background: laudoLang === lg ? 'rgba(99,102,241,0.16)' : '#0f172a',
                    border: `1px solid ${laudoLang === lg ? 'rgba(99,102,241,0.45)' : '#1e293b'}`,
                    color: laudoLang === lg ? '#a5b4fc' : '#64748b',
                    fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600,
                  }}
                >
                  {lg === 'pt' ? 'Português' : 'English'}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={loadExample}
              style={{
                flex: 1, padding: '9px', borderRadius: '8px',
                background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)',
                color: '#a5b4fc', fontSize: '0.82rem', cursor: 'pointer', fontWeight: 500,
              }}
            >
              Load Example
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !original.trim() || !translation.trim()}
              style={{
                flex: 2, padding: '9px', borderRadius: '8px',
                background: loading ? '#1e293b' : 'linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)',
                border: 'none', color: loading ? '#64748b' : '#fff',
                fontSize: '0.85rem', cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: 600, transition: 'all 0.2s',
              }}
            >
              {loading ? 'Analyzing…' : 'Analyze →'}
            </button>
          </div>

          {error && (
            <div style={{
              padding: '10px 12px', borderRadius: '8px',
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              color: '#fca5a5', fontSize: '0.78rem',
            }}>
              ⚠ {error}
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div style={{
              padding: '12px', borderRadius: '8px',
              background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)',
              fontSize: '0.78rem', color: '#6366f1', textAlign: 'center',
            }}>
              <div style={{ marginBottom: '6px' }}>Running philological pipeline…</div>
              <div style={{ color: '#334155', fontSize: '0.72rem' }}>
                Aligning tokens · Lexicon lookup · LLM analysis (parallel)
              </div>
            </div>
          )}
        </div>

        {/* CENTER — Results */}
        <div style={{ flex: 1, padding: '20px 24px', overflowY: 'auto' }}>
          {!result && !loading && (
            <div style={{
              height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexDirection: 'column', gap: '12px', color: '#1e293b',
            }}>
              <div style={{ fontSize: '3rem' }}>𓂀</div>
              <div style={{ fontSize: '0.9rem', color: '#334155' }}>
                Load an example or paste a manuscript to begin
              </div>
            </div>
          )}

          {result && (
            <>
              {/* Action bar — emite o laudo */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ fontSize: '0.72rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {title || 'Análise'} · {result.language}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => printLaudoPdf({
                      languageName: languages.find(l => l.id === language)?.name ?? language,
                      original, translation, source, title, lang: laudoLang,
                    }, result)}
                    style={{
                      padding: '7px 14px', borderRadius: '8px',
                      background: 'linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)',
                      border: 'none', color: '#fff', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600,
                    }}
                  >
                    ↓ PDF
                  </button>
                  <button
                    onClick={() => downloadLaudo({
                      languageName: languages.find(l => l.id === language)?.name ?? language,
                      original, translation, source, title, lang: laudoLang,
                    }, result)}
                    style={{
                      padding: '7px 14px', borderRadius: '8px',
                      background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)',
                      color: '#a5b4fc', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600,
                    }}
                  >
                    ↓ .md
                  </button>
                </div>
              </div>

              {/* Summary bar */}
              <SummaryBar summary={result.summary} processingMs={result.processing_ms} />

              {/* Parecer em prosa */}
              {result.summary.narrative && (
                <div style={{
                  marginBottom: '16px', padding: '14px 16px', borderRadius: '10px',
                  background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.18)',
                }}>
                  <div style={{
                    fontSize: '0.68rem', fontWeight: 700, color: '#818cf8',
                    textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px',
                  }}>
                    Audit Verdict
                  </div>
                  {result.summary.narrative.split('\n').filter(p => p.trim()).map((para, i) => (
                    <p key={i} style={{
                      margin: i === 0 ? 0 : '8px 0 0', fontSize: '0.83rem',
                      lineHeight: 1.6, color: '#cbd5e1',
                    }}>{para}</p>
                  ))}
                  {result.summary.corrected_translation && (
                    <p style={{ margin: '10px 0 0', paddingTop: '10px', borderTop: '1px solid rgba(99,102,241,0.18)', fontSize: '0.83rem', lineHeight: 1.6, color: '#cbd5e1' }}>
                      <strong style={{ color: '#818cf8' }}>
                        {laudoLang === 'en' ? 'Suggested running text' : 'Texto corrido sugerido'}:
                      </strong>{' '}
                      <span style={{ fontStyle: 'italic' }}>{result.summary.corrected_translation}</span>
                    </p>
                  )}
                </div>
              )}

              {/* Consistency issues */}
              {result.summary.consistency_issues.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  {result.summary.consistency_issues.map((issue, i) => (
                    <div key={i} style={{
                      padding: '8px 12px', borderRadius: '6px', marginBottom: '6px',
                      background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)',
                      fontSize: '0.78rem', color: '#93c5fd',
                    }}>
                      <strong>⇄ Intra-doc inconsistency:</strong>{' '}
                      <span style={{ fontFamily: 'monospace' }}>{issue.token}</span>{' '}
                      ({issue.occurrences}×) — rendered as: {issue.translations_used.map(t => `"${t}"`).join(', ')}
                      {issue.locations.length > 0 && (
                        <span style={{ color: '#64748b' }}> · {issue.locations.join(', ')}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Token title */}
              <div style={{
                fontSize: '0.72rem', color: '#334155',
                marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.06em',
              }}>
                {result.tokens.length} tokens · click to inspect
              </div>

              {/* Token heatmap */}
              <div style={{
                direction: rtl ? 'rtl' : 'ltr',
                lineHeight: 1,
                marginBottom: '24px',
              }}>
                {result.tokens.map((t, i) => (
                  <TokenChip
                    key={i}
                    token={t}
                    index={i}
                    selected={selectedIdx === i}
                    onClick={() => selectToken(t, i)}
                    rtl={rtl}
                  />
                ))}
              </div>

              {/* Token table */}
              <div style={{ marginTop: '8px' }}>
                <div style={{
                  fontSize: '0.7rem', fontWeight: 700, color: '#334155',
                  textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '8px',
                }}>
                  Token Table
                </div>
                <div style={{
                  background: '#0f172a', border: '1px solid #1e293b',
                  borderRadius: '10px', overflow: 'hidden',
                }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #1e293b' }}>
                        {['#', 'Original', 'Transliteration', 'Existing', 'Refined', 'Confidence', 'Flags'].map(h => (
                          <th key={h} style={{
                            padding: '8px 12px', textAlign: 'left',
                            color: '#475569', fontWeight: 600, fontSize: '0.7rem',
                            textTransform: 'uppercase', letterSpacing: '0.06em',
                          }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {result.tokens.map((t, i) => {
                        const changed = t.refined !== t.existing && t.existing !== ''
                        const conf = Math.round(t.confidence * 100)
                        const color = conf >= 75 ? '#22c55e' : conf >= 50 ? '#f59e0b' : '#ef4444'
                        return (
                          <tr
                            key={i}
                            onClick={() => selectToken(t, i)}
                            style={{
                              borderBottom: '1px solid #1e293b',
                              background: selectedIdx === i ? 'rgba(99,102,241,0.08)' : 'transparent',
                              cursor: 'pointer',
                              transition: 'background 0.1s',
                            }}
                          >
                            <td style={{ padding: '8px 12px', color: '#334155' }}>{i + 1}</td>
                            <td style={{
                              padding: '8px 12px', color: '#f1f5f9', fontWeight: 600,
                              direction: rtl ? 'rtl' : 'ltr',
                              fontFamily: rtl ? '"SBL Hebrew", "Ezra SIL", serif' : 'inherit',
                              fontSize: rtl ? '1.1rem' : '0.78rem',
                            }}>{t.original}</td>
                            <td style={{ padding: '8px 12px', color: '#64748b', fontStyle: 'italic' }}>{t.transliteration || '—'}</td>
                            <td style={{ padding: '8px 12px', color: '#94a3b8' }}>{t.existing || '∅'}</td>
                            <td style={{ padding: '8px 12px', color: changed ? '#fbbf24' : '#475569', fontWeight: changed ? 600 : 400 }}>
                              {changed ? t.refined : '—'}
                            </td>
                            <td style={{ padding: '8px 12px' }}>
                              <span style={{ color, fontWeight: 700 }}>{conf}%</span>
                            </td>
                            <td style={{ padding: '8px 12px' }}>
                              {t.flags.length > 0 ? (
                                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                  {t.flags.map(f => (
                                    <span key={f} style={{
                                      width: '8px', height: '8px', borderRadius: '50%',
                                      background: {
                                        hapax: '#a855f7',
                                        semantic_narrowing: '#f59e0b',
                                        consensus_low: '#ef4444',
                                        intra_inconsistent: '#3b82f6',
                                        contested_semantics: '#ec4899',
                                        lacuna: '#6b7280',
                                        idiomatic: '#14b8a6',
                                      }[f] ?? '#64748b',
                                      display: 'inline-block',
                                    }} title={f} />
                                  ))}
                                </div>
                              ) : <span style={{ color: '#22c55e', fontSize: '0.7rem' }}>✓</span>}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>

        {/* RIGHT — Token detail panel */}
        {selected && (
          <div style={{
            width: '340px',
            minWidth: '300px',
            borderLeft: '1px solid #1e293b',
            padding: '16px',
            overflowY: 'auto',
          }}>
            <TokenPanel
              token={selected}
              onClose={() => { setSelected(null); setSelectedIdx(null) }}
              rtl={rtl}
            />
          </div>
        )}
      </div>
    </div>
  )
}
