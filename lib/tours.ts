// lib/tours.ts
import { supabaseService } from "./supabaseServer";
import { logger } from "./logger";
import { generateDailyTour } from "./ai/tourGenerator";

export async function getOrCreateDailyTour(date: Date) {
  const isoDate = date.toISOString().slice(0, 10);

  const { data: existing, error: existingError } = await supabaseService
    .from("tours")
    .select("id, title, description, date, type, status, is_premium")
    .eq("date", isoDate)
    .eq("type", "daily")
    .maybeSingle();

  if (existingError) {
    logger.error("Error fetching existing daily tour", existingError);
  }

  if (existing && existing.status === "ready") {
    return existing;
  }

  if (existing && existing.status === "generating") {
    // Wacht, maar maak niets nieuws
    return existing;
  }

  // Markeer job
  const { data: job, error: jobError } = await supabaseService
    .from("tour_generation_jobs")
    .upsert(
      {
        date: isoDate,
        type: "daily",
        status: "running",
      },
      { onConflict: "date, type" }
    )
    .select("*")
    .single();

  if (jobError) {
    logger.error("Failed to create tour_generation_job", jobError);
  }

  try {
    const tour = await generateDailyTour({
      date,
      type: "daily",
      promptVersion: "v1",
    });

    await supabaseService
      .from("tour_generation_jobs")
      .update({ status: "completed" })
      .eq("id", job?.id);

    return tour;
  } catch (e: any) {
    logger.error("Failed to generate daily tour", { error: e?.message });
    await supabaseService
      .from("tour_generation_jobs")
      .update({ status: "failed", error_message: e?.message ?? "unknown" })
      .eq("id", job?.id);

    // Fallback: zoek laatste ready fallback tour
    const { data: fallback } = await supabaseService
      .from("tours")
      .select("*")
      .eq("type", "fallback")
      .eq("status", "ready")
      .order("date", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!fallback) {
      throw e;
    }

    return fallback;
  }
}

export async function getTourWithItemsById(id: string) {
  const { data: tour, error } = await supabaseService
    .from("tours")
    .select("*, tour_items(*, artworks_enriched(*))")
    .eq("id", id)
    .single();

  if (error) {
    logger.error("Failed to load tour by id", error);
    throw new Error("Tour not found");
  }

  return tour;
}
