export type FantasyProfile =
  | "half_ppr_4pt"
  | "half_ppr_6pt"
  | "full_ppr_4pt"
  | "full_ppr_6pt"
  | "standard_4pt"
  | "standard_6pt"

export type FantasyPosition = "QB" | "RB" | "WR" | "TE" | "FLEX"

export interface NflRankItem {
  player_id: string
  full_name: string
  position: FantasyPosition
  team_abbr: string
  team_id: string | number
  score: number
  proj_key: string
  event_id?: string
  home_team?: string
  away_team?: string
  commence_time?: string
}

export interface NflRankResponse {
  profile: FantasyProfile
  position: FantasyPosition
  items: NflRankItem[]
  updatedAt?: string
}

export interface NflProjectionIdentity {
  player_id: string
  full_name: string
  position: FantasyPosition
  team_abbr: string
  team_id: string | number
  event_id: string
  commence_time: string
  sleeper_id?: string
  espn_id?: string
  yahoo_id?: string
}

export interface NflProjectionInputs {
  // per-market metadata used to derive projections
  line?: number
  avg_over?: number
  avg_under?: number
  books?: string[]
  probabilities?: Record<string, number>
  inferred?: boolean
  [key: string]: unknown
}

export interface NflProjections {
  pass_yds?: number
  rush_yds?: number
  rec_yds?: number
  receptions?: number
  pass_tds?: number
  rush_tds?: number
  rec_tds?: number
  pass_ints?: number
  tds?: number
  any_td_prob?: number
  any_td_lambda?: number
  td_2plus_prob?: number
  longest_pass_completion?: number
  longest_reception?: number
  longest_rush?: number
}

export interface NflFantasyPoints {
  fantasy_points_half_ppr_4pt?: number
  fantasy_points_half_ppr_6pt?: number
  fantasy_points_full_ppr_4pt?: number
  fantasy_points_full_ppr_6pt?: number
  fantasy_points_standard_4pt?: number
  fantasy_points_standard_6pt?: number
}

export interface NflProjectionRecord extends NflFantasyPoints {
  identity: NflProjectionIdentity
  projections?: NflProjections
  inputs?: NflProjectionInputs
  event_total?: number
  home_spread?: number
}


