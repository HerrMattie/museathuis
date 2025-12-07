import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseClient";

export async function POST() {
  const supabase = supabaseServer();

  const { data, error } = await supabase
    .from("ingestion_jobs")
    .insert({
      status: "queued",
      source_name: "manual_trigger",
      meta: { triggered_from: "crm" }
    })
    .select()
    .single();

  if (error) {
    console.error(error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, job: data });
}
