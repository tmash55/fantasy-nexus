"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Trophy, Target, TrendingUp, Calendar } from "lucide-react"
import { teamLogoPath } from "@/lib/nfl-teams"

export interface WeekDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  week: number
  playerName?: string
  teamAbbr?: string
  playerPosition?: string
  points: number | null
  posRank: number | null
  stats?: Record<string, any> | null
}

export default function WeekDetailModal({
  open,
  onOpenChange,
  week,
  playerName,
  teamAbbr,
  playerPosition,
  points,
  posRank,
  stats,
}: WeekDetailModalProps) {
  const s = stats || {}
  const fmt = (v: any, digits = 1) => (typeof v === "number" ? v.toFixed(digits) : (v ?? "—"))
  const cmpPct =
    typeof s.cmp_pct === "number"
      ? s.cmp_pct
      : typeof s.pass_cmp === "number" && typeof s.pass_att === "number" && s.pass_att > 0
        ? (s.pass_cmp / s.pass_att) * 100
        : null
  const isQB = String(playerPosition || "").toUpperCase() === "QB"
  const teamLogo = teamLogoPath(teamAbbr || "")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto bg-background border-border p-0">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 bg-gradient-to-r from-blue-50/80 via-indigo-50/80 to-purple-50/80 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-800">
                  <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold text-foreground">Week {week} Performance</DialogTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-lg font-semibold text-foreground">{playerName || "Player"}</span>
                    {teamLogo && (
                      <img src={teamLogo || "/placeholder.svg"} alt={teamAbbr} className="w-5 h-5 rounded" />
                    )}
                    <span className="text-sm text-muted-foreground font-medium">{teamAbbr}</span>
                    {playerPosition && (
                      <Badge
                        variant="secondary"
                        className="ml-2 bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                      >
                        {playerPosition}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* Performance Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-emerald-50/80 to-green-50/80 dark:from-emerald-950/20 dark:to-green-950/20 border-emerald-200 dark:border-emerald-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800">
                    <Trophy className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground font-medium">Fantasy Points</div>
                    <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                      {points == null ? "—" : points.toFixed(2)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50/80 to-indigo-50/80 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-800">
                    <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground font-medium">Position Rank</div>
                    <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                      {posRank != null && playerPosition ? `${playerPosition}${posRank}` : "—"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50/80 to-red-50/80 dark:from-orange-950/20 dark:to-red-950/20 border-orange-200 dark:border-orange-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/50 border border-orange-200 dark:border-orange-800">
                    <TrendingUp className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground font-medium">Pass Rating</div>
                    <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                      {s.pass_rtg != null ? fmt(s.pass_rtg, 1) : "—"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50/80 to-pink-50/80 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/50 border border-purple-200 dark:border-purple-800">
                    <span className="text-sm font-bold text-purple-600 dark:text-purple-400">QBR</span>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground font-medium">QBR Rating</div>
                    <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                      {s.qbr != null ? fmt(s.qbr, 1) : "—"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Separator className="border-border" />

          {/* Detailed Statistics */}
          <Tabs defaultValue={isQB ? "passing" : "rushing"} className="w-full">
            <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto bg-muted">
              <TabsTrigger value="passing" className="flex items-center gap-2 data-[state=active]:bg-background">
                <span className="text-xs">🏈</span>
                Passing
              </TabsTrigger>
              <TabsTrigger value="rushing" className="flex items-center gap-2 data-[state=active]:bg-background">
                <span className="text-xs">🏃</span>
                Rush/Receiving
              </TabsTrigger>
            </TabsList>

            <TabsContent value="passing" className="mt-6">
              <Card className="bg-card border-border">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-muted/50 border-b border-border">
                          <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Opp
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Result
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            CMP
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            ATT
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            YDS
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            CMP%
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            AVG
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            TD
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            INT
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            LNG
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            SACK
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            RTG
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            QBR
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="hover:bg-muted/30 transition-colors border-b border-border">
                          <td className="px-4 py-4 text-sm text-foreground">Sun 9/7</td>
                          <td className="px-4 py-4 text-sm text-foreground">@ BUF</td>
                          <td className="px-4 py-4 text-center">
                            <Badge variant="destructive" className="text-xs">
                              L 41-40
                            </Badge>
                          </td>
                          <td className="px-4 py-4 text-center font-medium text-foreground">{s.pass_cmp ?? "33"}</td>
                          <td className="px-4 py-4 text-center font-medium text-foreground">{s.pass_att ?? "46"}</td>
                          <td className="px-4 py-4 text-center font-bold text-lg text-foreground">
                            {s.pass_yd ?? "394"}
                          </td>
                          <td className="px-4 py-4 text-center text-foreground">
                            {cmpPct != null ? fmt(cmpPct, 1) : "71.7"}
                          </td>
                          <td className="px-4 py-4 text-center text-foreground">
                            {s.pass_ypa != null ? fmt(s.pass_ypa, 1) : "8.6"}
                          </td>
                          <td className="px-4 py-4 text-center font-medium text-green-600 dark:text-green-400">
                            {s.pass_td ?? "2"}
                          </td>
                          <td className="px-4 py-4 text-center font-medium text-red-600 dark:text-red-400">
                            {s.pass_int ?? "—"}
                          </td>
                          <td className="px-4 py-4 text-center text-foreground">{s.pass_lng ?? "51"}</td>
                          <td className="px-4 py-4 text-center text-red-600 dark:text-red-400">{s.pass_sack ?? "1"}</td>
                          <td className="px-4 py-4 text-center font-medium text-foreground">
                            {s.pass_rtg != null ? fmt(s.pass_rtg, 1) : "112.0"}
                          </td>
                          <td className="px-4 py-4 text-center font-medium text-foreground">
                            {s.qbr != null ? fmt(s.qbr, 1) : "—"}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="rushing" className="mt-6">
              <Card className="bg-card border-border">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-muted/50 border-b border-border">
                          <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Rush ATT
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Rush YDS
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            AVG
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            TD
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            LNG
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            REC
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            REC YDS
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            YPR
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            TGT
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            REC TD
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="hover:bg-muted/30 transition-colors border-b border-border">
                          <td className="px-4 py-4 text-center font-medium text-foreground">{s.rush_att ?? "—"}</td>
                          <td className="px-4 py-4 text-center font-bold text-lg text-foreground">
                            {s.rush_yd ?? "—"}
                          </td>
                          <td className="px-4 py-4 text-center text-foreground">
                            {s.rush_ypa != null ? fmt(s.rush_ypa, 1) : "—"}
                          </td>
                          <td className="px-4 py-4 text-center font-medium text-green-600 dark:text-green-400">
                            {s.rush_td ?? "—"}
                          </td>
                          <td className="px-4 py-4 text-center text-foreground">{s.rush_lng ?? "—"}</td>
                          <td className="px-4 py-4 text-center font-medium text-foreground">{s.rec ?? "—"}</td>
                          <td className="px-4 py-4 text-center font-bold text-lg text-foreground">{s.rec_yd ?? "—"}</td>
                          <td className="px-4 py-4 text-center text-foreground">
                            {s.rec_ypr != null ? fmt(s.rec_ypr, 1) : "—"}
                          </td>
                          <td className="px-4 py-4 text-center text-foreground">{s.rec_tgt ?? "—"}</td>
                          <td className="px-4 py-4 text-center font-medium text-green-600 dark:text-green-400">
                            {s.rec_td ?? "—"}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
