import { supabaseBrowserClient } from "@/lib/supabaseClient";
import { fetchRijksmuseumCollection } from "@/lib/import/sources/rijksmuseumCollection";
import { fetchRijksmuseumOAI } from "@/lib/import/sources/rijksmuseumOAI";
import { mergeAndFilterArtworks } from "@/lib/import/mergeFilter";
import { enrichArtwork } from "@/lib/import/enrich/enrichArtwork";

export async function startMuseumImport(museumId: string) {
  const supabase = supabaseBrowserClient();

  // 1. Start dataset
  const { data: dataset, error: datasetErr } = await supabase
    .from("museum_datasets")
    .insert({ museum_id: museumId, status: "running" })
    .select()
    .single();

  if (datasetErr) throw new Error("Failed to create dataset");

  const datasetId = dataset.id;

  // 2. Fetch raw data from Rijksmuseum (collection API + OAI)
  const collectionData = await fetchRijksmuseumCollection();
  const oaiData = await fetchRijksmuseumOAI();

  // 3. Merge + quality filter
  const artworks = mergeAndFilterArtworks(collectionData, oaiData);

  // 4. Store artworks + enrichment
  for (const item of artworks) {
    const { data: inserted } = await supabase
      .from("artworks")
      .insert({
        museum_id: museumId,
        dataset_id: datasetId,
        ...item
      })
      .select()
      .single();

    // AI + external enrichment
    await enrichArtwork(inserted.id);
  }

  // 5. Finish dataset
  await supabase
    .from("museum_datasets")
    .update({
      status: "done",
      import_finished_at: new Date(),
      total_records: artworks.length
    })
    .eq("id", datasetId);

  return { datasetId };
}
