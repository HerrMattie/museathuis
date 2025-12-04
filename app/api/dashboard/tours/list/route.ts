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

export async function GET() {
  const { data, error } = await supabase
    .from("tours")
    .select("id, date, title, status, is_premium")
    .order("date", { ascending: true });

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "TOURS_LIST_FAILED" }, { status: 500 });
  }

  return NextResponse.json({ tours: data ?? [] });
}