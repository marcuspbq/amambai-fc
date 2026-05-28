'use client'

import { useState } from 'react'

const GERAL = [
  { pos:1, emoji:'🏅', name:'Pedro', pts:47, detail:'12 acertos · 2 exatos', cls:'gold', trend:'—' },
  { pos:2, emoji:'🎯', name:'Ana', pts:42, detail:'11 acertos · 1 exato', cls:'silver', trend:'↑' },
  { pos:3, emoji:'⭐', name:'Marcus ★', pts:38, detail:'10 acertos · 1 exato', cls:'you', trend:'↑' },
  { pos:4, emoji:'🦁', name:'Carlos', pts:31, detail:'9 acertos · 0 exatos', cls:'', trend:'↓' },
  { pos:5, emoji:'🦊', name:'Julia', pts:28, detail:'8 acertos · 1 exato', cls:'', trend:'—' },
  { pos:6, emoji:'🐉', name:'Rafael', pts:22, detail:'7 acertos · 0 exatos', cls:'', trend:'—' },
]

const ARTIL = [
  { pos:1, flag:'🇫🇷', name:'Mbappé', team:'França', owner:'⭐ Marcus', gols:4 },
  { pos:2, flag:'🇵🇹', name:'C. Ronaldo', team:'Portugal', owner:'🏅 Pedro', gols:3 },
  { pos:3, flag:'🇧🇷', name:'Vinicius Jr', team:'Brasil', owner:'⭐ Marcus', gols:2 },
  { pos:4, flag:'🇩🇪', name:'Müller', team:'Alemanha', owner:'🎯 Ana', gols:2 },
  { pos:5, flag:'🇦🇷', name:'Di María', team:'Argentina', owner:'🦁 Carlos', gols:1 },
]

const TRADER = [
  { pos:1, emoji:'🎯', name:'Ana', pts:44, picks:'🇩🇪×1 · 🇭🇷×1.5 · 🇲🇦×2' },
  { pos:2, emoji:'🦁', name:'Carlos', pts:38, picks:'🇫🇷×1 · 🇵🇹×1.5 · 🇯🇵×2' },
  { pos:3, emoji:'🏅', name:'Pedro', pts:32, picks:'🇪🇸×1 · 🇳🇱×1.5 · 🇸🇳×2' },
  { pos:4, emoji:'🦊', name:'Julia', pts:29, picks:'🇦🇷×1 · 🇺🇾×1.5 · 🇬🇭×2' },
  { pos:5, emoji:'⭐', name:'Marcus ★', pts:22, picks:'🇧🇷×1 · 🇫🇷×1.5 · 🇲🇦❌×2' },
]

export default function RankingPage() {
  const [tab, setTab] = useState<'geral'|'artil'|'trader'>('geral')

  return (
    <main style={{ minHeight:'100vh', background:'var(--dark)', paddingBottom:90 }}>
      <header className="app-header">
        <div style={{ position:'relative' }}>
          <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:36, letterSpacing:3 }}>📊 Rankings</div>
          <div style={{ fontFamily:'Barlow Condensed,sans-serif', fontSize:13, color:'var(--text-muted)', letterSpacing:1, marginTop:4 }}>Atualizado em tempo real</div>
        </div>
      </header>

      {/* TABS */}
      <div className="rank-tabs">
        {(['geral','artil','trader'] as const).map(t => (
          <button key={t} className={`rank-tab${tab===t?' active':''}`} onClick={()=>setTab(t)}>
            {t==='geral'?'🏆 Geral':t==='artil'?'👑 Artil.':'📈 Trader'}
          </button>
        ))}
      </div>

      <div style={{ padding:'16px 20px' }}>

        {/* GERAL */}
        {tab==='geral' && (
          <div className="rank-cards">
            {GERAL.map(r => (
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
        )}

        {/* ARTILHEIROS */}
        {tab==='artil' && (
          <div className="rank-cards">
            {ARTIL.map(a => (
              <div key={a.pos} className={`rank-card${a.pos===1?' gold':''}`}>
                <span className="rank-pos">{a.pos}</span>
                <span style={{ fontSize:32 }}>{a.flag}</span>
                <div className="rank-info">
                  <div className="rank-name">{a.name}</div>
                  <div className="rank-detail">{a.team} · {a.owner}</div>
                </div>
                <span className="rank-pts">{a.gols} ⚽</span>
              </div>
            ))}
          </div>
        )}

        {/* TRADER */}
        {tab==='trader' && (
          <div className="rank-cards">
            {TRADER.map(t => (
              <div key={t.pos} className={`rank-card${t.pos===1?' gold':''}${t.name.includes('Marcus')?' you':''}`} style={{ flexDirection:'column', alignItems:'flex-start', gap:8 }}>
                <div style={{ display:'flex', alignItems:'center', gap:14, width:'100%' }}>
                  <span className="rank-pos">{t.pos}</span>
                  <div className="rank-avatar">{t.emoji}</div>
                  <div className="rank-info">
                    <div className="rank-name">{t.name}</div>
                  </div>
                  <span className="rank-pts">{t.pts} pts</span>
                </div>
                <div style={{ marginLeft:56, fontSize:13, color:'var(--text-muted)', fontFamily:'Barlow Condensed,sans-serif', letterSpacing:0.5 }}>{t.picks}</div>
              </div>
            ))}
          </div>
        )}

      </div>

      <nav className="bottom-nav">
        {[{href:'/',icon:'🏠',label:'Home'},{href:'/palpites',icon:'⚽',label:'Palpites'},{href:'/ranking',icon:'📊',label:'Ranking',active:true},{href:'/perfil',icon:'👤',label:'Perfil'}].map(item=>(
          <a key={item.href} href={item.href} className={`nav-item${item.active?' active':''}`}>
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </a>
        ))}
      </nav>
    </main>
  )
}
