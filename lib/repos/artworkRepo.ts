// lib/repos/artworkRepo.ts
import { supabaseServerClient } from '@/lib/supabaseServer';

export type Artwork = {
  id: string;
  title: string | null;
  artistName: string | null;
  yearFrom: number | null;
  yearTo: number | null;
  imageUrl: string | null;
  museum: string | null;
  locationCity: string | null;
  locationCountry: string | null;
  description: string | null;
};

export type ArtworkListItem = {
  id: string;
  title: string | null;
  artistName: string | null;
  yearFrom: number | null;
  yearTo: number | null;
  museum: string | null;
  imageUrl: string | null;
};

/**
 * Detail van één kunstwerk op basis van ID.
 */
export async function getArtworkById(id: string): Promise<Artwork | null> {
  const supabase = supabaseServerClient;

  const { data, error } = await supabase
    .from('artworks')
    .select(
      `
        id,
        title,
        artist_name,
        year_from,
        year_to,
        image_url,
        museum,
        location_city,
        location_country,
        description_primary
      `
    )
    .eq('id', id)
    .single();

  if (error) {
    if ((error as any).code === 'PGRST116') {
      // geen rij gevonden
      return null;
    }
    console.error('[getArtworkById] fout:', error);
    throw error;
  }

  if (!data) return null;

  return {
    id: (data as any).id,
    title: (data as any).title ?? null,
    artistName: (data as any).artist_name ?? null,
    yearFrom: (data as any).year_from ?? null,
    yearTo: (data as any).year_to ?? null,
    imageUrl: (data as any).image_url ?? null,
    museum: (data as any).museum ?? null,
    locationCity: (data as any).location_city ?? null,
    locationCountry: (data as any).location_country ?? null,
    description: (data as any).description_primary ?? null
  };
}

/**
 * Eenvoudige zoekfunctie voor de adminomgeving.
 * Zoekt op titel en kunstenaar, optioneel gefilterd op zoekterm.
 */
export async function searchArtworksForAdmin(
  query: string | null,
  limit = 50
): Promise<ArtworkListItem[]> {
  const supabase = supabaseServerClient;

  let dbQuery = supabase
    .from('artworks')
    .select(
      `
        id,
        title,
        artist_name,
        year_from,
        year_to,
        museum,
        image_url
      `
    )
    .order('id', { ascending: true })
    .limit(limit);

  if (query && query.trim().length > 0) {
    const q = `%${query.trim()}%`;

    // Zoeken in titel of kunstenaar
    dbQuery = dbQuery.or(`title.ilike.${q},artist_name.ilike.${q}`);
  }

  const { data, error } = await dbQuery;

  if (error) {
    console.error('[searchArtworksForAdmin] fout:', error);
    throw error;
  }

  return (
    (data as any[] | null)?.map(row => ({
      id: row.id,
      title: row.title ?? null,
      artistName: row.artist_name ?? null,
      yearFrom: row.year_from ?? null,
      yearTo: row.year_to ?? null,
      museum: row.museum ?? null,
      imageUrl: row.image_url ?? null
    })) ?? []
  );
}
