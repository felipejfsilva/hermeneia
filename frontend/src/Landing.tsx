interface LandingProps {
  onStart: () => void
}

const BG = '#020617'
const PANEL = 'rgba(99,102,241,0.06)'
const PANEL_BORDER = 'rgba(99,102,241,0.18)'
const TEXT = '#f1f5f9'
const MUTED = '#64748b'
const FAINT = '#334155'
const ACCENT = '#a5b4fc'
const GRADIENT = 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)'

export function Landing({ onStart }: LandingProps) {
  return (
    <div style={{
      minHeight: '100vh', background: BG, color: TEXT,
      fontFamily: '"Inter", system-ui, sans-serif',
    }}>
      {/* Header */}
      <header style={{
        borderBottom: '1px solid #1e293b', padding: '14px 28px',
        display: 'flex', alignItems: 'center', gap: '12px',
        maxWidth: '1100px', margin: '0 auto',
      }}>
        <div style={{
          width: '32px', height: '32px', borderRadius: '8px',
          background: GRADIENT, display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: '1rem',
        }}>𓂀</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '1rem', letterSpacing: '-0.01em' }}>Hermeneia</div>
          <div style={{ fontSize: '0.72rem', color: '#475569' }}>Philological Translation Audit</div>
        </div>
        <button onClick={onStart} style={{
          marginLeft: 'auto', padding: '7px 14px', borderRadius: '8px',
          background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)',
          color: ACCENT, fontSize: '0.82rem', cursor: 'pointer', fontWeight: 600,
        }}>Abrir o app →</button>
      </header>

      {/* Hero */}
      <section style={{ maxWidth: '900px', margin: '0 auto', padding: '80px 28px 60px', textAlign: 'center' }}>
        <div style={{
          display: 'inline-block', padding: '4px 12px', borderRadius: '999px',
          background: PANEL, border: `1px solid ${PANEL_BORDER}`,
          fontSize: '0.7rem', color: ACCENT, letterSpacing: '0.08em',
          textTransform: 'uppercase', marginBottom: '24px', fontWeight: 600,
        }}>Hebraico bíblico · Grego koiné · Latim</div>
        <h1 style={{
          fontSize: 'clamp(2rem, 5vw, 3.4rem)', fontWeight: 800,
          letterSpacing: '-0.025em', lineHeight: 1.1, margin: 0,
        }}>
          Sua <span style={{
            background: GRADIENT, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>segunda opinião</span> sobre qualquer tradução de texto antigo.
        </h1>
        <p style={{
          fontSize: '1.05rem', color: '#94a3b8', lineHeight: 1.6,
          maxWidth: '680px', margin: '24px auto 0',
        }}>
          Cole uma tradução e veja, palavra por palavra, onde ela está firme e onde está sozinha —
          com citação de léxico real e a posição de 8 traduções de referência. Veredito em português
          ou inglês, laudo baixável em PDF.
        </p>
        <div style={{ marginTop: '36px', display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={onStart} style={{
            padding: '12px 28px', borderRadius: '10px', background: GRADIENT,
            border: 'none', color: '#fff', fontSize: '0.95rem', cursor: 'pointer', fontWeight: 600,
          }}>Auditar uma tradução →</button>
          <a href="#exemplo" style={{
            padding: '12px 24px', borderRadius: '10px',
            background: PANEL, border: `1px solid ${PANEL_BORDER}`,
            color: ACCENT, fontSize: '0.95rem', textDecoration: 'none', fontWeight: 600,
          }}>Ver exemplo real</a>
        </div>
        <div style={{ marginTop: '40px', fontSize: '0.78rem', color: FAINT }}>
          Grátis · Sem cadastro · Léxicos: BDB · LSJ · Lewis & Short — ~149.800 entradas indexadas
        </div>
      </section>

      {/* Como funciona */}
      <section style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 28px' }}>
        <h2 style={{ fontSize: '0.78rem', color: MUTED, textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'center', fontWeight: 700 }}>Como funciona</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginTop: '20px' }}>
          {[
            { n: '1', t: 'Busque o original', d: 'Digite a referência (ex.: "John 1:1") e escolha o testemunho textual — SBLGNT (crítico) ou TR para grego, WLC para hebraico. Ou cole o original direto.' },
            { n: '2', t: 'Cole a tradução', d: 'Qualquer tradução em qualquer idioma — KJV, NVI, Almeida, sua própria. O sistema alinha cada palavra antiga ao seu equivalente.' },
            { n: '3', t: 'Receba o laudo', d: 'Tabela token-a-token com flags, veredito em prosa, correções sugeridas com texto corrido pronto. Baixa em PDF ou Markdown.' },
          ].map(s => (
            <div key={s.n} style={{
              padding: '20px', borderRadius: '12px',
              background: PANEL, border: `1px solid ${PANEL_BORDER}`,
            }}>
              <div style={{
                fontSize: '0.85rem', fontWeight: 700, color: ACCENT, marginBottom: '8px',
              }}>{s.n}. {s.t}</div>
              <div style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.55 }}>{s.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Exemplo real */}
      <section id="exemplo" style={{ maxWidth: '900px', margin: '0 auto', padding: '60px 28px' }}>
        <h2 style={{ fontSize: '0.78rem', color: MUTED, textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'center', fontWeight: 700, margin: 0 }}>Exemplo real</h2>
        <div style={{ textAlign: 'center', fontSize: '1.1rem', marginTop: '12px', fontWeight: 600 }}>
          1 Coríntios 13:13 — "charity" ou "love"?
        </div>
        <div style={{
          marginTop: '24px', padding: '24px', borderRadius: '12px',
          background: '#0f172a', border: '1px solid #1e293b',
        }}>
          <div style={{ fontSize: '0.72rem', color: MUTED, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>Original (SBLGNT, koiné)</div>
          <div style={{ fontSize: '1.05rem', marginBottom: '14px', color: '#e2e8f0' }}>
            νυνὶ δὲ μένει πίστις, ἐλπίς, ἀγάπη· τὰ τρία ταῦτα, μείζων δὲ τούτων ἡ ἀγάπη.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px', marginTop: '16px' }}>
            {[
              { src: 'KJV (1611)', text: '"...the greatest of these is charity."', verdict: 'CONSENSUS_LOW', detail: 'ἀγάπη → "charity": apenas 2/8 traduções concordam (KJV, Vulgata). LSJ: "love". Leitura minoritária da época.', bad: true },
              { src: 'Almeida (atual)', text: '"...o maior destes é o amor."', verdict: 'OK', detail: 'ἀγάπη → "amor": 6/8 traduções concordam. Alinhada ao consenso moderno.', bad: false },
            ].map(c => (
              <div key={c.src} style={{
                padding: '14px', borderRadius: '10px',
                background: c.bad ? 'rgba(239,68,68,0.06)' : 'rgba(34,197,94,0.06)',
                border: `1px solid ${c.bad ? 'rgba(239,68,68,0.25)' : 'rgba(34,197,94,0.25)'}`,
              }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: c.bad ? '#fca5a5' : '#86efac', marginBottom: '4px' }}>{c.src} · <span style={{ letterSpacing: '0.05em' }}>{c.verdict}</span></div>
                <div style={{ fontSize: '0.88rem', fontStyle: 'italic', color: '#cbd5e1', marginBottom: '6px' }}>{c.text}</div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.5 }}>{c.detail}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '14px', padding: '12px', borderRadius: '8px', background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)', fontSize: '0.8rem', color: '#cbd5e1', lineHeight: 1.55 }}>
            <strong style={{ color: ACCENT }}>Veredito da Hermeneia:</strong> auditando o mesmo grego, a Almeida moderna alinha-se ao consenso (6/8) enquanto o "charity" da KJV é uma leitura de época hoje isolada (2/8). Cada número vem com citação verificável de léxico.
          </div>
        </div>
      </section>

      {/* Pra quem é */}
      <section style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 28px' }}>
        <h2 style={{ fontSize: '0.78rem', color: MUTED, textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'center', fontWeight: 700 }}>Para quem é</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginTop: '20px' }}>
          {[
            { t: 'Estudantes de teologia', d: 'Entenda por que uma palavra foi traduzida assim, sem cruzar Strong+BDB na mão.' },
            { t: 'Pastores e padres', d: 'Verifique pontos críticos antes do sermão — "carne" ou "natureza pecaminosa"?' },
            { t: 'Tradutores bíblicos', d: 'Compare suas escolhas contra o consenso, com documentação exportável.' },
            { t: 'Acadêmicos de exegese', d: 'Browsing rápido pra scoping de pesquisa em recepção e história tradutória.' },
            { t: 'Estudantes de clássicas', d: 'Latim (Lewis & Short) e grego clássico (LSJ) inclusos — auditar Virgílio ou Platão.' },
            { t: 'Curiosos com formação humanística', d: 'Entenda as escolhas por trás das suas leituras de Bíblia, Homero, Eneida.' },
          ].map(p => (
            <div key={p.t} style={{
              padding: '14px 16px', borderRadius: '10px',
              background: '#0f172a', border: '1px solid #1e293b',
            }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: TEXT, marginBottom: '4px' }}>{p.t}</div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.5 }}>{p.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* O que não é */}
      <section style={{ maxWidth: '780px', margin: '0 auto', padding: '40px 28px' }}>
        <div style={{
          padding: '20px', borderRadius: '12px', background: PANEL,
          border: `1px solid ${PANEL_BORDER}`, fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.6,
        }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Honestidade</div>
          <strong>A Hermeneia não substitui exegese e não emite verdade.</strong> Ela mostra evidência —
          glosas de léxicos reais e a distribuição de 8 traduções de referência — e sinaliza onde uma
          escolha tradutória se afasta do consenso. O consenso é, hoje, derivado por LLM (marcado como
          provisório no laudo); a v2 substitui por corpus alinhado verificado.
        </div>
      </section>

      {/* CTA final */}
      <section style={{ maxWidth: '700px', margin: '0 auto', padding: '40px 28px 80px', textAlign: 'center' }}>
        <button onClick={onStart} style={{
          padding: '14px 32px', borderRadius: '10px', background: GRADIENT,
          border: 'none', color: '#fff', fontSize: '1rem', cursor: 'pointer', fontWeight: 700,
        }}>Auditar uma tradução agora →</button>
        <div style={{ marginTop: '16px', fontSize: '0.78rem', color: FAINT }}>
          Léxico: BDB · LSJ · Lewis & Short · Consenso: 8 fontes por idioma · Laudo PDF
        </div>
      </section>

      <footer style={{ borderTop: '1px solid #1e293b', padding: '20px 28px', textAlign: 'center', fontSize: '0.72rem', color: '#475569' }}>
        HERMENEIA · auditor filológico de traduções · ancorado em dado verificável
      </footer>
    </div>
  )
}
