// lib/import/rijksmuseumImport.ts
import { supabaseServer } from "@/lib/supabaseClient";

/**
 * Placeholder voor het starten van een Rijksmuseum-ingest.
 * Contract: accepteert optioneel een museumId.
 */
/**
 * Start een import voor een museum via ingestion_jobs.
 */
export async function startMuseumImport(museumId: string) {
  const supabase = supabaseBrowser();  // LET OP: met haakjes

  const { data, error } = await supabase
    .from("ingestion_jobs")
    .insert({
      museum_id: museumId,
      status: "queued",
    })
    .select()
    .single();

  if (error) {
    console.error("Fout bij startMuseumImport:", error);
    throw error;
  }

  return data;
}


// Ook als default export beschikbaar
export default startRijksmuseumImport;
