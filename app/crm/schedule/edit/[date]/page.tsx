import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { nl } from 'date-fns/locale';

export const revalidate = 0;

export default async function EditSchedulePage({ params }: { params: { date: string } }) {
  const supabase = createClient(cookies());

  const dateStr = params.date;
  
  // 1. Haal alle mogelijke items op
  const [{ data: tours }, { data: games }, { data: focusItems }] = await Promise.all([
    supabase.from('tours').select('id, title').order('title'),
    supabase.from('games').select('id, title').order('title'),
    supabase.from('focus_items').select('id, title').order('title'),
  ]);

  // 2. Haal de planning voor deze dag op
  const { data: dayData } = await supabase.from('dayprogram_schedule').select('*').eq('day_date', dateStr).single();

  const formattedDate = format(parseISO(dateStr), 'EEEE d MMMM yyyy', { locale: nl });

  return (
    <div>
      <Link href="/crm/schedule" className="text-blue-600 hover:underline mb-4 block">
        &larr; Terug naar Weekplanning
      </Link>
      <h2 className="text-3xl font-bold text-slate-800 mb-6">
        Weekplanning Bewerken: <span className="capitalize">{formattedDate}</span>
      </h2>

      {/* TODO: Vervang dit door een functioneel bewerkingsformulier */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <p className="text-lg font-semibold mb-4">Huidige Items (voor {dateStr}):</p>
        
        {/* TOURS */}
        <div className="mb-4">
            <h3 className="font-bold text-slate-700 mb-2">Tours (Huidig: {dayData?.tour_ids?.length || 0})</h3>
            <select multiple className="w-full border p-2 rounded h-24">
                {tours?.map(t => (
                    <option key={t.id} value={t.id} selected={dayData?.tour_ids?.includes(t.id)}>
                        {t.title}
                    </option>
                ))}
            </select>
            <p className="text-sm text-slate-500 mt-1">Houd CTRL/CMD ingedrukt om meerdere te selecteren.</p>
        </div>

        {/* GAMES */}
        <div className="mb-4">
            <h3 className="font-bold text-slate-700 mb-2">Games (Huidig: {dayData?.game_ids?.length || 0})</h3>
            <select multiple className="w-full border p-2 rounded h-24">
                {games?.map(g => (
                    <option key={g.id} value={g.id} selected={dayData?.game_ids?.includes(g.id)}>
                        {g.title}
                    </option>
                ))}
            </select>
        </div>
        
        {/* FOCUS ITEMS */}
        <div className="mb-4">
            <h3 className="font-bold text-slate-700 mb-2">Focus Items (Huidig: {dayData?.focus_ids?.length || 0})</h3>
            <select multiple className="w-full border p-2 rounded h-24">
                {focusItems?.map(f => (
                    <option key={f.id} value={f.id} selected={dayData?.focus_ids?.includes(f.id)}>
                        {f.title}
                    </option>
                ))}
            </select>
        </div>

        <button 
            disabled 
            className="mt-6 bg-green-500 text-white px-4 py-2 rounded-lg font-bold opacity-50 cursor-not-allowed"
        >
            Opslaan (niet functioneel)
        </button>
        <p className="mt-2 text-sm text-red-600">Let op: Dit is nog een statische weergave; de opslaglogica mist nog!</p>
      </div>

    </div>
  );
}
