// lib/ai/tourGenerator.ts
import { supabaseServer } from "@/lib/supabaseClient";

export type GenerateDailyTourOptions = {
  date?: string;
  themeHint?: string;
};

/**
 * Placeholder AI-tour generator.
 * Accepteert óf een string (datum) óf een options-object.
 */
export async function generateDailyTour(
  options?: GenerateDailyTourOptions | string
) {
  const todayIso = new Date().toISOString().slice(0, 10);
  let targetDate = todayIso;

  if (typeof options === "string") {
    // route.ts roept generateDailyTour(targetDate: string) aan
    targetDate = options || todayIso;
  } else if (options && options.date) {
    targetDate = options.date;
  }

  const supabase = supabaseServer();

  const { data, error } = await supabase
    .from("tours")
    .insert({
      title: `Placeholder tour voor ${targetDate}`,
      intro:
        "Dit is een placeholder-tour uit de AI-engine. Vervang deze functie later door de echte tourgenerator.",
      status: "draft",
      is_premium: false,
      scheduled_for: targetDate
    })
    .select()
    .single();

  if (error) {
    console.error("Fout bij aanmaken placeholder tour:", error);
    return { ok: false, error: error.message };
  }

  return {
    ok: true,
    date: targetDate,
    tour: data
  };
}

// Laat dit onderaan staan als je al een default export hebt:
export default generateDailyTour;
