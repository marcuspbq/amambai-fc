'use client'

import { useEffect, useState } from 'react'

function Escudo({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="50" r="48" fill="white" stroke="#1a7a2e" strokeWidth="3"/>
      <g fill="#1a7a2e">
        <ellipse cx="18" cy="38" rx="5" ry="8" transform="rotate(-40 18 38)"/>
        <ellipse cx="13" cy="50" rx="5" ry="8" transform="rotate(-10 13 50)"/>
        <ellipse cx="16" cy="63" rx="5" ry="8" transform="rotate(20 16 63)"/>
        <ellipse cx="24" cy="74" rx="5" ry="7" transform="rotate(40 24 74)"/>
        <ellipse cx="22" cy="26" rx="4" ry="7" transform="rotate(-60 22 26)"/>
      </g>
      <g fill="#1a7a2e">
        <ellipse cx="82" cy="38" rx="5" ry="8" transform="rotate(40 82 38)"/>
        <ellipse cx="87" cy="50" rx="5" ry="8" transform="rotate(10 87 50)"/>
        <ellipse cx="84" cy="63" rx="5" ry="8" transform="rotate(-20 84 63)"/>
        <ellipse cx="76" cy="74" rx="5" ry="7" transform="rotate(-40 76 74)"/>
        <ellipse cx="78" cy="26" rx="4" ry="7" transform="rotate(60 78 26)"/>
      </g>
      <circle cx="50" cy="48" r="22" fill="white" stroke="#222" strokeWidth="1.5"/>
      <polygon points="50,30 60,37 57,50 43,50 40,37" fill="#222"/>
      <polygon points="30,44 40,37 43,50 35,57" fill="#222"/>
      <polygon points="70,44 60,37 57,50 65,57" fill="#222"/>
      <polygon points="43,68 35,57 43,50 57,50 65,57 57,68" fill="#222"/>
      <path id="a1" d="M 20,50 A 30,30 0 0,1 80,50" fill="none"/>
      <path id="a2" d="M 22,58 A 30,30 0 0,0 78,58" fill="none"/>
      <text fontFamily="Arial" fontSize="7.5" fill="#c8922a" fontWeight="bold" letterSpacing="0.5">
        <textPath href="#a1" startOffset="8%">PRAÇA AMAMBAÍ F.C.</textPath>
      </text>
      <text fontFamily="Arial" fontSize="6.5" fill="#c8922a" fontWeight="bold">
        <textPath href="#a2" startOffset="18%">MEIER · 1993</textPath>
      </text>
    </svg>
  )
}

