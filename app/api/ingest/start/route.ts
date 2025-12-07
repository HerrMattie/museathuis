import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseClient";

// Start een nieuwe ingest-job (placeholder / basisimplementatie)
export async function POST() {
  const supabase = supabaseServer() as any;

  const { data, error } = await supabase
    .from("ingestion_jobs")
    .insert(
      {
        status: "queued",
        source_name: "manual",
        meta: {
          triggered_from: "dashboard",
        },
      } as any
    )
    .select("*")
    .single();

  if (error) {
    console.error("Error creating ingestion job", error);
    return NextResponse.json(
      { error: "Fout bij aanmaken van ingest-job" },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      ok: true,
      job: data,
    },
    { status: 200 }
  );
}
