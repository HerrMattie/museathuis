// app/api/ingest/start/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseClient";

/**
 * Algemene ingest-start endpoint.
 * Maakt een nieuwe ingestion_job aan met bron 'rijksmuseum'.
 * In een latere fase kun je dit uitbreiden met meerdere bronnen.
 */
export async function POST() {
  try {
    const supabase = supabaseServer();

    const { data, error } = await (supabase
      .from("ingestion_jobs") as any)
      .insert(
        {
          status: "queued",
          source_name: "rijksmuseum",
          meta: {
            triggered_from: "api/ingest/start",
          },
        } as any
      )
      .select("*")
      .single();

    if (error) {
      console.error("Fout bij aanmaken ingestion_job:", error);
      return NextResponse.json(
        { error: "Fout bij aanmaken ingestion_job", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        jobId: data?.id,
        status: data?.status ?? "queued",
        source_name: data?.source_name ?? "rijksmuseum",
      },
      { status: 201 }
    );
  } catch (e: any) {
    console.error("Onverwachte fout in ingest-start:", e);
    return NextResponse.json(
      { error: "Onverwachte fout in ingest-start", details: e?.message },
      { status: 500 }
    );
  }
}
