import StartSitCompare from "@/components/nfl/StartSitCompare"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Target, TrendingUp, Zap, BarChart3 } from "lucide-react"
import { getWeekWindowForDate } from "@/lib/nfl-weeks"

export const dynamic = "force-dynamic"

export default function NflStartSitPage() {
  const ww = getWeekWindowForDate(new Date())
  return (
    <>
      <div className="bg-gradient-to-br from-card/80 to-muted/40 dark:from-card/60 dark:to-muted/20 border-b-2 border-border/60">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/15 dark:bg-primary/25 rounded-3xl mb-4 border-2 border-primary/20">
              <Users className="h-10 w-10 text-primary" />
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-black mb-4 text-foreground tracking-tight">NFL Week {ww.week} Start/Sit</h1>
              <p className="text-xl md:text-2xl mb-4 text-muted-foreground font-medium">Vegas-Powered Start/Sit Comparisons</p>
              <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Compare up to 3 players side-by-side using live Vegas market data — game totals, spreads, and player
                props — to make confident lineup decisions.
              </p>
            </div>
            <div className="flex items-center justify-center gap-6 flex-wrap">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Prop Line Analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Head-to-Head Projections</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Real-Time Updates</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 rounded-xl border border-border/60 bg-card/50 p-4 text-sm text-muted-foreground">
          <p>
            This tool relies entirely on Vegas market data to compare players — analyzing game totals, spreads, and
            player props to surface the best start. Odds data is powered by {""}
            <a href="https://www.oddsmash.io/nfl/odds/player-props" className="underline hover:text-primary font-medium">OddSmash</a>.
          </p>
        </div>

        {/* Main Tool */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-muted/50 border-b">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Start/Sit Comparison
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <StartSitCompare />
          </CardContent>
        </Card>
      </div>

      {/* Bottom Feature Row */}
      <div className="bg-gradient-to-r from-muted/30 to-muted/10 dark:from-muted/20 dark:to-muted/5 border-t-2 border-border/60">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">How It Helps</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Built for quick, confident lineup decisions.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-card/60 dark:bg-card/40 rounded-2xl border border-border/40">
              <div className="w-16 h-16 bg-blue-500/10 dark:bg-blue-400/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="text-lg font-bold mb-3 text-foreground">Player Comparisons</h3>
              <p className="text-muted-foreground leading-relaxed">Compare up to 3 options with a unified, responsive view.</p>
            </div>
            <div className="text-center p-6 bg-card/60 dark:bg-card/40 rounded-2xl border border-border/40">
              <div className="w-16 h-16 bg-purple-500/10 dark:bg-purple-400/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-purple-500" />
              </div>
              <h3 className="text-lg font-bold mb-3 text-foreground">Prop-Driven Insight</h3>
              <p className="text-muted-foreground leading-relaxed">Market lines and implied probabilities guide the call.</p>
            </div>
            <div className="text-center p-6 bg-card/60 dark:bg-card/40 rounded-2xl border border-border/40">
              <div className="w-16 h-16 bg-orange-500/10 dark:bg-orange-400/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-orange-500" />
              </div>
              <h3 className="text-lg font-bold mb-3 text-foreground">Always Current</h3>
              <p className="text-muted-foreground leading-relaxed">Updates with the latest odds and game changes.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
