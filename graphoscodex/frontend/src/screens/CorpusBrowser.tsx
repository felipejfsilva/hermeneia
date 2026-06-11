import { useState } from 'react'
import { T } from '../theme'

// Mock data — substrato dos 2 scripts da fase 1.
const SCRIPTS = [
  { code: 'linear_a', name: 'Linear A',         status: 'partial',       n: 1500, era: '1800–1450 a.C.' },
  { code: 'voynich',  name: 'Voynich',          status: 'undeciphered',  n:  240, era: '1404–1438 CE' },
]

const INSCRIPTIONS: Record<string, MockInsc[]> = {
  linear_a: [
    { ref: 'HT 31',     title: 'Tabuinha administrativa, Hagia Triada',    material: 'argila',  date: '~1450 a.C.' },
    { ref: 'HT 38',     title: 'Lista de oferendas',                       material: 'argila',  date: '~1450 a.C.' },
    { ref: 'HT 86',     title: 'Inventário de gêneros agrícolas',          material: 'argila',  date: '~1450 a.C.' },
    { ref: 'ZA 10',     title: 'Tabuinha de Zakros',                       material: 'argila',  date: '~1500 a.C.' },
    { ref: 'KH 5',      title: 'Khania, fragmento contábil',               material: 'argila',  date: '~1450 a.C.' },
    { ref: 'AB 80',     title: 'Disco com sinais isolados',                material: 'argila',  date: '~1600 a.C.' },
  ],
  voynich: [
    { ref: 'f1r',  title: 'Fólio 1, recto · capa botânica',                material: 'velino', date: 'c. 1420' },
    { ref: 'f33r', title: 'Fólio 33, recto · planta vermelha',             material: 'velino', date: 'c. 1420' },
    { ref: 'f67r', title: 'Fólio 67, recto · diagrama astronômico',        material: 'velino', date: 'c. 1420' },
    { ref: 'f86r', title: 'Fólio 86, recto · "rosetas"',                   material: 'velino', date: 'c. 1420' },
    { ref: 'f78v', title: 'Fólio 78, verso · banho coletivo',              material: 'velino', date: 'c. 1420' },
    { ref: 'f116v',title: 'Fólio 116, verso · texto final',                material: 'velino', date: 'c. 1420' },
  ],
}

const TIMELINE: Record<string, MockEvent[]> = {
  linear_a: [
    { year: 1903, who: 'Sir Arthur Evans',          claim: 'Identifica e nomeia Linear A em Cnossos.', kind: 'discovery' },
    { year: 1952, who: 'Michael Ventris',           claim: 'Decifra Linear B (irmão deciphrado). Valores fonéticos compartilhados informam Linear A parcialmente.', kind: 'milestone' },
    { year: 1985, who: 'John G. Younger',           claim: 'Comentários sistemáticos por inscrição (referência canônica).', kind: 'corpus' },
    { year: 2020, who: 'Salgarella & Castellan',    claim: 'SigLA — base paleográfica aberta.', kind: 'tool' },
    { year: 2024, who: 'Corazza et al. (MDPI)',     claim: 'Cryptanalysis + simulated annealing. Limitações sem língua relacionada conhecida.', kind: 'method' },
  ],
  voynich: [
    { year: 1912, who: 'Wilfrid Voynich',           claim: 'Adquire o manuscrito em Villa Mondragone, divulga ao público.', kind: 'discovery' },
    { year: 1944, who: 'William F. Friedman',       claim: 'Análise criptanalítica. Estatística sugere língua artificial.', kind: 'method' },
    { year: 2003, who: 'Gordon Rugg',               claim: 'Hipótese hoax via grades de Cardan.', kind: 'hypothesis' },
    { year: 2019, who: 'Gerard Cheshire',           claim: 'Proposta "proto-romance". Rejeitada pela comunidade.', kind: 'hypothesis' },
    { year: 2024, who: 'Lindemann',                 claim: 'Língua natural codificada. Sem consenso.', kind: 'hypothesis' },
  ],
}

type MockInsc = { ref: string; title: string; material: string; date: string }
type MockEvent = { year: number; who: string; claim: string; kind: string }