function useCountdown(target: string) {
  const [display, setDisplay] = useState('--:--:--')
  useEffect(() => {
    const tick = () => {
      const diff = new Date(target).getTime() - Date.now()
      if (diff <= 0) { setDisplay('00:00:00'); return }
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setDisplay([h,m,s].map(v=>String(v).padStart(2,'0')).join(':'))
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [target])
  return display
}

const NEXT_MATCH_TIME = new Date(Date.now() + 14 * 3600 * 1000 + 22 * 60 * 1000).toISOString()

const RANKING_DEMO = [
  { pos: 1, emoji: '🏅', name: 'Pedro', pts: 47, detail: '12 acertos · 2 exatos', cls: 'gold' },
  { pos: 2, emoji: '🎯', name: 'Ana', pts: 42, detail: '11 acertos · 1 exato', cls: 'silver' },
  { pos: 3, emoji: '⭐', name: 'Marcus ★', pts: 38, detail: '10 acertos · 1 exato', cls: 'you' },
]

const ARTILHEIROS_DEMO = [
  { flag: '🇫🇷', name: 'Mbappé', team: 'França · Atacante', gols: 4 },
  { flag: '🇧🇷', name: 'Vinicius Jr', team: 'Brasil · Atacante', gols: 2 },
  { flag: '🇵🇹', name: 'C. Ronaldo', team: 'Portugal · Atacante', gols: 1 },
]

export default function HomePage() {
  const countdown = useCountdown(NEXT_MATCH_TIME)

  return (
    <main style={{ minHeight: '100vh', background: 'var(--dark)' }}>

      {/* HEADER */}
      <header className="app-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
          <div className="brand">
            <Escudo size={52} />
            <div>
              <div className="brand-name">AMAMBAÍ F.C.</div>
              <div className="brand-sub">Bolão Copa do Mundo</div>
            </div>
          </div>
          <div style={{ width: 40, height: 40, background: 'rgba(255,255,255,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, cursor: 'pointer', position: 'relative' }}>
            🔔
            <span style={{ position: 'absolute', top: 4, right: 4, width: 8, height: 8, background: '#c0392b', borderRadius: '50%', border: '2px solid #152018' }}/>
          </div>
        </div>

        {/* NEXT MATCH */}
        <div className="next-match-card">
          <div className="match-label">⚡ Próximo Jogo</div>
          <div className="match-teams">
            <div className="match-team">
              <span className="team-flag">🇧🇷</span>
              <span className="team-name">Brasil</span>
            </div>
            <div className="match-center">
              <span className="vs-label">VS</span>
              <span className="countdown">{countdown}</span>
              <span className="countdown-sub">para fechar</span>
            </div>
            <div className="match-team">
              <span className="team-flag">🇦🇷</span>
              <span className="team-name">Argentina</span>
            </div>
          </div>
        </div>
      </header>

      {/* BODY */}
      <div className="screen-body">

        {/* ALERT */}
        <a href="/palpites" className="alert-banner">
          <span className="alert-icon">⏰</span>
          <span className="alert-text"><strong>Você ainda não palpitou!</strong> Toque para palpitar antes do fechamento.</span>
        </a>

        {/* SUA POSIÇÃO */}
        <div>
          <div className="sec-header">
            <span className="sec-title">Sua Posição</span>
          </div>
          <div className="mini-stats">
            <a href="/ranking" className="mini-stat">
              <span className="mini-stat-icon">🏆</span>
              <span className="mini-stat-val">3°</span>
              <span className="mini-stat-lbl">Geral</span>
            </a>
            <a href="/ranking" className="mini-stat">
              <span className="mini-stat-icon">👑</span>
              <span className="mini-stat-val">1°</span>
              <span className="mini-stat-lbl">Artil.</span>
            </a>
            <a href="/ranking" className="mini-stat">
              <span className="mini-stat-icon">📈</span>
              <span className="mini-stat-val">5°</span>
              <span className="mini-stat-lbl">Trader</span>
            </a>
          </div>
        </div>

        {/* RANKING */}
        <div>
          <div className="sec-header">
            <span className="sec-title">🏆 Ranking Geral</span>
            <a href="/ranking" className="sec-link">Ver tudo →</a>
          </div>
          <div className="rank-cards">
            {RANKING_DEMO.map(r => (
              <div key={r.pos} className={`rank-card ${r.cls}`}>
                <span className="rank-pos">{r.pos}</span>
                <div className="rank-avatar">{r.emoji}</div>
                <div className="rank-info">
                  <div className="rank-name">{r.name}</div>
                  <div className="rank-detail">{r.detail}</div>
                </div>
                <span className="rank-pts">{r.pts}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ARTILHEIROS */}
        <div>
          <div className="sec-header">
            <span className="sec-title">👑 Meus Artilheiros</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {ARTILHEIROS_DEMO.map(a => (
              <div key={a.name} className="artilheiro-row">
                <span className="artilheiro-flag">{a.flag}</span>
                <div className="artilheiro-info">
                  <div className="artilheiro-name">{a.name}</div>
                  <div className="artilheiro-sub">{a.team}</div>
                </div>
                <span className="artilheiro-gols">{a.gols} ⚽</span>
              </div>
            ))}
          </div>
        </div>

        {/* CRÉDITOS */}
        <div className="dev-credit">
          <p>Desenvolvido por <a href="https://github.com/marcuspbq" target="_blank" rel="noopener noreferrer">Marcus Paulo</a></p>
          <p className="sub">Praça Amambaí F.C. · Meier · 1993</p>
        </div>

      </div>

      {/* BOTTOM NAV */}
      <nav className="bottom-nav">
        {[
          { href: '/', icon: '🏠', label: 'Home', active: true },
          { href: '/palpites', icon: '⚽', label: 'Palpites' },
          { href: '/ranking', icon: '📊', label: 'Ranking' },
          { href: '/perfil', icon: '👤', label: 'Perfil' },
        ].map(item => (
          <a key={item.href} href={item.href} className={`nav-item ${item.active ? 'active' : ''}`}>
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </a>
        ))}
      </nav>

    </main>
  )
}
