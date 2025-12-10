import { SupabaseClient } from '@supabase/supabase-js';

export async function getDailyProgram(supabase: SupabaseClient) {
  const today = new Date().toISOString().split('T')[0];

  // 1. Probeer programma van VANDAAG te pakken
  let { data: schedule } = await supabase
    .from('dayprogram_schedule')
    .select('*')
    .eq('day_date', today)
    .single();

  // 2. Geen programma? Pak de meest recente (zodat de site nooit leeg is)
  if (!schedule) {
    const { data: fallback } = await supabase
        .from('dayprogram_schedule')
        .select('*')
        .order('day_date', { ascending: false })
        .limit(1)
        .single();
    schedule = fallback;
  }

  if (!schedule) return null;

  // 3. Haal de gekoppelde items op (Tour, Focus, Game, Salon)
  // We pakken de EERSTE uit de array van ID's (want schedule slaat arrays op)
  const tourId = schedule.tour_ids?.[0];
  const focusId = schedule.focus_ids?.[0];
  const gameId = schedule.game_ids?.[0];
  const salonId = schedule.salon_ids?.[0];

  const [tour, focus, game, salon] = await Promise.all([
    tourId ? supabase.from('tours').select('*').eq('id', tourId).single() : { data: null },
    focusId ? supabase.from('focus_items').select('*').eq('id', focusId).single() : { data: null },
    gameId ? supabase.from('games').select('*').eq('id', gameId).single() : { data: null },
    salonId ? supabase.from('salons').select('*').eq('id', salonId).single() : { data: null },
  ]);

  return {
    date: schedule.day_date,
    theme: {
        title: schedule.theme_title || "Kunst Ontdekken",
        description: schedule.theme_description || "Een prachtige collectie voor vandaag."
    },
    items: {
        tour: tour.data,
        focus: focus.data,
        game: game.data,
        salon: salon.data
    }
  };
}
