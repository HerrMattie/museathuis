import { supabaseBrowserClient } from "@/lib/supabaseClient";
import { enrichFromWikidata } from "./wikidata";
import { enrichWithAI } from "./openai";

export async function enrichArtwork(artworkId: string) {
  const supabase = supabaseBrowserClient();

  const { data: artwork } = await supabase
    .from("artworks")
    .select("*")
    .eq("id", artworkId)
    .single();

  if (!artwork) return;

  // Step 1: Wikidata enrichment
  const wd = await enrichFromWikidata(artwork);

  // Step 2: AI fallback
  const ai = await enrichWithAI(artwork, wd);

  await supabase.from("artworks_enriched").insert({
    artwork_id: artworkId,
    wikidata_id: wd.wikidata_id,
    wikipedia_url_nl: wd.wikipedia_nl,
    wikipedia_url_en: wd.wikipedia_en,
    artist_bio: wd.bio,
    artist_movement: wd.movement,
    artist_nationality: wd.nationality,
    artist_occupations: wd.occupations,
    description_primary: ai.description,
    ai_theme: ai.theme,
    ai_tags: ai.tags,
    ai_style_analysis: ai.style,
    ai_context: ai.context,
    ai_validation_score: ai.score
  });
}
