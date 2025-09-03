"use client"

import { useMemo } from "react"
import type { FantasyPosition, NflRankItem } from "@/types/nfl"
import { Badge } from "@/components/ui/badge"
import { PlayerBadge, getPlayerBadges } from "@/components/ui/player-badge"
import { useQuery } from "@tanstack/react-query"
import { formatMatchup, teamAbbrFrom, teamLogoPath } from "@/lib/nfl-teams"
import { useIsMobile } from "@/hooks/use-mobile"
import { Clock, MapPin, Lock } from "lucide-react"
import { useAuth } from "@/components/providers/auth-provider"
import Link from "next/link"
import { Button } from "@/components/ui/button"

async function fetchProjection(proj_key: string) {
  const res = await fetch(`/api/nfl/projection?proj_key=${encodeURIComponent(proj_key)}`)
  if (!res.ok) throw new Error("Failed to load projection")
  const json = await res.json()
  return json.data
}

function initialsFrom(fullName: string | undefined): string {
  if (!fullName) return "?"
  const parts = fullName.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase()
}

function InlineAvatar({ projKey, fullName, size = 32 }: { projKey: string; fullName: string; size?: number }) {
  const { data } = useQuery({
    queryKey: useMemo(() => ["nfl-projection", projKey] as const, [projKey]),
    queryFn: () => fetchProjection(projKey),
    enabled: Boolean(projKey),
    staleTime: 60_000,
    gcTime: 300_000,
    refetchOnWindowFocus: false,
    retry: 1,
  })
  const headshot = (data as any)?.identity?.headshot_url ?? (data as any)?.headshot_url
  return (
    <div className="rounded-full overflow-hidden bg-muted flex items-center justify-center border border-border/40" style={{ width: size, height: size }}>
      {typeof headshot === "string" && headshot ? (
        <img src={headshot} alt={fullName} className="w-full h-full object-cover" />
      ) : (
        <span className="text-xs font-bold text-foreground">{initialsFrom(fullName)}</span>
      )}
    </div>
  )
}

export default function RankingsTable({
  items,
  position,
  search,
  onRowClick,
}: {
  items: NflRankItem[]
  position: FantasyPosition
  search: string
  onRowClick: (projKey: string) => void
}) {
  const isMobile = useIsMobile()
  const { isPro } = useAuth()
  const rankByProjKey = useMemo(() => {
    const m = new Map<string, number>()
    items.forEach((it, idx) => m.set(it.proj_key, idx + 1))
    return m
  }, [items])
  const filteredItems = items.filter((it) => !search || it.full_name.toLowerCase().includes(search.toLowerCase()))
  const limitedItems = isPro ? filteredItems : filteredItems.slice(0, 10)

  if (isMobile) {
    return (
      <MobileRankingsTable isPro={isPro} items={limitedItems} position={position} onRowClick={onRowClick} rankByProjKey={rankByProjKey} />
    )
  }

  return (
    <DesktopRankingsTable isPro={isPro} items={limitedItems} position={position} onRowClick={onRowClick} rankByProjKey={rankByProjKey} />
  )
}

