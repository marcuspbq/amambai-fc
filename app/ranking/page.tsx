'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

type Tab = 'geral' | 'artilheiro' | 'trader'

interface MemberRow {
  id: string
  nickname: string
  avatar_emoji: string
  score_general: number
  score_artilheiro: number
  score_trader: number
  exact_predictions: number
  predictions_count: number
}

interface ArtilheiroRow {
  player_name: string
  team: string
  team_flag: string
  goals: number
  owner_nickname: string
  owner_avatar: string
}

interface TraderRow {
  nickname: string
  avatar_emoji: string
  score_trader: number
  picks: { team_name: string; team_flag: string; pick_type: string; total_pts: number; eliminated: boolean }[]
}

export default function RankingPage() {
  const supabase = createClient()
  const [tab, setTab] = useState<Tab>('geral')
  const [members, setMembers] = useState<MemberRow[]>([])
  const [artilheiros, setArtilheiros] = useState<ArtilheiroRow[]>([])
  const [traders, setTraders] = useState<TraderRow[]>([])
  const [myId, setMyId] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Geral
      const { data: memberData } = await supabase
        .from('pool_members')
        .select('id, score_general, score_artilheiro, score_trader, exact_predictions, predictions_count, user:users(nickname, avatar_emoji)')
        .order('score_general', { ascending: false })

      if (memberData) {
        const rows = memberData.map((m: Record<string, unknown>) => {
          const u = m.user as { nickname: string; avatar_emoji: string }
          return {
            id: m.id as string,
            nickname: u.nickname,
            avatar_emoji: u.avatar_emoji,
            score_general: m.score_general as number,
            score_artilheiro: m.score_artilheiro as number,
            score_trader: m.score_trader as number,
            exact_predictions: m.exact_predictions as number,
            predictions_count: m.predictions_count as number,
          }
        })
        setMembers(rows)
        const me = rows.find(r => r.id === user.id)
        if (me) setMyId(me.id)
      }

      // Artilheiros
      const { data: playerData } = await supabase
        .from('draft_players')
        .select('player_name, team, team_flag, goals, owner:pool_members(user:users(nickname, avatar_emoji))')
        .order('goals', { ascending: false })

      if (playerData) {
        const rows = playerData.map((p: Record<string, unknown>) => {
          const owner = (p.owner as Record<string, unknown>)?.user as { nickname: string; avatar_emoji: string } | null
          return {
            player_name: p.player_name as string,
            team: p.team as string,
            team_flag: p.team_flag as string,
            goals: p.goals as number,
            owner_nickname: owner?.nickname ?? '—',
            owner_avatar: owner?.avatar_emoji ?? '👤',
          }
        })
        setArtilheiros(rows)
      }

      // Trader
      const { data: traderData } = await supabase
        .from('pool_members')
        .select('score_trader, user:users(nickname, avatar_emoji), trader_picks(*)')
        .order('score_trader', { ascending: false })

      if (traderData) {
        const rows = traderData.map((m: Record<string, unknown>) => {
          const u = m.user as { nickname: string; avatar_emoji: string }
          return {
            nickname: u.nickname,
            avatar_emoji: u.avatar_emoji,
            score_trader: m.score_trader as number,
            picks: (m.trader_picks as Record<string, unknown>[]) ?? [],
          }
        })
        setTraders(rows as TraderRow[])
      }
    }

    load()

    // Realtime updates
    const channel = supabase
      .channel('ranking-live')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'pool_members' }, load)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'draft_players' }, load)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'geral', label: 'Geral', icon: '🏆' },
    { key: 'artilheiro', label: 'Artil.', icon: '👑' },
    { key: 'trader', label: 'Trader', icon: '📈' },
  ]

  return (
    <main className="min-h-screen pb-20" style={{ background: 'var(--dark)' }}>

      <header
        className="px-5 py-5"
        style={{ background: 'linear-gradient(180deg, var(--green) 0%, var(--dark-2) 100%)' }}
      >
        <h1 className="text-3xl tracking-widest" style={{ fontFamily: 'var(--font-bebas)' }}>
          📊 Rankings
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Atualizado em tempo real
        </p>
      </header>

      {/* tabs */}
      <div className="flex gap-2 px-4 pt-4">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="flex-1 rounded-xl py-2 text-xs tracking-widest font-bold transition-all active:scale-95"
            style={{
              fontFamily: 'var(--font-condensed)',
              background: tab === t.key ? 'var(--green)' : 'var(--surface)',
              border: tab === t.key ? 'none' : '1px solid rgba(255,255,255,0.06)',
              color: tab === t.key ? 'white' : 'var(--text-muted)',
            }}
          >
            {t.icon} {t.label.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="p-4 flex flex-col gap-2">

        {/* ── GERAL ── */}
        {tab === 'geral' && members.map((m, i) => (
          <div
            key={m.id}
            className="rounded-xl p-3 flex items-center gap-3"
            style={{
              background: m.id === myId
                ? 'rgba(46,204,90,0.06)'
                : i === 0 ? 'rgba(200,146,42,0.08)' : 'var(--surface)',
              border: m.id === myId
                ? '1px solid rgba(46,204,90,0.2)'
                : i === 0 ? '1px solid rgba(200,146,42,0.25)' : '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <span
              className="text-xl min-w-6 text-center"
              style={{
                fontFamily: 'var(--font-bebas)',
                color: i === 0 ? 'var(--gold-light)' : i === 1 ? '#ccc' : i === 2 ? '#cd7f32' : 'var(--text-muted)',
              }}
            >
              {i + 1}
            </span>
            <span className="text-2xl">{m.avatar_emoji}</span>
            <div className="flex-1">
              <p className="font-bold text-sm" style={{ fontFamily: 'var(--font-condensed)' }}>
                {m.nickname} {m.id === myId ? '★' : ''}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {m.predictions_count} palpites · {m.exact_predictions} exatos
              </p>
            </div>
            <span
              className="text-2xl"
              style={{
                fontFamily: 'var(--font-bebas)',
                color: m.id === myId ? 'var(--green-glow)' : i === 0 ? 'var(--gold-light)' : 'white',
              }}
            >
              {m.score_general}
            </span>
          </div>
        ))}

        {/* ── ARTILHEIRO ── */}
        {tab === 'artilheiro' && artilheiros.map((p, i) => (
          <div
            key={`${p.player_name}-${i}`}
            className="rounded-xl p-3 flex items-center gap-3"
            style={{
              background: i === 0 ? 'rgba(200,146,42,0.08)' : 'var(--surface)',
              border: i === 0 ? '1px solid rgba(200,146,42,0.25)' : '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <span
              className="text-xl min-w-6 text-center"
              style={{
                fontFamily: 'var(--font-bebas)',
                color: i === 0 ? 'var(--gold-light)' : 'var(--text-muted)',
              }}
            >
              {i + 1}
            </span>
            <span className="text-3xl">{p.team_flag}</span>
            <div className="flex-1">
              <p className="font-bold text-sm" style={{ fontFamily: 'var(--font-condensed)' }}>
                {p.player_name}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {p.team} · escolhido por {p.owner_avatar} {p.owner_nickname}
              </p>
            </div>
            <span
              className="text-2xl"
              style={{ fontFamily: 'var(--font-bebas)', color: 'var(--gold-light)' }}
            >
              {p.goals} ⚽
            </span>
          </div>
        ))}

        {/* ── TRADER ── */}
        {tab === 'trader' && traders.map((t, i) => (
          <div
            key={`${t.nickname}-${i}`}
            className="rounded-xl p-3"
            style={{
              background: i === 0 ? 'rgba(200,146,42,0.08)' : 'var(--surface)',
              border: i === 0 ? '1px solid rgba(200,146,42,0.25)' : '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xl min-w-6 text-center" style={{ fontFamily: 'var(--font-bebas)', color: i === 0 ? 'var(--gold-light)' : 'var(--text-muted)' }}>{i + 1}</span>
              <span className="text-2xl">{t.avatar_emoji}</span>
              <div className="flex-1">
                <p className="font-bold text-sm" style={{ fontFamily: 'var(--font-condensed)' }}>{t.nickname}</p>
              </div>
              <span className="text-2xl" style={{ fontFamily: 'var(--font-bebas)', color: i === 0 ? 'var(--gold-light)' : 'white' }}>
                {t.score_trader.toFixed(0)} pts
              </span>
            </div>
            <div className="flex gap-2 ml-9 flex-wrap">
              {t.picks.map((pick, pi) => (
                <span
                  key={pi}
                  className="text-xs px-2 py-1 rounded-lg"
                  style={{
                    background: 'var(--surface-2)',
                    color: pick.eliminated ? '#e74c3c' : 'var(--text-muted)',
                    fontFamily: 'var(--font-condensed)',
                  }}
                >
                  {pick.team_flag} {pick.team_name}
                  {pick.pick_type === 'wildcard' && ' 🎲'}
                  {pick.pick_type === 'favorite' && ' ⭐'}
                  {pick.eliminated && ' ❌'}
                </span>
              ))}
            </div>
          </div>
        ))}

      </div>

      {/* Bottom Nav */}
      <nav
        className="fixed bottom-0 left-0 right-0 flex items-center justify-around px-2 pb-2 pt-1"
        style={{ background: 'var(--dark-2)', borderTop: '1px solid var(--border)', height: 64 }}
      >
        {[
          { href: '/', icon: '🏠', label: 'Home', key: 'home' },
          { href: '/palpites', icon: '⚽', label: 'Palpites', key: 'palpites' },
          { href: '/ranking', icon: '📊', label: 'Ranking', key: 'ranking' },
          { href: '/perfil', icon: '👤', label: 'Perfil', key: 'perfil' },
        ].map(item => (
          <a key={item.key} href={item.href} className="flex flex-col items-center gap-1 px-3 py-1 rounded-xl">
            <span className={`text-xl ${item.key === 'ranking' ? 'scale-110' : ''}`}>{item.icon}</span>
            <span className="text-xs tracking-wider" style={{ fontFamily: 'var(--font-condensed)', color: item.key === 'ranking' ? 'var(--gold-light)' : 'var(--text-muted)' }}>
              {item.label.toUpperCase()}
            </span>
          </a>
        ))}
      </nav>

    </main>
  )
}
