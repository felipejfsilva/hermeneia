/**
 * GraphosCodex — fetch direto do Supabase REST (PostgREST).
 * Sem dependência de @supabase/supabase-js (mantém bundle leve).
 * Usa a chave publishable; RLS protege escrita.
 */
const SUPABASE_URL = 'https://hbcwsurfdfcgfxxawfhc.supabase.co'
const SUPABASE_KEY = 'sb_publishable_BiPoyp0US_SVrJ1W2F105w_hQ2vnzuP'

export interface Script {
  code: string
  name: string
  description: string | null
  period_start: number | null
  period_end: number | null
  region: string | null
  status: string
  anchor_code: string | null
  corpus_size: number | null
}

export interface Inscription {
  id: string
  script_code: string
  ref: string
  title: string | null
  description: string | null
  material: string | null
  date_estimate: string | null
  holding_institution: string | null
  transcription: string | null
  transcription_format: string | null
  image_url: string | null
  metadata: { section?: string; lines?: number; source?: string; truncated?: boolean } | null
}

export interface Sign {
  id: string
  script_code: string
  sign_id: string
  attestation_count: number
  source: string | null
}

export interface ProposalMapping {
  sign_id: string
  mapping_type: string
  value: string
  confidence: number | null
  evidence_note: string | null
}

export interface Proposal {
  id: string
  script_code: string
  slug: string
  title: string
  author: string
  author_affiliation: string | null
  year_proposed: number | null
  proposal_type: string
  summary: string | null
  evidence: string | null
  citation: string | null
  url: string | null
  status: string
  provenance: string
  mappings?: ProposalMapping[]
}

export interface TestReport {
  proposal_id: string
  coverage: number
  internal_consistency: number
  global_score: number
  conflicts: { sign_id: string; mapping_type: string; values: string[] }[]
  verdict: string
}

async function rest<T>(path: string): Promise<T> {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  })
  if (!r.ok) throw new Error(`${r.status} ${path}: ${await r.text()}`)
  return r.json()
}

export async function listScripts(): Promise<Script[]> {
  return rest<Script[]>('graphoscodex_scripts?select=*&order=name')
}

export async function listInscriptions(scriptCode: string): Promise<Inscription[]> {
  return rest<Inscription[]>(
    `graphoscodex_inscriptions?script_code=eq.${scriptCode}&select=*&order=ref`
  )
}

export async function listSigns(scriptCode: string): Promise<Sign[]> {
  return rest<Sign[]>(
    `graphoscodex_signs?script_code=eq.${scriptCode}&select=*&order=attestation_count.desc`
  )
}

export async function listProposals(scriptCode?: string): Promise<Proposal[]> {
  const filter = scriptCode ? `&script_code=eq.${scriptCode}` : ''
  return rest<Proposal[]>(`graphoscodex_proposals?select=*${filter}&order=year_proposed.desc`)
}

export async function getProposal(slug: string): Promise<Proposal | null> {
  const rows = await rest<Proposal[]>(`graphoscodex_proposals?slug=eq.${slug}&select=*`)
  if (!rows.length) return null
  const p = rows[0]
  p.mappings = await rest<ProposalMapping[]>(
    `graphoscodex_proposal_mappings?proposal_id=eq.${p.id}&select=sign_id,mapping_type,value,confidence,evidence_note`
  )
  return p
}

/**
 * Calcula coverage + consistency NO CLIENTE.
 * (Em produção isto chamaria POST /proposals/{id}/test no FastAPI.
 *  Como o backend ainda não está deployado, replicamos a lógica do tests_engine.py.)
 */
export async function testProposal(slug: string): Promise<TestReport | null> {
  const prop = await getProposal(slug)
  if (!prop) return null
  const signs = await listSigns(prop.script_code)

  const totalAttest = signs.reduce((s, x) => s + (x.attestation_count || 0), 0) || 1
  const mappedIds = new Set((prop.mappings || []).map(m => m.sign_id))
  const coveredAttest = signs
    .filter(s => mappedIds.has(s.sign_id))
    .reduce((s, x) => s + (x.attestation_count || 0), 0)
  const coverage = coveredAttest / totalAttest

  const bySignType = new Map<string, Set<string>>()
  for (const m of prop.mappings || []) {
    const k = `${m.sign_id}|${m.mapping_type}`
    if (!bySignType.has(k)) bySignType.set(k, new Set())
    bySignType.get(k)!.add(m.value)
  }
  const conflicts: TestReport['conflicts'] = []
  for (const [k, vs] of bySignType) {
    if (vs.size > 1) {
      const [sid, mt] = k.split('|')
      conflicts.push({ sign_id: sid, mapping_type: mt, values: [...vs].sort() })
    }
  }
  const consistency = bySignType.size === 0 ? 1.0 : 1 - conflicts.length / bySignType.size

  let global_score = 0.6 * coverage + 0.4 * consistency
  if (prop.proposal_type === 'hoax' && (prop.mappings || []).length === 0) {
    global_score = 0
  }

  const nMap = (prop.mappings || []).length
  const cov = (coverage * 100).toFixed(1)
  const con = (consistency * 100).toFixed(1)
  const verdict = nMap === 0
    ? 'Hipótese sem mapeamentos signo→valor (estrutural/nula). Não testável por cobertura.'
    : `Cobertura ${cov}% dos signos do corpus (ponderada por frequência). Consistência interna ${con}%. ${nMap} mapeamentos sobre ${signs.length} signos catalogados.`

  return {
    proposal_id: prop.id,
    coverage: +coverage.toFixed(3),
    internal_consistency: +consistency.toFixed(3),
    global_score: +global_score.toFixed(3),
    conflicts,
    verdict,
  }
}
