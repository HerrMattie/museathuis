import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Calendar, RefreshCw, AlertTriangle, CheckCircle, History, ArrowRight } from 'lucide-react';
import { format, addDays, subDays, parseISO } from 'date-fns';
import { nl } from 'date-fns/locale';

export const revalidate = 0;

export default async function CrmSchedulePage() {
  const supabase = createClient(cookies());
  const today = new Date().toISOString().split('T')[0];
  const lastWeekStart = format(subDays(new Date(), 7), 'yyyy-MM-dd');

  // 1. Haal rooster op (inclusief salon_ids)
  const { data: schedule } = await supabase
    .from('dayprogram_schedule')
    .select('*')
    .gte('day_date', lastWeekStart)
    .order('day_date', { ascending: true });

  // 2. Verzamel alle ID's om titels op te halen
  const allIds = new Set<string>();
  schedule?.forEach(s => {
      s.tour_ids?.forEach((id: string) => allIds.add(id));
      s.game_ids?.forEach((id: string) => allIds.add(id));
      s.focus_ids?.forEach((id: string) => allIds.add(id));
      s.salon_ids?.forEach((id: string) => allIds.add(id)); // <--- NIEUW: Salons
  });
  const idArray = Array.from(allIds);

  // 3. Haal de titels op uit de verschillende tabellen
  const { data: tours } = await supabase.from('tours').select('id, title').in('id', idArray);
  const { data: games } = await supabase.from('games').select('id, title').in('id', idArray);
  const { data: focusItems } = await supabase.from('focus_items').select('id, title').in('id', idArray);
  const { data: salons } = await supabase.from('salons').select('id, title').in('id', idArray);

  // Helper functie om titels bij ID's te vinden
  const getTitles = (ids: any, source: any) => {
      if (!ids || !Array.isArray(ids) || ids.length === 0) return [];
      if (!source || !Array.isArray(source)) return [];
      return ids.map((id: string) => source.find((item: any) => item.id === id)?.title || "Onbekend item");
  };

  // Datums voor de weergave
  const upcomingDates = Array.from({ length: 7 }).map((_, i) => format(addDays(parseISO(today), i), 'yyyy-MM-dd'));
  const archiveDates = Array.from({ length: 7 }).map((_, i) => format(subDays(parseISO(today), i + 1), 'yyyy-MM-dd')).reverse();

  // De kaart renderer
  const renderDayCard = (dateStr: string, isArchive: boolean) => {
      const dateObj = parseISO(dateStr);
      const dayData = schedule?.find(s => s.day_date === dateStr);
      
      const dayTours = getTitles(dayData?.tour_ids || [], tours || []);
      const dayGames = getTitles(dayData?.game_ids || [], games || []);
      const dayFocus = getTitles(dayData?.focus_ids || [], focusItems || []);
      const daySalons = getTitles(dayData?.salon_ids || [], salons || []); // <--- NIEUW

      // LOGICA: Hebben we inhoud?
      const hasSomething = dayData && (dayTours.length > 0 || dayGames.length > 0 || dayFocus.length > 0 || daySalons.length > 0);
      
      // LOGICA: Is de dag 'Gereed'? (Minimaal 3 van de kern-content, 1 salon is bonus)
      const isFullyReady = dayData && 
                           dayTours.length >= 3 && 
                           dayGames.length >= 3 && 
                           dayFocus.length >= 3;

      return (
        <div key={dateStr} className={`bg-white rounded-xl shadow-sm border overflow-hidden mb-4 ${isFullyReady ? 'border-green-200' : 'border-orange-200 bg-orange-50/10'} ${isArchive ? 'opacity-75 grayscale-[0.5]' : ''}`}>
            <div className="p-3 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div className="flex items-center gap-3">
                    <Calendar className={isArchive ? "text-slate-300" : "text-slate-500"} size={18} />
                    <h3 className={`font-bold capitalize ${isArchive ? 'text-slate-500' : 'text-slate-800'}`}>
                        {format(dateObj, 'EEEE d MMMM', { locale: nl })}
                    </h3>
                    
                    {!isArchive && (
                        isFullyReady ? 
                        <span className="text-[10px] font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full flex gap-1 items-center"><CheckCircle size={10}/> Gereed</span> : 
                        <span className="text-[10px] font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full flex gap-1 items-center"><AlertTriangle size={10}/> {hasSomething ? 'Incompleet' : 'Leeg'}</span>
                    )}
                </div>
                <Link href={`/crm/schedule/edit/${dateStr}`} className="text-xs bg-white border border-slate-200 px-3 py-1.5 rounded hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors font-medium">
                    {hasSomething ? 'Wijzigen' : 'Inplannen'}
                </Link>
            </div>
            
            {(hasSomething) && (
                <div className="p-4 text-xs text-slate-600 grid grid-cols-4 gap-2">
                    <div>
                        <strong className="block text-slate-400 mb-1 uppercase tracking-wider text-[10px]">Tours</strong>
                        {dayTours.length > 0 ? <span className="text-slate-800 font-bold">{dayTours.length}</span> : <span className="text-red-400">-</span>}
                    </div>
                    <div>
                        <strong className="block text-slate-400 mb-1 uppercase tracking-wider text-[10px]">Games</strong>
                        {dayGames.length > 0 ? <span className="text-slate-800 font-bold">{dayGames.length}</span> : <span className="text-red-400">-</span>}
                    </div>
                    <div>
                        <strong className="block text-slate-400 mb-1 uppercase tracking-wider text-[10px]">Focus</strong>
                        {dayFocus.length > 0 ? <span className="text-slate-800 font-bold">{dayFocus.length}</span> : <span className="text-red-400">-</span>}
                    </div>
                    <div>
                        <strong className="block text-slate-400 mb-1 uppercase tracking-wider text-[10px]">Salons</strong>
                        {daySalons.length > 0 ? <span className="text-slate-800 font-bold">{daySalons.length}</span> : <span className="text-slate-400">-</span>}
                    </div>
                </div>
            )}
        </div>
      );
  };

  return (
    <div>
      <header className="flex justify-between items-center mb-8">
        <div>
            <h2 className="text-3xl font-bold text-slate-800">Weekplanning</h2>
            <p className="text-slate-500">Beheer de dagelijkse content en bekijk het archief.</p>
        </div>
        <div className="flex gap-3">
             <form action="/api/cron/generate-daily" method="GET" target="_blank">
                <button className="bg-museum-gold text-black px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-yellow-600 transition-colors shadow-sm text-sm">
                   <RefreshCw size={16} /> Genereer Vandaag Opnieuw
                </button>
             </form>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* KOLOM 1: AANKOMEND */}
          <div>
              <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Calendar className="text-blue-600"/> Aankomende 7 Dagen
              </h3>
              <div className="space-y-4">
                  {upcomingDates.map(date => renderDayCard(date, false))}
              </div>
          </div>

          {/* KOLOM 2: ARCHIEF */}
          <div>
              <h3 className="text-xl font-bold text-slate-500 mb-4 flex items-center gap-2">
                  <History className="text-slate-400"/> Archief (Vorige week)
              </h3>
              <div className="space-y-4">
                  {archiveDates.map(date => renderDayCard(date, true))}
              </div>
          </div>
      </div>
    </div>
  );
}
