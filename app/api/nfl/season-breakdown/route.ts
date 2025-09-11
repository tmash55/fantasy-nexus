import { NextResponse } from "next/server"

// Calls Supabase RPC get_fantasy_season_breakdown
export async function GET(req: Request) {
  const url = new URL(req.url)
  const position = url.searchParams.get("position") || "QB"
  const season = Number(url.searchParams.get("season") || new Date().getFullYear())
  const scoring = url.searchParams.get("scoring") || "half_ppr"
  const limit = Number(url.searchParams.get("limit") || 50)

  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!SUPABASE_URL || !SERVICE_KEY) {
    return NextResponse.json(
      { error: "Missing Supabase env. Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set." },
      { status: 500 },
    )
  }

  try {
    const rpcUrl = `${SUPABASE_URL}/rest/v1/rpc/get_fantasy_season_breakdown`
    const body = {
      p_position: position,
      p_season: season,
      p_scoring_type: scoring,
      p_limit: limit,
    }
    const res = await fetch(rpcUrl, {
      method: "POST",
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "count=exact",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    })

    if (!res.ok) {
      const text = await res.text().catch(() => "")
      return NextResponse.json({ error: "RPC call failed", detail: text }, { status: 500 })
    }
    const data = await res.json()
    return NextResponse.json({ data })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unknown error" }, { status: 500 })
  }
}


