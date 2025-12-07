// lib/import/startMuseumImport.ts
import { supabaseBrowser } from "@/lib/supabaseClient";

/**
 * Start een nieuwe importjob voor een museumbron.
 * Wordt typischerwijs vanaf het dashboard aangeroepen.
 */
export async function startMuseumImport(
  museumId: string,
  sourceName: string = "rijksmuseum",
  trigger: string = "dashboard"
) {
  const supabase = supabaseBrowser();

  const { data, error } = await (supabase
    .from("ingestion_jobs") as any)
    .insert(
      {
        status: "queued",
        source_name: sourceName,
        meta: {
          trigger,
          museumId,
        },
      } as any
    )
    .select("*")
    .single();

  if (error) {
    console.error("Fout bij aanmaken ingestion_job (startMuseumImport):", error);
    throw new Error(error.message);
  }

  return data;
}
