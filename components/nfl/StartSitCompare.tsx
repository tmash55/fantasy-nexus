"use client"

import { useMemo, useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
// import { PlayerBadge } from "@/components/ui/player-badge"
import type { FantasyProfile, NflRankItem, FantasyPosition } from "@/types/nfl"
import { Users, Search, X, Plus, Target, Crown, ArrowRight, Minus, Lock } from "lucide-react"
import { teamLogoPath, teamAbbrFrom, teamNameFromAbbr } from "@/lib/nfl-teams"
import { getWeekWindowForDate } from "@/lib/nfl-weeks"
import { useIsMobile } from "@/hooks/use-mobile"
import { useAuth } from "@/components/providers/auth-provider"
import { useRouter } from "next/navigation"

type CompareItem = {
  proj_key: string
  identity: { player_id: string; full_name: string; position: string; team_abbr: string; headshot_url?: string | null }
  event_total: number | null
  home_spread: number | null
  home_team?: string | null
  away_team?: string | null
  fantasy_points: Record<string, number>
  inputs?: Record<string, any>
  projections?: Record<string, any>
}

export default function StartSitCompare() {
  const isMobile = useIsMobile()
  const { isPro } = useAuth()
  const router = useRouter()
  const [scoringFormat, setScoringFormat] = useState<"ppr" | "half_ppr" | "standard">("half_ppr")
  const [tdPoints, setTdPoints] = useState<4 | 6>(6)

  const profile: FantasyProfile = useMemo(() => {
    if (scoringFormat === "ppr") return (tdPoints === 6 ? "full_ppr_6pt" : "full_ppr_4pt") as FantasyProfile
    if (scoringFormat === "half_ppr") return (tdPoints === 6 ? "half_ppr_6pt" : "half_ppr_4pt") as FantasyProfile
    return (tdPoints === 6 ? "standard_6pt" : "standard_4pt") as FantasyProfile
  }, [scoringFormat, tdPoints])

  const ww = getWeekWindowForDate(new Date())
  const { data: rankList = [] } = useQuery({
    queryKey: useMemo(() => ["start-sit-rankings", profile, ww.seasonYear, ww.week] as const, [profile, ww.seasonYear, ww.week]),
    queryFn: async () => {
      const positions: FantasyPosition[] = ["QB", "RB", "WR", "TE"]
      const results = await Promise.all(
        positions.map(async (pos) => {
          const res = await fetch(`/api/nfl/rankings?profile=${profile}&position=${pos}&season=${ww.seasonYear}&week=${ww.week}`)
          if (!res.ok) return [] as NflRankItem[]
          const json = await res.json()
          return (json?.data?.items ?? []) as NflRankItem[]
        })
      )
      const byId = new Map<string, NflRankItem>()
      results.flat().forEach((it) => {
        if (!byId.has(it.player_id)) byId.set(it.player_id, it)
      })
      return Array.from(byId.values())
    },
    staleTime: 60_000,
  })

  type Selected = { proj_key: string; label: string; player: NflRankItem } | null
  const [selected, setSelected] = useState<Selected[]>([null, null])
  const [queries, setQueries] = useState<string[]>(["", ""]) // search text per slot

  const suggestions = (slot: number) => {
    const q = queries[slot]?.toLowerCase() || ""
    if (!q) return [] as NflRankItem[]
    return rankList.filter((it) => it.full_name.toLowerCase().includes(q)).slice(0, 8)
  }

  const compareKeys = useMemo(() => (selected.map((s) => s?.proj_key).filter(Boolean) as string[]), [selected])

  const { data, isFetching, refetch } = useQuery({
    queryKey: useMemo(() => ["start-sit-compare", compareKeys, ww.seasonYear, ww.week] as const, [compareKeys, ww.seasonYear, ww.week]),
    queryFn: async () => {
      if (compareKeys.length < 2) return { items: [] as CompareItem[] }
      const res = await fetch("/api/start-sit/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proj_keys: compareKeys }),
      })
      if (!res.ok) throw new Error("Compare failed")
      const json = await res.json()
      return json.data as { items: CompareItem[] }
    },
    enabled: compareKeys.length >= 2,
    staleTime: 30_000,
  })

  // Logging: dedupe and auto-log when keys reach 2 or 3
  const getGlobal = (): any => (typeof window !== 'undefined' ? (window as any) : ({} as any))
  const __g = getGlobal()
  const lastLoggedRef = __g.__startSitLastLogged || { current: '' }
  __g.__startSitLastLogged = lastLoggedRef
  const logCompareIfNeeded = async () => {
    const chosen = selected.filter(Boolean) as { proj_key: string; player: NflRankItem }[]
    if (chosen.length < 2) return
    const key = chosen.map((c) => c.proj_key).sort().join('|') + `|${profile}`
    if (lastLoggedRef.current === key) return
    lastLoggedRef.current = key
    const ww = getWeekWindowForDate(new Date())
    await fetch('/api/start-sit/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        season_year: ww.seasonYear,
        week: ww.week,
        profile,
        player_ids: chosen.map((c) => String(c.player.player_id)),
        proj_keys: chosen.map((c) => c.proj_key),
        source_path: typeof window !== 'undefined' ? window.location.pathname : undefined,
        dedupe_key: key,
      }),
    })
  }

  const items = useMemo(() => (data?.items ?? []) as CompareItem[], [data])

  // Auto log when selections change to 2 or 3 players
  useEffect(() => { if (compareKeys.length >= 2) { void logCompareIfNeeded() } }, [compareKeys.length, logCompareIfNeeded])

  // If user loses Pro while 3 slots are present, trim to 2
  useEffect(() => {
    if (!isPro && selected.length > 2) {
      setSelected((prev) => prev.slice(0, 2))
      setQueries((prev) => prev.slice(0, 2))
    }
  }, [isPro, selected.length])

  const initialsFrom = (fullName: string | undefined): string => {
    if (!fullName) return "?"
    const parts = fullName.trim().split(/\s+/)
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
    return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase()
  }

  const itemHeadshot = (item: NflRankItem | { full_name: string; proj_key: string; team_abbr?: string } | any): string | null => {
    // Prefer identity.headshot_url from compare payload, otherwise fallback (none available from rankings yet)
    return (item as any)?.identity?.headshot_url ?? (item as any)?.headshot_url ?? null
  }

  const pickPoints = (fp: Record<string, number>): number | null => {
    const entries = Object.entries(fp || {})
    if (entries.length === 0) return null
    const match = entries
      .filter(([k]) =>
        scoringFormat === "ppr"
          ? k.includes("ppr") && !k.includes("half_ppr")
          : scoringFormat === "half_ppr"
            ? k.includes("half_ppr")
            : k.includes("standard"),
      )
      .sort((a, b) => {
        const pref = tdPoints === 6
        const a6 = a[0].includes("6pt"), b6 = b[0].includes("6pt")
        return (pref ? Number(b6) - Number(a6) : Number(a6) - Number(b6))
      })[0]
    const val = match ? Number(match[1]) : Number(entries[0][1])
    return isNaN(val) ? null : val
  }

  const points = items.map((it) => pickPoints(it.fantasy_points))
  const maxPoints = points.reduce<number | null>((m, v) => (v == null ? m : m == null ? v : Math.max(m, v)), null)

  // Highest game total among compared players
  const eventTotals = items.map((it) => (typeof it.event_total === 'number' ? Number(it.event_total) : null))
  const maxEventTotal = eventTotals.reduce<number | null>((m, v) => (v == null ? m : m == null ? v : Math.max(m, v)), null)

  // Get all available markets/props
  const allMarkets = useMemo(() => {
    const marketSet = new Set<string>()
    items.forEach((item) => {
      const inputs = item.inputs as Record<string, any> | undefined
      if (inputs) {
        Object.keys(inputs).forEach((market) => marketSet.add(market))
      }
    })
    return Array.from(marketSet).sort()
  }, [items])

  const orderedMarkets = useMemo(() => {
    let markets = [...allMarkets]
    // Remove Receiving/Rushing TD markets we don't care about
    const excludeMatchers = [
      /rec(eption|eiving)?\s*(tds?|touchdowns?)/i,
      /rush(ing)?\s*(tds?|touchdowns?)/i,
    ]
    markets = markets.filter((m) => !excludeMatchers.some((rx) => rx.test(m)))
    const allQB = items.length > 0 && items.every((it) => String(it.identity.position).toUpperCase() === 'QB')
    if (!allQB) return markets
    const priority = (m: string): number => {
      if (/anytime\s*t(d|ouchdown)/i.test(m)) return 0
      if (/pass(ing)?\s*yards?/i.test(m)) return 1
      if (/pass(ing)?\s*t(ouch)?d(own)?s?/i.test(m)) return 2
      if (/pass(ing)?\s*intercept/i.test(m)) return 3
      if (/pass(ing)?\s*attempts?/i.test(m)) return 4
      if (/pass(ing)?\s*completions?/i.test(m)) return 5
      if (/rush(ing)?\s*yards?/i.test(m)) return 6
      if (/rush(ing)?\s*attempts?/i.test(m)) return 7
      if (/longest\s*pass/i.test(m)) return 8
      if (/longest\s*rush/i.test(m)) return 9
      return 50
    }
    return markets.sort((a, b) => {
      const pa = priority(a), pb = priority(b)
      if (pa !== pb) return pa - pb
      return a.localeCompare(b)
    })
  }, [allMarkets, items])

  // Removed fantasy points matrix; single format shown in header only

  const setQuery = (idx: number, val: string) => {
    setQueries((prev) => {
      const next = [...prev]
      next[idx] = val
      return next
    })
  }

  const choose = (idx: number, it: NflRankItem) => {
    setSelected((prev) => {
      const next = [...prev]
      next[idx] = {
        proj_key: it.proj_key,
        label: `${it.full_name} • ${it.team_abbr} • ${it.position}`,
        player: it,
      }
      return next
    })
    setQueries((prev) => {
      const next = [...prev]
      next[idx] = `${it.full_name}`
      return next
    })
  }

  const clearSlot = (idx: number) => {
    setSelected((prev) => {
      const next = [...prev]
      next[idx] = null
      return next
    })
    setQueries((prev) => {
      const next = [...prev]
      next[idx] = ""
      return next
    })
  }

  const addSlot = () => {
    if (!isPro) {
      router.push('/pricing')
      return
    }
    if (selected.length < 3) {
      setSelected((prev) => [...prev, null])
      setQueries((prev) => [...prev, ""])
    }
  }

  const removeSlot = (idx: number) => {
    if (selected.length > 2) {
      setSelected((prev) => prev.filter((_, i) => i !== idx))
      setQueries((prev) => prev.filter((_, i) => i !== idx))
    }
  }

  const deriveGameInfo = (it: CompareItem) => {
    const playerAbbr = teamAbbrFrom(it.identity.team_abbr || '')
    const homeAbbr = teamAbbrFrom(it.home_team || '')
    const awayAbbr = teamAbbrFrom(it.away_team || '')
    if (!playerAbbr || !homeAbbr || !awayAbbr) {
      return { isAway: null as boolean | null, opponentName: null as string | null, opponentAbbr: null as string | null, spread: null as number | null }
    }
    const isAway = playerAbbr === awayAbbr
    const opponentAbbr = isAway ? homeAbbr : awayAbbr
    const opponentName = teamNameFromAbbr(opponentAbbr) || opponentAbbr
    const homeSpread = typeof it.home_spread === 'number' ? it.home_spread : null
    const spread = homeSpread == null ? null : (isAway ? -homeSpread : homeSpread)
    return { isAway, opponentName, opponentAbbr, spread }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-card via-card to-muted/10 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <div className="bg-gradient-to-br from-primary/20 to-primary/10 p-3 rounded-lg">
              <Users className="w-6 h-6 text-primary" />
            </div>
            Start/Sit Comparison Tool
          </CardTitle>
          <p className="text-muted-foreground">
            Compare up to 3 players side-by-side with detailed projections, prop lines, and betting data
          </p>
          <div className="text-xs text-muted-foreground mt-1">
            Odds powered by <a href="https://oddsmash.io/nfl/odds/player-props" className="underline hover:text-primary">OddSmash</a> — view player props →
          </div>
        </CardHeader>
      </Card>

      {/* Player Selection */}
      <Card className="bg-gradient-to-br from-background via-background to-muted/20 border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Search className="w-5 h-5 text-primary" />
            Select Players to Compare
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {selected.map((sel, i) => (
              <div key={i} className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder={`Search player ${i + 1}...`}
                    value={queries[i]}
                    onChange={(e) => setQuery(i, e.target.value)}
                    className="pl-10 pr-10 bg-background/50 border-border/60 hover:border-primary/40 focus:border-primary/60 transition-colors"
                  />
                  {queries[i] && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => (sel ? clearSlot(i) : setQuery(i, ""))}
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                {/* Search Suggestions */}
                {!!queries[i] && !sel && (
                  <div className="absolute z-50 mt-1 w-full bg-popover border border-border rounded-lg shadow-lg max-h-64 overflow-y-auto">
                    {suggestions(i).map((s) => (
                      <button
                        key={s.player_id}
                        onClick={() => choose(i, s)}
                        className="w-full text-left px-4 py-3 hover:bg-muted/60 transition-colors border-b border-border/30 last:border-b-0"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-muted/60 flex items-center justify-center text-[10px] font-bold text-foreground">
                              {initialsFrom(s.full_name)}
                            </div>
                            <div>
                              <span className="font-semibold text-foreground">{s.full_name}</span>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="h-4 text-[10px] px-1.5">
                                  {s.position}
                                </Badge>
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  {s.team_abbr}
                                  {(() => { const p = teamLogoPath(s.team_abbr); return p ? <img src={p} alt={s.team_abbr} className="w-3.5 h-3.5" /> : null })()}
                                </span>
                              </div>
                            </div>
                          </div>
                          {/* Remove projections in suggestion row per request */}
                        </div>
                      </button>
                    ))}
                    {suggestions(i).length === 0 && (
                      <div className="px-4 py-3 text-sm text-muted-foreground text-center">No players found</div>
                    )}
                  </div>
                )}

                {/* Selected Player */}
                {sel && (
                  <div className="mt-3 bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-background rounded-full flex items-center justify-center border border-border/40 overflow-hidden">
                          {itemHeadshot(sel.player) ? (
                            <img src={itemHeadshot(sel.player)!} alt={sel.player.full_name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-sm font-bold text-foreground">{initialsFrom(sel.player.full_name)}</span>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">{sel.player.full_name}</div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Badge variant="outline" className="h-4 text-[10px] px-1.5">
                              {sel.player.position}
                            </Badge>
                            <span className="flex items-center gap-1">{sel.player.team_abbr}{(() => { const p = teamLogoPath(sel.player.team_abbr); return p ? <img src={p} alt={sel.player.team_abbr} className="w-3.5 h-3.5" /> : null })()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {selected.length > 2 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSlot(i)}
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => clearSlot(i)} className="h-8 w-8 p-0">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Add Player Button */}
            {selected.length < 3 && (
              <Button
                variant={isPro ? "outline" : "default"}
                onClick={addSlot}
                className={`h-12 border-dashed border-2 transition-colors ${isPro ? "hover:border-primary/40 hover:bg-primary/5 bg-transparent" : "bg-orange-500 hover:bg-orange-600 text-white border-orange-500/60"}`}
              >
                {!isPro ? (
                  <>
                    <Lock className="w-5 h-5 mr-2" />
                    Unlock 3rd Player (Pro)
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5 mr-2" />
                    Add Player
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-border/30">
            <div className="flex items-center gap-3">
              <Button
                onClick={async () => {
                  const res = await refetch()
                  try {
                    const chosen = selected.filter(Boolean) as { proj_key: string; player: NflRankItem }[]
                    if (chosen.length >= 2) {
                      const window = getWeekWindowForDate(new Date())
                      await fetch('/api/start-sit/log', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          season_year: window.seasonYear,
                          week: window.week,
                          profile,
                          player_ids: chosen.map((c) => String(c.player.player_id)),
                          proj_keys: chosen.map((c) => c.proj_key),
                          source_path: typeof window !== 'undefined' ? (window as any).location.pathname : undefined,
                        }),
                      })
                    }
                  } catch (e) { console.warn('start-sit log compare failed', e) }
                  return res
                }}
                disabled={isFetching || selected.filter(Boolean).length < 2}
                className="gap-2"
              >
                {isFetching ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Comparing...
                  </>
                ) : (
                  <>
                    <Target className="w-4 h-4" />
                    Compare Players
                  </>
                )}
              </Button>
              <Badge variant="outline" className="text-xs">
                {selected.filter(Boolean).length}/3 selected
              </Badge>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Scoring:</span>
                <Button variant={scoringFormat === "ppr" ? "default" : "outline"} size="sm" onClick={() => setScoringFormat("ppr")}>
                  PPR
                </Button>
                <Button variant={scoringFormat === "half_ppr" ? "default" : "outline"} size="sm" onClick={() => setScoringFormat("half_ppr")}>
                  Half
                </Button>
                <Button variant={scoringFormat === "standard" ? "default" : "outline"} size="sm" onClick={() => setScoringFormat("standard")}>
                  Std
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Passing TD:</span>
                <Button variant={tdPoints === 4 ? 'default' : 'outline'} size="sm" onClick={() => setTdPoints(4)}>4pt</Button>
                <Button variant={tdPoints === 6 ? 'default' : 'outline'} size="sm" onClick={() => setTdPoints(6)}>6pt</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Unified Comparison View */}
      {items.length >= 2 && (
        <Card className="bg-gradient-to-br from-background via-background to-muted/20 border-border/60">
          <CardContent className="p-0">
            <div className="grid gap-0" style={{ gridTemplateColumns: `repeat(${items.length}, 1fr)` }}>
              {/* Player Headers */}
              {items.map((item, idx) => {
                const pts = points[idx]
                const isBest = maxPoints != null && pts != null && pts === maxPoints
                const badges: string[] = []

                return (
                  <div
                    key={item.proj_key}
                    className={`relative p-6 border-r border-border/30 last:border-r-0 ${
                      isBest
                        ? "bg-gradient-to-br from-primary/10 via-primary/10 to-primary/20 ring-2 ring-primary/40 rounded-lg"
                        : "bg-gradient-to-br from-card/50 to-muted/20"
                    }`}
                  >
                    {isBest && (
                      <div className="absolute top-4 right-4">
                        <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-2 py-1 rounded-full flex items-center gap-1 text-xs font-semibold">
                          <Crown className="w-3 h-3" />
                          Best
                        </div>
                      </div>
                    )}

                    {/* Player Avatar */}
                    <div className="flex flex-col items-center mb-6">
                      <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center border-2 border-border/40 mb-3 overflow-hidden">
                        {item.identity.headshot_url ? (
                          <img src={item.identity.headshot_url} alt={item.identity.full_name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-lg font-bold text-foreground">{initialsFrom(item.identity.full_name)}</span>
                        )}
                      </div>
                      <h3 className="font-bold text-lg text-foreground text-center mb-1">{item.identity.full_name}</h3>
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="outline" className="h-5 text-xs px-2">
                          {item.identity.position}
                        </Badge>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          {item.identity.team_abbr}
                          {(() => { const p = teamLogoPath(item.identity.team_abbr); return p ? <img src={p} alt={item.identity.team_abbr} className="w-4 h-4" /> : null })()}
                        </span>
                      </div>

                      {/* Player Badges */}
                      {badges.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap justify-center mb-4">
                          {/* Badges suppressed in Start/Sit until we define comparison-specific badges */}
                          {badges.length > 3 && (
                            <div className="text-xs text-muted-foreground bg-muted/50 rounded-full px-2 py-1">
                              +{badges.length - 3}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Stats Column */}
                    <div className="space-y-4">
                      {/* Fantasy Points */}
                      <div className="text-center bg-muted/30 border border-border/40 rounded-lg p-4">
                        <div className="text-sm text-muted-foreground mb-1">Fantasy Points</div>
                        <div className="text-2xl font-bold text-primary">{pts != null ? pts.toFixed(1) : "—"}</div>
                      </div>

                      {/* Game Environment */}
                      <div className="space-y-3">
                        <div className="text-center">
                          <div className="text-sm text-muted-foreground">Opponent</div>
                          <div className="text-lg font-semibold text-foreground">
                            {(() => {
                              const gi = deriveGameInfo(item)
                              if (gi.isAway == null) return '—'
                              const oppLabel = isMobile ? (gi.opponentAbbr ?? '—') : (gi.opponentName ?? '—')
                              return `${gi.isAway ? '@' : 'vs'} ${oppLabel}`
                            })()}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-muted-foreground">Game Total</div>
                          <div className={`text-lg font-semibold px-3 py-2 rounded-lg inline-block border ${
                            item.event_total != null && maxEventTotal != null && Number(item.event_total) === maxEventTotal
                              ? 'bg-primary/10 text-primary border-primary/20'
                              : 'border-transparent text-foreground'
                          }`}>
                            {item.event_total ?? "—"}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-muted-foreground">Spread</div>
                          <div className="text-lg font-semibold text-foreground">
                            {(() => {
                              const gi = deriveGameInfo(item)
                              if (gi.spread == null) return '—'
                              const s = gi.spread
                              return s > 0 ? `+${s}` : String(s)
                            })()}
                          </div>
                        </div>
                      </div>

                      {/* Per-format rows removed; single format shown above */}

                      {/* Prop Lines */}
                      {orderedMarkets.map((market) => {
                        const meta = (item.inputs as any)?.[market]
                        const line = typeof meta?.line === "number" ? meta.line : null

                        // Special handling for Anytime TD market
                        const isATD = market === "Anytime Touchdown Scorer"
                        // QB markets
                        const isPassTD = /pass(ing)?\s*t(ouch)?d(own)?s?/i.test(market)
                        const isPassINT = /pass(ing)?\s*intercept/i.test(market)
                        const isPassAtt = /pass(ing)?\s*attempts?/i.test(market)
                        const isPassComp = /pass(ing)?\s*completions?/i.test(market)
                        const isRushAtt = /rush(ing)?\s*attempts?/i.test(market)
                        // Receiving markets with inference
                        const isRec = /receptions?/i.test(market)
                        const isRecYds = /reception\s*yards?/i.test(market)
                        const inferred = Boolean(meta?.inferred)
                        const impliedFromAmerican = (odds: number): number => {
                          if (odds == null || Number.isNaN(odds)) return NaN
                          return odds >= 0 ? 100 / (odds + 100) : -odds / (-odds + 100)
                        }
                        const tdProb = (() => {
                          if (!isATD) return null
                          if (typeof meta?.p_any === "number") return meta.p_any
                          if (typeof meta?.avg_any === "number") return impliedFromAmerican(meta.avg_any)
                          if (typeof meta?.avg_yes === "number") return impliedFromAmerican(meta.avg_yes)
                          return null
                        })()

                        const projValue = (() => {
                          if (!(isPassTD || isPassINT)) return null
                          const lambda = typeof meta?.lambda === 'number' ? meta.lambda : null
                          if (lambda != null) return lambda
                          const proj = (item as any)?.projections
                          if (!proj) return null
                          if (isPassTD && typeof proj?.pass_tds === 'number') return proj.pass_tds
                          if (isPassINT && typeof proj?.pass_ints === 'number') return proj.pass_ints
                          return null
                        })()

                        const recDisplay = (() => {
                          if (!(isRec || isRecYds)) return null
                          if (typeof line === 'number') return line
                          const proj = (item as any)?.projections
                          if (isRec && typeof proj?.receptions === 'number') return proj.receptions
                          if (isRecYds && typeof proj?.rec_yds === 'number') return proj.rec_yds
                          return null
                        })()

                        // Determine the best value across players: highest line or highest TD prob
                        const isBestValue = (() => {
                          if (isATD) {
                            const probs = items.map((it) => {
                              const m = (it.inputs as any)?.[market]
                              if (typeof m?.p_any === "number") return m.p_any
                              if (typeof m?.avg_any === "number") return impliedFromAmerican(m.avg_any)
                              if (typeof m?.avg_yes === "number") return impliedFromAmerican(m.avg_yes)
                              return -Infinity
                            })
                            const maxP = Math.max(...(probs.filter((p) => Number.isFinite(p)) as number[]))
                            return tdProb != null && tdProb === maxP
                          }
                          if (isPassTD || isPassINT) {
                            const vals = items.map((it) => {
                              const m = (it.inputs as any)?.[market]
                              const lam = typeof m?.lambda === 'number' ? m.lambda : (it as any)?.projections?.[isPassTD ? 'pass_tds' : 'pass_ints']
                              return typeof lam === 'number' ? lam : -Infinity
                            })
                            const finite = vals.filter((v) => Number.isFinite(v)) as number[]
                            if (finite.length === 0) return false
                            if (isPassINT) {
                              const minV = Math.min(...finite)
                              return projValue != null && projValue === minV
                            }
                            const maxV = Math.max(...finite)
                            return projValue != null && projValue === maxV
                          }
                          if (isRec || isRecYds) {
                            const vals = items.map((it) => {
                              const m = (it.inputs as any)?.[market]
                              const ln = typeof m?.line === 'number' ? m.line : null
                              if (ln != null) return ln
                              const proj = (it as any)?.projections
                              if (isRec && typeof proj?.receptions === 'number') return proj.receptions
                              if (isRecYds && typeof proj?.rec_yds === 'number') return proj.rec_yds
                              return -Infinity
                            })
                            const finite = vals.filter((v) => Number.isFinite(v)) as number[]
                            if (finite.length === 0) return false
                            const maxV = Math.max(...finite)
                            return recDisplay != null && recDisplay === maxV
                          }
                          const allLines = items.map((it) => {
                            const m = (it.inputs as any)?.[market]
                            return typeof m?.line === "number" ? m.line : null
                          })
                          const maxLine = Math.max(...(allLines.filter((l) => l !== null) as number[]))
                          return line === maxLine && line !== null
                        })()

                        // Gate specific markets for non‑Pro
                        const gated = !isPro && (isATD || isRushAtt || isPassAtt || isPassComp)
                        if (gated) {
                          const label = isATD
                            ? 'Anytime TD'
                            : isPassAtt
                              ? 'Pass Attempts'
                              : isPassComp
                                ? 'Pass Completions'
                                : isRushAtt
                                  ? 'Rush Attempts'
                                  : market
                          return (
                            <div key={market} className="text-center">
                              <div className="text-sm text-muted-foreground mb-1">{label}</div>
                              <Button onClick={() => router.push('/pricing')} className="bg-orange-500 hover:bg-orange-600 text-white h-8 px-3 rounded-full inline-flex items-center gap-2">
                                <Lock className="w-3.5 h-3.5" /> Unlock (Pro)
                              </Button>
                            </div>
                          )
                        }

                        return (
                          <div key={market} className="space-y-2">
                            <div className="text-center">
                              <div className="text-sm text-muted-foreground mb-1 flex items-center justify-center gap-2">{isATD ? "Anytime TD" : (isPassINT ? "Interceptions" : market)}{(isRec || isRecYds) && inferred ? (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className="text-[10px] px-1 py-0.5 rounded bg-amber-500/15 text-amber-600 border border-amber-500/30">inferred</span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      No reception odds available right now. We infer receptions from our model (e.g., yards ÷ YPR).
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              ) : null}</div>
                              <div
                                className={`text-lg font-semibold px-3 py-2 rounded-lg transition-colors border ${
                                  isBestValue ? "bg-primary/10 text-primary border-primary/20" : "border-transparent text-foreground"
                                }`}
                                style={{}}
                                
                              >
                                <span className="inline-flex items-center justify-center min-h-[36px]">
                                  {isATD
                                    ? (tdProb != null ? `${(tdProb * 100).toFixed(1)}%` : "—")
                                    : (isPassTD || isPassINT)
                                      ? (projValue != null ? Number(projValue).toFixed(2) : '—')
                                      : (isRec || isRecYds)
                                        ? (recDisplay != null ? Number(recDisplay).toFixed(1) : '—')
                                        : (line != null ? line : "—")}
                                </span>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {selected.filter(Boolean).length < 2 && (
        <Card className="bg-muted/20 border-border/40">
          <CardContent className="p-12 text-center">
            <div className="bg-gradient-to-br from-muted/40 to-muted/20 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Select Players to Compare</h3>
            <p className="text-muted-foreground mb-4">
              Choose at least 2 players to see detailed comparisons of their projections, prop lines, and betting data.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <span>Search above to get started</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
