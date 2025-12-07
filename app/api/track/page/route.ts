import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);

    const route = body?.route || "/";
    const userAgent = request.headers.get("user-agent") || undefined;

    const { error } = await supabase.from("page_events").insert({
      route,
      user_agent: userAgent,
    });

    if (error) {
      console.error("Error inserting page_event", error);
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Page tracking error", e);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}