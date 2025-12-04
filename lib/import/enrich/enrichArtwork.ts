// lib/import/enrich/enrichArtwork.ts
import { enrichFromWikidata } from "./wikidata";
import { enrichWithAI } from "./openai";

export type EnrichArtworkOptions = {
  useWikidata?: boolean;
  useAI?: boolean;
};

/**
 * Centrale verrijkingsfunctie.
 * Contract: accepteert een artwork en geeft een (eventueel verrijkt) artwork terug.
 * Voor nu: veilige placeholders, later vul je de echte logica in.
 */
export async function enrichArtwork(
  artwork: any,
  options: EnrichArtworkOptions = {}
): Promise<any> {
  let result = { ...artwork };

  if (options.useWikidata) {
    result = await enrichFromWikidata(result);
  }

  if (options.useAI) {
    result = await enrichWithAI(result);
  }

  return result;
}

// Default export zodat beide import-vormen werken
export default enrichArtwork;
