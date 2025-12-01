// lib/repos/tourRepo.ts
import { supabaseServerClient } from '@/lib/supabaseServer';

export type TourArtwork = {
  id: string;
  position: number;
  title: string | null;
  artistName: string | null;
  yearFrom: number | null;
  yearTo: number | null;
  imageUrl: string | null;
};

export type TourOfToday = {
  id: string;
  date: string;
  title: string;
  subtitle: string | null;
  artworks: TourArtwork[];
};

/**
 * Retourneert de tour van vandaag met de bijbehorende kunstwerken,
 * of null als er geen gepubliceerde tour is ingepland.
 */
export async function getTourOfToday(): Promise<TourOfToday | null> {
  const supabase = supabaseServerClient;

  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  // 1. Haal de tour van vandaag op
  const { data: tour, error: tourError } = await supabase
    .from('tours')
    .select('id, date, title, subtitle')
    .eq('date', today)
    .eq('is_published', true)
    .single();

  if (tourError) {
    // Geen tour gevonden is geen "harde" fout, maar wel een signaal
    if (tourError.code === 'PGRST116') {
      // no rows
      return null;
    }
    console.error('[getTourOfToday] fout bij ophalen tour:', tourError);
    throw tourError;
  }

  if (!tour) {
    return null;
  }

  // 2. Haal de gekoppelde kunstwerken op via de koppeltabel tour_artworks
  // Hiervoor is in Supabase een relatie nodig:
  // tour_artworks.artworks -> artworks.id (foreign key)
  const { data: artworkRows, error: artworksError } = await supabase
    .from('tour_artworks')
    .select(
      `
      position,
      artworks (
        id,
        title,
        artist_name,
        year_from,
        year_to,
        image_url
      )
    `
    )
    .eq('tour_id', tour.id)
    .order('position', { ascending: true });

  if (artworksError) {
    console.error(
      '[getTourOfToday] fout bij ophalen tour_artworks:',
      artworksError
    );
    throw artworksError;
  }

  const artworks: TourArtwork[] =
    artworkRows?.map((row: any) => {
      const aw = row.artworks || {};
      return {
        id: aw.id,
        position: row.position,
        title: aw.title ?? null,
        artistName: aw.artist_name ?? null,
        yearFrom: aw.year_from ?? null,
        yearTo: aw.year_to ?? null,
        imageUrl: aw.image_url ?? null
      };
    }) ?? [];

  return {
    id: tour.id,
    date: tour.date,
    title: tour.title,
    subtitle: tour.subtitle ?? null,
    artworks
  };
}
