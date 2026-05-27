'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { formatCountdown, isPredictionOpen } from '@/lib/scoring'
import type { Match, RankingEntry, DraftPlayer } from '@/types'

// ── Escudo SVG ────────────────────────────────────
function Escudo({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="50" r="48" fill="white" stroke="#1a7a2e" strokeWidth="3" />
      <g fill="#1a7a2e">
        <ellipse cx="18" cy="38" rx="5" ry="8" transform="rotate(-40 18 38)" />
        <ellipse cx="13" cy="50" rx="5" ry="8" transform="rotate(-10 13 50)" />
        <ellipse cx="16" cy="63" rx="5" ry="8" transform="rotate(20 16 63)" />
        <ellipse cx="24" cy="74" rx="5" ry="7" transform="rotate(40 24 74)" />
        <ellipse cx="22" cy="26" rx="4" ry="7" transform="rotate(-60 22 26)" />
      </g>
      <g fill="#1a7a2e">
        <ellipse cx="82" cy="38" rx="5" ry="8" transform="rotate(40 82 38)" />
        <ellipse cx="87" cy="50" rx="5" ry="8" transform="rotate(10 87 50)" />
        <ellipse cx="84" cy="63" rx="5" ry="8" transform="rotate(-20 84 63)" />
        <ellipse cx="76" cy="74" rx="5" ry="7" transform="rotate(-40 76 74)" />
        <ellipse cx="78" cy="26" rx="4" ry="7" transform="rotate(60 78 26)" />
      </g>
      <circle cx="50" cy="48" r="22" fill="white" stroke="#222" strokeWidth="1.5" />
      <polygon points="50,30 60,37 57,50 43,50 40,37" fill="#222" />
      <polygon points="30,44 40,37 43,50 35,57" fill="#222" />
      <polygon points="70,44 60,37 57,50 65,57" fill="#222" />
      <polygon points="43,68 35,57 43,50 57,50 65,57 57,68" fill="#222" />
      <path id="topArc" d="M 20,50 A 30,30 0 0,1 80,50" fill="none" />
      <path id="botArc" d="M 22,58 A 30,30 0 0,0 78,58" fill="none" />
      <text fontFamily="Arial" fontSize="7.5" fill="#c8922a" fontWeight="bold" letterSpacing="0.5">
        <textPath href="#topArc" startOffset="8%">PRAÇA AMAMBAÍ F.C.</textPath>
      </text>
      <text fontFamily="Arial" fontSize="6.5" fill="#c8922a" fontWeight="bold">
        <textPath href="#botArc" startOffset="18%">MEIER · 1993</textPath>
      </text>
    </svg>
  )
}

