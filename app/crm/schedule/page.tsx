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

  // 1. Haal rooster op: Vandaag + 7 dagen vooruit EN 7 dagen terug (Archief)
  const { data: schedule } = await supabase
    .from('dayprogram_schedule')
    .select('*')
    .gte('day_date', lastWeekStart) // Vanaf vorige week
    .order('day_date', { ascending: true }); // Oudste eerst

  // 2. Verzamel ID's voor lookup
  const allIds = new Set<string>();
  schedule?.forEach(s => {
      s.tour_ids?.forEach((id: string) => allIds.add(id));
      s.game_ids?.forEach((id: string) => allIds.add(id));
      s.focus_ids?.forEach((id: string) => allIds.add(id));
  });
  const idArray = Array.from(allIds);

  // 3. Haal titels op
  const { data: tours } = await supabase.from('tours').select('id, title').in('id', idArray);
  const { data: games } = await supabase.from('games').select('id, title').in('id', idArray);
  const { data: focusItems } = await supabase.from('focus_items').select('id, title').in('id', idArray);

  // Helper
  const getTitles = (ids: any, source: any) => {
      if (!ids || !Array.isArray(ids) || ids.length === 0) return [];
      if (!source || !Array.isArray(source)) return [];
      return ids.map((id: string) => source.find((item: any) => item.id === id)?.title || "Onbekend item");
  };

  // Splits data in Toekomst en Verleden
  const upcomingDates = Array.from({ length: 7 }).map((_, i) => format(addDays(parseISO(today), i), 'yyyy-MM-dd'));
  const archiveDates = Array.from({ length: 7 }).map((_, i) => format(subDays(parseISO(today), i + 1), 'yyyy-MM-dd')).reverse(); // Gisteren tot week terug

const renderDayCard = (dateStr: string, isArchive: boolean) => {
      const dateObj = parseISO(dateStr);
      const dayData = schedule?.find(s => s.day_date === dateStr);
      
      const dayTours = getTitles(dayData?.tour_ids || [], tours || []);
      const dayGames = getTitles(dayData?.game_ids || [], games || []);
      const dayFocus = getTitles(dayData?.focus_ids || [], focusItems || []);
      
      // *** VERBETERDE LOGICA VOOR 'GEREED' ***
      // We beschouwen een dag pas als 'Gereed' als er van elke categorie MINIMAAL 1 item is.
      const isFilled = (dayData && dayTours.length = 3 && dayGames.length = 3  && dayFocus.length = 3);
  
      return (
        <div key={dateStr} className={`bg-white rounded-xl shadow-sm border overflow-hidden mb-4 ${isFilled ? 'border-slate-200' : 'border-orange-200 bg-orange-50/10'} ${isArchive ? 'opacity-75 grayscale-[0.5]' : ''}`}>
            <div className="p-3 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div className="flex items-center gap-3">
                    <Calendar className={isArchive ? "text-slate-300" : "text-slate-500"} size={18} />
                    <h3 className={`font-bold capitalize ${isArchive ? 'text-slate-500' : 'text-slate-800'}`}>
                        {format(dateObj, 'EEEE d MMMM', { locale: nl })}
                    </h3>
                    {!isArchive && (
                        isFilled ? 
                        <span className="text-[10px] font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full flex gap-1 items-center"><CheckCircle size={10}/> Gereed</span> : 
                        <span className="text-[10px] font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full flex gap-1 items-center"><AlertTriangle size={10}/> Leeg</span>
                    )}
                </div>
                <Link href={`/crm/schedule/edit/${dateStr}`} className="text-xs bg-white border border-slate-200 px-3 py-1.5 rounded hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors font-medium">
                    {isFilled ? 'Wijzigen' : 'Inplannen'}
                </Link>
            </div>
            
            {isFilled && (
                <div className="p-4 text-xs text-slate-600">
                    <strong>Tour:</strong> {dayTours[0]} {dayTours.length > 1 && `+ ${dayTours.length - 1} andere`}
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
              <div className="mt-4 p-4 bg-slate-100 rounded-xl text-center text-slate-400 text-sm">
                  Oudere data wordt automatisch bewaard in de database.
              </div>
          </div>

      </div>
    </div>
  );
}
