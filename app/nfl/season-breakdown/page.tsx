import SeasonBreakdownTable from "@/components/nfl/SeasonBreakdownTable"

export const metadata = {
  title: "NFL Season Breakdown | Fantasy Nexus",
  description: "Weekly fantasy performance by player with sortable weeks and season totals.",
}

export default function Page() {
  return (
    <div className="container mx-auto px-3 sm:px-6 py-6 sm:py-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold">Season Breakdown</h1>
        <p className="text-muted-foreground">Sort weekly fantasy points, filter by position, season, and scoring.</p>
      </div>
      <SeasonBreakdownTable />
    </div>
  )
}



