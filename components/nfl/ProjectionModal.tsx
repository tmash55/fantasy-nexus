"use client"

import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { teamLogoPath, teamAbbrFrom } from "@/lib/nfl-teams"
import { useAuth } from "@/components/providers/auth-provider"
import { useRouter } from "next/navigation"
import {
  User,
  MapPin,
  Clock,
  TrendingUp,
  Target,
  Activity,
  BarChart3,
  Calendar,
  DollarSign,
  Lock,
  AlertCircle,
  Percent,
} from "lucide-react"

async function fetchProjection(proj_key: string) {
  const res = await fetch(`/api/nfl/projection?proj_key=${encodeURIComponent(proj_key)}`)
  if (!res.ok) throw new Error("Failed to load projection")
  const json = await res.json()
  return json.data
}

// Mock game log data - replace with actual API call
const mockGameLog = [
  { week: 12, opponent: "vs DAL", fantasyPoints: 18.4, yards: 89, tds: 1, receptions: 6, oppRank: "soft" },
  { week: 11, opponent: "@SEA", fantasyPoints: 22.1, yards: 112, tds: 1, receptions: 8, oppRank: "average" },
  { week: 10, opponent: "vs TB", fantasyPoints: 15.2, yards: 76, tds: 0, receptions: 5, oppRank: "tough" },
  { week: 9, opponent: "@SF", fantasyPoints: 28.7, yards: 156, tds: 2, receptions: 9, oppRank: "soft" },
  { week: 8, opponent: "vs LAR", fantasyPoints: 12.8, yards: 68, tds: 0, receptions: 4, oppRank: "tough" },
]

