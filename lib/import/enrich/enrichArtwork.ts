// lib/import/enrich/enrichArtwork.ts
import { enrichFromWikidata } from "./wikidata";
import { enrichWithAI } from "./openai";

// Voorkomt "unused import" problemen
void enrichFromWikidata;
void enrichWithAI;

export type EnrichArtworkOptions = {
  useWikidata?: boolean;
  useAI?: boolean;
};

/**
 * Placeholder verrijkingsfunctie.
 * Contract: accepteert een artwork (any) en geeft een (eventueel verrijkt) object terug.
 * Later kun je hier stap voor stap Wikidata + AI verrijking inbouwen.
 */
export async function enrichArtwork(
  artwork: any,
  _options: EnrichArtworkOptions = {}
): Promise<any> {
  // Voor nu doen we niets met Wikidata/AI, alleen de structuur staat.
  return { ...artwork };
}

// Default export zodat "import enrichArtwork from ..." ook werkt
export default enrichArtwork;
