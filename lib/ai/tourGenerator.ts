// lib/ai/tourGenerator.ts
import { supabaseServer } from "@/lib/supabaseClient";

export async function generateDailyTour(date: string) {
  const targetDate = date || new Date().toISOString().slice(0, 10);
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
    return { ok: false, error: error.message, date: targetDate };
  }

  return {
    ok: true,
    date: targetDate,
    tour: data
  };
}

export default generateDailyTour;
