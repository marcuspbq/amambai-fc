// ─────────────────────────────────────────────────
// Amambaí F.C. — Worker de sincronização
// POST /api/sync
//
// Chamado pelo Vercel Cron Job a cada 60s durante jogos
// e a cada 6h fora de jogos.
//
// Também pode ser chamado manualmente pelo admin.
// ─────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  fetchAllMatches,
  fetchLiveMatches,
  fetchTopScorers,
  normalizeMatch,
} from '@/lib/football-api'
import { calculatePoints } from '@/lib/scoring'
import type { Prediction } from '@/types'

// Admin Supabase client (service role — só no server)
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(req: NextRequest) {
  // Verifica segredo para evitar chamadas não autorizadas
  const secret = req.headers.get('x-sync-secret')
  if (secret !== process.env.API_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getSupabase()
  const results = { matches: 0, goals: 0, points: 0 }

  try {
    // ── 1. Busca jogos ao vivo ou de hoje ─────────
    const liveMatches = await fetchLiveMatches()
    const allMatches = liveMatches.length > 0 ? liveMatches : await fetchAllMatches()

    // ── 2. Atualiza placares no banco ─────────────
    for (const fixture of allMatches) {
      const normalized = normalizeMatch(fixture)

      await supabase
        .from('matches')
        .upsert(normalized, { onConflict: 'external_id' })

      results.matches++

      // ── 3. Se jogo finalizado, calcula pontos ──
      if (normalized.status === 'FT' &&
          normalized.home_score !== null &&
          normalized.away_score !== null) {

        // Busca o jogo no banco para obter o ID interno
        const { data: dbMatch } = await supabase
          .from('matches')
          .select('id')
          .eq('external_id', normalized.external_id)
          .single()

        if (!dbMatch) continue

        // Busca todos os palpites deste jogo ainda não pontuados
        const { data: predictions } = await supabase
          .from('predictions')
          .select('*')
          .eq('match_id', dbMatch.id)
          .eq('points_earned', 0)

        if (!predictions?.length) continue

        for (const pred of predictions as Prediction[]) {
          const pts = calculatePoints(
            { home_pred: pred.home_pred, away_pred: pred.away_pred },
            { home_score: normalized.home_score, away_score: normalized.away_score }
          )

          // Atualiza pontos do palpite
          await supabase
            .from('predictions')
            .update({ points_earned: pts })
            .eq('id', pred.id)

          // Soma pontos no member
          await supabase.rpc('increment_score_general', {
            member_id: pred.member_id,
            pts,
            is_exact: pts === 7,
          })

          results.points++
        }
      }
    }

    // ── 4. Atualiza gols dos artilheiros ──────────
    const scorers = await fetchTopScorers()

    for (const scorer of scorers) {
      const playerId = String(scorer.player.id)
      const goals = scorer.statistics[0]?.goals?.total ?? 0

      await supabase
        .from('draft_players')
        .update({ goals })
        .eq('external_id', playerId)

      results.goals++
    }

    // ── 5. Recalcula pontos do Trader da Copa ─────
    // (disparado separadamente pelo admin quando uma seleção avança)
    // Ver: /api/trader/advance

    return NextResponse.json({
      ok: true,
      synced: results,
      timestamp: new Date().toISOString(),
    })

  } catch (err) {
    console.error('[SYNC ERROR]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

// GET — health check (Vercel Cron)
export async function GET() {
  return NextResponse.json({ status: 'Amambaí F.C. sync worker online ⚽' })
}