// ── Countdown hook ────────────────────────────────
function useCountdown(target: string | null) {
  const [display, setDisplay] = useState('--:--:--')

  useEffect(() => {
    if (!target) return
    const tick = () => setDisplay(formatCountdown(target))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [target])

  return display
}

// ── Componente principal ──────────────────────────
export default function HomePage() {
  const supabase = createClient()
  const [nextMatch, setNextMatch] = useState<Match | null>(null)
  const [ranking, setRanking] = useState<RankingEntry[]>([])
  const [myPlayers, setMyPlayers] = useState<DraftPlayer[]>([])
  const [hasPendingPrediction, setHasPendingPrediction] = useState(false)
  const countdown = useCountdown(nextMatch?.kickoff_at ?? null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Próximo jogo
      const { data: matches } = await supabase
        .from('matches')
        .select('*')
        .eq('status', 'SCHEDULED')
        .order('kickoff_at', { ascending: true })
        .limit(1)

      if (matches?.[0]) {
        setNextMatch(matches[0])
        setHasPendingPrediction(isPredictionOpen(matches[0].kickoff_at))
      }

      // Ranking top 3
      const { data: members } = await supabase
        .from('pool_members')
        .select('*, user:users(nickname, avatar_emoji)')
        .order('score_general', { ascending: false })
        .limit(3)

      if (members) setRanking(members as unknown as RankingEntry[])

      // Meus artilheiros
      const { data: players } = await supabase
        .from('draft_players')
        .select('*')
        .eq('owner_id', user.id)
        .order('goals', { ascending: false })

      if (players) setMyPlayers(players as DraftPlayer[])
    }

    load()

    // Realtime: ranking
    const channel = supabase
      .channel('ranking-updates')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'pool_members' }, load)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  return (
    <main className="min-h-screen" style={{ background: 'var(--dark)' }}>

      {/* ── Header ── */}
      <header
        className="relative overflow-hidden px-5 py-6"
        style={{
          background: 'linear-gradient(180deg, var(--green) 0%, var(--dark-2) 100%)',
        }}
      >
        {/* diagonal stripes */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'repeating-linear-gradient(-45deg,transparent,transparent 20px,rgba(255,255,255,0.02) 20px,rgba(255,255,255,0.02) 21px)',
          }}
        />

        {/* brand */}
        <div className="relative flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <Escudo size={48} />
            <div>
              <h1
                className="text-xl tracking-widest leading-none"
                style={{ fontFamily: 'var(--font-bebas)' }}
              >
                AMAMBAÍ F.C.
              </h1>
              <p className="text-xs tracking-widest" style={{ color: 'var(--gold-light)' }}>
                BOLÃO COPA DO MUNDO
              </p>
            </div>
          </div>

          <a href="/perfil" className="relative">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-lg"
              style={{ background: 'rgba(255,255,255,0.1)' }}
            >
              🔔
            </div>
            <span
              className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full border-2"
              style={{
                background: '#c0392b',
                borderColor: 'var(--dark-2)',
              }}
            />
          </a>
        </div>

        {/* next match */}
        {nextMatch && (
          <div
            className="relative rounded-2xl p-4"
            style={{
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(200,146,42,0.3)',
            }}
          >
            <p
              className="text-xs tracking-widest mb-3"
              style={{ fontFamily: 'var(--font-condensed)', color: 'var(--gold-light)' }}
            >
              ⚡ PRÓXIMO JOGO
            </p>
            <div className="flex items-center justify-between">
              <div className="flex-1 flex flex-col items-center gap-1">
                <span className="text-4xl">{nextMatch.home_team_flag}</span>
                <span
                  className="text-xs tracking-wider"
                  style={{ fontFamily: 'var(--font-condensed)', fontWeight: 700 }}
                >
                  {nextMatch.home_team.toUpperCase()}
                </span>
              </div>

              <div className="flex flex-col items-center px-3">
                <span
                  className="text-xs tracking-widest mb-1"
                  style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-condensed)' }}
                >
                  VS
                </span>
                <span
                  className="text-3xl leading-none"
                  style={{ fontFamily: 'var(--font-bebas)', color: 'var(--gold-light)', letterSpacing: 2 }}
                >
                  {countdown}
                </span>
                <span className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  para fechar
                </span>
              </div>

              <div className="flex-1 flex flex-col items-center gap-1">
                <span className="text-4xl">{nextMatch.away_team_flag}</span>
                <span
                  className="text-xs tracking-wider"
                  style={{ fontFamily: 'var(--font-condensed)', fontWeight: 700 }}
                >
                  {nextMatch.away_team.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        )}
      </header>

      <div className="p-4 flex flex-col gap-4">

        {/* alerta de palpite pendente */}
        {hasPendingPrediction && (
          <a href="/palpites">
            <div
              className="rounded-xl p-3 flex items-center gap-3"
              style={{
                background: 'rgba(192,57,43,0.15)',
                border: '1px solid rgba(192,57,43,0.5)',
                animation: 'pulse-border 2s ease-in-out infinite',
              }}
            >
              <span className="text-xl">⏰</span>
              <p className="text-sm font-medium" style={{ color: '#f0a090', lineHeight: 1.4 }}>
                <strong>Você ainda não palpitou!</strong> Toque para palpitar antes do fechamento.
              </p>
            </div>
          </a>
        )}

        {/* mini stats da posição */}
        <div>
          <p
            className="text-xs tracking-widest mb-2"
            style={{ fontFamily: 'var(--font-condensed)', color: 'var(--text-muted)' }}
          >
            SUA POSIÇÃO
          </p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: '🏆', label: 'Geral', val: '3°' },
              { icon: '👑', label: 'Artil.', val: '1°' },
              { icon: '📈', label: 'Trader', val: '5°' },
            ].map((s) => (
              <a href="/ranking" key={s.label}>
                <div
                  className="rounded-xl p-3 text-center"
                  style={{ background: 'var(--surface)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <span className="text-xl block mb-1">{s.icon}</span>
                  <span
                    className="text-2xl block leading-none"
                    style={{ fontFamily: 'var(--font-bebas)' }}
                  >
                    {s.val}
                  </span>
                  <span className="text-xs block mt-1" style={{ color: 'var(--text-muted)' }}>
                    {s.label}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* ranking top 3 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p
              className="text-xs tracking-widest"
              style={{ fontFamily: 'var(--font-condensed)', color: 'var(--text-muted)' }}
            >
              🏆 RANKING GERAL
            </p>
            <a href="/ranking" className="text-xs font-semibold" style={{ color: 'var(--gold)' }}>
              Ver tudo →
            </a>
          </div>
          <div className="flex flex-col gap-2">
            {ranking.map((entry, i) => (
              <div
                key={entry.member_id}
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
                    color: i === 0 ? 'var(--gold-light)' : i === 1 ? '#ccc' : '#cd7f32',
                  }}
                >
                  {i + 1}
                </span>
                <span className="text-2xl">{entry.avatar_emoji}</span>
                <div className="flex-1">
                  <p className="font-bold text-sm" style={{ fontFamily: 'var(--font-condensed)' }}>
                    {entry.nickname}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {entry.score_general} pts
                  </p>
                </div>
                <span
                  className="text-2xl"
                  style={{
                    fontFamily: 'var(--font-bebas)',
                    color: i === 0 ? 'var(--gold-light)' : 'white',
                  }}
                >
                  {entry.score_general}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* meus artilheiros */}
        {myPlayers.length > 0 && (
          <div>
            <p
              className="text-xs tracking-widest mb-2"
              style={{ fontFamily: 'var(--font-condensed)', color: 'var(--text-muted)' }}
            >
              👑 MEUS ARTILHEIROS
            </p>
            <div className="flex flex-col gap-2">
              {myPlayers.map((p) => (
                <div
                  key={p.id}
                  className="rounded-xl p-3 flex items-center gap-3"
                  style={{ background: 'var(--surface)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <span className="text-2xl">{p.team_flag}</span>
                  <div className="flex-1">
                    <p className="font-bold text-sm" style={{ fontFamily: 'var(--font-condensed)' }}>
                      {p.player_name}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{p.team}</p>
                  </div>
                  <span className="text-xl" style={{ fontFamily: 'var(--font-bebas)', color: 'var(--gold-light)' }}>
                    {p.goals} ⚽
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* créditos */}
        <div className="text-center py-4 mt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Desenvolvido por{' '}
            <a
              href="https://github.com/marcuspbq"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold"
              style={{ color: 'var(--gold-light)' }}
            >
              Marcus Paulo
            </a>
          </p>
          <p className="text-xs mt-1" style={{ color: 'rgba(122,158,126,0.5)', letterSpacing: '1px', fontFamily: 'var(--font-condensed)' }}>
            PRAÇA AMAMBAÍ F.C. · MEIER · 1993
          </p>
        </div>

      </div>

      {/* ── Bottom Nav ── */}
      <nav
        className="fixed bottom-0 left-0 right-0 flex items-center justify-around px-2 pb-2 pt-1"
        style={{
          background: 'var(--dark-2)',
          borderTop: '1px solid var(--border)',
          height: 64,
        }}
      >
        {[
          { href: '/', icon: '🏠', label: 'Home', active: true },
          { href: '/palpites', icon: '⚽', label: 'Palpites' },
          { href: '/ranking', icon: '📊', label: 'Ranking' },
          { href: '/perfil', icon: '👤', label: 'Perfil' },
        ].map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-1 px-3 py-1 rounded-xl"
          >
            <span className={`text-xl ${item.active ? 'scale-110' : ''}`}>{item.icon}</span>
            <span
              className="text-xs tracking-wider"
              style={{
                fontFamily: 'var(--font-condensed)',
                color: item.active ? 'var(--gold-light)' : 'var(--text-muted)',
              }}
            >
              {item.label.toUpperCase()}
            </span>
          </a>
        ))}
      </nav>

    </main>
  )
}