function MobileRankingsTable({
  isPro,
  items,
  position,
  onRowClick,
  rankByProjKey,
}: {
  isPro: boolean
  items: NflRankItem[]
  position: FantasyPosition
  onRowClick: (projKey: string) => void
  rankByProjKey: Map<string, number>
}) {
  const first = items.slice(0, Math.min(5, items.length))
  const next = isPro ? [] : items.slice(5, Math.min(10, items.length))
  return (
    <div className="space-y-3">
      {first.map((item, idx) => (
        <button
          key={item.player_id + idx}
          onClick={() => onRowClick(item.proj_key)}
          className="w-full text-left bg-background border border-border/60 rounded-xl p-4 hover:bg-muted/30 hover:border-primary/30 transition-all duration-200 hover:shadow-md group"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-lg text-sm font-bold text-primary">
                  {rankByProjKey.get(item.proj_key) ?? idx + 1}
                </div>
                <div className="grid grid-cols-[36px,1fr] gap-x-3 gap-y-0.5 items-center min-w-0">
                  <div className="row-span-2"><InlineAvatar projKey={item.proj_key} fullName={item.full_name} size={36} /></div>
                  <div className="font-semibold text-foreground truncate group-hover:text-primary transition-colors leading-tight">
                    {item.full_name}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-medium text-muted-foreground">{item.team_abbr}</span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <Badge variant="outline" className="h-5 text-xs px-2">
                      {item.position}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-foreground">{item.score.toFixed(1)}</div>
                <div className="text-xs text-muted-foreground">proj pts</div>
              </div>
            </div>
            <MobileGameInfo item={item} />
          </div>
        </button>
      ))}

      {!isPro && next.length > 0 && (
        <div className="relative">
          <div className="space-y-3 pointer-events-none">
            {next.map((item, nidx) => (
              <div key={item.player_id + "b" + nidx} className="w-full text-left bg-background border border-border/60 rounded-xl p-4 opacity-50 blur-[2px]">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-lg text-sm font-bold text-primary">
                    {rankByProjKey.get(item.proj_key) ?? (5 + nidx + 1)}
                  </div>
                  <div className="h-4 w-24 bg-muted/40 rounded" />
                </div>
              </div>
            ))}
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-5 px-4">
              <div className="text-xs text-muted-foreground pb-2 sm:pb-3 md:pb-4">You’re only seeing the top 5 {position}s. Unlock full rankings + custom scoring.</div>
              <Link href="/pricing">
                <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-full h-9 px-4">
                  <Lock className="h-4 w-4 mr-2" />
                  Unlock Full Rankings
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function MobilePlayerBadges({
  item,
  position,
  index,
  allItems,
}: { item: NflRankItem; position: FantasyPosition; index: number; allItems: NflRankItem[] }) {
  const { data } = useQuery({
    queryKey: useMemo(() => ["nfl-projection", item.proj_key] as const, [item.proj_key]),
    queryFn: () => fetchProjection(item.proj_key),
    enabled: index < 20, // Only load badges for top players to avoid too many requests
    staleTime: 60_000,
  })

  // Store in a lightweight global cache so sibling rows can compute ranks without extra queries
  if (data) getProjCache().set(item.proj_key, data)

  // Mock game data - in real app this would come from the API
  const gameData = {
    event_total: data?.event_total,
    team_implied_total: data?.team_implied_total,
    spread: data?.home_spread,
  }

  const context = computeBadgeContext(allItems, index)
  const badges = getPlayerBadges(item, gameData, data?.inputs, position, context)

  if (badges.length === 0) return null

  return (
    <div className="flex items-center gap-1 mt-2">
      {badges.slice(0, 4).map((badgeType) => (
        <PlayerBadge key={badgeType} type={badgeType} />
      ))}
      {badges.length > 4 && (
        <Badge variant="outline" className="h-6 w-6 p-0 rounded-full flex items-center justify-center text-xs">
          +{badges.length - 4}
        </Badge>
      )}
    </div>
  )
}

function MobileGameInfo({ item, index }: { item: NflRankItem; index?: number }) {
  const away = item.away_team ?? item.team_abbr
  const home = item.home_team ?? item.team_abbr
  const homeAbbr = teamAbbrFrom(home || "") || (typeof home === "string" ? home.substring(0, 3).toUpperCase() : "HOME")
  const awayAbbr = teamAbbrFrom(away || "") || (typeof away === "string" ? away.substring(0, 3).toUpperCase() : "AWY")
  const playerAbbr = (item.team_abbr || "").toUpperCase()
  const isPlayerAway = playerAbbr === awayAbbr
  const opponentAbbr = isPlayerAway ? homeAbbr : awayAbbr

  const { data } = useQuery({
    queryKey: useMemo(() => ["nfl-projection", item.proj_key] as const, [item.proj_key]),
    queryFn: () => fetchProjection(item.proj_key),
    enabled: Boolean(item.proj_key),
    staleTime: 60_000,
    gcTime: 300_000,
    refetchOnWindowFocus: false,
    retry: 1,
  })

  const total = typeof (data as any)?.event_total === "number" ? (data as any).event_total : undefined
  const spread = typeof (data as any)?.home_spread === "number" ? (data as any).home_spread : undefined
  let teamImpliedTotal =
    typeof (data as any)?.team_implied_total === "number" ? (data as any).team_implied_total : undefined
  if (typeof total === "number" && typeof spread === "number" && teamImpliedTotal == null) {
    // Compute from total and home spread: home = total/2 - spread/2, away = total - home
    const homeImpl = total / 2 - spread / 2
    const awayImpl = total - homeImpl
    teamImpliedTotal = isPlayerAway ? awayImpl : homeImpl
  }

  // Format: @SEA • 49.5 | SF -2.5 • Team: 24.5
  const oppDisplay = `${isPlayerAway ? "@" : ""}${opponentAbbr}`
  const spreadDisplay = typeof spread === "number" ? `${homeAbbr} ${spread > 0 ? `+${spread}` : spread}` : null
  const gameInfo = [oppDisplay, typeof total === "number" ? total.toFixed(1) : null, spreadDisplay]
    .filter(Boolean)
    .join(" • ")

  return (
    <div className="flex items-center gap-2 p-3 bg-muted/20 rounded-lg border border-border/40">
      <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-foreground truncate">{gameInfo || "—"}</div>
        {item.commence_time && (
          <div className="flex items-center gap-1 mt-1">
            <Clock className="w-3 h-3 text-muted-foreground" />
            <div className="text-xs text-muted-foreground">{formatCT(item.commence_time)}</div>
          </div>
        )}
      </div>
    </div>
  )
}

function MobileMarketCell({ projKey, market, index }: { projKey: string; market: string; index: number }) {
  const { data, isLoading } = useQuery({
    queryKey: useMemo(() => ["nfl-projection", projKey] as const, [projKey]),
    queryFn: () => fetchProjection(projKey),
    enabled: index < 50,
    staleTime: 60_000,
  })

  const meta = (data?.inputs as any)?.[market]
  const line = typeof meta?.line === "number" ? meta.line : null
  const avgOver = typeof meta?.avg_over === "number" ? meta.avg_over : null
  const avgUnder = typeof meta?.avg_under === "number" ? meta.avg_under : null
  const inferred = Boolean(meta?.inferred)

  const fmt = (n: number | null) => (n == null ? "—" : n > 0 ? `+${n}` : `${n}`)

  return (
    <div className="p-3 bg-muted/10 rounded-lg border border-border/30">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
          {getMarketShortLabel(market)}
          {inferred && (
            <span className="text-[9px] px-1 py-0.5 rounded bg-amber-500/15 text-amber-600 border border-amber-500/30">inferred</span>
          )}
        </div>
      </div>
      <div className="space-y-1">
        <div className="text-sm font-bold text-foreground">{isLoading ? "—" : line != null ? String(line) : "—"}</div>
        <div className="text-xs text-muted-foreground">{isLoading ? "" : `${fmt(avgOver)}/${fmt(avgUnder)}`}</div>
      </div>
    </div>
  )
}

function DesktopRankingsTable({
  isPro,
  items,
  position,
  onRowClick,
  rankByProjKey,
}: {
  isPro: boolean
  items: NflRankItem[]
  position: FantasyPosition
  onRowClick: (projKey: string) => void
  rankByProjKey: Map<string, number>
}) {
  const first = isPro ? items : items.slice(0, Math.min(5, items.length))
  const next = isPro ? [] : items.slice(5, Math.min(10, items.length))
  return (
    <div className="bg-background border border-border/60 rounded-xl overflow-hidden">
      {/* Table Header */}
      <div className="bg-gradient-to-r from-muted/50 to-muted/30 border-b border-border/60">
        {/* Row 1: Group labels */}
        <div className="flex items-center px-6 pt-3 gap-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <div className="w-16 flex-shrink-0" />
          <div className="flex-[2] min-w-[340px]" />
          <div className="w-40" />
          <div className="w-44" />
          <div className="w-28" />
        </div>
        {/* Row 2: Column labels */}
        <div className="flex items-center px-6 pb-3 pt-2 gap-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          <div className="w-16 flex-shrink-0">Rank</div>
          <div className="flex-[2] min-w-[340px]">Player</div>
          <div className="w-40 text-center">Game</div>
          <div className="w-44 text-center">Environment</div>
          <div className="w-28 text-right">Score</div>
        </div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-border/40 max-h-[70vh] overflow-y-auto">
        {first.map((it, idx) => (
          <button
            key={it.player_id + idx}
            onClick={() => onRowClick(it.proj_key)}
            className="w-full text-left hover:bg-muted/30 hover:border-l-4 hover:border-l-primary relative transition-all duration-200 group"
          >
            <div className="flex items-center px-6 py-4 gap-4">
              {/* Rank pill */}
              <div className="w-16 flex-shrink-0">
                <div className="text-center bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg px-3 py-2 font-bold text-primary group-hover:from-primary/20 group-hover:to-primary/10 transition-all">
                  {rankByProjKey.get(it.proj_key) ?? idx + 1}
                </div>
              </div>

              {/* Player */}
              <div className="flex-[2] min-w-[340px]">
                <div className="grid grid-cols-[40px,1fr] gap-x-3 gap-y-0.5 items-center">
                  <div className="row-span-2"><InlineAvatar projKey={it.proj_key} fullName={it.full_name} size={40} /></div>
                  <div className="font-bold text-foreground truncate group-hover:text-primary transition-colors text-lg leading-tight">
                    {it.full_name}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mt-0.5">
                    {(() => { const p = teamLogoPath(it.team_abbr); return p ? <img src={p} alt={it.team_abbr} className="w-4 h-4 rounded-sm" /> : null })()}
                    <span className="font-semibold">{it.team_abbr}</span>
                    <span>•</span>
                    <Badge variant="outline" className="h-5 text-xs px-2">
                      {it.position}
                    </Badge>
                    {(() => {
                      try {
                        const rec = getProjCache().get(it.proj_key)
                        const inferred = Boolean(rec?.inputs?.['Receptions']?.inferred || rec?.inputs?.['Reception Yards']?.inferred)
                        if (!inferred) return null
                        return (
                          <span className="text-[9px] px-1 py-0.5 rounded bg-amber-500/15 text-amber-600 border border-amber-500/30">inferred</span>
                        )
                      } catch { return null }
                    })()}
                  </div>
                </div>
              </div>

              {/* Game / Env / Team Total */}
              <DesktopGameEnvCells item={it} index={idx} />

              {/* Score */}
              <div className="w-28 text-right">
                <div className="text-2xl font-bold leading-none text-foreground">{it.score.toFixed(1)}</div>
                <div className="text-xs text-muted-foreground mt-1">proj points</div>
              </div>
            </div>
          </button>
        ))}

        {!isPro && next.length > 0 && (
          <div className="relative">
            <div className="divide-y divide-border/40 opacity-60 blur-[2px] pointer-events-none">
              {next.map((it, nidx) => (
                <div key={it.player_id + "b" + nidx} className="flex items-center px-6 py-4 gap-4">
                  <div className="w-16 flex-shrink-0">
                    <div className="text-center bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg px-3 py-2 font-bold text-primary">
                      {rankByProjKey.get(it.proj_key) ?? (5 + nidx + 1)}
                    </div>
                  </div>
                  <div className="flex-[2] min-w-[340px] h-6 bg-muted/40 rounded" />
                  <div className="w-40" />
                  <div className="w-44" />
                  <div className="w-28" />
                </div>
              ))}
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-6">
                <div className="text-sm text-muted-foreground pb-3 sm:pb-4 md:pb-6 lg:pb-8">You’re only seeing the top 5 {position}s. Unlock the full rankings + custom scoring.</div>
                <Link href="/pricing">
                  <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-full h-10 px-5">
                    <Lock className="h-4 w-4 mr-2" />
                    Unlock Full Rankings
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function DesktopPlayerBadges({
  item,
  position,
  index,
  allItems,
}: { item: NflRankItem; position: FantasyPosition; index: number; allItems: NflRankItem[] }) {
  const { data } = useQuery({
    queryKey: useMemo(() => ["nfl-projection", item.proj_key] as const, [item.proj_key]),
    queryFn: () => fetchProjection(item.proj_key),
    enabled: index < 20, // Only load badges for top players
    staleTime: 60_000,
  })

  if (data) getProjCache().set(item.proj_key, data)

  // Mock game data - in real app this would come from the API
  const gameData = {
    event_total: data?.event_total,
    team_implied_total: data?.team_implied_total,
    spread: data?.home_spread,
  }

  const context = computeBadgeContext(allItems, index)
  const badges = getPlayerBadges(item, gameData, data?.inputs, position, context)

  if (badges.length === 0) return null

  return (
    <div className="flex items-center gap-1 mt-2">
      {badges.slice(0, 5).map((badgeType) => (
        <PlayerBadge key={badgeType} type={badgeType} />
      ))}
      {badges.length > 5 && (
        <Badge variant="outline" className="h-6 w-6 p-0 rounded-full flex items-center justify-center text-xs">
          +{badges.length - 5}
        </Badge>
      )}
    </div>
  )
}

// ------- Badge context helpers (top/bottom team totals, TD favorites) -------
const __moduleProjCache: { map?: Map<string, any> } = {}
function getProjCache(): Map<string, any> {
  try {
    if (typeof window !== 'undefined') {
      const w = window as any
      w.__nflProjCache = w.__nflProjCache || new Map<string, any>()
      return w.__nflProjCache as Map<string, any>
    }
  } catch (e) {
    // ignore
  }
  if (!__moduleProjCache.map) __moduleProjCache.map = new Map<string, any>()
  return __moduleProjCache.map
}

function getAnyTdProbFromInputs(inputs: any): number | undefined {
  const atd = inputs?.["Anytime Touchdown Scorer"]
  const p = typeof atd?.p_any === "number" ? atd.p_any : undefined
  return p
}

function computeBadgeContext(items: NflRankItem[], currentIdx: number) {
  const cache = getProjCache()
  const limit = Math.min(items.length, 50)
  const totals: Array<{ idx: number; total: number }> = []
  const tdFavByPos: Record<string, { idx: number; prob: number }> = {}

  for (let i = 0; i < limit; i++) {
    const it = items[i]
    const rec = cache.get(it.proj_key)
    if (!rec) continue
    // Derive team implied if available; otherwise use event_total as a fallback ordering proxy
    if (typeof rec?.event_total === "number") {
      const total = Number(rec.event_total)
      const spread = typeof rec?.home_spread === 'number' ? Number(rec.home_spread) : undefined
      let teamTotal: number | undefined = typeof rec?.team_implied_total === 'number' ? Number(rec.team_implied_total) : undefined
      if (teamTotal == null && typeof spread === 'number') {
        // Approximate based on player team home/away using rank item position (not ideal w/o team_abbr)
        // Fallback to half of total if unknown
        teamTotal = total / 2
      }
      totals.push({ idx: i, total: teamTotal ?? total / 2 })
    }
    const prob = getAnyTdProbFromInputs(rec?.inputs)
    if (typeof prob === "number") {
      const key = it.position
      const best = tdFavByPos[key]
      if (!best || prob > best.prob) tdFavByPos[key] = { idx: i, prob }
    }
  }

  const topTeamTotal = isIdxInTopK(totals, currentIdx, 3, "desc")
  const bottomTeamTotal = isIdxInTopK(totals, currentIdx, 3, "asc")
  const currentPos = items[currentIdx]?.position
  const tdFavorite = currentPos ? tdFavByPos[currentPos]?.idx === currentIdx : false
  return { topTeamTotal, bottomTeamTotal, tdFavorite }
}

function isIdxInTopK(
  arr: Array<{ idx: number; total: number }>,
  idx: number,
  k: number,
  direction: "asc" | "desc",
) {
  if (arr.length === 0) return false
  const sorted = [...arr].sort((a, b) => (direction === "asc" ? a.total - b.total : b.total - a.total))
  const top = sorted.slice(0, Math.min(k, sorted.length)).map((x) => x.idx)
  return top.includes(idx)
}

function DesktopMarketCell({ projKey, market, index }: { projKey: string; market: string; index: number }) {
  const { data, isLoading } = useQuery({
    queryKey: useMemo(() => ["nfl-projection", projKey] as const, [projKey]),
    queryFn: () => fetchProjection(projKey),
    enabled: index < 50,
    staleTime: 60_000,
  })

  const meta = (data?.inputs as any)?.[market]
  const line = typeof meta?.line === "number" ? meta.line : null
  const avgOver = typeof meta?.avg_over === "number" ? meta.avg_over : null
  const avgUnder = typeof meta?.avg_under === "number" ? meta.avg_under : null
  const inferred = Boolean(meta?.inferred)

  const fmt = (n: number | null) => (n == null ? "—" : n > 0 ? `+${n}` : `${n}`)

  return (
    <div className="w-32 text-center">
      <div className="flex items-center justify-center gap-2 mb-1">
        <div className="text-lg font-bold text-foreground">{isLoading ? "—" : line != null ? String(line) : "—"}</div>
        {!isLoading && inferred && (
          <span className="text-[9px] px-1 py-0.5 rounded bg-amber-500/15 text-amber-600 border border-amber-500/30">inferred</span>
        )}
      </div>
      <div className="text-xs text-muted-foreground">{isLoading ? "" : `${fmt(avgOver)}/${fmt(avgUnder)}`}</div>
    </div>
  )
}

function DesktopGameEnvCells({ item, index }: { item: NflRankItem; index: number }) {
  const away = item.away_team ?? item.team_abbr
  const home = item.home_team ?? item.team_abbr
  const kickoff = item.commence_time
  const homeAbbr = teamAbbrFrom(home || "") || (typeof home === "string" ? home.substring(0, 3).toUpperCase() : "HOME")
  const awayAbbr = teamAbbrFrom(away || "") || (typeof away === "string" ? away.substring(0, 3).toUpperCase() : "AWY")
  const playerAbbr = (item.team_abbr || "").toUpperCase()
  const isPlayerAway = playerAbbr === awayAbbr

  const { data } = useQuery({
    queryKey: useMemo(() => ["nfl-projection", item.proj_key] as const, [item.proj_key]),
    queryFn: () => fetchProjection(item.proj_key),
    enabled: Boolean(item.proj_key),
    staleTime: 60_000,
    gcTime: 300_000,
    refetchOnWindowFocus: false,
    retry: 1,
  })

  const total = typeof (data as any)?.event_total === "number" ? (data as any).event_total : undefined
  const spread = typeof (data as any)?.home_spread === "number" ? (data as any).home_spread : undefined
  let teamImpliedTotal =
    typeof (data as any)?.team_implied_total === "number" ? (data as any).team_implied_total : undefined

  if (data) getProjCache().set(item.proj_key, data)

  const dateStr = kickoff ? formatCT(kickoff) : null
  const envStr = [
    typeof total === "number" ? `O/U ${Number(total).toFixed(1)}` : null,
    typeof spread === "number" ? `${homeAbbr} ${spread > 0 ? `+${spread}` : spread}` : null,
  ]
    .filter(Boolean)
    .join(" | ")

  // Calculate player's team implied total
  const playerTeamTotal = (() => {
    if (typeof teamImpliedTotal === "number") return teamImpliedTotal
    if (typeof total === "number" && typeof spread === "number") {
      const homeImpl = total / 2 - spread / 2
      const awayImpl = total - homeImpl
      return isPlayerAway ? awayImpl : homeImpl
    }
    return undefined
  })()

  return (
    <>
      <div className="w-40 text-center">
        <div className="flex items-center justify-center gap-2 font-semibold text-foreground text-base">
          {(() => { const p = teamLogoPath(awayAbbr); return p ? <img src={p} alt={awayAbbr} className="w-5 h-5" /> : null })()}
          <span>{formatMatchup(away, home)}</span>
          {(() => { const p = teamLogoPath(homeAbbr); return p ? <img src={p} alt={homeAbbr} className="w-5 h-5" /> : null })()}
        </div>
        {dateStr && (
          <div className="flex items-center justify-center gap-1 mt-1">
            <Clock className="w-3 h-3 text-muted-foreground" />
            <div className="text-xs text-muted-foreground">{dateStr}</div>
          </div>
        )}
      </div>
      <div className="w-44 text-center">
        <div className="font-semibold text-foreground text-base">{envStr || "—"}</div>
        <div className="text-xs text-muted-foreground mt-1">Game Environment</div>
      </div>
      {/* Team Total column hidden for now */}
    </>
  )
}

// removed footer CTA per updated design

function formatCT(timestamp: string): string {
  try {
    const dt = new Date(timestamp)
    const opts: Intl.DateTimeFormatOptions = {
      timeZone: "America/Chicago",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }
    const s = dt.toLocaleString("en-US", opts)
    return s.replace(/,\s?\d{4}/, "")
  } catch {
    return ""
  }
}

function getMarketGroupsForPosition(position: FantasyPosition): { label: string; markets: string[] }[] {
  if (position === "QB") {
    return [
      { label: "Passing", markets: ["Pass Yards", "Pass TDs"] },
      { label: "Rushing", markets: ["Rush Yards"] },
    ]
  }
  if (position === "RB") {
    return [
      { label: "Rushing", markets: ["Rush Yards", "Longest Rush"] },
      { label: "Receiving", markets: ["Reception Yards"] },
    ]
  }
  if (position === "WR" || position === "TE") {
    return [{ label: "Receiving", markets: ["Reception Yards", "Receptions", "Longest Reception"] }]
  }
  return [
    { label: "Rushing", markets: ["Rush Yards"] },
    { label: "Receiving", markets: ["Reception Yards", "Receptions"] },
  ]
}

function getMarketShortLabel(market: string): string {
  switch (market) {
    case "Pass Yards":
      return "YDS"
    case "Pass TDs":
      return "TDS"
    case "Rush Yards":
      return "YDS"
    case "Reception Yards":
      return "YDS"
    case "Receptions":
      return "REC"
    case "Longest Rush":
      return "LONG"
    case "Longest Reception":
      return "LONG"
    default:
      return market
  }
}
