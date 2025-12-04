// lib/import/rijksmuseumImport.ts
import { supabaseServer } from "@/lib/supabaseClient";

/**
 * Placeholder voor het starten van een Rijksmuseum-ingest.
 * Contract: accepteert optioneel een museumId.
 */
export async function startRijksmuseumImport(museumId?: string) {
  const supabase = supabaseServer();

  const { data, error } = await supabase
    .from("ingestion_jobs")
    .insert({
      status: "queued",
      source_name: "rijksmuseum",
      meta: {
        trigger: "admin_api_placeholder",
        museumId: museumId ?? null
      }
    })
    .select()
    .single();

  if (error) {
    console.error("Fout bij aanmaken ingestion job:", error);
    return { ok: false, error: error.message };
  }

  return {
    ok: true,
    job: data,
    importedCount: 0 // placeholder, later vervangen door echte aantallen
  };
}

// Ook als default export beschikbaar
export default startRijksmuseumImport;
