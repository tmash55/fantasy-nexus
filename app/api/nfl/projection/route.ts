import { NextResponse } from 'next/server'
import { z } from 'zod'
import { redisGetJSON } from '@/lib/redis'
import type { NflProjectionRecord } from '@/types/nfl'

export const dynamic = 'force-dynamic'

const QuerySchema = z.object({
  proj_key: z.string().min(1),
})

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const raw = { proj_key: searchParams.get('proj_key') }
    const parsed = QuerySchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid query', details: parsed.error.flatten() }, { status: 400 })
    }
    const { proj_key } = parsed.data
    const record = await redisGetJSON<NflProjectionRecord>(proj_key)

    if (!record) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // Pass through, no server-side inference (client will badge inferred)
    return new NextResponse(JSON.stringify({ success: true, data: record }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=60',
        'CDN-Cache-Control': 'public, max-age=60',
        'Vercel-CDN-Cache-Control': 'public, max-age=60',
      },
    })
  } catch (error) {
    console.error('[GET /api/nfl/projection] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}



