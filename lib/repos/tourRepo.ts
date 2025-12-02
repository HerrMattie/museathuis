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

async function getArtworksForTour(tourId: string): Promise<TourArtwork[]> {
  const supabase = supabaseServerClient;

  const { data, error } = await supabase
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

  if (error) {
    console.error('[getArtworksForTour] fout:', error);
    throw error;
  }

  return (
    (data as any[] | null)?.map(row => {
      const aw = (row as any).artworks || {};
      return {
        id: aw.id,
        position: (row as any).position,
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
 * Tour voor specifieke datum (YYYY-MM-DD).
 */
export async function getTourForDate(date: string): Promise<TourOfToday | null> {
  const supabase = supabaseServerClient;

  const { data, error } = await supabase
    .from('tours')
    .select('id, date, title, subtitle, is_published, is_premium')
    .eq('date', date)
    .eq('is_published', true)
    .single<RawTourRow>();

  if (error) {
    if ((error as any).code === 'PGRST116') {
      return null;
    }
    console.error('[getTourForDate] fout:', error);
    throw error;
  }

  if (!data) return null;

  const artworks = await getArtworksForTour(String(data.id));

  return {
    id: String(data.id),
    date: data.date,
    title: data.title,
    subtitle: data.subtitle,
    isPremium: data.is_premium,
    artworks
  };
}

/**
 * Tour van vandaag.
 */
export async function getTourOfToday(): Promise<TourOfToday | null> {
  const today = new Date().toISOString().slice(0, 10);
  return getTourForDate(today);
}

/**
 * Overzicht voor admin-lijst.
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
      id: String(row.id),
      date: row.date,
      title: row.title,
      isPublished: row.is_published,
      isPremium: row.is_premium
    })) ?? []
  );
}

/**
 * Tours in een datumbereik (voor kalender).
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
      id: String(row.id),
      date: row.date,
      title: row.title,
      isPublished: row.is_published,
      isPremium: row.is_premium
    })) ?? []
  );
}

/**
 * Detail van één tour.
 */
export async function getTourById(id: string): Promise<TourDetail | null> {
  const supabase = supabaseServerClient;

  const { data, error } = await supabase
    .from('tours')
    .select('id, date, title, subtitle, is_published, is_premium')
    .eq('id', id)
    .single<RawTourRow>();

  if (error) {
    if ((error as any).code === 'PGRST116') {
      return null;
    }
    console.error('[getTourById] fout:', error);
    throw error;
  }

  const artworks = await getArtworksForTour(String(data.id));

  return {
    id: String(data.id),
    date: data.date,
    title: data.title,
    subtitle: data.subtitle,
    isPublished: data.is_published,
    isPremium: data.is_premium,
    artworks
  };
}
