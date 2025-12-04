// lib/import/startMuseumImport.ts
import { supabaseBrowser } from "@/lib/supabaseClient";
import { fetchRijksmuseumCollection } from "@/lib/import/sources/rijksmuseumCollection";
import { fetchRijksmuseumOAI } from "@/lib/import/sources/rijksmuseumOAI";
import { mergeAndFilterArtworks } from "@/lib/import/mergeFilter";
import enrichArtwork from "@/lib/import/enrich/enrichArtwork";

// Voorkomt "unused import" problemen; logica bouw je later in.
void fetchRijksmuseumCollection;
void fetchRijksmuseumOAI;
void mergeAndFilterArtworks;
void enrichArtwork;

/**
 * Placeholder museumimport.
 * Contract: wordt aangeroepen met een museumId (string) en registreert een ingest-job.
 * De echte fetch/merge/enrich logica kun je later toevoegen.
 */
export async function startMuseumImport(museumId: string) {
  const supabase = supabaseBrowser();

  const { data, error } = await supabase
    .from("ingestion_jobs")
    .insert({
      status: "queued",
      source_name: "museum_import",
      meta: {
        trigger: "admin_api_placeholder",
        museumId
      }
    })
    .select()
    .single();

  if (error) {
    console.error("Fout bij startMuseumImport:", error);
    return { ok: false, error: error.message };
  }

  return {
    ok: true,
    job: data
  };
}

export default startMuseumImport;
