// lib/ai/tourGenerator.ts
import OpenAI from "openai";
import { supabaseService } from "../supabaseServer";
import { logger } from "../logger";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export type TourType = "daily" | "weekly" | "monthly";

interface GenerateTourOptions {
  date: Date;
  type: TourType;
  promptVersion: string;
}

export async function generateDailyTour(options: GenerateTourOptions) {
  const { date, type, promptVersion } = options;
  const isoDate = date.toISOString().slice(0, 10);

  logger.info("Start tourgeneration", { isoDate, type });

  // Eenvoudig voorbeeld: kies 8 willekeurige kunstwerken
  const { data: artworks, error: artworkError } = await supabaseService
    .from("artworks_enriched")
    .select("id, title, artist_name, year_from, year_to, image_url")
    .eq("is_active", true)
    .limit(8);

  if (artworkError || !artworks || artworks.length === 0) {
    logger.error("No artworks available for tour", artworkError);
    throw new Error("No artworks available for tour generation");
  }

  const prompt = `
Je bent een museale tekstschrijver. Maak een coherente korte tour met de volgende kunstwerken.
Elke tour bestaat uit:
- een titel
- een korte intro
- per kunstwerk een kopregel en een tekst van ongeveer 3 minuten voorleestijd.

Retourneer strikt JSON met de structuur:
{
  "title": string,
  "description": string,
  "items": [
    {
      "artworkId": string,
      "headline": string,
      "text": string
    }
  ]
}

Kunstwerken:
${JSON.stringify(artworks, null, 2)}
`;

  const completion = await openai.responses.create({
    model: "gpt-4.1-mini",
    input: prompt,
    temperature: 0.7,
  });

  const raw = completion.output[0].content[0];
  if (raw.type !== "output_text") {
    throw new Error("Unexpected OpenAI response type for tour");
  }

  const text = raw.text;
  let parsed: {
    title: string;
    description: string;
    items: { artworkId: string; headline: string; text: string }[];
  };

  try {
    parsed = JSON.parse(text);
  } catch (e) {
    logger.error("Failed to parse AI tour JSON", { text });
    throw new Error("Failed to parse AI tour JSON");
  }

  const { data: tour, error: tourError } = await supabaseService
    .from("tours")
    .insert({
      title: parsed.title,
      description: parsed.description,
      date: isoDate,
      type,
      status: "ready",
      is_premium: false,
      theme: null,
      ai_model: "gpt-4.1-mini",
      ai_prompt: prompt,
      ai_response_raw: completion,
      prompt_version: promptVersion,
    })
    .select("*")
    .single();

  if (tourError || !tour) {
    logger.error("Failed to save tour", tourError);
    throw new Error("Failed to save tour");
  }

  const itemsToInsert = parsed.items.map((item, index) => ({
    tour_id: tour.id,
    artwork_id: item.artworkId,
    position: index + 1,
    headline: item.headline,
    text: item.text,
  }));

  const { error: itemsError } = await supabaseService
    .from("tour_items")
    .insert(itemsToInsert);

  if (itemsError) {
    logger.error("Failed to save tour items", itemsError);
    throw new Error("Failed to save tour items");
  }

  return tour;
}
