"use client"

import { useQuery } from "@tanstack/react-query"
import { useMemo, useState } from "react"
import type { FantasyPosition, FantasyProfile, NflRankItem } from "@/types/nfl"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Target, Zap, BarChart3 } from "lucide-react"
import RankingsFilters, { deriveProfile, type RankingsFiltersState } from "@/components/nfl/RankingsFilters"
import ProjectionModal from "@/components/nfl/ProjectionModal"
import RankingsTable from "@/components/nfl/RankingsTable"
import { getWeekWindowForDate, isWithinWindow } from "@/lib/nfl-weeks"

type QueryKey = ["nfl-rankings", FantasyProfile, FantasyPosition]

async function fetchRankings(profile: FantasyProfile, position: FantasyPosition) {
  const res = await fetch(`/api/nfl/rankings?profile=${profile}&position=${position}`)
  if (!res.ok) throw new Error("Failed to load rankings")
  const json = await res.json()
  return json.data.items as NflRankItem[]
}

export default function NflRankingsPage() {
  const [filters, setFilters] = useState<RankingsFiltersState>({
    ppr: "half_ppr",
    tdPoints: 4,
    position: "QB",
    search: "",
  })
  const profile: FantasyProfile = deriveProfile(filters.ppr, filters.tdPoints)
  const position: FantasyPosition = filters.position
  const [selectedProjKey, setSelectedProjKey] = useState<string | null>(null)

  const {
    data: items = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: useMemo(() => ["nfl-rankings", profile, position] as QueryKey, [profile, position]),
    queryFn: () => fetchRankings(profile, position),
    staleTime: 60_000,
  })

  // Compute current NFL week window and filter items by commence_time if present
  const now = new Date()
  const window = getWeekWindowForDate(now)
  const weekItems = useMemo(() => {
    return items.filter((it) => {
      if (!it.commence_time) return false
      const dt = new Date(it.commence_time)
      if (isNaN(dt.getTime())) return false
      return isWithinWindow(dt, window)
    })
  }, [items, window])

  return (
    <>
      <div className="bg-gradient-to-br from-card/80 to-muted/40 dark:from-card/60 dark:to-muted/20 border-b-2 border-border/60">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/15 dark:bg-primary/25 rounded-3xl mb-4 border-2 border-primary/20">
              <span className="text-4xl">🏈</span>
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-black mb-4 text-foreground tracking-tight">NFL Week {window.week} Rankings</h1>
              <p className="text-xl md:text-2xl mb-4 text-muted-foreground font-medium">
                Vegas-Powered Fantasy Football Intelligence
              </p>
              <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Our rankings are driven solely by live Vegas markets — odds, game totals, spreads, and player props.
                No consensus projections, just market signals distilled into actionable fantasy insight.
              </p>
            </div>
            <div className="flex items-center justify-center gap-6 flex-wrap">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Vegas Line Integration</span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Real-Time Updates</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Market Signals</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 rounded-xl border border-border/60 bg-card/50 p-4 text-sm text-muted-foreground">
          <p>
            Our rankings lean entirely on Vegas market data to surface weekly opportunities and avoid potential busts —
            analyzing game totals, spreads, and player props. Odds data is powered by{" "}
            <a
              href="https://www.oddsmash.io/nfl/odds/player-props"
              className="underline hover:text-primary font-medium"
            >
              OddSmash
            </a>{" "}
            — the most comprehensive NFL betting intelligence platform.
          </p>
        </div>

        {/* Rankings Table */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-muted/50 border-b">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Fantasy Rankings
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {/* Filters */}
            <div className="p-4 border-b bg-background/50">
              <RankingsFilters value={filters} onChange={(next) => setFilters(next)} />
            </div>

            {/* Table Content */}
            {isLoading && (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-sm text-muted-foreground">Loading rankings...</p>
              </div>
            )}

            {isError && (
              <div className="p-8 text-center">
                <div className="text-destructive mb-2">Failed to load rankings</div>
                <Button variant="outline" onClick={() => refetch()}>
                  Try Again
                </Button>
              </div>
            )}

            {!isLoading && !isError && items.length === 0 && (
              <div className="p-8 text-center">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
                <p className="text-sm text-muted-foreground">
                  Rankings data is not available for the current selection.
                </p>
              </div>
            )}

            {!isLoading && !isError && weekItems.length > 0 && (
              <RankingsTable
                items={weekItems}
                position={position}
                search={filters.search}
                onRowClick={(k) => setSelectedProjKey(k)}
              />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="bg-gradient-to-r from-muted/30 to-muted/10 dark:from-muted/20 dark:to-muted/5 border-t-2 border-border/60">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">Why Our Rankings Are Different</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We don&apos;t just aggregate expert opinions — we integrate live market data to give you the edge
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-card/60 dark:bg-card/40 rounded-2xl border border-border/40">
              <div className="w-16 h-16 bg-blue-500/10 dark:bg-blue-400/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="text-lg font-bold mb-3 text-foreground">Vegas Integration</h3>
              <p className="text-muted-foreground leading-relaxed">
                Live betting lines, game totals, and player props inform our rankings. When Vegas moves, we adjust —
                giving you the most current market perspective.
              </p>
            </div>
            <div className="text-center p-6 bg-card/60 dark:bg-card/40 rounded-2xl border border-border/40">
              <div className="w-16 h-16 bg-purple-500/10 dark:bg-purple-400/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-purple-500" />
              </div>
              <h3 className="text-lg font-bold mb-3 text-foreground">Real-Time Updates</h3>
              <p className="text-muted-foreground leading-relaxed">
                Rankings update throughout the week as news breaks and lines move. Get the latest intel on injuries,
                weather, and game script changes.
              </p>
            </div>
            <div className="text-center p-6 bg-card/60 dark:bg-card/40 rounded-2xl border border-border/40">
              <div className="w-16 h-16 bg-orange-500/10 dark:bg-orange-400/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-orange-500" />
              </div>
              <h3 className="text-lg font-bold mb-3 text-foreground">Market Signals</h3>
              <p className="text-muted-foreground leading-relaxed">
                Identify players with positive market momentum and avoid those facing headwinds. Our algorithms detect
                when the smart money is moving.
              </p>
            </div>
          </div>
        </div>
      </div>

      <ProjectionModal projKey={selectedProjKey} onClose={() => setSelectedProjKey(null)} />
    </>
  )
}
