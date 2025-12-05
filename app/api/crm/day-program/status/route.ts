import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

type Body = {
  date: string;
  contentType: "tour" | "game" | "focus";
  status: "draft" | "published";
};

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as Body | null;

  if (!body || !body.date || !body.contentType || !body.status) {
    return NextResponse.json(
      { error: "INVALID_BODY" },
      { status: 400 }
    );
  }

  const d = new Date(body.date);
  if (Number.isNaN(d.getTime())) {
    return NextResponse.json(
      { error: "INVALID_DATE" },
      { status: 400 }
    );
  }

  const dateStr = d.toISOString().slice(0, 10);

  let error = null;

  if (body.contentType === "tour") {
    const result = await supabase
      .from("tours")
      .update({ status: body.status })
      .eq("date", dateStr);

    error = result.error;
  } else if (body.contentType === "game") {
    const result = await supabase
      .from("games")
      .update({ status: body.status })
      .eq("date", dateStr);

    error = result.error;
  } else if (body.contentType === "focus") {
    const result = await supabase
      .from("focus_schedule")
      .update({ status: body.status })
      .eq("date", dateStr);

    error = result.error;
  }

  if (error) {
    console.error("Error updating day program status", error);
    return NextResponse.json(
      { error: "STATUS_UPDATE_FAILED" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}