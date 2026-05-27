// ─────────────────────────────────────────────────
// Amambaí F.C. — API-Football integration
// Documentação: https://api-sports.io/documentation/football/v3
// ─────────────────────────────────────────────────

const BASE_URL = 'https://v3.football.api-sports.io'
const LEAGUE_ID = process.env.WORLD_CUP_LEAGUE_ID || '1'
const SEASON = process.env.WORLD_CUP_SEASON || '2026'

async function fetchAPI(endpoint: string) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'x-apisports-key': process.env.FOOTBALL_API_KEY!,
    },
    next: { revalidate: 300 }, // cache 5 min
  })

  if (!res.ok) throw new Error(`API-Football error: ${res.status}`)
  const data = await res.json()

  // A API retorna erros dentro do campo errors
  if (data.errors && Object.keys(data.errors).length > 0) {
    throw new Error(`API-Football: ${JSON.stringify(data.errors)}`)
  }

  return data.response
}

// ── Buscar todos os jogos da Copa ──────────────────
export async function fetchAllMatches() {
  return fetchAPI(`/fixtures?league=${LEAGUE_ID}&season=${SEASON}`)
}

// ── Buscar jogos ao vivo ───────────────────────────
export async function fetchLiveMatches() {
  return fetchAPI(`/fixtures?league=${LEAGUE_ID}&season=${SEASON}&status=1H-2H-HT-ET-P`)
}

// ── Buscar jogos de hoje ───────────────────────────
export async function fetchTodayMatches() {
  const today = new Date().toISOString().split('T')[0]
  return fetchAPI(`/fixtures?league=${LEAGUE_ID}&season=${SEASON}&date=${today}`)
}

// ── Buscar estatísticas de um jogo ────────────────
export async function fetchMatchStats(fixtureId: string) {
  return fetchAPI(`/fixtures/statistics?fixture=${fixtureId}`)
}

// ── Buscar artilheiros da Copa ────────────────────
export async function fetchTopScorers() {
  return fetchAPI(`/players/topscorers?league=${LEAGUE_ID}&season=${SEASON}`)
}

// ── Buscar gols de um jogador específico ──────────
export async function fetchPlayerGoals(playerId: string) {
  return fetchAPI(
    `/players?id=${playerId}&league=${LEAGUE_ID}&season=${SEASON}`
  )
}

// ── Normalizar jogo da API para nosso formato ─────
export function normalizeMatch(apiFixture: Record<string, unknown>) {
  const fixture = apiFixture.fixture as Record<string, unknown>
  const teams = apiFixture.teams as Record<string, Record<string, unknown>>
  const goals = apiFixture.goals as Record<string, number | null>
  const league = apiFixture.league as Record<string, unknown>

  return {
    external_id: String(fixture.id),
    home_team: String(teams.home.name),
    home_team_flag: String(teams.home.logo),
    away_team: String(teams.away.name),
    away_team_flag: String(teams.away.logo),
    home_score: goals.home,
    away_score: goals.away,
    kickoff_at: fixture.date as string,
    status: normalizeStatus(String((fixture.status as Record<string, string>).short)),
    stage: normalizeStage(String(league.round)),
    group: String(league.round).includes('Group')
      ? String(league.round)
      : undefined,
  }
}

function normalizeStatus(apiStatus: string): string {
  const map: Record<string, string> = {
    'NS': 'SCHEDULED',
    '1H': 'LIVE', 'HT': 'LIVE', '2H': 'LIVE',
    'ET': 'LIVE', 'P': 'LIVE',
    'FT': 'FT', 'AET': 'FT', 'PEN': 'FT',
    'PST': 'POSTPONED', 'CANC': 'POSTPONED',
  }
  return map[apiStatus] || 'SCHEDULED'
}

function normalizeStage(round: string): string {
  if (round.includes('Group')) return 'GROUP_STAGE'
  if (round.includes('Round of 16')) return 'ROUND_OF_16'
  if (round.includes('Quarter')) return 'QUARTER_FINALS'
  if (round.includes('Semi')) return 'SEMI_FINALS'
  if (round.includes('3rd')) return 'THIRD_PLACE'
  if (round.includes('Final')) return 'FINAL'
  return 'GROUP_STAGE'
}
