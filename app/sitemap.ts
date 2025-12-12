import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

// We maken hier een 'schone' client aan, los van cookies/auth, 
// omdat Google geen ingelogde gebruiker is.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const BASE_URL = 'https://museathuis.nl'; // Pas dit aan naar je echte domein!

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 1. Haal dynamische data op (alleen gepubliceerde items)
  const [tours, games, focus, salons] = await Promise.all([
    supabase.from('tours').select('id, updated_at').eq('status', 'published'),
    supabase.from('games').select('id, updated_at').eq('status', 'published'),
    supabase.from('focus_items').select('id, created_at').eq('status', 'published'), // Focus heeft vaak geen updated_at
    supabase.from('salons').select('id, created_at').eq('status', 'published'),
  ]);

  // 2. Definieer de vaste pagina's
  const staticRoutes = [
    '',
    '/tour',
    '/game',
    '/focus',
    '/salon',
    '/pricing',
    '/login',
    '/about',
  ].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // 3. Genereer dynamische routes
  const tourRoutes = (tours.data || []).map((item) => ({
    url: `${BASE_URL}/tour/${item.id}`,
    lastModified: new Date(item.updated_at || new Date()),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const gameRoutes = (games.data || []).map((item) => ({
    url: `${BASE_URL}/game/${item.id}`,
    lastModified: new Date(item.updated_at || new Date()),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  const focusRoutes = (focus.data || []).map((item) => ({
    url: `${BASE_URL}/focus/${item.id}`,
    lastModified: new Date(item.created_at || new Date()),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  const salonRoutes = (salons.data || []).map((item) => ({
    url: `${BASE_URL}/salon/${item.id}`,
    lastModified: new Date(item.created_at || new Date()),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [
    ...staticRoutes,
    ...tourRoutes,
    ...gameRoutes,
    ...focusRoutes,
    ...salonRoutes,
  ];
}
