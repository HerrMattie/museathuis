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
    if (error.code === 'PGRST116') {
      // geen rij
      return null;
    }
    console.error('[getArtworkById] fout:', error);
    throw error;
  }

  if (!data) return null;

  return {
    id: data.id,
    title: data.title ?? null,
    artistName: data.artist_name ?? null,
    yearFrom: data.year_from ?? null,
    yearTo: data.year_to ?? null,
    imageUrl: data.image_url ?? null,
    museum: data.museum ?? null,
    locationCity: data.location_city ?? null,
    locationCountry: data.location_country ?? null,
    description: data.description_primary ?? null
  };
}

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
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('[getArtworkById] fout:', error);
    throw error;
  }

  if (!data) return null;

  return {
    id: data.id,
    title: data.title ?? null,
    artistName: data.artist_name ?? null,
    yearFrom: data.year_from ?? null,
    yearTo: data.year_to ?? null,
    imageUrl: data.image_url ?? null,
    museum: data.museum ?? null,
    locationCity: data.location_city ?? null,
    locationCountry: data.location_country ?? null,
    description: data.description_primary ?? null
  };
}

// ▼▼▼ NIEUWE CODE: zoekfunctie voor admin ▼▼▼

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
 * Eenvoudige zoekfunctie voor de adminomgeving.
 * Zoekt op titel en artiestnaam, optioneel gefilterd op een zoekterm.
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

    // Basic full-text benadering: OR op title / artist_name
    dbQuery = dbQuery.or(
      `title.ilike.${q},artist_name.ilike.${q}`
    );
  }

  const { data, error } = await dbQuery;

  if (error) {
    console.error('[searchArtworksForAdmin] fout:', error);
    throw error;
  }

  return (
    data?.map((row: any) => ({
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
