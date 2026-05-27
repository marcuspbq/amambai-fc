// ─────────────────────────────────────────────────
// Amambaí F.C. — Tipos globais
// ─────────────────────────────────────────────────

export type MatchStatus = 'SCHEDULED' | 'LIVE' | 'FT' | 'POSTPONED'
export type MatchStage =
  | 'GROUP_STAGE'
  | 'ROUND_OF_16'
  | 'QUARTER_FINALS'
  | 'SEMI_FINALS'
  | 'THIRD_PLACE'
  | 'FINAL'

export type PickType = 'favorite' | 'intermediate' | 'wildcard'

// ── Usuário ──────────────────────────────────────
export interface User {
  id: string
  email: string
  nickname: string
  avatar_emoji: string
  created_at: string
}

// ── Bolão ────────────────────────────────────────
export interface Pool {
  id: string
  name: string
  admin_id: string
  invite_code: string
  status: 'SETUP' | 'DRAFT' | 'ACTIVE' | 'FINISHED'
  draft_open: boolean
  created_at: string
}

// ── Membro do Bolão ──────────────────────────────
export interface PoolMember {
  id: string
  pool_id: string
  user_id: string
  draft_order: number
  score_general: number
  score_artilheiro: number
  score_trader: number
  predictions_count: number
  exact_predictions: number
  // joins
  user?: User
}

// ── Jogo ─────────────────────────────────────────
export interface Match {
  id: string
  external_id: string
  home_team: string
  home_team_flag: string
  away_team: string
  away_team_flag: string
  home_score: number | null
  away_score: number | null
  kickoff_at: string
  stage: MatchStage
  status: MatchStatus
  group?: string
}

// ── Palpite ──────────────────────────────────────
export interface Prediction {
  id: string
  member_id: string
  match_id: string
  home_pred: number
  away_pred: number
  points_earned: number
  // joins
  match?: Match
}

// ── Jogador do Draft ─────────────────────────────
export interface DraftPlayer {
  id: string
  pool_id: string
  player_name: string
  team: string
  team_flag: string
  external_id: string
  owner_id: string | null
  goals: number
  // joins
  owner?: PoolMember
}

// ── Trader Pick ──────────────────────────────────
export interface TraderPick {
  id: string
  member_id: string
  team_name: string
  team_flag: string
  pick_type: PickType
  multiplier: number
  base_pts: number
  total_pts: number
  eliminated: boolean
  // joins
  member?: PoolMember
}

// ── Ranking ──────────────────────────────────────
export interface RankingEntry {
  member_id: string
  nickname: string
  avatar_emoji: string
  score_general: number
  score_artilheiro: number
  score_trader: number
  total_goals: number
  position_general: number
  position_artilheiro: number
  position_trader: number
  trend: 'up' | 'down' | 'same'
}

// ── Pontuação ────────────────────────────────────
export const SCORING = {
  CORRECT_WINNER: 3,
  CORRECT_DRAW: 3,
  EXACT_SCORE: 7,
  CORRECT_QUALIFIER: 2,
  CHAMPION_BONUS: 10,
} as const

export const TRADER_POINTS = {
  GROUP_WIN: 1,
  QUALIFY_R16: 3,
  QUALIFY_QF: 5,
  QUALIFY_SF: 7,
  QUALIFY_FINAL: 10,
  CHAMPION: 15,
  PENALTY_WIN_BONUS: 2,
} as const

export const TRADER_MULTIPLIERS: Record<PickType, number> = {
  favorite: 1.0,
  intermediate: 1.5,
  wildcard: 2.0,
}
