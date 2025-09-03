import { NextResponse } from 'next/server'
import { createClient } from '@/libs/supabase/server'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({})) as any
    const season_year = Number(body?.season_year)
    const week = Number(body?.week)
    const profile = String(body?.profile || '')
    const player_ids = Array.isArray(body?.player_ids) ? body.player_ids.map(String) : []
    const proj_keys = Array.isArray(body?.proj_keys) ? body.proj_keys.map(String) : null
    const source_path = typeof body?.source_path === 'string' ? body.source_path : null
    const dedupe_key = typeof body?.dedupe_key === 'string' ? body.dedupe_key : null

    if (!season_year || !week || !profile || player_ids.length < 2) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const supabase = createClient()
    const { data: user } = await supabase.auth.getUser()
    const client_fingerprint = (req.headers.get('x-forwarded-for') || '')

    const { error: insertError } = await supabase
      .from('start_sit_comparisons')
      .insert({
        season_year,
        week,
        profile,
        player_ids,
        proj_keys,
        source_path,
        created_by: user?.user?.id ?? null,
        client_fingerprint,
        dedupe_key,
      })

    if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Internal error' }, { status: 500 })
  }
}


