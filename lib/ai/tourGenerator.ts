// lib/ai/tourGenerator.ts
import { supabaseServer } from "@/lib/supabaseClient";

export type GenerateDailyTourOptions = {
  date?: string;
  themeHint?: string;
};

/**
 * Placeholder AI-tour generator.
 * Later vervang je dit door de echte tour-engine (selectie artworks + aanmaken tour + tour_items).
 */
export async function generateDailyTour(
  options: GenerateDailyTourOptions = {}
) {
  const today = options.date ?? new Date().toISOString().slice(0, 10);
  const supabase = supabaseServer();

  // Dummy: maak een tour-record aan met alleen titel/intro
  const { data, error } = await supabase
    .from("tours")
    .insert({
      title: `Placeholder tour voor ${today}`,
      intro:
        "Dit is een placeholder-tour uit de AI-engine. Vervang deze functie door de echte tourgenerator.",
      status: "draft",
      is_premium: false,
      scheduled_for: today
    })
    .select()
    .single();

  if (error) {
    console.error("Fout bij aanmaken placeholder tour:", error);
    return { ok: false, error: error.message };
  }

  return {
    ok: true,
    date: today,
    tour: data
  };
}

// Zorg dat default import ook werkt (mocht je die ergens gebruiken)
export default generateDailyTour;
