import { NextResponse } from "next/server";
import { createClient } from "@/libs/supabase/server";

export const dynamic = "force-dynamic";

function isActiveStatus(status: string | null | undefined): boolean {
  if (!status) return false;
  const s = status.toLowerCase();
  return s === "active" || s === "trialing";
}

export async function GET() {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ pro: false });
    }

    // Check brand-scoped subscription
    const { data, error } = await supabase
      .from("subscriptions")
      .select("status, current_period_end, cancel_at_period_end, brand_key")
      .eq("user_id", user.id)
      .eq("brand_key", "fantasy_nexus")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      // Non-fatal; treat as no sub
      return NextResponse.json({ pro: false });
    }

    const status = data?.status ?? null;
    const cpe = data?.current_period_end ? new Date(data.current_period_end) : null;
    const now = new Date();
    const inPeriod = cpe ? cpe.getTime() > now.getTime() : true;
    const active = isActiveStatus(status) && inPeriod;

    return NextResponse.json({
      pro: Boolean(active),
      status: status ?? null,
      current_period_end: cpe ? cpe.toISOString() : null,
      brand_key: data?.brand_key ?? "fantasy_nexus",
    });
  } catch (e) {
    return NextResponse.json({ pro: false });
  }
}



