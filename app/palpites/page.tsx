'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { isPredictionOpen } from '@/lib/scoring'
import type { Match, Prediction } from '@/types'

export default function PalpitesPage() {
  const supabase = createClient()
  const [matches, setMatches] = useState<Match[]>([])
  const [predictions, setPredictions] = useState<Record<string, Prediction>>({})
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<Set<string>>(new Set())

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Jogos abertos para palpite
      const { data: matchData } = await supabase
        .from('matches')
        .select('*')
        .eq('status', 'SCHEDULED')
        .order('kickoff_at', { ascending: true })

      if (matchData) setMatches(matchData as Match[])

      // Palpites já feitos
      const { data: predData } = await supabase
        .from('predictions')
        .select('*')
        .in('match_id', matchData?.map(m => m.id) ?? [])

      if (predData) {
        const map: Record<string, Prediction> = {}
        predData.forEach((p) => { map[p.match_id] = p as Prediction })
        setPredictions(map)
      }
    }
    load()
  }, [])

  async function savePrediction(matchId: string, home: number, away: number) {
    setSaving(matchId)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Busca o member_id do usuário neste pool
    const { data: member } = await supabase
      .from('pool_members')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!member) return

    const payload = {
      member_id: member.id,
      match_id: matchId,
      home_pred: home,
      away_pred: away,
      points_earned: 0,
    }

    await supabase
      .from('predictions')
      .upsert(payload, { onConflict: 'member_id,match_id' })

    setSaved(prev => new Set([...prev, matchId]))
    setSaving(null)
  }

  return (
    <main className="min-h-screen pb-20" style={{ background: 'var(--dark)' }}>

      {/* header */}
      <header
        className="px-5 py-5"
        style={{ background: 'linear-gradient(180deg, var(--green) 0%, var(--dark-2) 100%)' }}
      >
        <h1
          className="text-3xl tracking-widest"
          style={{ fontFamily: 'var(--font-bebas)' }}
        >
          ⚽ Palpites
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--gold-light)' }}>
          Fecha 30 minutos antes do apito
        </p>
      </header>

      <div className="p-4 flex flex-col gap-3">
        {matches.length === 0 && (
          <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
            <p className="text-4xl mb-3">🏁</p>
            <p className="font-semibold">Nenhum jogo aberto para palpitar</p>
            <p className="text-sm mt-1">Volte antes do próximo jogo!</p>
          </div>
        )}

        {matches.map((match) => {
          const isOpen = isPredictionOpen(match.kickoff_at)
          const existing = predictions[match.id]
          const isSaved = saved.has(match.id) || !!existing
          const isSaving = saving === match.id

          return (
            <MatchCard
              key={match.id}
              match={match}
              existing={existing}
              isOpen={isOpen}
              isSaved={isSaved}
              isSaving={isSaving}
              onSave={(home, away) => savePrediction(match.id, home, away)}
            />
          )
        })}
      </div>

      {/* Bottom Nav */}
      <BottomNav active="palpites" />
    </main>
  )
}

