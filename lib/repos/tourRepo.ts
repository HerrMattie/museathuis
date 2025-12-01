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
  isPremium: boolean;
  artworks: TourArtwork[];
};

export type TourListItem = {
  id: string;
  date: string;
  title: string;
  isPublished: boolean;
  isPremium: boolean;
};

export type TourDetail = {
  id: string;
  date: string;
  title: string;
  subtitle: string | null;
  isPublished: boolean;
  isPremium: boolean;
  artworks: TourArtwork[];
};

type RawTourRow = {
  id: string;
  date: string;
  title: string;
  subtitle: string | null;
  is_published: boolean;
  is_premium: boolean;
};

/**
 * Interne helper om artworks voor een tour op te halen.
 */
async function getArtworksForTour(tourId: string): Promise<TourArtwork[]> {
  const supabase = supabaseServerClient;

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
    .eq('tour_id', tourId)
    .order('position', { ascending: true });

  if (artworksError) {
    console.error('[getArtworksForTour] fout:', artworksError);
    throw artworksError;
  }

  return (
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
    }) ?? []
  );
}

/**
 * Tour voor een specifieke datum ophalen (YYYY-MM-DD).
 */
export async function getTourForDate(date: string): Promise<TourOfToday | null> {
  const supabase = supabaseServerClient;

  const { data: tour, error: tourError } = await supabase
    .from('tours')
    .select('id, date, title, subtitle, is_published, is_premium')
    .eq('date', date)
    .eq('is_published', true)
    .single<RawTourRow>();

  if (tourError) {
    if (tourError.code === 'PGRST116') {
      return null;
    }
    console.error('[getTourForDate] fout:', tourError);
    throw tourError;
  }

  if (!tour) return null;

  const artworks = await getArtworksForTour(tour.id);

  return {
    id: tour.id,
    date: tour.date,
    title: tour.title,
    subtitle: tour.subtitle,
    isPremium: tour.is_premium,
    artworks
  };
}

/**
 * Robuuste tour van vandaag:
 * - Haalt eerst tour voor vandaag op.
 * - Als er geen is, geeft null terug (frontend toont nette melding).
 * (Eventuele fallbacklogica kun je hier later toevoegen.)
 */
export async function getTourOfToday(): Promise<TourOfToday | null> {
  const today = new Date().toISOString().slice(0, 10);
  return getTourForDate(today);
}

/**
 * Lijst van tours voor adminoverzicht (recentste eerst).
 */
export async function listToursForAdmin(limit = 30): Promise<TourListItem[]> {
  const supabase = supabaseServerClient;

  const { data, error } = await supabase
    .from('tours')
    .select('id, date, title, is_published, is_premium')
    .order('date', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[listToursForAdmin] fout:', error);
    throw error;
  }

  return (
    (data as RawTourRow[] | null)?.map(row => ({
      id: row.id,
      date: row.date,
      title: row.title,
      isPublished: row.is_published,
      isPremium: row.is_premium
    })) ?? []
  );
}

/**
 * Tours in een datumbereik (voor kalender/planning).
 */
export async function listToursInRange(
  fromDate: string,
  toDate: string
): Promise<TourListItem[]> {
  const supabase = supabaseServerClient;

  const { data, error } = await supabase
    .from('tours')
    .select('id, date, title, is_published, is_premium')
    .gte('date', fromDate)
    .lte('date', toDate)
    .order('date', { ascending: true });

  if (error) {
    console.error('[listToursInRange] fout:', error);
    throw error;
  }

  return (
    (data as RawTourRow[] | null)?.map(row => ({
      id: row.id,
      date: row.date,
      title: row.title,
      isPublished: row.is_published,
      isPremium: row.is_premium
    })) ?? []
  );
}

/**
 * Detail van één tour (admin).
 */
export async function getTourById(id: string): Promise<TourDetail | null> {
  const supabase = supabaseServerClient;

  const { data: tour, error: tourError } = await supabase
    .from('tours')
    .select('id, date, title, subtitle, is_published, is_premium')
    .eq('id', id)
    .single<RawTourRow>();

  if (tourError) {
    if (tourError.code === 'PGRST116') {
      return null;
    }
    console.error('[getTourById] fout tour:', tourError);
    throw tourError;
  }

  const artworks = await getArtworksForTour(tour.id);

  return {
    id: tour.id,
    date: tour.date,
    title: tour.title,
    subtitle: tour.subtitle,
    isPublished: tour.is_published,
    isPremium: tour.is_premium,
    artworks
  };
}
