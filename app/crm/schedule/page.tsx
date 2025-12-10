import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Calendar, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import { format, addDays, parseISO } from 'date-fns';
import { nl } from 'date-fns/locale';

export const revalidate = 0;

export default async function CrmSchedulePage() {
  const supabase = createClient(cookies());
  const today = new Date().toISOString().split('T')[0];

  // 1. Haal het rooster op voor de komende 7 dagen
  const { data: schedule } = await supabase
    .from('dayprogram_schedule')
    .select('*')
    .gte('day_date', today)
    .order('day_date', { ascending: true })
    .limit(7);

  // 2. Verzamel alle ID's om de details (titels) op te halen
  const tourIds = schedule?.flatMap(s => s.tour_ids || []) || [];
  const gameIds = schedule?.flatMap(s => s.game_ids || []) || [];
  const focusIds = schedule?.flatMap(s => s.focus_ids || []) || [];

  // 3. Haal de details op (zodat we titels zien ipv ID's)
  const { data: tours } = await supabase.from('tours').select('id, title').in('id', tourIds);
  const { data: games } = await supabase.from('games').select('id, title').in('id', gameIds);
  const { data: focusItems } = await supabase.from('focus_items').select('id, title').in('id', focusIds);

  // Helper om titels te vinden
  const getTitles = (ids: string[], source: any[]) => {
      if (!ids || ids.length === 0) return [];
      return ids.map(id => source?.find(item => item.id === id)?.title || "Onbekend item");
  };

  return (
    <div>
      <header className="flex justify-between items-center mb-8">
        <div>
            <h2 className="text-3xl font-bold text-slate-800">Weekplanning</h2>
            <p className="text-slate-500">Overzicht van de dagelijkse content (Tours, Games, Focus).</p>
        </div>
        <div className="flex gap-3">
             <form action="/api/cron/generate-daily" method="GET" target="_blank">
                <button className="bg-museum-gold text-black px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-yellow-600 transition-colors shadow-sm">
                   <RefreshCw size={18} /> Genereer Vandaag Opnieuw
                </button>
             </form>
        </div>
      </header>

      <div className="space-y-6">
        {/* We tonen de komende 7 dagen, ook als er nog geen data is */}
        {Array.from({ length: 7 }).map((_, i) => {
            const date = addDays(parseISO(today), i);
            const dateStr = format(date, 'yyyy-MM-dd');
            const dayData = schedule?.find(s => s.day_date === dateStr);
            
            const dayTours = getTitles(dayData?.tour_ids, tours);
            const dayGames = getTitles(dayData?.game_ids, games);
            const dayFocus = getTitles(dayData?.focus_ids, focusItems);

            const isFilled = dayData && dayTours.length > 0;

            return (
                <div key={dateStr} className={`bg-white rounded-xl shadow-sm border ${isFilled ? 'border-slate-200' : 'border-orange-200 bg-orange-50/30'} overflow-hidden`}>
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <div className="flex items-center gap-3">
                            <Calendar className="text-slate-400" size={20} />
                            <h3 className="font-bold text-slate-800 capitalize">
                                {format(date, 'EEEE d MMMM', { locale: nl })}
                            </h3>
                            {isFilled ? (
                                <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                    <CheckCircle size={12}/> Gepland
                                </span>
                            ) : (
                                <span className="flex items-center gap-1 text-xs font-bold text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                                    <AlertTriangle size={12}/> Nog leeg
                                </span>
                            )}
                        </div>
                        {/* Edit knop voor de dagplanning (Toekomstige feature) */}
                        <button className="text-sm text-blue-600 hover:underline font-medium">
                            Wijzigen
                        </button>
                    </div>

                    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                        
                        {/* TOURS */}
                        <div>
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">3 Tours</h4>
                            {dayTours.length > 0 ? (
                                <ul className="space-y-2">
                                    {dayTours.map((t, idx) => (
                                        <li key={idx} className="text-sm text-slate-700 bg-slate-100 p-2 rounded truncate border border-slate-200">
                                            {idx + 1}. {t}
                                        </li>
                                    ))}
                                </ul>
                            ) : <span className="text-sm text-slate-400 italic">Geen tours gepland</span>}
                        </div>

                        {/* GAMES */}
                        <div>
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">3 Games</h4>
                            {dayGames.length > 0 ? (
                                <ul className="space-y-2">
                                    {dayGames.map((t, idx) => (
                                        <li key={idx} className="text-sm text-slate-700 bg-slate-100 p-2 rounded truncate border border-slate-200">
                                            {idx + 1}. {t}
                                        </li>
                                    ))}
                                </ul>
                            ) : <span className="text-sm text-slate-400 italic">Geen games gepland</span>}
                        </div>

                        {/* FOCUS */}
                        <div>
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">3 Focus Items</h4>
                            {dayFocus.length > 0 ? (
                                <ul className="space-y-2">
                                    {dayFocus.map((t, idx) => (
                                        <li key={idx} className="text-sm text-slate-700 bg-slate-100 p-2 rounded truncate border border-slate-200">
                                            {idx + 1}. {t}
                                        </li>
                                    ))}
                                </ul>
                            ) : <span className="text-sm text-slate-400 italic">Geen focus items gepland</span>}
                        </div>

                    </div>
                </div>
            );
        })}
      </div>
    </div>
  );
}
