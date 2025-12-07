// lib/import/rijksmuseumImport.ts
import { supabaseServer } from "@/lib/supabaseClient";

/**
 * Start een nieuwe importjob voor Rijksmuseum-data.
 * Deze functie wordt aangeroepen vanuit de admin- / ingest-API.
 */
export async function startRijksmuseumImport(
  museumId: string | null = null,
  trigger: string = "dashboard"
) {
  const supabase = supabaseServer();

  const { data, error } = await (supabase
    .from("ingestion_jobs") as any)
    .insert(
      {
        status: "queued",
        source_name: "rijksmuseum",
        meta: {
          trigger,
          museumId,
        },
      } as any
    )
    .select("*")
    .single();

  if (error) {
    console.error("Fout bij aanmaken ingestion_job (Rijksmuseum):", error);
    throw new Error(error.message);
  }

  return data;
}
