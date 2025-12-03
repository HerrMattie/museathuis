// lib/import/rijksmuseumImport.ts
import { supabaseServer } from "@/lib/supabaseClient";

/**
 * Placeholder voor het starten van een Rijksmuseum-ingest.
 * Maakt alleen een record in ingestion_jobs aan.
 */
export async function queueRijksmuseumImportRun() {
  const supabase = supabaseServer();

  const { data, error } = await supabase
    .from("ingestion_jobs")
    .insert({
      status: "queued",
      source_name: "rijksmuseum",
      meta: { trigger: "admin_api_placeholder" }
    })
    .select()
    .single();

  if (error) {
    console.error("Fout bij aanmaken ingestion job:", error);
    return { ok: false, error: error.message };
  }

  return { ok: true, job: data };
}

// Ook hier beide importstijlen mogelijk maken
export default queueRijksmuseumImportRun;