// ── Match Card ────────────────────────────────────
function MatchCard({
  match, existing, isOpen, isSaved, isSaving, onSave,
}: {
  match: Match
  existing?: Prediction
  isOpen: boolean
  isSaved: boolean
  isSaving: boolean
  onSave: (home: number, away: number) => void
}) {
  const [home, setHome] = useState<number | null>(existing?.home_pred ?? null)
  const [away, setAway] = useState<number | null>(existing?.away_pred ?? null)
  const [picker, setPicker] = useState<'home' | 'away' | null>(null)

  const kickoff = new Date(match.kickoff_at)
  const timeStr = kickoff.toLocaleString('pt-BR', {
    weekday: 'short', day: '2-digit', month: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })

  function handleSave() {
    if (home === null || away === null) return
    onSave(home, away)
  }

  return (
    <div
      className="rounded-2xl p-4 relative"
      style={{
        background: isSaved ? 'rgba(46,204,90,0.04)' : 'var(--surface)',
        border: isSaved
          ? '1px solid rgba(46,204,90,0.3)'
          : '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* header */}
      <div className="flex items-center justify-between mb-4">
        <span
          className="text-xs tracking-wider font-semibold"
          style={{ fontFamily: 'var(--font-condensed)', color: 'var(--gold)' }}
        >
          {match.stage.replace('_', ' ')} · {match.group || ''}
        </span>
        <span className="text-xs" style={{ color: isOpen ? 'var(--text-muted)' : '#e74c3c' }}>
          {isSaved ? '✅ Salvo' : isOpen ? timeStr : '🔒 Fechado'}
        </span>
      </div>

      {/* teams & score */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 flex flex-col items-center gap-2">
          <span className="text-5xl">{match.home_team_flag}</span>
          <span
            className="text-xs tracking-wide font-bold text-center"
            style={{ fontFamily: 'var(--font-condensed)' }}
          >
            {match.home_team.toUpperCase()}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <ScoreButton
            value={home}
            disabled={!isOpen}
            active={picker === 'home'}
            onClick={() => isOpen && setPicker(picker === 'home' ? null : 'home')}
          />
          <span style={{ fontFamily: 'var(--font-bebas)', fontSize: 20, color: 'var(--text-muted)' }}>
            ×
          </span>
          <ScoreButton
            value={away}
            disabled={!isOpen}
            active={picker === 'away'}
            onClick={() => isOpen && setPicker(picker === 'away' ? null : 'away')}
          />
        </div>

        <div className="flex-1 flex flex-col items-center gap-2">
          <span className="text-5xl">{match.away_team_flag}</span>
          <span
            className="text-xs tracking-wide font-bold text-center"
            style={{ fontFamily: 'var(--font-condensed)' }}
          >
            {match.away_team.toUpperCase()}
          </span>
        </div>
      </div>

      {/* picker */}
      {picker && (
        <div className="mt-4">
          <p className="text-xs text-center mb-3" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-condensed)', letterSpacing: 2 }}>
            {picker === 'home' ? match.home_team.toUpperCase() : match.away_team.toUpperCase()} — gols
          </p>
          <div className="grid grid-cols-5 gap-2">
            {[0,1,2,3,4,5,6,7,8,9].map(n => (
              <button
                key={n}
                onClick={() => {
                  if (picker === 'home') setHome(n)
                  else setAway(n)
                  setPicker(null)
                }}
                className="rounded-xl h-12 flex items-center justify-center transition-all active:scale-90"
                style={{
                  background: (picker === 'home' ? home : away) === n
                    ? 'var(--gold)'
                    : 'var(--surface-2)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  fontFamily: 'var(--font-bebas)',
                  fontSize: 24,
                  color: (picker === 'home' ? home : away) === n ? 'var(--dark)' : 'white',
                }}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* save button */}
      {isOpen && (
        <button
          onClick={handleSave}
          disabled={home === null || away === null || isSaving}
          className="w-full mt-4 rounded-xl py-3 font-bold tracking-widest transition-all active:scale-95"
          style={{
            fontFamily: 'var(--font-condensed)',
            fontSize: 14,
            background: isSaved
              ? 'rgba(46,204,90,0.12)'
              : home !== null && away !== null
              ? 'var(--green)'
              : 'rgba(255,255,255,0.05)',
            color: isSaved ? 'var(--green-glow)' : 'white',
            border: isSaved ? '1px solid rgba(46,204,90,0.3)' : 'none',
            opacity: home === null || away === null ? 0.5 : 1,
          }}
        >
          {isSaving ? 'SALVANDO...' : isSaved ? '✓ PALPITE SALVO' : 'SALVAR PALPITE'}
        </button>
      )}
    </div>
  )
}

function ScoreButton({
  value, disabled, active, onClick,
}: {
  value: number | null
  disabled: boolean
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-14 h-14 rounded-xl flex items-center justify-center transition-all active:scale-90"
      style={{
        background: 'var(--dark)',
        border: active
          ? '2px solid var(--gold-light)'
          : '2px solid rgba(200,146,42,0.3)',
        boxShadow: active ? '0 0 0 3px rgba(232,184,75,0.15)' : 'none',
        fontFamily: 'var(--font-bebas)',
        fontSize: 32,
        color: value !== null ? 'var(--gold-light)' : 'rgba(255,255,255,0.2)',
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {value !== null ? value : '—'}
    </button>
  )
}

function BottomNav({ active }: { active: string }) {
  const items = [
    { href: '/', icon: '🏠', label: 'Home', key: 'home' },
    { href: '/palpites', icon: '⚽', label: 'Palpites', key: 'palpites' },
    { href: '/ranking', icon: '📊', label: 'Ranking', key: 'ranking' },
    { href: '/perfil', icon: '👤', label: 'Perfil', key: 'perfil' },
  ]
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 flex items-center justify-around px-2 pb-2 pt-1"
      style={{ background: 'var(--dark-2)', borderTop: '1px solid var(--border)', height: 64 }}
    >
      {items.map(item => (
        <a key={item.key} href={item.href} className="flex flex-col items-center gap-1 px-3 py-1 rounded-xl">
          <span className={`text-xl ${item.key === active ? 'scale-110' : ''}`}>{item.icon}</span>
          <span
            className="text-xs tracking-wider"
            style={{
              fontFamily: 'var(--font-condensed)',
              color: item.key === active ? 'var(--gold-light)' : 'var(--text-muted)',
            }}
          >
            {item.label.toUpperCase()}
          </span>
        </a>
      ))}
    </nav>
  )
}
