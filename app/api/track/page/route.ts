import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body.route !== "string") {
    return NextResponse.json(
      { error: "INVALID_PAYLOAD" },
      { status: 400 }
    );
  }

  const { error } = await supabase.from("page_events").insert({
    user_id: null,
    route: body.route,
    referrer: body.referrer ?? null,
  });

  if (error) {
    console.error(error);
    return NextResponse.json(
      { error: "LOG_FAILED" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}