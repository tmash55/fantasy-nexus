import { NextResponse } from 'next/server'
import { redis } from '@/lib/redis'
import type { FantasyPosition, FantasyProfile, NflRankItem, NflRankResponse } from '@/types/nfl'
import { getWeekWindowForDate } from '@/lib/nfl-weeks'

export const dynamic = 'force-dynamic'

type RankcacheRecord = {
  player_id: string
  full_name: string
  position: FantasyPosition
  team_abbr: string
  team_id: string | number
  score: number
  proj_key: string
}[]

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const profileParam = searchParams.get('profile')
    const positionParam = searchParams.get('position')
    const eventId = searchParams.get('event_id')
    const limitParam = searchParams.get('limit')

    const allowedProfiles: FantasyProfile[] = [
      'half_ppr_4pt',
      'half_ppr_6pt',
      'full_ppr_4pt',
      'full_ppr_6pt',
      'standard_4pt',
      'standard_6pt',
    ]
    const allowedPositions: FantasyPosition[] = ['QB', 'RB', 'WR', 'TE', 'FLEX']

    const profile: FantasyProfile = allowedProfiles.includes(profileParam as FantasyProfile)
      ? (profileParam as FantasyProfile)
      : 'full_ppr_6pt'
    const position: FantasyPosition = allowedPositions.includes(positionParam as FantasyPosition)
      ? (positionParam as FantasyPosition)
      : 'FLEX'
    const limit = limitParam ? Math.min(1000, Math.max(1, Number(limitParam) || 0)) : undefined

    // Build week-scoped key: nfl:rankcache:WEEK:{season}:{week2}:{profile}:{position}
    const now = new Date()
    const { week, seasonYear } = getWeekWindowForDate(now)
    const week2 = String(week).padStart(2, '0')
    const key = `nfl:rankcache:WEEK:${seasonYear}:${week2}:${profile}:${position}`

    let records: RankcacheRecord | null = null
    // Prefer list form if present
    try {
      const list = await redis.lrange<string | NflRankItem>(key, 0, -1)
      if (Array.isArray(list) && list.length > 0) {
        const parsedList = list
          .map((entry) => {
            if (typeof entry === 'string') {
              try { return JSON.parse(entry) as NflRankItem } catch { return null }
            }
            return entry as NflRankItem
          })
          .filter(Boolean) as NflRankItem[]
        records = parsedList
      }
    } catch (_) {
      // ignore and fallback to GET below
    }

    // Fallback to GET single value (array or object) if list empty
    if (!records || records.length === 0) {
      const raw = await redis.get<string | RankcacheRecord | Record<string, any>>(key)
      if (raw) {
        let parsedAny: any = raw
        if (typeof raw === 'string') {
          try { parsedAny = JSON.parse(raw) } catch { parsedAny = raw }
        }
        if (Array.isArray(parsedAny)) records = parsedAny as RankcacheRecord
        else if (parsedAny && typeof parsedAny === 'object' && Array.isArray((parsedAny as any).items)) records = (parsedAny as any).items
        else if (parsedAny && typeof parsedAny === 'object') records = Object.values(parsedAny) as RankcacheRecord
        else records = []
      } else {
        records = []
      }
    }

    // Optional limit and normalization
    let items = (records || []).map((r) => ({
      ...r,
      score: Number(r.score),
    }))
    if (typeof limit === 'number') {
      items = items.slice(0, limit)
    }

    if (!items || items.length === 0) {
      return NextResponse.json({ success: true, data: { profile, position, items: [] as NflRankItem[] } }, {
        headers: {
          'Cache-Control': 'public, max-age=60, stale-while-revalidate=60',
          'CDN-Cache-Control': 'public, max-age=60',
          'Vercel-CDN-Cache-Control': 'public, max-age=60',
        },
      })
    }

    const response: NflRankResponse = {
      profile,
      position,
      items,
      updatedAt: new Date().toISOString(),
    }

    return new NextResponse(JSON.stringify({ success: true, data: response }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=60',
        'CDN-Cache-Control': 'public, max-age=60',
        'Vercel-CDN-Cache-Control': 'public, max-age=60',
        'stale-while-revalidate': '60',
      },
    })
  } catch (error) {
    console.error('[GET /api/nfl/rankings] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


