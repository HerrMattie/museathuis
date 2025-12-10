import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { format, parseISO, subDays } from 'date-fns';
import { nl } from 'date-fns/locale';
import EditScheduleForm from './EditScheduleForm';

export const revalidate = 0;

export default async function EditSchedulePage({ params }: { params: { date: string } }) {
  const supabase = createClient(cookies());
  const dateStr = params.date;

  // 1. Haal alle beschikbare content op (voor de keuzelijsten)
  const [{ data: tours }, { data: games }, { data: focusItems }] = await Promise.all([
    supabase.from('tours').select('id, title').order('title'),
    supabase.from('games').select('id, title').order('title'),
    supabase.from('focus_items').select('id, title').order('title'),
  ]);

  // 2. Haal de HUIDIGE planning voor deze dag op
  const { data: dayData } = await supabase
    .from('dayprogram_schedule')
    .select('*')
    .eq('day_date', dateStr)
    .single();

  // 3. Haal GESCHIEDENIS op (laatste 30 dagen) voor de duplicaat-check
  const thirtyDaysAgo = format(subDays(parseISO(dateStr), 30), 'yyyy-MM-dd');
  
  const { data: pastSchedules } = await supabase
    .from('dayprogram_schedule')
    .select('*')
    .lt('day_date', dateStr) // Alles voor vandaag
    .gte('day_date', thirtyDaysAgo); // Tot 30 dagen terug

  // Flatten de geschiedenis naar een simpele lijst voor makkelijk zoeken
  const history: any[] = [];
  pastSchedules?.forEach(day => {
      day.tour_ids?.forEach((id: string) => history.push({ date: day.day_date, item_id: id, type: 'tour' }));
      day.game_ids?.forEach((id: string) => history.push({ date: day.day_date, item_id: id, type: 'game' }));
      day.focus_ids?.forEach((id: string) => history.push({ date: day.day_date, item_id: id, type: 'focus' }));
  });

  const formattedDate = format(parseISO(dateStr), 'EEEE d MMMM yyyy', { locale: nl });

  return (
    <div>
      <div className="mb-6">
        <Link href="/crm/schedule" className="text-slate-500 hover:text-slate-800 text-sm font-medium mb-2 inline-block">
            &larr; Terug naar Weekoverzicht
        </Link>
        <h2 className="text-3xl font-bold text-slate-800">
            Planning Bewerken
        </h2>
        <p className="text-museum-gold font-serif text-xl capitalize">{formattedDate}</p>
      </div>

      <EditScheduleForm 
        date={dateStr}
        initialData={dayData || { tour_ids: [], game_ids: [], focus_ids: [] }}
        availableTours={tours || []}
        availableGames={games || []}
        availableFocus={focusItems || []}
        history={history}
      />
    </div>
  );
}
