import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

function getServiceClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("SUPABASE_URL of SUPABASE_SERVICE_ROLE_KEY ontbreekt");
  }

  return createClient(url, key, { auth: { persistSession: false } });
}

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY ontbreekt");
  }
  return new OpenAI({ apiKey });
}

/**
 * Eenvoudige 80/20 tourgenerator:
 *  - kies 8 goede artworks
 *  - genereer 1 titel + intro
 *  - genereer korte tekst per artwork
 *  - sla tour + items op
 */
export async function generateDailyTour(targetDate: string) {
  const supabase = getServiceClient();
  const openai = getOpenAIClient();

  // 1. Check of er al een tour voor deze dag is
  const { data: existing } = await supabase
    .from("tours")
    .select("id")
    .eq("date", targetDate)
    .maybeSingle();

  if (existing?.id) {
    return { tourId: existing.id, status: "already_exists" };
  }

  // 2. Kies 8 artworks op basis van quality_score
  const { data: artworks, error: awErr } = await supabase
    .from("artworks")
    .select("id,title,artist,year_from,year_to,object_type,material")
    .order("quality_score", { ascending: false })
    .limit(40);

  if (awErr) {
    throw new Error(awErr.message);
  }
  if (!artworks || artworks.length < 8) {
    throw new Error("Onvoldoende geschikte artworks voor een tour");
  }

  const selected = artworks.slice(0, 8);

  // 3. Vraag aan AI om een titel + intro en per werk een korte tekst te genereren
  const systemPrompt = `Je bent een museale rondleider. 
Maak een rustige, verdiepende tour voor een breed publiek.
Gebruik heldere taal, geen vakjargon, en verbind de werken onderling.`;

  const userPrompt = `We gaan een digitale kunsttour maken voor MuseaThuis.

Dit zijn de 8 geselecteerde werken (met basisgegevens):

${selected.map((a, i) => `${i + 1}. Titel: ${a.title} | Kunstenaar: ${a.artist ?? "onbekend"} | Jaar: ${a.year_from ?? ""}–${a.year_to ?? ""} | Type: ${a.object_type ?? ""} | Materiaal: ${a.material ?? ""}`).join("
")}

Maak output in strikt JSON-formaat met de volgende structuur:

{
  "title": "korte titel voor de hele tour",
  "intro": "korte intro van maximaal 180 woorden",
  "items": [
    { "index": 1, "text": "tekst voor werk 1 (ongeveer 250-300 woorden)" },
    ...
    { "index": 8, "text": "tekst voor werk 8 (ongeveer 250-300 woorden)" }
  ]
}`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    response_format: { type: "json_object" }
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) {
    throw new Error("Geen geldige AI-output ontvangen");
  }

  let parsed: any;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("AI-output kon niet als JSON worden gelezen");
  }

  // 4. Sla de tour op
  const { data: tour, error: tourErr } = await supabase
    .from("tours")
    .insert({
      date: targetDate,
      title: parsed.title ?? "Tour van vandaag",
      intro: parsed.intro ?? null,
      is_premium: false
    })
    .select("id")
    .single();

  if (tourErr) {
    throw new Error(tourErr.message);
  }

  const tourId = tour.id;

  // 5. Items opslaan
  const itemsPayload = (parsed.items ?? []).map((it: any) => {
    const index = Number(it.index) || 1;
    const artwork = selected[index - 1];
    if (!artwork) return null;

    return {
      tour_id: tourId,
      artwork_id: artwork.id,
      position: index,
      ai_text: it.text ?? ""
    };
  }).filter((x: any) => x !== null);

  if (itemsPayload.length) {
    const { error: itemsErr } = await supabase
      .from("tour_items")
      .insert(itemsPayload);

    if (itemsErr) {
      throw new Error(itemsErr.message);
    }
  }

  return { tourId, status: "created" };
}
