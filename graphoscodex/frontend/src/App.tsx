import { useEffect, useState } from 'react'
import { T } from './theme'
import { CorpusBrowser } from './screens/CorpusBrowser'
import { HypothesisEditor } from './screens/HypothesisEditor'
import { TestRunner } from './screens/TestRunner'
import { ComparisonView } from './screens/ComparisonView'

type Screen = 'corpus' | 'editor' | 'tests' | 'compare'

const SCREENS: { id: Screen; label: string; sub: string }[] = [
  { id: 'corpus',  label: 'Corpus',     sub: 'navegar inscrições + historiografia' },
  { id: 'editor',  label: 'Hipóteses',  sub: 'registrar e editar propostas' },
  { id: 'tests',   label: 'Testes',     sub: 'rodar testes cross-modal' },
  { id: 'compare', label: 'Comparar',   sub: 'duas ou mais propostas lado a lado' },
]

export function App() {
  const [screen, setScreen] = useState<Screen>(() =>
    (window.location.hash.replace('#', '') as Screen) || 'corpus'
  )
  useEffect(() => {
    const onHash = () => {
      const h = window.location.hash.replace('#', '') as Screen
      if (h && SCREENS.find(s => s.id === h)) setScreen(h)
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  function go(s: Screen) {
    window.location.hash = s
    setScreen(s)
  }

  return (
    <div style={{
      minHeight: '100vh', background: T.bg, color: T.text,
      display: 'flex', flexDirection: 'column',
    }}>
      <Header active={screen} onNavigate={go} />
      <main style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
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
  return (
    <header style={{
      borderBottom: `1px solid ${T.border}`,
      padding: '12px 24px',
      display: 'flex', alignItems: 'center', gap: '20px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8, background: T.gradient,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, fontWeight: 700,
        }}>𓂀</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '1rem', letterSpacing: '-0.01em' }}>GraphosCodex</div>
          <div style={{ fontSize: '0.7rem', color: T.textVeryFaint }}>workbench de decifração</div>
        </div>
      </div>

      <nav style={{ display: 'flex', gap: '4px', marginLeft: '20px' }}>
        {SCREENS.map(s => (
          <button
            key={s.id}
            onClick={() => onNavigate(s.id)}
            title={s.sub}
            style={{
              padding: '7px 14px', borderRadius: 8, cursor: 'pointer',
              fontSize: '0.85rem', fontWeight: 600,
              background: active === s.id ? T.accentBgM : 'transparent',
              border: `1px solid ${active === s.id ? T.accentBdM : 'transparent'}`,
              color: active === s.id ? T.accent : T.textMid,
            }}
          >
            {s.label}
          </button>
        ))}
      </nav>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{
          padding: '3px 10px', borderRadius: 999, fontSize: '0.65rem',
          background: T.warnBg, border: `1px solid ${T.warnBd}`, color: T.warn,
          textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700,
        }}>WIREFRAME · DADOS MOCK</span>
        <button style={{
          padding: '7px 14px', borderRadius: 8, background: T.gradient,
          border: 'none', color: '#fff', fontSize: '0.82rem', cursor: 'pointer',
          fontWeight: 600,
        }}>
          Entrar
        </button>
      </div>
    </header>
  )
}

function Footer() {
  return (
    <footer style={{
      borderTop: `1px solid ${T.border}`, padding: '10px 24px',
      fontSize: '0.7rem', color: T.textVeryFaint, textAlign: 'center',
    }}>
      GraphosCodex · workbench colaborativa de decifração · open access
    </footer>
  )
}
