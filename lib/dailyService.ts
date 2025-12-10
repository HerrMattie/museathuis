import { SupabaseClient } from '@supabase/supabase-js';

// Type definities voor duidelijkheid
type ContentType = 'tour' | 'game' | 'focus';

/**
 * Haalt het programma van VANDAAG op.
 * Als er geen programma is voor vandaag, pakt hij het meest recente programma (fallback).
 */
export async function getDailyProgram(supabase: SupabaseClient) {
  const today = new Date().toISOString().split('T')[0];

  // 1. Probeer programma van VANDAAG te pakken
  let { data: schedule } = await supabase
    .from('dayprogram_schedule')
    .select('*')
    .eq('day_date', today)
    .single();

  // 2. Geen programma? Pak de meest recente (Fallback)
  // Dit voorkomt dat je homepage leeg is als je een dag vergeet in te plannen.
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
  // We pakken de EERSTE uit de array van ID's (want schedule slaat arrays op: ['id1', 'id2'])
  const tourId = schedule.tour_ids?.[0];
  const focusId = schedule.focus_ids?.[0];
  const gameId = schedule.game_ids?.[0];
  const salonId = schedule.salon_ids?.[0];

  // Parallel ophalen voor snelheid
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

/**
 * Haalt content op van de afgelopen X dagen (exclusief vandaag).
 * Wordt gebruikt voor de "Time Travel" feature (Level 10+).
 */
export async function getPastContent(supabase: SupabaseClient, daysBack: number, type: ContentType) {
  if (daysBack <= 0) return [];

  const today = new Date().toISOString().split('T')[0];
  
  // Bereken de startdatum (Vandaag - X dagen)
  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - daysBack);
  const startDate = pastDate.toISOString().split('T')[0];

  // 1. Haal de schema's op van de afgelopen periode
  const { data: schedules } = await supabase
    .from('dayprogram_schedule')
    .select(`day_date, ${type}_ids`) // Selecteer dynamisch de kolom (bijv. 'game_ids')
    .lt('day_date', today)           // Kleiner dan vandaag (want vandaag staat al op home)
    .gte('day_date', startDate)      // Groter/gelijk aan startdatum
    .order('day_date', { ascending: false });

  if (!schedules || schedules.length === 0) return [];

  // 2. Verzamel alle ID's uit de arrays
  // De database geeft terug: [{ game_ids: ['a', 'b'] }, { game_ids: ['c'] }]
  // Wij maken daarvan: ['a', 'b', 'c']
  const ids = schedules
    .flatMap((s: any) => s[`${type}_ids`])
    .filter(Boolean); // Verwijder null/undefined

  // Verwijder dubbele ID's (voor het geval een item 2x ingepland was)
  const uniqueIds = Array.from(new Set(ids));

  if (uniqueIds.length === 0) return [];

  // 3. Haal de daadwerkelijke content details op
  // Bepaal juiste tabelnaam
  let table = 'tours';
  if (type === 'focus') table = 'focus_items';
  if (type === 'game') table = 'games';

  const { data: items } = await supabase
    .from(table)
    .select('*')
    .in('id', uniqueIds)
    .eq('status', 'published') // Alleen gepubliceerde items tonen
    .order('created_at', { ascending: false });

  return items || [];
}
