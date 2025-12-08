// lib/data/day-program.ts
import { createClient } from '@/utils/supabase/server'; // Zorg dat je server client correct staat
import { cookies } from 'next/headers';

export type DayProgram = {
  tour: { id: string; title: string; intro: string; hero_image_url: string; is_premium: boolean } | null;
  // Game en Focus voegen we later toe
};

export async function getDailyProgram(): Promise<DayProgram> {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  // 1. Probeer eerst de 'harde' planning uit dayprogram_schedule te halen
  const { data: schedule } = await supabase
    .from('dayprogram_schedule')
    .select('tour_id, game_id, focus_id')
    .eq('day_date', today)
    .single();

  let tourId = schedule?.tour_id;

  // 2. Fallback: Als er geen planning is, zoek een tour die specifiek op deze datum staat
  if (!tourId) {
    const { data: tourByDate } = await supabase
      .from('tours')
      .select('id')
      .eq('date', today)
      .eq('status', 'published') // Neem alleen gepubliceerde tours
      .single();
    tourId = tourByDate?.id;
  }

  // 3. Haal de daadwerkelijke content op als we een ID hebben
  let tourData = null;
  if (tourId) {
    const { data } = await supabase
      .from('tours')
      .select('id, title, intro, hero_image_url, is_premium')
      .eq('id', tourId)
      .single();
    tourData = data;
  }

  return {
    tour: tourData,
  };
}
