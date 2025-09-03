"use client"

import type React from "react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  TrendingUp,
  TrendingDown,
  Target,
  Zap,
  Crown,
  Shield,
  ShieldAlert,
  Flame,
  Snowflake,
  Trophy,
  Activity,
} from "lucide-react"

export type PlayerBadgeType =
  | "highest-over-under"
  | "lowest-over-under"
  | "highest-team-total"
  | "lowest-team-total"
  | "td-favorite"
  | "positive-game-script"
  | "shootout-alert"
  | "highest-yardage-line"
  | "longest-play-threat"
  | "soft-matchup"
  | "tough-matchup"
  | "hot-streak"
  | "cold-streak"

export interface PlayerBadgeProps {
  type: PlayerBadgeType
  value?: string | number
  className?: string
}

const badgeConfig: Record<
  PlayerBadgeType,
  {
    label: string
    icon: React.ComponentType<{ className?: string }>
    variant: "default" | "secondary" | "destructive" | "outline"
    className: string
    description: string
  }
> = {
  "highest-over-under": {
    label: "High O/U",
    icon: TrendingUp,
    variant: "default",
    className: "bg-blue-500/10 text-blue-700 border-blue-500/20 dark:text-blue-400",
    description: "Highest over/under of the week",
  },
  "lowest-over-under": {
    label: "Low O/U",
    icon: TrendingDown,
    variant: "outline",
    className: "bg-gray-500/10 text-gray-700 border-gray-500/20 dark:text-gray-400",
    description: "Lowest over/under of the week",
  },
  "highest-team-total": {
    label: "High Total",
    icon: Target,
    variant: "default",
    className: "bg-green-500/10 text-green-700 border-green-500/20 dark:text-green-400",
    description: "Highest team implied total",
  },
  "lowest-team-total": {
    label: "Low Total",
    icon: Target,
    variant: "outline",
    className: "bg-red-500/10 text-red-700 border-red-500/20 dark:text-red-400",
    description: "Lowest team implied total",
  },
  "td-favorite": {
    label: "TD Fav",
    icon: Zap,
    variant: "default",
    className: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20 dark:text-yellow-400",
    description: "Best anytime TD probability at position",
  },
  "positive-game-script": {
    label: "Game Script+",
    icon: Activity,
    variant: "default",
    className: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-400",
    description: "Positive game script - team favored by significant margin",
  },
  "shootout-alert": {
    label: "Shootout",
    icon: Zap,
    variant: "default",
    className: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20 dark:text-yellow-400",
    description: "High-scoring game potential",
  },
  "highest-yardage-line": {
    label: "Prop Leader",
    icon: Crown,
    variant: "default",
    className: "bg-purple-500/10 text-purple-700 border-purple-500/20 dark:text-purple-400",
    description: "Highest yardage line at position this week",
  },
  "longest-play-threat": {
    label: "Big Play",
    icon: Trophy,
    variant: "default",
    className: "bg-orange-500/10 text-orange-700 border-orange-500/20 dark:text-orange-400",
    description: "Top 3 longest play prop at position",
  },
  "soft-matchup": {
    label: "Soft",
    icon: Shield,
    variant: "default",
    className: "bg-teal-500/10 text-teal-700 border-teal-500/20 dark:text-teal-400",
    description: "Opponent allows boom games vs position",
  },
  "tough-matchup": {
    label: "Tough",
    icon: ShieldAlert,
    variant: "destructive",
    className: "bg-red-500/10 text-red-700 border-red-500/20 dark:text-red-400",
    description: "Opponent top-5 defense vs position",
  },
  "hot-streak": {
    label: "Hot",
    icon: Flame,
    variant: "default",
    className: "bg-red-500/10 text-red-700 border-red-500/20 dark:text-red-400",
    description: "3+ games above projection",
  },
  "cold-streak": {
    label: "Cold",
    icon: Snowflake,
    variant: "outline",
    className: "bg-blue-500/10 text-blue-700 border-blue-500/20 dark:text-blue-400",
    description: "3+ games below projection",
  },
}

export function PlayerBadge({ type, value, className }: PlayerBadgeProps) {
  const config = badgeConfig[type]
  const Icon = config.icon

  return (
    <Badge
      variant={config.variant}
      className={cn(
        "h-7 w-7 p-0 rounded-full flex items-center justify-center transition-all hover:scale-105",
        config.className,
        className,
      )}
      title={value != null ? `${config.label}${typeof value === 'number' ? ` (${value})` : ''}` : config.description}
    >
      <Icon className="w-3.5 h-3.5" />
    </Badge>
  )
}

// Helper function to determine which badges a player should have
export function getPlayerBadges(
  player: any,
  gameData: { team_implied_total?: number; event_total?: number; spread?: number } | undefined,
  propInputs: Record<string, any> | undefined,
  position: string,
  context?: { topTeamTotal?: boolean; bottomTeamTotal?: boolean; tdFavorite?: boolean }
): PlayerBadgeType[] {
  const badges: PlayerBadgeType[] = []

  // Deterministic badges limited to available data:
  // Team implied totals via context ranking (top/bottom 3)
  if (context?.topTeamTotal) badges.push('highest-team-total')
  if (context?.bottomTeamTotal) badges.push('lowest-team-total')
  if (context?.tdFavorite) badges.push('td-favorite')

  // 2) Prop-based badges
  const getLine = (market: string): number | undefined => {
    const raw = propInputs?.[market]?.line
    return typeof raw === 'number' ? raw : undefined
  }

  // Highest yardage line by position (heuristic thresholds; tune as needed)
  const passYds = getLine('Pass Yards')
  const rushYds = getLine('Rush Yards')
  const recYds = getLine('Reception Yards')
  const longestRush = getLine('Longest Rush')
  const longestRec = getLine('Longest Reception')

  if (position === 'QB' && typeof passYds === 'number' && passYds >= 270) {
    badges.push('highest-yardage-line')
  }
  if (position === 'RB' && typeof rushYds === 'number' && rushYds >= 80) {
    badges.push('highest-yardage-line')
  }
  if (position === 'WR' && typeof recYds === 'number' && recYds >= 80) {
    badges.push('highest-yardage-line')
  }
  if (position === 'TE' && typeof recYds === 'number' && recYds >= 60) {
    badges.push('highest-yardage-line')
  }

  // Boom potential from longest-play props or very high yardage lines
  if (
    (typeof longestRush === 'number' && longestRush >= 18) ||
    (typeof longestRec === 'number' && longestRec >= 25) ||
    (typeof rushYds === 'number' && rushYds >= 95) ||
    (typeof recYds === 'number' && recYds >= 95)
  ) {
    badges.push('longest-play-threat')
  }

  // Note: intentionally omitting hot/cold, matchup, and shootout badges until we have reliable data
  return badges
}
