// ─────────────────────────────────────────────────
// Amambaí F.C. — Lógica de pontuação v2.0
// Regras finais — maio/2026
// ─────────────────────────────────────────────────

// ── BOLÃO DE PLACARES ─────────────────────────────
// Placar exato = 3pts / Resultado correto = 1pt / Errou = 0
// Considera apenas resultado nos 90min (FT)
// Prorrogação e pênaltis IGNORADOS

export type MatchResult = 'HOME' | 'AWAY' | 'DRAW'

export function getResult(home: number, away: number): MatchResult {
  if (home > away) return 'HOME'
  if (away > home) return 'AWAY'
  return 'DRAW'
}

export function calculateBolaoPoints(
  pred: { home: number; away: number },
  result: { home: number; away: number }
): number {
  // Placar exato
  if (pred.home === result.home && pred.away === result.away) return 3
  // Resultado correto
  if (getResult(pred.home, pred.away) === getResult(result.home, result.away)) return 1
  return 0
}

// ── TRADER DA COPA ────────────────────────────────
// Modelo Brasileirão: vitória=3, empate=1, derrota=0
// Vale para todas as fases — grupos e mata-mata igual
// Considera resultado nos 90min

export type TraderResult = 'WIN' | 'DRAW' | 'LOSS'

export function calculateTraderPoints(
  teamName: string,
  homeTeam: string,
  awayTeam: string,
  winner: 'home' | 'away' | 'draw'
): { result: TraderResult; points: number } {
  if (winner === 'draw') return { result: 'DRAW', points: 1 }

  const isHome = teamName === homeTeam
  const won = (isHome && winner === 'home') || (!isHome && winner === 'away')

  return won
    ? { result: 'WIN', points: 3 }
    : { result: 'LOSS', points: 0 }
}

// ── REI DOS ARTILHEIROS ───────────────────────────
// 1pt por gol marcado em jogo
// Gols em disputa de pênaltis = NÃO contam
// Gols em prorrogação = CONTAM
// Gols contra = NÃO contam para o jogador

export function isGoalCounted(isShootoutPenalty: boolean, isOwnGoal: boolean): boolean {
  return !isShootoutPenalty && !isOwnGoal
}

// ── PALPITES — CONTROLE DE PRAZO ──────────────────
// Fecha 30 minutos antes do apito

export function isPredictionOpen(kickoffAt: string): boolean {
  const kickoff = new Date(kickoffAt)
  const now = new Date()
  const closeAt = new Date(kickoff.getTime() - 30 * 60 * 1000)
  return now < closeAt
}

export function getTimeUntilClose(kickoffAt: string): number {
  const kickoff = new Date(kickoffAt)
  const closeAt = new Date(kickoff.getTime() - 30 * 60 * 1000)
  return closeAt.getTime() - Date.now()
}

// ── MERCADO — CONTROLE DE PRAZO ───────────────────
// Fecha em 8 de junho de 2026 às 23h59

export const MARKET_CLOSE = new Date('2026-06-08T23:59:00-03:00')

export function isMarketOpen(): boolean {
  return Date.now() < MARKET_CLOSE.getTime()
}

export function getTimeUntilMarketClose(): number {
  return MARKET_CLOSE.getTime() - Date.now()
}

// ── FORMATAÇÃO ────────────────────────────────────

export function formatCountdown(ms: number): string {
  if (ms <= 0) return '00:00:00'
  const h = Math.floor(ms / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  const s = Math.floor((ms % 60000) / 1000)
  return [h, m, s].map(v => String(v).padStart(2, '0')).join(':')
}

export function formatCountdownFromDate(target: string): string {
  return formatCountdown(new Date(target).getTime() - Date.now())
}

// ── DESEMPATE ─────────────────────────────────────
// Ordem: Bolão → Trader → Artilheiro
// Se persistir: divide o prêmio

export interface MemberScore {
  memberId: string
  nickname: string
  scoreBolao: number
  scoreTrader: number
  scoreArtilheiro: number
}

export type Competition = 'BOLAO' | 'TRADER' | 'ARTILHEIRO'

export function sortByCompetition(members: MemberScore[], competition: Competition): MemberScore[] {
  return [...members].sort((a, b) => {
    const getPrimary = (m: MemberScore) =>
      competition === 'BOLAO' ? m.scoreBolao
      : competition === 'TRADER' ? m.scoreTrader
      : m.scoreArtilheiro

    const getTb1 = (m: MemberScore) =>
      competition === 'BOLAO' ? m.scoreTrader : m.scoreBolao

    const getTb2 = (m: MemberScore) =>
      competition === 'ARTILHEIRO' ? m.scoreTrader : m.scoreArtilheiro

    return getPrimary(b) - getPrimary(a)
      || getTb1(b) - getTb1(a)
      || getTb2(b) - getTb2(a)
  })
}

// ── TIERS DE FORÇA ────────────────────────────────
export const TIERS = {
  A: ['Brasil','Argentina','França','Inglaterra','Espanha','Alemanha','Portugal','Holanda'],
  B: ['Estados Unidos','Bélgica','Uruguai','Japão','Marrocos','Croácia','Senegal','Colômbia'],
  C: ['Equador','Noruega','Áustria','Turquia','Coreia do Sul','México','Suíça','Austrália'],
  D: ['Haiti','Curaçao','Jordânia','Cabo Verde','Catar','Bósnia e Herz.','Panamá','Gana',
      'África do Sul','Paraguai','Costa do Marfim','Tunísia','Nova Zelândia','Argélia',
      'Iraque','Egito','Irã','Arábia Saudita','RD Congo','Uzbequistão','Escócia'],
} as const

export type Tier = keyof typeof TIERS

export function getTeamTier(teamName: string): Tier {
  for (const [tier, teams] of Object.entries(TIERS)) {
    if ((teams as readonly string[]).includes(teamName)) return tier as Tier
  }
  return 'D'
}
