const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8001'

export async function refineTranslation(payload: {
  original_text: string
  translation: string
  language: string
  translation_source?: string
  manuscript_title?: string
  researcher_notes?: string
}) {
  const res = await fetch(`${BASE}/refine`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail ?? 'API error')
  }
  return res.json()
}

export async function getLanguages() {
  const res = await fetch(`${BASE}/languages`)
  return res.json()
}

export interface SourceWitness {
  witness: string
  witness_name: string
  language_id: string
  text: string
  ref: string
}

export async function fetchSourceText(ref: string, language?: string): Promise<{
  ref: string
  resolved: { book: string; chapter: number; verse: number } | null
  witnesses: SourceWitness[]
}> {
  const params = new URLSearchParams({ ref })
  if (language) params.set('language', language)
  const res = await fetch(`${BASE}/source-text?${params.toString()}`)
  if (!res.ok) throw new Error('Falha ao buscar texto-fonte')
  return res.json()
}
