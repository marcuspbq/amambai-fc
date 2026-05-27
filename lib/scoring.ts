// ─────────────────────────────────────────────────
// Amambaí F.C. — Lógica de pontuação
// Sem subjetividade. Tudo automático.
// ─────────────────────────────────────────────────
import { Match, Prediction, SCORING } from '@/types'

// ── Calcula pontos de um palpite ──────────────────
export function calculatePoints(
  prediction: Pick<Prediction, 'home_pred' | 'away_pred'>,
  match: Pick<Match, 'home_score' | 'away_score'>
): number {
  const { home_pred, away_pred } = prediction
  const { home_score, away_score } = match

  // Jogo não finalizado
  if (home_score === null || away_score === null) return 0

  // Placar exato — maior pontuação
  if (home_pred === home_score && away_pred === away_score) {
    return SCORING.EXACT_SCORE
  }

  const predResult = getResult(home_pred, away_pred)
  const realResult = getResult(home_score, away_score)

  // Acertou o vencedor ou empate
  if (predResult === realResult) {
    return predResult === 'DRAW' ? SCORING.CORRECT_DRAW : SCORING.CORRECT_WINNER
  }

  return 0
}

type MatchResult = 'HOME' | 'AWAY' | 'DRAW'

function getResult(home: number, away: number): MatchResult {
  if (home > away) return 'HOME'
  if (away > home) return 'AWAY'
  return 'DRAW'
}

// ── Calcula pontos do Trader por fase ────────────
import { TRADER_POINTS, TRADER_MULTIPLIERS, PickType, MatchStage } from '@/types'

export function calculateTraderPoints(
  basePoints: number,
  pickType: PickType
): number {
  return basePoints * TRADER_MULTIPLIERS[pickType]
}

export function getTraderPointsForStage(stage: MatchStage): number {
  const map: Partial<Record<MatchStage, number>> = {
    ROUND_OF_16:    TRADER_POINTS.QUALIFY_R16,
    QUARTER_FINALS: TRADER_POINTS.QUALIFY_QF,
    SEMI_FINALS:    TRADER_POINTS.QUALIFY_SF,
    FINAL:          TRADER_POINTS.QUALIFY_FINAL,
  }
  return map[stage] ?? 0
}

// ── Verifica se palpite ainda está aberto ─────────
export function isPredictionOpen(kickoffAt: string): boolean {
  const kickoff = new Date(kickoffAt)
  const now = new Date()
  const thirtyMinBefore = new Date(kickoff.getTime() - 30 * 60 * 1000)
  return now < thirtyMinBefore
}

// ── Formata countdown para exibição ───────────────
export function formatCountdown(kickoffAt: string): string {
  const diff = new Date(kickoffAt).getTime() - Date.now()
  if (diff <= 0) return '00:00:00'

  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  const s = Math.floor((diff % 60000) / 1000)

  return [h, m, s].map(v => String(v).padStart(2, '0')).join(':')
}
