"use client"

import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import WeekDetailModal from "@/components/nfl/WeekDetailModal"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { teamLogoPath } from "@/lib/nfl-teams"
import { TrendingUp, Calendar, Trophy } from "lucide-react"
import SeasonBreakdownFilters from "./SeasonBreakdownFilters"


type Scoring = "full_ppr_4pt" | "full_ppr_6pt" | "half_ppr_4pt" | "half_ppr_6pt" | "standard_4pt" | "standard_6pt"
type Position = "QB" | "RB" | "WR" | "TE"

async function fetchSeasonBreakdown(position: Position, season: number, scoring: Scoring, limit: number) {
  const params = new URLSearchParams({ position, season: String(season), scoring, limit: String(limit) })
  const res = await fetch(`/api/nfl/season-breakdown?${params.toString()}`, { cache: "no-store" })
  if (!res.ok) throw new Error("Failed to load season breakdown")
  const json = await res.json()
  return json.data as any[]
}

export default function SeasonBreakdownTable() {
  const [position, setPosition] = useState<Position>("QB")
  const [season, setSeason] = useState<number>(new Date().getFullYear())
  const [scoring, setScoring] = useState<Scoring>("half_ppr_4pt")
  const [limit, setLimit] = useState<number>(50)
  const [sortWeek, setSortWeek] = useState<number | null>(null)
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")

  const { data, isLoading } = useQuery({
    queryKey: useMemo(
      () => ["season-breakdown", position, season, scoring, limit] as const,
      [position, season, scoring, limit],
    ),
    queryFn: () => fetchSeasonBreakdown(position, season, scoring, limit),
    staleTime: 60_000,
  })

  const rows = useMemo(() => {
    const list = (data ?? []).map((r: any) => ({ ...r }))
    if (sortWeek != null) {
      list.sort((a: any, b: any) => {
        const aw = (a.weekly_stats || []).find((w: any) => Number(w.week) === sortWeek)?.fantasy_points ?? null
        const bw = (b.weekly_stats || []).find((w: any) => Number(w.week) === sortWeek)?.fantasy_points ?? null
        const av = typeof aw === "number" ? aw : -1e9
        const bv = typeof bw === "number" ? bw : -1e9
        return sortDir === "desc" ? bv - av : av - bv
      })
    } else {
      // Default: sort by season position rank if present (ascending), otherwise by total fantasy points (descending)
      list.sort((a: any, b: any) => {
        const ar = typeof a.season_pos_rank === "number" ? a.season_pos_rank : null
        const br = typeof b.season_pos_rank === "number" ? b.season_pos_rank : null
        if (ar != null && br != null) return ar - br
        if (ar != null) return -1
        if (br != null) return 1
        return (b.season_fantasy_points ?? 0) - (a.season_fantasy_points ?? 0)
      })
    }
    return list.slice(0, Math.max(1, limit))
  }, [data, sortWeek, sortDir, limit])

  const weeks = useMemo(() => {
    const maxWeek = Math.max(
      0,
      ...(data ?? [])
        .flatMap((r: any) => (r.weekly_stats || []).map((w: any) => Number(w.week)))
        .filter((n: number) => !Number.isNaN(n)),
    )
    return Array.from({ length: maxWeek }, (_, i) => i + 1)
  }, [data])

  const resetSort = () => {
    setSortWeek(null)
    setSortDir("desc")
  }

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-orange-500/10 via-red-500/10 to-pink-500/10 border border-border/50">
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
        <div className="relative px-6 py-6 md:py-8">
          <div className="max-w-4xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                Season Analysis
              </Badge>
            </div>
            <h1 className="text-xl md:text-2xl font-bold mb-2">NFL Season Breakdown</h1>
            <p className="text-sm md:text-base text-muted-foreground mb-4 max-w-3xl leading-relaxed">
              Analyze complete season performance with week-by-week fantasy point breakdowns. Track consistency,
              identify trends, and compare players across different scoring formats.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-card border border-border/50">
                <TrendingUp className="h-4 w-4 text-orange-500" />
                <div className="text-sm">
                  <div className="font-medium">Weekly Tracking</div>
                  <div className="text-xs text-muted-foreground">Performance by week</div>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-card border border-border/50">
                <Trophy className="h-4 w-4 text-red-500" />
                <div className="text-sm">
                  <div className="font-medium">Multiple Formats</div>
                  <div className="text-xs text-muted-foreground">PPR, Half, Standard</div>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-card border border-border/50">
                <Calendar className="h-4 w-4 text-pink-500" />
                <div className="text-sm">
                  <div className="font-medium">Historical Data</div>
                  <div className="text-xs text-muted-foreground">Multi-season analysis</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-gradient-to-br from-card to-card/50 border-border/50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy className="h-5 w-5 text-primary" />
            Season Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SeasonBreakdownFilters
            position={position}
            season={season}
            scoring={scoring}
            limit={limit}
            onPositionChange={setPosition}
            onSeasonChange={setSeason}
            onScoringChange={setScoring}
            onLimitChange={setLimit}
            onResetSort={resetSort}
          />
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden bg-gradient-to-br from-card to-card/50 border-border/50">
        <div className="overflow-x-auto">
          <table className="min-w-[320px] w-full text-xs md:text-sm">
            <thead>
              <tr className="bg-muted/40 border-b border-border/50">
                <th className="text-left px-1 md:px-3 py-2 md:py-3 w-8 md:w-16 font-semibold text-[10px] md:text-sm">Rank</th>
                <th className="text-left px-1 md:px-3 py-2 md:py-3 font-semibold text-[10px] md:text-sm min-w-[120px] md:min-w-[200px]">Player</th>
                {weeks.map((w) => (
                  <th
                    key={w}
                    className="text-center px-0.5 md:px-2 py-2 md:py-3 cursor-pointer select-none hover:bg-muted/60 transition-colors font-semibold text-[10px] md:text-sm min-w-[32px] md:min-w-[60px]"
                    onClick={() => {
                      setSortWeek((curr) => {
                        if (curr === w) {
                          setSortDir((d) => (d === "desc" ? "asc" : "desc"))
                          return curr
                        }
                        setSortDir("desc")
                        return w
                      })
                    }}
                  >
                    <span className="hidden md:inline">W{w}</span>
                    <span className="md:hidden">{w}</span>
                    {sortWeek === w ? (sortDir === "desc" ? " ↓" : " ↑") : ""}
                  </th>
                ))}
                <th className="text-right px-1 md:px-3 py-2 md:py-3 w-16 md:w-24 font-semibold text-[10px] md:text-sm">Avg</th>
                <th className="text-right px-1 md:px-3 py-2 md:py-3 w-16 md:w-24 font-semibold text-[10px] md:text-sm">Pts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                <tr>
                  <td className="px-3 py-8 text-center text-muted-foreground" colSpan={weeks.length + 4}>
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      Loading season data...
                    </div>
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td className="px-3 py-8 text-center text-muted-foreground" colSpan={weeks.length + 4}>
                    No data available for the selected filters
                  </td>
                </tr>
              ) : (
                rows.map((r: any, idx: number) => (
                  <tr key={r.player_id ?? idx} className="hover:bg-muted/30 transition-colors">
                    <td className="px-1 md:px-3 py-2 md:py-3 text-muted-foreground font-medium text-xs md:text-sm">
                      {typeof r.season_pos_rank === "number" ? r.season_pos_rank : idx + 1}
                    </td>
                    <td className="px-1 md:px-3 py-2 md:py-3">
                      <div className="grid grid-cols-[24px,1fr] md:grid-cols-[40px,1fr] gap-x-2 md:gap-x-3 gap-y-0.5 items-center">
                        <div className="row-span-2">
                          <div className="md:hidden">
                            <InlineHeadshot url={r.headshot_url} fullName={r.full_name} size={24} />
                          </div>
                          <div className="hidden md:block">
                            <InlineHeadshot url={r.headshot_url} fullName={r.full_name} size={40} />
                          </div>
                        </div>
                        <div className="font-bold text-foreground leading-tight text-xs md:text-sm">{r.full_name}</div>
                        <div className="flex items-center gap-1 md:gap-2 text-[10px] md:text-xs text-muted-foreground">
                          {(() => {
                            const p = teamLogoPath(r.team_abbr)
                            return p ? (
                              <img src={p || "/placeholder.svg"} alt={r.team_abbr} className="w-3 h-3 md:w-4 md:h-4 rounded-sm" />
                            ) : null
                          })()}
                          <span className="font-semibold">{r.team_abbr}</span>
                          <span className="hidden md:inline">•</span>
                          <Badge variant="outline" className="h-4 md:h-5 text-[8px] md:text-[10px] px-1 md:px-2">
                            {r.player_position}
                          </Badge>
                        </div>
                      </div>
                    </td>
                    {weeks.map((w) => {
                      const ws = (r.weekly_stats || []).find((x: any) => Number(x.week) === w)
                      return (
                        <td key={w} className="px-0.5 md:px-2 py-2 md:py-3 text-center">
                          <WeekCell
                            week={w}
                            weekStats={ws}
                            scoring={scoring}
                            playerPosition={r.player_position}
                            playerName={r.full_name}
                            teamAbbr={r.team_abbr}
                          />
                        </td>
                      )
                    })}
                    {(() => {
                      const s = (r.season_stats || {}) as any
                      const isSixPt = scoring.endsWith("_6pt")
                      const custom = ((): number | null => {
                        if (typeof s?.custom_fantasy_points === "number") return s.custom_fantasy_points
                        if (typeof (r as any)?.season_custom_fantasy_points === "number")
                          return (r as any).season_custom_fantasy_points
                        if (typeof (r as any)?.custom_fantasy_points === "number")
                          return (r as any).custom_fantasy_points
                        return null
                      })()
                      const mapped = (() => {
                        if (scoring.startsWith("full_ppr"))
                          return typeof s.pts_ppr === "number"
                            ? s.pts_ppr
                            : typeof r.season_fantasy_points === "number"
                              ? r.season_fantasy_points
                              : null
                        if (scoring.startsWith("half_ppr"))
                          return typeof s.pts_half_ppr === "number"
                            ? s.pts_half_ppr
                            : typeof r.season_fantasy_points === "number"
                              ? r.season_fantasy_points
                              : null
                        return typeof s.pts_std === "number"
                          ? s.pts_std
                          : typeof r.season_fantasy_points === "number"
                            ? r.season_fantasy_points
                            : null
                      })()
                      const total = isSixPt ? (custom != null ? custom : mapped) : mapped
                      const gp =
                        typeof s.gp === "number" ? s.gp : typeof r.total_games === "number" ? r.total_games : null
                      const avg = typeof total === "number" && typeof gp === "number" && gp > 0 ? total / gp : null
                      return (
                        <>
                          <td className="px-1 md:px-3 py-2 md:py-3 text-right tabular-nums text-muted-foreground text-xs md:text-sm">
                            {typeof avg === "number"
                              ? `${avg.toFixed(2)}${typeof gp === "number" ? ` (${gp})` : ""}`
                              : "—"}
                          </td>
                          <td className="px-1 md:px-3 py-2 md:py-3 text-right tabular-nums font-semibold text-xs md:text-sm">
                            {typeof total === "number" ? total.toFixed(2) : "—"}
                          </td>
                        </>
                      )
                    })()}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

function initialsFrom(fullName: string | undefined): string {
  if (!fullName) return "?"
  const parts = fullName.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase()
}

function InlineHeadshot({ url, fullName, size = 40 }: { url?: string | null; fullName: string; size?: number }) {
  return (
    <div
      className="rounded-full overflow-hidden bg-muted flex items-center justify-center border-2 border-border/40 shadow-sm"
      style={{ width: size, height: size }}
    >
      {typeof url === "string" && url ? (
        <img src={url || "/placeholder.svg"} alt={fullName} className="w-full h-full object-cover" />
      ) : (
        <span className="text-xs font-bold text-foreground">{initialsFrom(fullName)}</span>
      )}
    </div>
  )
}

function WeekCell({
  week,
  weekStats,
  scoring,
  playerPosition,
  playerName,
  teamAbbr,
}: { week: number; weekStats: any; scoring: Scoring; playerPosition: string; playerName?: string; teamAbbr?: string }) {
  const stats = weekStats?.stats || {}
  const pointsFromScoring = (() => {
    if (!stats) return null
    if (scoring.startsWith("full_ppr")) return typeof stats.pts_ppr === "number" ? stats.pts_ppr : null
    if (scoring.startsWith("half_ppr")) return typeof stats.pts_half_ppr === "number" ? stats.pts_half_ppr : null
    return typeof stats.pts_std === "number" ? stats.pts_std : null
  })()
  const points = (() => {
    // Only use custom_fantasy_points for 6pt scoring, otherwise use regular scoring
    const isSixPt = scoring.endsWith("_6pt")
    if (isSixPt && typeof weekStats?.custom_fantasy_points === "number") {
      return weekStats.custom_fantasy_points
    }
    return pointsFromScoring
  })()
  const posRank = (() => {
    if (scoring.startsWith("full_ppr")) return typeof stats.pos_rank_ppr === "number" ? stats.pos_rank_ppr : null
    if (scoring.startsWith("half_ppr"))
      return typeof stats.pos_rank_half_ppr === "number" ? stats.pos_rank_half_ppr : null
    return typeof stats.pos_rank_std === "number" ? stats.pos_rank_std : null
  })()

  const getColor = (p: number | null) => {
    if (p == null) return "bg-muted/40 text-muted-foreground border border-border/30"
    if (p >= 25) return "bg-emerald-600 text-white border border-emerald-700 shadow-sm"
    if (p >= 20) return "bg-emerald-500 text-white border border-emerald-600 shadow-sm"
    if (p >= 15) return "bg-emerald-400 text-emerald-900 border border-emerald-500"
    if (p >= 10) return "bg-yellow-400 text-yellow-900 border border-yellow-500"
    if (p >= 5) return "bg-orange-400 text-orange-900 border border-orange-500"
    if (p > 0) return "bg-red-400 text-white border border-red-500 shadow-sm"
    return "bg-red-600 text-white border border-red-700 shadow-sm"
  }
  const cls = getColor(points)

  const tooltip = (
    <div className="space-y-2">
      <div className="text-xs font-semibold">Week {week}</div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <div>Pass Yds: {stats?.pass_yd ?? "-"}</div>
          <div>Pass TD: {stats?.rec_td ?? stats?.pass_td ?? "-"}</div>
          <div>INT: {stats?.pass_int ?? "-"}</div>
        </div>
        <div>
          <div>Rush Yds: {stats?.rush_yd ?? "-"}</div>
          <div>Rush TD: {stats?.rush_td ?? "-"}</div>
          <div>Rec: {stats?.rec ?? "-"}</div>
        </div>
      </div>
    </div>
  )

  const [open, setOpen] = useState(false)

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className={`rounded-md px-1 md:px-2 py-1 md:py-1.5 tabular-nums transition-all hover:scale-105 ${cls} min-w-[28px] md:min-w-[48px]`}
            >
              <div className="font-semibold leading-tight text-[10px] md:text-sm">{points == null ? "—" : points.toFixed(2)}</div>
              <div className="text-[8px] md:text-[10px] leading-tight opacity-90">
                {posRank != null ? `${String(playerPosition)}${posRank}` : ""}
              </div>
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">{tooltip}</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <WeekDetailModal
        open={open}
        onOpenChange={setOpen}
        week={week}
        playerName={playerName}
        teamAbbr={teamAbbr}
        playerPosition={playerPosition}
        points={points}
        posRank={posRank}
        stats={stats}
      />
    </>
  )
}
