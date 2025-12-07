// lib/ai/tourGenerator.ts
import { supabaseServer } from "@/lib/supabaseClient";

/**
 * Genereer een placeholder-tour voor een specifieke datum.
 */
export async function generateTourForDate(targetDate: string) {
  const supabase = supabaseServer();

  const { data, error } = await (supabase
    .from("tours") as any)
    .insert(
      {
        title: `Placeholder tour voor ${targetDate}`,
        intro_text:
          "Dit is een tijdelijke MuseaThuis-tour voor deze datum. In een volgende fase wordt deze automatisch gevuld met AI-gegenereerde inhoud.",
        status: "draft",
        is_premium: true,
        scheduled_for: targetDate,
      } as any
    )
    .select("id, title, intro_text, scheduled_for")
    .single();

  if (error) {
    console.error(error);
    throw new Error(error.message);
  }

  return data;
}

/**
 * Backwards compatible helper die door API-routes wordt gebruikt.
 * Als er geen datum wordt meegegeven, pakken we 'vandaag'.
 */
export async function generateDailyTour(targetDate?: string) {
  const date =
    targetDate ??
    new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  return generateTourForDate(date);
}