export default function ProjectionModal({ projKey, onClose }: { projKey: string | null; onClose: () => void }) {
  const [scoringFormat, setScoringFormat] = useState<"ppr" | "half_ppr" | "standard">("half_ppr")
  const [tdPoints, setTdPoints] = useState<4 | 6>(4)
  const { isPro } = useAuth()
  const router = useRouter()

  const open = Boolean(projKey)
  const { data, isLoading, isError } = useQuery({
    queryKey: useMemo(() => ["nfl-projection", projKey] as const, [projKey]),
    queryFn: () => fetchProjection(projKey as string),
    enabled: Boolean(projKey),
    staleTime: 60_000,
  })

  // Prepare ranking context for position rank box
  const idForRank = useMemo(() => {
    const rec: any = data
    return rec ? (rec.identity ?? rec) : undefined
  }, [data])
  const positionForRank = useMemo(
    () => String(idForRank?.position || idForRank?.player_position || "FLEX"),
    [idForRank],
  )
  const profileFor = (fmt: "ppr" | "half_ppr" | "standard", pts: 4 | 6): string => {
    const suffix = pts === 6 ? "6pt" : "4pt"
    if (fmt === "ppr") return `full_ppr_${suffix}`
    if (fmt === "half_ppr") return `half_ppr_${suffix}`
    return `standard_${suffix}`
  }
  const profileParam = profileFor(scoringFormat, tdPoints)
  const { data: rankData } = useQuery({
    queryKey: ["nfl-rankings-mini", profileParam, positionForRank] as const,
    queryFn: async () => {
      const res = await fetch(`/api/nfl/rankings?profile=${profileParam}&position=${positionForRank}`)
      if (!res.ok) throw new Error("Failed to load rankings")
      const json = await res.json()
      return (json?.data?.items ?? []) as Array<{ player_id: string }>
    },
    enabled: Boolean(idForRank?.player_id && profileParam && positionForRank),
    staleTime: 60_000,
  })

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-5xl w-[95vw] max-h-[95vh] overflow-y-auto overflow-x-hidden p-0">
        {isLoading && (
          <div className="space-y-6 p-4 sm:p-6">
            <div className="flex items-center gap-4">
              <Skeleton className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 sm:h-6 w-32 sm:w-48" />
                <Skeleton className="h-3 sm:h-4 w-24 sm:w-32" />
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20 sm:h-24 rounded-lg" />
              ))}
            </div>
          </div>
        )}

        {isError && (
          <div className="flex items-center justify-center p-8 sm:p-12 text-center">
            <div className="space-y-4">
              <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-destructive/10 rounded-xl mx-auto">
                <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 text-destructive" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-foreground">Unable to Load Player Data</h3>
                <p className="text-sm text-muted-foreground mt-1">Please try again or contact support</p>
              </div>
            </div>
          </div>
        )}

        {!isLoading && !isError && data && (
          <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
            {/* Player Header Card */}
            {(() => {
              const rec: any = data
              const id = rec.identity ?? rec
              const home = rec.home_team ?? id.home_team
              const away = rec.away_team ?? id.away_team
              const kickoff = rec.commence_time ?? id.commence_time
              const teamLogo = teamLogoPath(id.team_abbr ?? id.team_name)
              const headshot: string | null = (id as any)?.headshot_url ?? (rec as any)?.headshot_url ?? null

              return (
                <Card className="bg-gradient-to-r from-background to-muted/30 border border-border/40 backdrop-blur-sm">
                  <CardContent className="pt-4 sm:pt-6">
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-4 sm:mb-6">
                      <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                        {/* Player Headshot */}
                        <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-background rounded-xl border-2 border-primary/20 overflow-hidden flex-shrink-0">
                          {headshot ? (
                            <img
                              src={headshot || "/placeholder.svg"}
                              alt={String(id.full_name)}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                          )}
                        </div>

                        {/* Player Info */}
                        <div className="space-y-2 min-w-0 flex-1">
                          <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-foreground truncate">{id.full_name}</h2>
                            <div className="flex items-center gap-2 sm:gap-3 mt-1">
                              <Badge variant="outline" className="h-5 text-xs px-2 flex-shrink-0">
                                {id.position}
                              </Badge>
                              <span className="text-muted-foreground hidden sm:inline">•</span>
                              <span className="font-semibold text-foreground flex items-center gap-1 min-w-0">
                                <span className="truncate">{id.team_abbr ?? id.team_name}</span>
                                {teamLogo ? (
                                  <img
                                    src={teamLogo || "/placeholder.svg"}
                                    alt={String(id.team_abbr ?? id.team_name)}
                                    className="w-4 h-4 flex-shrink-0"
                                  />
                                ) : null}
                              </span>
                            </div>
                          </div>

                          {/* Quick Match Context */}
                          {away && home && (
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 p-3 bg-background/60 rounded-lg border border-border/40">
                              <div className="flex items-center gap-2 min-w-0">
                                <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                <span className="font-medium text-sm truncate">
                                  {(() => {
                                    const playerAbbr = String(id.team_abbr || id.team_name || "").toUpperCase()
                                    const homeAbbr = teamAbbrFrom(home) || String(home).slice(0, 3).toUpperCase()
                                    const awayAbbr = teamAbbrFrom(away) || String(away).slice(0, 3).toUpperCase()
                                    const isAway = playerAbbr === awayAbbr
                                    const opponent = isAway ? home : home ? home : away
                                    const oppName = isAway
                                      ? typeof home === "string"
                                        ? home
                                        : String(home)
                                      : typeof away === "string"
                                        ? away
                                        : String(away)
                                    const total = (data as any)?.event_total
                                    return `${isAway ? "@" : "vs"} ${oppName}${total ? ` • O/U ${total}` : ""}`
                                  })()}
                                </span>
                              </div>
                              {kickoff && (
                                <div className="flex items-center gap-2 min-w-0">
                                  <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                  <span className="text-sm text-muted-foreground truncate">
                                    {new Date(kickoff).toLocaleDateString("en-US", {
                                      weekday: "short",
                                      month: "short",
                                      day: "numeric",
                                      hour: "numeric",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="w-full sm:w-auto">
                        <div className="bg-muted/20 border border-border/40 rounded-lg p-2 sm:p-2 flex flex-col gap-2 items-stretch sm:items-end">
                          {/* Scoring segment */}
                          <div className="w-full flex items-center justify-between sm:justify-end gap-2">
                            <span className="text-xs text-muted-foreground hidden sm:inline">Scoring</span>
                            <div className="inline-flex rounded-full overflow-hidden border border-border/40">
                              <Button
                                variant={scoringFormat === "ppr" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setScoringFormat("ppr")}
                                className="rounded-none rounded-l-full h-8 px-3 text-xs"
                              >
                                PPR
                              </Button>
                              <Button
                                variant={scoringFormat === "half_ppr" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setScoringFormat("half_ppr")}
                                className="rounded-none h-8 px-3 text-xs"
                              >
                                Half
                              </Button>
                              <Button
                                variant={scoringFormat === "standard" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setScoringFormat("standard")}
                                className="rounded-none rounded-r-full h-8 px-3 text-xs"
                              >
                                Std
                              </Button>
                            </div>
                          </div>
                          {/* Pass TD segment (QB only) */}
                          {positionForRank.toUpperCase() === "QB" && (
                            <div className="w-full flex items-center justify-between sm:justify-end gap-2">
                              <span className="text-xs text-muted-foreground whitespace-nowrap">Pass TD</span>
                              <div className="inline-flex rounded-full overflow-hidden border border-border/40">
                                <Button
                                  variant={tdPoints === 4 ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => setTdPoints(4)}
                                  className="rounded-none rounded-l-full h-8 px-3 text-xs"
                                >
                                  4pt
                                </Button>
                                <Button
                                  variant={tdPoints === 6 ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => setTdPoints(6)}
                                  className="rounded-none rounded-r-full h-8 px-3 text-xs"
                                >
                                  6pt
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })()}

            <Tabs defaultValue="betting" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-muted/20 border border-border/40 rounded-md h-auto">
                <TabsTrigger
                  value="betting"
                  className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-1.5 text-xs sm:text-sm"
                >
                  <DollarSign className="w-4 h-4" />
                  <span className="hidden sm:inline">Betting Data</span>
                  <span className="sm:hidden">Betting</span>
                </TabsTrigger>
                <TabsTrigger
                  value="gamelog"
                  className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-1.5 text-xs sm:text-sm"
                >
                  <Calendar className="w-4 h-4" />
                  <span className="hidden sm:inline">Game Log</span>
                  <span className="sm:hidden">Log</span>
                </TabsTrigger>
                <TabsTrigger
                  value="trends"
                  className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-1.5 text-xs sm:text-sm"
                >
                  <TrendingUp className="w-4 h-4" />
                  <span className="hidden sm:inline">Trends & Insights</span>
                  <span className="sm:hidden">Trends</span>
                </TabsTrigger>
              </TabsList>

              {/* Fantasy Relevant Betting Data */}
              <TabsContent value="betting" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
                {/* ... existing code for fantasy projections and other content ... */}

                {(() => {
                  const rec: any = data
                  const id = (rec?.identity ?? rec) as any
                  const fmtKey = (k: string): "ppr" | "half_ppr" | "standard" | null => {
                    if (k.includes("half_ppr")) return "half_ppr"
                    if (k.includes("standard")) return "standard"
                    if (k.includes("full_ppr") || (k.includes("ppr") && !k.includes("half_ppr"))) return "ppr"
                    return null
                  }
                  const pickProjection = (): number | null => {
                    const entries = Object.entries(rec).filter(([k]) => k.startsWith("fantasy_points_"))
                    const targetSuffix = tdPoints === 6 ? "6pt" : "4pt"
                    const candidates = entries.filter(([k]) => fmtKey(k) === scoringFormat && k.includes(targetSuffix))
                    if (candidates.length === 0) return null
                    const val = Number(candidates[0][1])
                    return isNaN(val) ? null : val
                  }
                  const selectedPoints = pickProjection()

                  // Build a profile for rankings API to compute position rank
                  const profileFor = (fmt: "ppr" | "half_ppr" | "standard"): string => {
                    const suffix = tdPoints === 6 ? "6pt" : "4pt"
                    if (fmt === "ppr") return `full_ppr_${suffix}`
                    if (fmt === "half_ppr") return `half_ppr_${suffix}`
                    return `standard_${suffix}`
                  }
                  const position = positionForRank
                  const rankItems = (rankData as Array<{ player_id: string }>) || []
                  const posRank = (() => {
                    const idx = rankItems.findIndex(
                      (r: { player_id: string }) => String(r.player_id) === String(id.player_id),
                    )
                    return idx >= 0 ? idx + 1 : null
                  })()

                  return (
                    <Card className="bg-background/50 backdrop-blur-sm border border-border/40">
                      <CardHeader className="pb-3 sm:pb-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                          <div className="flex items-center gap-2">
                            <Target className="w-5 h-5 text-primary" />
                            <CardTitle className="text-base sm:text-lg">Fantasy Projections</CardTitle>
                          </div>
                          <Badge
                            variant="secondary"
                            className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/30 text-xs"
                          >
                            {(scoringFormat === "ppr"
                              ? "PPR"
                              : scoringFormat === "half_ppr"
                                ? "Half PPR"
                                : "Standard") + (positionForRank.toUpperCase() === "QB" ? ` • ${tdPoints}pt` : "")}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                          <div className="p-3 sm:p-4 rounded-xl border bg-muted/30 border-border/40">
                            <div className="text-xs uppercase font-semibold text-muted-foreground tracking-wider mb-1">
                              Projection
                            </div>
                            <div className="text-2xl sm:text-3xl font-bold text-foreground">
                              {selectedPoints != null ? selectedPoints.toFixed(1) : "—"}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">fantasy points</div>
                          </div>
                          <div className="p-3 sm:p-4 rounded-xl border bg-muted/30 border-border/40">
                            <div className="text-xs uppercase font-semibold text-muted-foreground tracking-wider mb-1">
                              Position Rank
                            </div>
                            <div className="text-2xl sm:text-3xl font-bold text-foreground">
                              {posRank != null ? `${String(position)}${posRank}` : "—"}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">{position} rank</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })()}

                {/* QB Passing TDs (probabilities if available) */}
                {(() => {
                  const rec: any = data
                  const pos = String(positionForRank || "").toUpperCase()
                  const inputs = (rec as any)?.inputs as Record<string, any> | undefined
                  if (pos !== "QB" || !inputs) return null
                  if (!isPro) {
                    return (
                      <Card>
                        <CardHeader>
                          <div className="flex items-center gap-2">
                            <Target className="w-5 h-5 text-primary" />
                            <CardTitle>Passing TDs</CardTitle>
                            <Badge variant="outline" className="text-xs">
                              QB
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="text-center">
                            <div className="text-sm text-muted-foreground mb-2">QB odds of going over X TDs</div>
                            <Button
                              onClick={() => router.push("/pricing")}
                              className="bg-orange-500 hover:bg-orange-600 text-white rounded-full h-9 px-4"
                            >
                              <Lock className="h-4 w-4 mr-2" /> Unlock (Pro)
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  }
                  const keys = Object.keys(inputs)
                  const matchKey = keys.find((k) => /pass(ing)?\s*t(ouch)?d(own)?s?/i.test(k))
                  if (!matchKey) return null
                  const meta = (inputs as any)[matchKey] || {}
                  const p05 = typeof meta?.p_over_0_5 === "number" ? meta.p_over_0_5 : null
                  const p15 = typeof meta?.p_over_1_5 === "number" ? meta.p_over_1_5 : null
                  const lambda = typeof meta?.lambda === "number" ? meta.lambda : null
                  if (p05 == null && p15 == null && lambda == null) return null
                  const pct = (p: number | null) =>
                    p == null ? null : (Math.max(0, Math.min(1, p)) * 100).toFixed(1) + "%"
                  return (
                    <Card>
                      <CardHeader>
                        <div className="flex items-center gap-2">
                          <Target className="w-5 h-5 text-primary" />
                          <CardTitle>Passing TDs</CardTitle>
                          <Badge variant="outline" className="text-xs">
                            QB
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="p-4 rounded-xl border bg-muted/30 border-border/40 text-center">
                            <div className="text-xs uppercase font-semibold text-muted-foreground tracking-wider mb-1">
                              Over 0.5
                            </div>
                            <div className="text-2xl font-bold text-foreground">{pct(p05) ?? "—"}</div>
                          </div>
                          <div className="p-4 rounded-xl border bg-muted/30 border-border/40 text-center">
                            <div className="text-xs uppercase font-semibold text-muted-foreground tracking-wider mb-1">
                              Over 1.5
                            </div>
                            <div className="text-2xl font-bold text-foreground">{pct(p15) ?? "—"}</div>
                          </div>
                          <div className="p-4 rounded-xl border bg-muted/30 border-border/40 text-center">
                            <div className="text-xs uppercase font-semibold text-muted-foreground tracking-wider mb-1">
                              Expected TDs (λ)
                            </div>
                            <div className="text-2xl font-bold text-foreground">
                              {lambda != null ? Number(lambda).toFixed(2) : "—"}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })()}

                {/* Prop Betting Lines */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-primary" />
                      <CardTitle>Prop Betting Lines</CardTitle>
                      <Badge variant="outline" className="text-xs">
                        Average from 10+ books
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Odds powered by{" "}
                      <a href="https://oddsmash.io/nfl/odds/player-props" className="underline hover:text-primary">
                        OddSmash
                      </a>{" "}
                      — view player props →
                    </div>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      if (!isPro) {
                        return (
                          <div className="text-center py-10">
                            <div className="mb-3 text-sm text-muted-foreground">
                              Anytime TD %, QB TD odds, and player prop lines
                            </div>
                            <Button
                              onClick={() => router.push("/pricing")}
                              className="bg-orange-500 hover:bg-orange-600 text-white rounded-full h-9 px-4"
                            >
                              <Lock className="h-4 w-4 mr-2" /> Unlock (Pro)
                            </Button>
                          </div>
                        )
                      }
                      const inputs = (data as any)?.inputs as Record<string, any> | undefined
                      if (!inputs) {
                        return (
                          <div className="text-center py-8 text-muted-foreground">
                            <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No betting data available</p>
                          </div>
                        )
                      }

                      const atd = (inputs as any)["Anytime Touchdown Scorer"] as any
                      const pAny = typeof atd?.p_any === "number" ? atd.p_any : undefined
                      const avgAny =
                        typeof atd?.avg_any === "number"
                          ? atd.avg_any
                          : typeof atd?.avg_yes === "number"
                            ? atd.avg_yes
                            : undefined
                      const probPct = typeof pAny === "number" ? Math.max(0, Math.min(1, pAny)) * 100 : undefined
                      const fairOdds = (() => {
                        if (typeof pAny !== "number" || pAny <= 0 || pAny >= 1) return undefined
                        const american =
                          pAny >= 0.5 ? -Math.round((pAny / (1 - pAny)) * 100) : Math.round(((1 - pAny) / pAny) * 100)
                        return american
                      })()
                      const fmtOdds = (o: number | undefined) =>
                        typeof o === "number" ? (o > 0 ? `+${o}` : `${o}`) : "—"

                      const markets = Object.entries(inputs)
                        .map(([market, meta]) => {
                          const m: any = meta
                          const line = m?.line
                          const avgOver = m?.avg_over
                          const avgUnder = m?.avg_under
                          const inferred = Boolean(m?.inferred)
                          const hasOdds = typeof avgOver === "number" || typeof avgUnder === "number"
                          const hasLine = typeof line === "number"
                          // Allow inferred-only markets (e.g., Receptions inferred from yards)
                          if (!hasOdds && !hasLine && !inferred) return null

                          // Calculate implied probability for display context (not used yet in UI text)
                          const impliedOver = avgOver ? (Math.abs(avgOver) / (Math.abs(avgOver) + 100)) * 100 : null
                          const impliedUnder = avgUnder ? (Math.abs(avgUnder) / (Math.abs(avgUnder) + 100)) * 100 : null

                          // Determine inferred value + note
                          let inferredValue: number | null = null
                          let inferredNote: string | null = null
                          const proj = (data as any)?.projections || {}
                          if (inferred) {
                            if (/receptions?/i.test(market)) {
                              if (typeof proj?.receptions === "number") inferredValue = proj.receptions
                              const src = typeof m?.from_rec_yds === "number" ? m.from_rec_yds : undefined
                              const ypr = typeof m?.ypr_used === "number" ? m.ypr_used : undefined
                              if (src != null && ypr != null) inferredNote = `derived from ${src} rec yds @ ${ypr} YPR`
                            } else if (/reception\s*yards?/i.test(market)) {
                              if (typeof proj?.rec_yds === "number") inferredValue = proj.rec_yds
                              const src = typeof m?.from_receptions === "number" ? m.from_receptions : undefined
                              const ypr = typeof m?.ypr_used === "number" ? m.ypr_used : undefined
                              if (src != null && ypr != null)
                                inferredNote = `derived from ${src} receptions @ ${ypr} YPR`
                            }
                          }

                          return {
                            market,
                            line,
                            avgOver,
                            avgUnder,
                            impliedOver,
                            impliedUnder,
                            hasLine,
                            inferred,
                            inferredValue,
                            inferredNote,
                          }
                        })
                        .filter(Boolean)

                      return (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {(probPct != null || avgAny != null || fairOdds != null) && (
                            <div className="lg:col-span-2 p-4 bg-muted/20 rounded-lg border border-border/40 flex items-center justify-between">
                              <div>
                                <div className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">
                                  Anytime TD
                                </div>
                                <div className="text-2xl font-bold text-foreground">
                                  {probPct != null ? `${probPct.toFixed(1)}%` : "—"}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-xs text-muted-foreground">Fair Odds</div>
                                <div className="text-xl font-semibold text-foreground">{fmtOdds(fairOdds)}</div>
                                {typeof avgAny === "number" && (
                                  <div className="text-xs text-muted-foreground mt-1">Avg Odds {fmtOdds(avgAny)}</div>
                                )}
                              </div>
                            </div>
                          )}
                          {markets.map((market: any) => (
                            <div key={market.market} className="p-4 bg-muted/20 rounded-lg border border-border/40">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="font-semibold text-foreground">{market.market}</h4>
                                <div className="flex items-center gap-2">
                                  <Percent className="w-3 h-3 text-muted-foreground" />
                                  {market.inferred ? (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-600 border border-amber-500/30">
                                      inferred
                                    </span>
                                  ) : null}
                                </div>
                              </div>

                              <div className="space-y-3">
                                <div className="text-center">
                                  <div className="text-xs text-muted-foreground mb-1">Line</div>
                                  <div className="text-2xl font-bold text-foreground">
                                    {market.hasLine || market.inferred ? (
                                      <span className="inline-flex items-center gap-2">
                                        {String(
                                          market.hasLine
                                            ? market.line
                                            : market.inferredValue != null
                                              ? Number(market.inferredValue).toFixed(1)
                                              : "—",
                                        )}
                                        {market.inferred ? (
                                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-600 border border-amber-500/30">
                                            inferred
                                          </span>
                                        ) : null}
                                      </span>
                                    ) : (
                                      "—"
                                    )}
                                  </div>
                                  {market.inferred && market.inferredNote && (
                                    <div className="text-xs text-muted-foreground mt-1">{market.inferredNote}</div>
                                  )}
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                  <div className="text-center p-2 bg-emerald-500/10 rounded border border-emerald-500/30">
                                    <div className="text-xs text-emerald-600 dark:text-emerald-300 mb-1">Over</div>
                                    <div className="font-semibold text-emerald-600 dark:text-emerald-300">
                                      {market.avgOver
                                        ? market.avgOver > 0
                                          ? `+${market.avgOver}`
                                          : `${market.avgOver}`
                                        : "—"}
                                    </div>
                                  </div>

                                  <div className="text-center p-2 bg-red-500/10 rounded border border-red-500/30">
                                    <div className="text-xs text-red-600 dark:text-red-300 mb-1">Under</div>
                                    <div className="font-semibold text-red-600 dark:text-red-300">
                                      {market.avgUnder
                                        ? market.avgUnder > 0
                                          ? `+${market.avgUnder}`
                                          : `${market.avgUnder}`
                                        : "—"}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )
                    })()}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Game Log */}
              <TabsContent value="gamelog" className="space-y-6">
                <Card className="border-dashed border-primary/30 bg-primary/5">
                  <CardContent className="py-12">
                    <div className="text-center space-y-2">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                        <Calendar className="w-4 h-4" />
                        <span className="text-xs font-semibold">Game Log</span>
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">Under Construction</h3>
                      <p className="text-sm text-muted-foreground">
                        Coming soon: rolling logs, matchup difficulty, and heatmaps. 🏗️
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Trends & Insights */}
              <TabsContent value="trends" className="space-y-6">
                <Card className="border-dashed border-primary/30 bg-primary/5">
                  <CardContent className="py-12">
                    <div className="text-center space-y-2">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                        <Activity className="w-4 h-4" />
                        <span className="text-xs font-semibold">Trends & Insights</span>
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">Coming Soon</h3>
                      <p className="text-sm text-muted-foreground">
                        Live trends, movement, and boom/bust analytics are on the way. 🚧
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