export function CorpusBrowser() {
  const [script, setScript] = useState('linear_a')
  const [insc, setInsc] = useState<MockInsc | null>(INSCRIPTIONS['linear_a'][0])

  return (
    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '280px 1fr 360px', overflow: 'hidden' }}>
      {/* ESQUERDA — scripts + inscrições */}
      <aside style={{
        borderRight: `1px solid ${T.border}`,
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        <SectionLabel>Scripts</SectionLabel>
        <div style={{ padding: '4px 10px' }}>
          {SCRIPTS.map(s => (
            <button
              key={s.code}
              onClick={() => { setScript(s.code); setInsc(INSCRIPTIONS[s.code][0]) }}
              style={{
                width: '100%', textAlign: 'left', padding: '10px 12px',
                marginBottom: '4px', borderRadius: 8, cursor: 'pointer',
                background: script === s.code ? T.accentBg : 'transparent',
                border: `1px solid ${script === s.code ? T.accentBd : 'transparent'}`,
                color: T.text,
              }}
            >
              <div style={{ fontSize: '0.88rem', fontWeight: 700 }}>{s.name}</div>
              <div style={{ fontSize: '0.7rem', color: T.textMute, marginTop: 2 }}>
                {s.era} · {s.n} inscrições · {s.status}
              </div>
            </button>
          ))}
        </div>

        <SectionLabel style={{ marginTop: 12 }}>Inscrições</SectionLabel>
        <div style={{ flex: 1, overflowY: 'auto', padding: '4px 10px 12px' }}>
          {INSCRIPTIONS[script].map(i => (
            <button
              key={i.ref}
              onClick={() => setInsc(i)}
              style={{
                width: '100%', textAlign: 'left', padding: '8px 10px',
                marginBottom: '3px', borderRadius: 6, cursor: 'pointer',
                background: insc?.ref === i.ref ? T.accentBg : 'transparent',
                border: `1px solid ${insc?.ref === i.ref ? T.accentBd : T.border}`,
                color: T.text,
              }}
            >
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: T.accent }}>{i.ref}</div>
              <div style={{ fontSize: '0.72rem', color: T.textMid, marginTop: 2 }}>{i.title}</div>
            </button>
          ))}
        </div>
      </aside>

      {/* CENTRO — inscrição selecionada */}
      <section style={{ overflowY: 'auto', padding: '24px 28px' }}>
        {insc && (
          <>
            <div style={{ fontSize: '0.72rem', color: T.textMute, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: 6 }}>
              {SCRIPTS.find(s => s.code === script)?.name} · {insc.ref}
            </div>
            <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700, letterSpacing: '-0.01em' }}>{insc.title}</h1>
            <div style={{ marginTop: 6, fontSize: '0.8rem', color: T.textMid }}>
              {insc.material} · {insc.date}
            </div>

            {/* placeholder de imagem */}
            <div style={{
              marginTop: 20, padding: 40, borderRadius: 12,
              background: T.bgPanel, border: `1px solid ${T.border}`,
              textAlign: 'center', minHeight: 320,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexDirection: 'column', gap: 8,
            }}>
              <div style={{ fontSize: '3rem', opacity: 0.3 }}>🗎</div>
              <div style={{ fontSize: '0.78rem', color: T.textMute }}>
                Imagem alta resolução de {insc.ref}
              </div>
              <div style={{ fontSize: '0.7rem', color: T.textFaint }}>
                (Beinecke yale.edu · SigLA Cambridge — ingestão futura)
              </div>
            </div>

            {/* transcrição mock */}
            <SectionLabel style={{ marginTop: 24, paddingLeft: 0 }}>Transcrição</SectionLabel>
            <div style={{
              padding: 16, borderRadius: 10,
              background: T.bgPanel, border: `1px solid ${T.border}`,
              fontFamily: 'ui-monospace, monospace', fontSize: '0.95rem',
              color: T.textMid, lineHeight: 1.7,
            }}>
              {script === 'linear_a'
                ? <>𐘀𐘂𐘄 𐘅𐘇 · 𐘉𐘊𐘌𐘎 · 𐘐𐘒𐘔 · 𐘖𐘘 — <span style={{ color: T.textFaint }}>(EVA-equivalente Linear A; sequência mock)</span></>
                : <>otol dain kchedy daiin · qokeey shedy lkar — <span style={{ color: T.textFaint }}>(EVA Voynich mock)</span></>
              }
            </div>

            {/* iconografia placeholder */}
            <SectionLabel style={{ marginTop: 24, paddingLeft: 0 }}>Iconografia anotada</SectionLabel>
            <div style={{
              padding: 14, borderRadius: 10,
              background: T.bgPanel, border: `1px solid ${T.border}`,
              fontSize: '0.8rem', color: T.textMid,
            }}>
              {script === 'voynich'
                ? <>3 elementos botânicos · 0 figuras humanas · 0 elementos astronômicos. <a style={{ color: T.accent }}>Anotar →</a></>
                : <>1 elemento administrativo (sinal de "olive oil" Linear B). <a style={{ color: T.accent }}>Anotar →</a></>}
            </div>
          </>
        )}
      </section>

      {/* DIREITA — timeline historiográfica */}
      <aside style={{ borderLeft: `1px solid ${T.border}`, overflowY: 'auto' }}>
        <SectionLabel>Linha do tempo historiográfica</SectionLabel>
        <div style={{ padding: '4px 14px 20px' }}>
          {TIMELINE[script].map(ev => (
            <div key={ev.year + ev.who} style={{
              marginBottom: 14, paddingLeft: 12,
              borderLeft: `2px solid ${T.accentBd}`,
            }}>
              <div style={{ fontSize: '0.72rem', color: T.accent, fontWeight: 700 }}>{ev.year}</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, marginTop: 2 }}>{ev.who}</div>
              <div style={{ fontSize: '0.76rem', color: T.textMid, marginTop: 4, lineHeight: 1.5 }}>{ev.claim}</div>
              <div style={{ marginTop: 4, fontSize: '0.65rem', color: T.textVeryFaint, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{ev.kind}</div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  )
}

function SectionLabel({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      fontSize: '0.66rem', color: T.textMute, textTransform: 'uppercase',
      letterSpacing: '0.1em', fontWeight: 700,
      padding: '14px 14px 6px',
      ...style,
    }}>{children}</div>
  )
}
