import { createClient } from '@/lib/supabaseServer'; 
import { cookies } from 'next/headers';

export type DayProgram = {
  tour: { id: string; title: string; intro: string; hero_image_url: string; is_premium: boolean } | null;
  game: { id: string; title: string; short_description: string; is_premium: boolean } | null;
  focus: { id: string; title: string; intro: string; is_premium: boolean; artwork: { image_url: string } | null } | null;
};

export async function getDailyProgram(): Promise<DayProgram> {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore); 
  const today = new Date().toISOString().split('T')[0];

  // 1. Haal de planning op
  const { data: schedule } = await supabase
    .from('dayprogram_schedule')
    .select('tour_id, game_id, focus_id')
    .eq('day_date', today)
    .single();

  let tourId = schedule?.tour_id;
  let gameId = schedule?.game_id;
  let focusId = schedule?.focus_id;

  // 2. Fallbacks
  if (!tourId) {
    const { data } = await supabase.from('tours').select('id').eq('date', today).eq('status', 'published').maybeSingle();
    tourId = data?.id;
  }
  if (!gameId) {
    const { data } = await supabase.from('games').select('id').eq('date', today).eq('status', 'published').maybeSingle();
    gameId = data?.id;
  }
  if (!focusId) {
    const { data } = await supabase.from('focus_items').select('id').eq('published_date', today).maybeSingle();
    focusId = data?.id;
  }

  // 3. Haal content op
  const [tourRes, gameRes, focusRes] = await Promise.all([
    tourId ? supabase.from('tours').select('id, title, intro, hero_image_url, is_premium').eq('id', tourId).single() : Promise.resolve({ data: null }),
    gameId ? supabase.from('games').select('id, title, short_description, is_premium').eq('id', gameId).single() : Promise.resolve({ data: null }),
    focusId ? supabase.from('focus_items').select('id, title, intro, is_premium, artwork:artworks(image_url)').eq('id', focusId).single() : Promise.resolve({ data: null })
  ]);

  // --- DE FIX ZIT HIERONDER ---
  // Supabase geeft 'artwork' terug als een array (bijv: [{image_url: '...'}]).
  // Wij transformeren dit hier naar een enkel object of null, zodat TypeScript tevreden is.
  
  const focusData = focusRes.data as any; // We gebruiken 'any' om de array-structuur tijdelijk te negeren
  
  let formattedFocus = null;
  if (focusData) {
    // Check of artwork een array is en pak de eerste, anders pak het object zelf of null
    const artworkObj = Array.isArray(focusData.artwork) && focusData.artwork.length > 0 
      ? focusData.artwork[0] 
      : focusData.artwork;

    formattedFocus = {
      id: focusData.id,
      title: focusData.title,
      intro: focusData.intro,
      is_premium: focusData.is_premium,
      artwork: artworkObj || null
    };
  }

  return {
    tour: tourRes.data,
    game: gameRes.data,
    focus: formattedFocus,
  };
}
