'use client'

import { useState } from 'react'
import { useRequireAuth } from '@/lib/useRequireAuth'

const JOGOS = [
  { id: 1, fase: 'Fase de Grupos · Grupo A', time: '✅ Salvo', homef: '🇩🇪', home: 'Alemanha', awayf: '🇯🇵', away: 'Japão', done: true, hp: 2, ap: 1 },
  { id: 2, fase: '🔥 Clássico · Grupo B', time: '⏰ 14h restantes', homef: '🇧🇷', home: 'Brasil', awayf: '🇦🇷', away: 'Argentina', done: false, hp: null, ap: null },
  { id: 3, fase: 'Fase de Grupos · Grupo C', time: 'Amanhã 12:00', homef: '🇫🇷', home: 'França', awayf: '🇲🇦', away: 'Marrocos', done: false, hp: null, ap: null },
]

function MatchCard({ jogo }: { jogo: typeof JOGOS[0] }) {
  const [hp, setHp] = useState<number|null>(jogo.hp)
  const [ap, setAp] = useState<number|null>(jogo.ap)
  const [picker, setPicker] = useState<'home'|'away'|null>(null)
  const [saved, setSaved] = useState(jogo.done)

  function save() {
    if (hp === null || ap === null) return
    setSaved(true)
    setPicker(null)
  }

  return (
    <div className={`palpite-card${saved ? ' done' : ''}`}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 4 }}>
        <span className="palpite-fase">{jogo.fase}</span>
        <span style={{ fontSize:12, color: saved ? 'var(--green-glow)' : jogo.id===2 ? '#e74c3c' : 'var(--text-muted)' }}>{saved ? '✅ Salvo' : jogo.time}</span>
      </div>

      <div className="palpite-teams">
        <div className="palpite-team">
          <span className="palpite-flag">{jogo.homef}</span>
          <span className="palpite-name">{jogo.home}</span>
        </div>
        <div className="score-area">
          <button className="score-btn" onClick={() => setPicker(picker==='home'?null:'home')} style={{ borderColor: picker==='home'?'var(--gold-light)':'rgba(200,146,42,0.4)' }}>
            {hp !== null ? hp : '—'}
          </button>
          <span className="score-x">×</span>
          <button className="score-btn" onClick={() => setPicker(picker==='away'?null:'away')} style={{ borderColor: picker==='away'?'var(--gold-light)':'rgba(200,146,42,0.4)' }}>
            {ap !== null ? ap : '—'}
          </button>
        </div>
        <div className="palpite-team">
          <span className="palpite-flag">{jogo.awayf}</span>
          <span className="palpite-name">{jogo.away}</span>
        </div>
      </div>

      {picker && (
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontFamily:'Barlow Condensed,sans-serif', fontSize:11, letterSpacing:2, color:'var(--text-muted)', textAlign:'center', marginBottom:10, textTransform:'uppercase' }}>
            {picker==='home' ? jogo.home : jogo.away} — gols
          </p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:8 }}>
            {[0,1,2,3,4,5,6,7,8,9].map(n => {
              const cur = picker==='home' ? hp : ap
              return (
                <button key={n} onClick={() => { picker==='home'?setHp(n):setAp(n); setPicker(null) }}
                  style={{ background: cur===n?'var(--gold)':'var(--surface-2)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, height:52, fontFamily:'Bebas Neue,sans-serif', fontSize:26, color: cur===n?'var(--dark)':'white', cursor:'pointer', transition:'all 0.15s' }}>
                  {n}
                </button>
              )
            })}
          </div>
        </div>
      )}

      <button className={`btn-save${saved?' saved':''}`} onClick={save}>
        {saved ? '✓ Palpite Salvo' : 'Salvar Palpite'}
      </button>
    </div>
  )
}

export default function PalpitesPage() {
  const { loading } = useRequireAuth()
  if (loading) return null

  return (
    <main style={{ minHeight:'100vh', background:'var(--dark)', paddingBottom: 90 }}>
      <header className="app-header">
        <div style={{ position:'relative' }}>
          <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:36, letterSpacing:3 }}>⚽ Palpites</div>
          <div style={{ fontFamily:'Barlow Condensed,sans-serif', fontSize:13, color:'var(--gold-light)', letterSpacing:1, marginTop:4 }}>Fecha 30 minutos antes do apito</div>
        </div>
      </header>
      <div style={{ padding:'20px 20px 0' }}>
        {JOGOS.map(j => <MatchCard key={j.id} jogo={j} />)}
      </div>
      <nav className="bottom-nav">
        {[{href:'/',icon:'🏠',label:'Home'},{href:'/palpites',icon:'⚽',label:'Palpites',active:true},{href:'/ranking',icon:'📊',label:'Ranking'},{href:'/perfil',icon:'👤',label:'Perfil'}].map(item=>(
          <a key={item.href} href={item.href} className={`nav-item${item.active?' active':''}`}>
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </a>
        ))}
      </nav>
    </main>
  )
}
