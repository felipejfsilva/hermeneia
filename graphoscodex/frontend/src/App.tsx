import { useEffect, useRef, useState } from 'react'
import { T } from './theme'
import { CorpusBrowser } from './screens/CorpusBrowser'
import { HypothesisEditor } from './screens/HypothesisEditor'
import { TestRunner } from './screens/TestRunner'
import { ComparisonView } from './screens/ComparisonView'

type Screen = 'corpus' | 'editor' | 'tests' | 'compare'

const NAV: { id: Screen; label: string; sub: string }[] = [
  { id: 'corpus',  label: 'Corpus',     sub: 'navegar inscrições + linha do tempo' },
  { id: 'editor',  label: 'Hipóteses',  sub: 'compor uma proposta' },
  { id: 'tests',   label: 'Testes',     sub: 'rodar fits cross-modal' },
  { id: 'compare', label: 'Comparar',   sub: 'duas ou mais lado a lado' },
]

export function App() {
  const [screen, setScreen] = useState<Screen>(() =>
    (window.location.hash.replace('#', '') as Screen) || 'corpus'
  )
  useEffect(() => {
    const onHash = () => {
      const h = window.location.hash.replace('#', '') as Screen
      if (h && NAV.find(s => s.id === h)) setScreen(h)
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  function go(s: Screen) { window.location.hash = s; setScreen(s) }

  return (
    <div style={{
      minHeight: '100vh', background: T.bg, color: T.ink,
      display: 'flex', flexDirection: 'column',
    }}>
      <Header active={screen} onNavigate={go} />
      <main key={screen} className="gc-fade" style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {screen === 'corpus'  && <CorpusBrowser />}
        {screen === 'editor'  && <HypothesisEditor />}
        {screen === 'tests'   && <TestRunner />}
        {screen === 'compare' && <ComparisonView />}
      </main>
      <Footer />
    </div>
  )
}

function Header({ active, onNavigate }: { active: Screen; onNavigate: (s: Screen) => void }) {
  // Indicador animado sob o tab ativo
  const navRef = useRef<HTMLDivElement>(null)
  const [indicator, setIndicator] = useState({ left: 0, width: 0 })
  useEffect(() => {
    const el = navRef.current?.querySelector<HTMLButtonElement>(`button[data-id="${active}"]`)
    if (!el || !navRef.current) return
    const navBox = navRef.current.getBoundingClientRect()
    const btnBox = el.getBoundingClientRect()
    setIndicator({ left: btnBox.left - navBox.left, width: btnBox.width })
  }, [active])

  return (
    <header style={{
      borderBottom: `1px solid ${T.divider}`,
      background: T.bg, position: 'sticky', top: 0, zIndex: 10,
      backdropFilter: 'saturate(180%) blur(8px)',
    }}>
      <div style={{
        maxWidth: 1320, margin: '0 auto',
        padding: '16px 28px 0',
        display: 'flex', alignItems: 'baseline', gap: '32px',
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <span className="gc-serif" style={{
            fontSize: '1.5rem', fontWeight: 600, letterSpacing: '-0.01em',
            fontStyle: 'italic', color: T.ink,
          }}>
            Graphos<span style={{ fontStyle: 'normal', color: T.oxblood }}>Codex</span>
          </span>
          <span className="gc-serif" style={{
            fontSize: '0.78rem', fontStyle: 'italic', color: T.inkMute,
          }}>· workbench de decifração</span>
        </div>

        <div ref={navRef} style={{ display: 'flex', gap: 2, marginLeft: 'auto', position: 'relative' }}>
          {NAV.map(s => (
            <button
              key={s.id}
              data-id={s.id}
              onClick={() => onNavigate(s.id)}
              title={s.sub}
              style={{
                padding: '10px 16px 14px',
                border: 'none', background: 'transparent',
                color: active === s.id ? T.ink : T.inkMute,
                fontSize: '0.88rem', fontWeight: active === s.id ? 600 : 500,
                transition: `color ${T.fast} ${T.ease}`,
              }}
              onMouseEnter={e => (e.currentTarget.style.color = T.ink)}
              onMouseLeave={e => (e.currentTarget.style.color = active === s.id ? T.ink : T.inkMute)}
            >
              {s.label}
            </button>
          ))}
          <div style={{
            position: 'absolute', bottom: -1, height: 2,
            background: T.oxblood, borderRadius: 1,
            left: indicator.left, width: indicator.width,
            transition: `left ${T.med} ${T.easeOut}, width ${T.med} ${T.easeOut}`,
          }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Pill>wireframe · dados mock</Pill>
          <button style={{
            padding: '8px 16px', borderRadius: 999,
            background: T.ink, border: `1px solid ${T.ink}`,
            color: T.bg, fontSize: '0.82rem', fontWeight: 600,
            transition: `transform ${T.fast} ${T.ease}, box-shadow ${T.fast} ${T.ease}`,
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = T.shadowMd }}
          onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}>
            Entrar
          </button>
        </div>
      </div>
    </header>
  )
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      padding: '3px 10px', borderRadius: 999, fontSize: '0.66rem',
      background: T.ochreBg, border: `1px solid ${T.ochreBd}`, color: '#7a5a18',
      textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600,
      fontFamily: T.fontSans,
    }}>{children}</span>
  )
}

function Footer() {
  return (
    <footer style={{
      borderTop: `1px solid ${T.divider}`, padding: '14px 28px',
      fontSize: '0.74rem', color: T.inkMute,
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      maxWidth: 1320, margin: '0 auto', width: '100%',
    }}>
      <span className="gc-serif gc-italic">
        Graphos<span style={{ color: T.oxblood, fontStyle: 'normal' }}>Codex</span> — workbench colaborativa de decifração
      </span>
      <span>open access · bem comum acadêmico</span>
    </footer>
  )
}
