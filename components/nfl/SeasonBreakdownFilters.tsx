"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, Trophy, BarChart3, RotateCcw, Filter } from "lucide-react"

type Position = "QB" | "RB" | "WR" | "TE"
type Scoring = "full_ppr_4pt" | "full_ppr_6pt" | "half_ppr_4pt" | "half_ppr_6pt" | "standard_4pt" | "standard_6pt"
type PprType = "full_ppr" | "half_ppr" | "standard"
type TdPts = "4pt" | "6pt"

interface SeasonBreakdownFiltersProps {
  position: Position
  season: number
  scoring: Scoring
  limit: number
  onPositionChange: (position: Position) => void
  onSeasonChange: (season: number) => void
  onScoringChange: (scoring: Scoring) => void
  onLimitChange: (limit: number) => void
  onResetSort: () => void
}

export default function SeasonBreakdownFilters({
  position,
  season,
  scoring,
  limit,
  onPositionChange,
  onSeasonChange,
  onScoringChange,
  onLimitChange,
  onResetSort,
}: SeasonBreakdownFiltersProps) {
  const positions: { value: Position; label: string;}[] = [
    { value: "QB", label: "Quarterback",},
    { value: "RB", label: "Running Back"},
    { value: "WR", label: "Wide Receiver"},
    { value: "TE", label: "Tight End"},
  ]

  const pprOptions: { value: PprType; label: string; short: string }[] = [
    { value: "full_ppr", label: "Full PPR", short: "PPR" },
    { value: "half_ppr", label: "Half PPR", short: "Half" },
    { value: "standard", label: "Standard", short: "Std" },
  ]
  const tdOptions: { value: TdPts; label: string }[] = [
    { value: "4pt", label: "4pt Pass TD" },
    { value: "6pt", label: "6pt Pass TD" },
  ]

  const parseScoring = (s: Scoring): { ppr: PprType; td: TdPts } => {
    const parts = s.split("_")
    const tdRaw = parts.pop() as string
    const pprRaw = parts.join("_") as PprType
    const td = (tdRaw.endsWith("pt") ? tdRaw : (tdRaw + "pt")) as TdPts
    return { ppr: pprRaw, td }
  }

  const combineScoring = (ppr: PprType, td: TdPts): Scoring => `${ppr}_${td}` as Scoring

  const { ppr, td } = parseScoring(scoring)

  const limitOptions = [25, 50, 100, 200]
  const currentYear = new Date().getFullYear()
  const seasons = Array.from({ length: 6 }, (_, i) => currentYear - i)

  const isDefaultFilters = position === "QB" && season === currentYear && scoring === "half_ppr_4pt" && limit === 50

  return (
    <div className="space-y-4">
      {/* Main Filters Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {/* Position */}
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">
            <Users className="h-3 w-3" />
            Position
          </div>
          <Select value={position} onValueChange={onPositionChange}>
            <SelectTrigger className="h-9 bg-background/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {positions.map((pos) => (
                <SelectItem key={pos.value} value={pos.value}>
                  <div className="flex items-center gap-2">
                    <span>{pos.value}</span>
                    <span className="text-xs text-muted-foreground">• {pos.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Season */}
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">
            <Calendar className="h-3 w-3" />
            Season
          </div>
          <Select value={String(season)} onValueChange={(v) => onSeasonChange(Number(v))}>
            <SelectTrigger className="h-9 bg-background/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {seasons.map((yr) => (
                <SelectItem key={yr} value={String(yr)}>
                  {yr} {yr === currentYear && <span className="text-xs text-muted-foreground">• Current</span>}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* PPR Type */}
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">
            <Trophy className="h-3 w-3" />
            PPR
          </div>
          <Select value={ppr} onValueChange={(v) => onScoringChange(combineScoring(v as PprType, td))}>
            <SelectTrigger className="h-9 bg-background/50">
              <SelectValue placeholder="Select PPR" />
            </SelectTrigger>
            <SelectContent>
              {pprOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* QB TD Points */}
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">
            <Trophy className="h-3 w-3" />
            Pass TD
          </div>
          <Select value={td} onValueChange={(v) => onScoringChange(combineScoring(ppr, v as TdPts))}>
            <SelectTrigger className="h-9 bg-background/50">
              <SelectValue placeholder="Pass TD" />
            </SelectTrigger>
            <SelectContent>
              {tdOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Limit */}
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">
            <BarChart3 className="h-3 w-3" />
            Players
          </div>
          <Select value={String(limit)} onValueChange={(v) => onLimitChange(Number(v))}>
            <SelectTrigger className="h-9 bg-background/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {limitOptions.map((n) => (
                <SelectItem key={n} value={String(n)}>
                  Top {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Filters & Actions */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/50">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Filter className="h-3 w-3" />
          Active:
        </div>

        <Badge variant="secondary" className="h-6 text-xs">
          {position}
        </Badge>

        <Badge variant="secondary" className="h-6 text-xs">
          {season}
        </Badge>

        <Badge variant="secondary" className="h-6 text-xs">
          {pprOptions.find((x) => x.value === ppr)?.short}
        </Badge>
        <Badge variant="secondary" className="h-6 text-xs">{td.toUpperCase()}</Badge>

        <Badge variant="secondary" className="h-6 text-xs">
          Top {limit}
        </Badge>

        <div className="flex items-center gap-2 ml-auto">
          <Button variant="ghost" size="sm" onClick={onResetSort} className="h-6 px-2 text-xs">
            <RotateCcw className="h-3 w-3 mr-1" />
            Reset Sort
          </Button>
        </div>
      </div>
    </div>
  )
}
