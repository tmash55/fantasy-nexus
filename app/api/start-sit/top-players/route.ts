import { NextResponse } from 'next/server'
import { createClient } from '@/libs/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const start = url.searchParams.get('start') // ISO or relative not supported, expect ISO
    const end = url.searchParams.get('end')
    const season = url.searchParams.get('season')
    const week = url.searchParams.get('week')
    const limit = url.searchParams.get('limit')

    const supabase = createClient()
    const { data, error } = await supabase.rpc('get_top_players', {
      start_time: start ? new Date(start).toISOString() : undefined,
      end_time: end ? new Date(end).toISOString() : undefined,
      season_y: season ? Number(season) : null,
      week_no: week ? Number(week) : null,
      limit_count: limit ? Number(limit) : 25,
    })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, data })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Internal error' }, { status: 500 })
  }
}



