import { NextResponse } from 'next/server'
import { redis } from '@/lib/redis'

export const dynamic = 'force-dynamic'

type CompareRequest = {
  proj_keys: string[] // up to 3 keys like nfl:proj:...
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<CompareRequest>
    const keys = Array.isArray(body?.proj_keys) ? body!.proj_keys!.filter(Boolean) : []
    if (keys.length < 2 || keys.length > 3) {
      return NextResponse.json({ error: 'Provide 2-3 proj_keys' }, { status: 400 })
    }

    // Fetch projections in parallel
    const results = await Promise.all(
      keys.map(async (k) => {
        const data = await redis.get<any>(k)
        if (!data) return null
        try {
          return typeof data === 'string' ? JSON.parse(data) : data
        } catch {
          return data
        }
      })
    )

    const items = results
      .map((rec, idx) => {
        if (!rec) return null
        const id: any = rec.identity ?? rec
        return {
          proj_key: keys[idx],
          identity: {
            player_id: id.player_id,
            full_name: id.full_name,
            position: id.position ?? id.player_position,
            team_abbr: id.team_abbr ?? id.team_name,
            headshot_url: id.headshot_url ?? rec.headshot_url ?? null,
          },
          event_total: rec.event_total ?? null,
          home_spread: rec.home_spread ?? null,
          home_team: rec.home_team ?? id.home_team ?? null,
          away_team: rec.away_team ?? id.away_team ?? null,
          inputs: rec.inputs ?? null,
          projections: rec.projections ?? null,
          fantasy_points: Object.fromEntries(
            Object.entries(rec).filter(([k]) => k.startsWith('fantasy_points_'))
          ),
        }
      })
      .filter(Boolean)

    return NextResponse.json({ success: true, data: { items } }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('[POST /api/start-sit/compare] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


