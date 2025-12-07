// lib/import/rijksmuseumImport.ts
import { supabaseServer } from "@/lib/supabaseClient";

/**
 * Placeholder voor het starten van een Rijksmuseum-ingest.
 * Maakt een record aan in `ingestion_jobs`.
 * Contract: accepteert optioneel een museumId.
 */
export async function startRijksmuseumImport(museumId?: string) {
  const supabase = supabaseServer();

const { data, error } = await (supabase
  .from("ingestion_jobs") as any)
  .insert(
    {
      status: "queued",
      source_name: "rijksmuseum",
      meta: {
        trigger: "dashboard", // of de waarde die je nu al gebruikt
        museumId: museumId ?? null,
      },
    } as any
  )
  .select("*")
  .single();

  if (error) {
    console.error("Fout bij startRijksmuseumImport:", error);
    return {
      ok: false,
      error: error.message,
    };
  }

  return {
    ok: true,
    job: data,
    importedCount: 0, // placeholder, later vervangen door echte aantallen
  };
}

// Ook als default export beschikbaar
export default startRijksmuseumImport;
