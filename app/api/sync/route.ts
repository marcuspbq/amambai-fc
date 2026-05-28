// ─────────────────────────────────────────────────
// Amambaí F.C. — Worker de sincronização v2.0
// POST /api/sync — chamado pelo Vercel Cron a cada 5min
// ─────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { fetchLiveMatches, fetchAllMatches, normalizeMatch } from '@/lib/football-api'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-sync-secret')
  if (secret !== process.env.API_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getSupabase()
  const results = { matches_synced: 0, points_calculated: 0, goals_synced: 0 }

  try {
    // ── 1. Busca jogos ────────────────────────────
    const liveMatches = await fetchLiveMatches()
    const matches = liveMatches.length > 0 ? liveMatches : await fetchAllMatches()

    for (const fixture of matches) {
      const normalized = normalizeMatch(fixture)

      const { data: upserted } = await supabase
        .from('matches')
        .upsert(normalized, { onConflict: 'external_id' })
        .select('id, status')
        .single()

      results.matches_synced++

      // ── 2. Jogo finalizado — calcula pontos ───
      if (upserted && normalized.status === 'FT') {
        // Bolão de Placares
        await supabase.rpc('calculate_prediction_points', { p_match_id: upserted.id })

        // Trader da Copa — modelo Brasileirão
        await supabase.rpc('process_trader_match', { p_match_id: upserted.id })

        results.points_calculated++

        // ── 3. Mata-mata — marca seleção eliminada
        if (normalized.stage !== 'GROUP_STAGE') {
          const loser = normalized.winner === 'home'
            ? normalized.away_team
            : normalized.winner === 'away'
            ? normalized.home_team
            : null // empate nos 90min não elimina ainda

          if (loser) {
            await supabase.rpc('eliminate_team', {
              p_team_name: loser,
              p_stage: normalized.stage,
            })
          }
        }
      }
    }

    // ── 4. Sincroniza gols dos artilheiros ────────
    // Busca jogos finalizados das últimas 3h com gols pendentes
    const { data: recentMatches } = await supabase
      .from('matches')
      .select('id, external_id')
      .eq('status', 'FT')
      .gte('kickoff_at', new Date(Date.now() - 3 * 3600 * 1000).toISOString())

    if (recentMatches?.length) {
      for (const match of recentMatches) {
        await supabase.rpc('sync_artilheiro_goals', { p_match_id: match.id })
        results.goals_synced++
      }
    }

    return NextResponse.json({
      ok: true,
      synced: results,
      timestamp: new Date().toISOString(),
      note: 'Amambaí F.C. sync v2 — Bolão + Trader (Brasileirão) + Artilheiro',
    })

  } catch (err) {
    console.error('[SYNC ERROR]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ status: '⚽ Amambaí F.C. sync worker v2 online' })
}
