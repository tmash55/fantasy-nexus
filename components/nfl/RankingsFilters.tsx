"use client"

import { useState, useEffect } from "react"
import type { FantasyPosition, FantasyProfile } from "@/types/nfl"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Search, X, Filter, Zap } from "lucide-react"
import { useAuth } from "@/components/providers/auth-provider"

export type PprSetting = "standard" | "half_ppr" | "full_ppr"
export type TdPoints = 4 | 6

export interface RankingsFiltersState {
  ppr: PprSetting
  tdPoints: TdPoints
  position: FantasyPosition
  search: string
}

export function deriveProfile(ppr: PprSetting, tdPoints: TdPoints): FantasyProfile {
  const td = tdPoints === 4 ? "4pt" : "6pt"
  if (ppr === "standard") return `standard_${td}` as FantasyProfile
  if (ppr === "half_ppr") return `half_ppr_${td}` as FantasyProfile
  return `full_ppr_${td}` as FantasyProfile
}

const POSITION_OPTIONS: FantasyPosition[] = ["QB", "RB", "WR", "TE", "FLEX"]

export default function RankingsFilters({
  value,
  onChange,
}: {
  value: RankingsFiltersState
  onChange: (next: RankingsFiltersState, derivedProfile: FantasyProfile) => void
}) {
  const [local, setLocal] = useState<RankingsFiltersState>(value)
  const { isPro } = useAuth()
  const locked = !isPro

  useEffect(() => {
    setLocal(value)
  }, [value])

  const update = (patch: Partial<RankingsFiltersState>) => {
    if (locked) {
      const keys = Object.keys(patch)
      const onlyPosition = keys.length === 1 && keys[0] === "position"
      if (!onlyPosition) return
    }
    const next = { ...local, ...patch }
    setLocal(next)
    onChange(next, deriveProfile(next.ppr, next.tdPoints))
  }

  const clearSearch = () => update({ search: "" })
  const currentProfile = deriveProfile(local.ppr, local.tdPoints)

  return (
    <Card className="relative bg-gradient-to-r from-card via-card to-primary/5 border border-primary/20">
      <CardContent className="p-4">
        {/* Header - Compact */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-1.5 rounded-lg">
              <Filter className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Rankings Filters</h3>
              <p className="text-xs text-muted-foreground">Customize your view</p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-xs px-2 py-1">
            <Zap className="w-3 h-3 mr-1" />
            {currentProfile}
          </Badge>
        </div>

        {/* Compact Filter Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          {/* Position */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Position</label>
            <Select value={local.position} onValueChange={(v) => update({ position: v as FantasyPosition })}>
              <SelectTrigger className="h-9 text-sm bg-background/60 border-border/60 hover:border-primary/40 transition-colors">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {POSITION_OPTIONS.map((pos) => (
                  <SelectItem key={pos} value={pos} className="text-sm">
                    <div className="flex items-center gap-2">
                      <span>{pos}</span>
                      {pos === "FLEX" && <span className="text-xs text-muted-foreground">RB/WR/TE</span>}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* PPR */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Scoring</label>
            <Select value={local.ppr} onValueChange={(v) => update({ ppr: v as PprSetting })}>
              <SelectTrigger disabled={locked} className="h-9 text-sm bg-background/60 border-border/60 hover:border-primary/40 transition-colors">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard" className="text-sm">
                  <div className="flex items-center gap-2">
                    <span>Standard</span>
                    <Badge variant="outline" className="text-xs px-1">
                      0 PPR
                    </Badge>
                  </div>
                </SelectItem>
                <SelectItem value="half_ppr" className="text-sm">
                  <div className="flex items-center gap-2">
                    <span>Half PPR</span>
                    <Badge variant="outline" className="text-xs px-1">
                      0.5
                    </Badge>
                  </div>
                </SelectItem>
                <SelectItem value="full_ppr" className="text-sm">
                  <div className="flex items-center gap-2">
                    <span>Full PPR</span>
                    <Badge variant="outline" className="text-xs px-1">
                      1.0
                    </Badge>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* TD Points */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Pass TD</label>
            <Select value={String(local.tdPoints)} onValueChange={(v) => update({ tdPoints: Number(v) as TdPoints })}>
              <SelectTrigger disabled={locked} className="h-9 text-sm bg-background/60 border-border/60 hover:border-primary/40 transition-colors">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="4" className="text-sm">
                  <div className="flex items-center gap-2"><span>4 Points</span></div>
                </SelectItem>
                <SelectItem value="6" className="text-sm">
                  <div className="flex items-center gap-2"><span>6 Points</span></div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Search */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Search</label>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-muted-foreground" />
              <Input
                type="text"
                value={local.search}
                onChange={(e) => update({ search: e.target.value })}
                placeholder="Player name..."
                disabled={locked}
                className="h-9 pl-7 pr-8 text-sm bg-background/60 border-border/60 hover:border-primary/40 focus:border-primary/60 transition-colors"
              />
              {local.search && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSearch}
                  disabled={locked}
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 hover:bg-muted/60"
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Active Filters - Mobile Responsive */}
        {(local.search || local.position !== "FLEX" || local.ppr !== "full_ppr" || local.tdPoints !== 6) && (
          <div className="bg-muted/20 border border-border/30 rounded-lg p-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <span className="text-xs font-medium text-foreground">Active Filters</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => update({ search: "", position: "FLEX", ppr: "full_ppr", tdPoints: 6 })}
                className="text-xs h-6 px-2 self-start sm:self-auto"
              >
                Reset All
              </Button>
            </div>
            <div className="flex flex-wrap gap-1">
              {local.search && (
                <Badge
                  variant="secondary"
                  className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-xs px-2 py-0.5 gap-1"
                >
                  &quot;{local.search}&quot;
                  <X className="w-2 h-2 cursor-pointer" onClick={clearSearch} />
                </Badge>
              )}
              {local.position !== "FLEX" && (
                <Badge
                  variant="secondary"
                  className="bg-green-500/10 text-green-600 border-green-500/20 text-xs px-2 py-0.5"
                >
                  {local.position}
                </Badge>
              )}
              {local.ppr !== "full_ppr" && (
                <Badge
                  variant="secondary"
                  className="bg-purple-500/10 text-purple-600 border-purple-500/20 text-xs px-2 py-0.5"
                >
                  {local.ppr === "standard" ? "Standard" : "Half PPR"}
                </Badge>
              )}
              {local.tdPoints !== 6 && (
                <Badge
                  variant="secondary"
                  className="bg-orange-500/10 text-orange-600 border-orange-500/20 text-xs px-2 py-0.5"
                >
                  4pt TD
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
