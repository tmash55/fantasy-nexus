// NFL team mapping utilities: names, abbreviations, and common aliases

export type NflTeamAbbr =
  | 'ARI' | 'ATL' | 'BAL' | 'BUF' | 'CAR' | 'CHI' | 'CIN' | 'CLE'
  | 'DAL' | 'DEN' | 'DET' | 'GB'  | 'HOU' | 'IND' | 'JAX' | 'KC'
  | 'LV'  | 'LAC' | 'LAR' | 'MIA' | 'MIN' | 'NE'  | 'NO'  | 'NYG'
  | 'NYJ' | 'PHI' | 'PIT' | 'SEA' | 'SF'  | 'TB'  | 'TEN' | 'WAS'

export const TEAM_ABBR_TO_NAME: Record<NflTeamAbbr, string> = {
  ARI: 'Arizona Cardinals',
  ATL: 'Atlanta Falcons',
  BAL: 'Baltimore Ravens',
  BUF: 'Buffalo Bills',
  CAR: 'Carolina Panthers',
  CHI: 'Chicago Bears',
  CIN: 'Cincinnati Bengals',
  CLE: 'Cleveland Browns',
  DAL: 'Dallas Cowboys',
  DEN: 'Denver Broncos',
  DET: 'Detroit Lions',
  GB:  'Green Bay Packers',
  HOU: 'Houston Texans',
  IND: 'Indianapolis Colts',
  JAX: 'Jacksonville Jaguars',
  KC:  'Kansas City Chiefs',
  LV:  'Las Vegas Raiders',
  LAC: 'Los Angeles Chargers',
  LAR: 'Los Angeles Rams',
  MIA: 'Miami Dolphins',
  MIN: 'Minnesota Vikings',
  NE:  'New England Patriots',
  NO:  'New Orleans Saints',
  NYG: 'New York Giants',
  NYJ: 'New York Jets',
  PHI: 'Philadelphia Eagles',
  PIT: 'Pittsburgh Steelers',
  SEA: 'Seattle Seahawks',
  SF:  'San Francisco 49ers',
  TB:  'Tampa Bay Buccaneers',
  TEN: 'Tennessee Titans',
  WAS: 'Washington Commanders',
}

// Build a case-insensitive name->abbr map with useful aliases
const buildNameToAbbr = (): Record<string, NflTeamAbbr> => {
  const map: Record<string, NflTeamAbbr> = {}
  const put = (key: string, abbr: NflTeamAbbr) => { map[key.toLowerCase()] = abbr }

  (Object.keys(TEAM_ABBR_TO_NAME) as NflTeamAbbr[]).forEach((abbr) => {
    const full = TEAM_ABBR_TO_NAME[abbr]
    put(full, abbr)
    // Also store city-only shortcuts
    const city = full.split(' ').slice(0, -1).join(' ')
    if (city) put(city, abbr)
  })

  // Historical and common aliases
  put('oakland raiders', 'LV')
  put('san diego chargers', 'LAC')
  put('st. louis rams', 'LAR')
  put('st louis rams', 'LAR')
  put('washington', 'WAS')
  put('washington football team', 'WAS')
  put('washington redskins', 'WAS')

  // Abbreviation variants treated as names
  ;(
    ['ARI','ATL','BAL','BUF','CAR','CHI','CIN','CLE','DAL','DEN','DET','GB','HOU','IND','JAX','KC','LV','LAC','LAR','MIA','MIN','NE','NO','NYG','NYJ','PHI','PIT','SEA','SF','TB','TEN','WAS'] as NflTeamAbbr[]
  ).forEach((abbr) => put(abbr, abbr))

  return map
}

export const TEAM_NAME_TO_ABBR: Record<string, NflTeamAbbr> = buildNameToAbbr()

export function teamAbbrFrom(input: string | null | undefined): NflTeamAbbr | null {
  if (!input) return null
  const key = String(input).trim().toLowerCase()
  return TEAM_NAME_TO_ABBR[key] ?? null
}

export function teamNameFromAbbr(input: string | null | undefined): string | null {
  if (!input) return null
  const abbr = String(input).trim().toUpperCase() as NflTeamAbbr
  return TEAM_ABBR_TO_NAME[abbr] ?? null
}

export function normalizeAbbr(input: string | null | undefined): NflTeamAbbr | null {
  const abbr = teamAbbrFrom(input)
  return abbr ?? null
}

export function formatMatchup(awayAbbr: string, homeAbbr: string): string {
  const a = teamAbbrFrom(awayAbbr) ?? (awayAbbr?.toUpperCase() || '')
  const h = teamAbbrFrom(homeAbbr) ?? (homeAbbr?.toUpperCase() || '')
  return `${a} @ ${h}`
}


export function teamLogoPath(input: string | null | undefined): string | null {
  const abbr = teamAbbrFrom(input ?? '')
  if (!abbr) return null
  return `/images/nfl/${abbr}.svg`
}


// Teams that play home games in roofed/dome/retractable-roof stadiums
// Note: Retractable roofs may open; we mark these as roof-capable for weather-independent environments
const ROOFED_HOME_LIST: NflTeamAbbr[] = [
  'ARI', // State Farm Stadium (retractable)
  'ATL', // Mercedes-Benz Stadium (retractable)
  'DAL', // AT&T Stadium (retractable)
  'DET', // Ford Field (fixed)
  'HOU', // NRG Stadium (retractable)
  'IND', // Lucas Oil Stadium (retractable)
  'LAC', // SoFi Stadium (roofed)
  'LAR', // SoFi Stadium (roofed)
  'LV',  // Allegiant Stadium (fixed)
  'MIN', // U.S. Bank Stadium (fixed)
  'NO',  // Caesars Superdome (fixed)
]
export const ROOFED_HOME_ABBRS: Set<NflTeamAbbr> = new Set<NflTeamAbbr>(ROOFED_HOME_LIST)

export function isRoofedStadium(input: string | null | undefined): boolean {
  const abbr = teamAbbrFrom(input ?? '')
  return abbr ? ROOFED_HOME_ABBRS.has(abbr) : false
}


