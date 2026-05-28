'use client'

export default function PerfilPage() {
  return (
    <main style={{ minHeight:'100vh', background:'var(--dark)', paddingBottom:90 }}>

      {/* HEADER */}
      <div className="profile-header">
        <div style={{ position:'relative' }}>
          <div className="profile-avatar">
            ⭐
            <div className="profile-badge">CAM. 10</div>
          </div>
          <div className="profile-name">MARCUS</div>
          <div className="profile-sub">Amambaí F.C. · Meier · 1993</div>
        </div>
      </div>

      {/* STATS */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, padding:'20px 20px 0' }}>
        {[
          { val:'3°', color:'var(--green-glow)', lbl:'Ranking Geral' },
          { val:'68%', color:'var(--gold-light)', lbl:'Acertos' },
          { val:'7 ⚽', color:'var(--white)', lbl:'Artilheiro' },
        ].map(s => (
          <div key={s.lbl} style={{ background:'var(--surface)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:14, padding:'16px 10px', textAlign:'center' }}>
            <span style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:28, color:s.color, display:'block', lineHeight:1 }}>{s.val}</span>
            <span style={{ fontFamily:'Barlow Condensed,sans-serif', fontSize:10, letterSpacing:'1.5px', textTransform:'uppercase', color:'var(--text-muted)', marginTop:6, display:'block' }}>{s.lbl}</span>
          </div>
        ))}
      </div>

      <div style={{ padding:'16px 20px', display:'flex', flexDirection:'column', gap:14 }}>

        {/* ARTILHEIROS */}
        <div style={{ background:'var(--surface)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, padding:18 }}>
          <div style={{ fontFamily:'Barlow Condensed,sans-serif', fontWeight:700, fontSize:11, letterSpacing:2, textTransform:'uppercase', color:'var(--text-muted)', marginBottom:14 }}>👑 Meus Artilheiros</div>
          <div style={{ display:'flex', gap:10 }}>
            {[{flag:'🇫🇷',name:'Mbappé',gols:4},{flag:'🇧🇷',name:'Vini Jr',gols:2},{flag:'🇵🇹',name:'CR7',gols:1}].map(p => (
              <div key={p.name} style={{ flex:1, background:'var(--surface-2)', borderRadius:12, padding:'12px 8px', textAlign:'center', border:'1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize:26, display:'block', marginBottom:6 }}>{p.flag}</span>
                <span style={{ fontFamily:'Barlow Condensed,sans-serif', fontWeight:700, fontSize:13, display:'block', color:'var(--white)' }}>{p.name}</span>
                <span style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:22, color:'var(--gold-light)', display:'block' }}>{p.gols}</span>
                <span style={{ fontSize:9, color:'var(--text-muted)', letterSpacing:1 }}>GOLS</span>
              </div>
            ))}
          </div>
        </div>

        {/* TRADER */}
        <div style={{ background:'var(--surface)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, padding:18 }}>
          <div style={{ fontFamily:'Barlow Condensed,sans-serif', fontWeight:700, fontSize:11, letterSpacing:2, textTransform:'uppercase', color:'var(--text-muted)', marginBottom:14 }}>📈 Portfólio Trader</div>
          {[
            { flag:'🇧🇷', name:'Brasil', type:'Favorita · ×1.0', typeColor:'var(--gold)', pts:'18 pts' },
            { flag:'🇫🇷', name:'França', type:'Intermediária · ×1.5', typeColor:'var(--green-glow)', pts:'12 pts' },
            { flag:'🇲🇦', name:'Marrocos', type:'Zebra · ×2.0 · ❌ elim.', typeColor:'#e74c3c', pts:'0 pts' },
          ].map(t => (
            <div key={t.name} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ fontSize:24 }}>{t.flag}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:'Barlow Condensed,sans-serif', fontWeight:700, fontSize:16, color:'var(--white)' }}>{t.name}</div>
                <div style={{ fontSize:12, color:t.typeColor }}>{t.type}</div>
              </div>
              <span style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:20, color:'var(--gold-light)' }}>{t.pts}</span>
            </div>
          ))}
        </div>

        {/* BADGES */}
        <div style={{ background:'var(--surface)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, padding:18 }}>
          <div style={{ fontFamily:'Barlow Condensed,sans-serif', fontWeight:700, fontSize:11, letterSpacing:2, textTransform:'uppercase', color:'var(--text-muted)', marginBottom:14 }}>🏅 Conquistas</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>
            {[
              { emoji:'🔥', name:'3 Acertos Seguidos', locked:false },
              { emoji:'🎯', name:'Placar Exato', locked:false },
              { emoji:'🔮', name:'Vidente', locked:true },
              { emoji:'👑', name:'Rei Absoluto', locked:true },
            ].map(b => (
              <div key={b.name} style={{ background:'var(--surface-2)', borderRadius:10, padding:'10px 6px', textAlign:'center', border:'1px solid rgba(255,255,255,0.06)', opacity:b.locked?0.3:1, filter:b.locked?'grayscale(1)':'none' }}>
                <span style={{ fontSize:22, display:'block', marginBottom:4 }}>{b.emoji}</span>
                <span style={{ fontSize:9, color:'var(--text-muted)', lineHeight:1.3, display:'block' }}>{b.name}</span>
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

      <nav className="bottom-nav">
        {[{href:'/',icon:'🏠',label:'Home'},{href:'/palpites',icon:'⚽',label:'Palpites'},{href:'/ranking',icon:'📊',label:'Ranking'},{href:'/perfil',icon:'👤',label:'Perfil',active:true}].map(item=>(
          <a key={item.href} href={item.href} className={`nav-item${item.active?' active':''}`}>
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </a>
        ))}
      </nav>
    </main>
  )
}
