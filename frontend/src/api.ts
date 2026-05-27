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
