import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Headphones, ArrowRight, Lock, Clock } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import DateNavigator from '@/components/ui/DateNavigator';
import { getLevel } from '@/lib/levelSystem';
import { getHistoryAccess } from '@/lib/accessControl';

export const revalidate = 0;

export default async function TourPage({ searchParams }: { searchParams: { date?: string } }) {
  const supabase = createClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();

  // 1. Datum & Level bepalen
  const today = new Date().toISOString().split('T')[0];
  const selectedDate = searchParams.date || today;
  
  // Haal XP op voor level check
  const { count: actionCount } = await supabase.from('user_activity_logs').select('*', { count: 'exact', head: true }).eq('user_id', user?.id);
  const { count: favCount } = await supabase.from('favorites').select('*', { count: 'exact', head: true }).eq('user_id', user?.id);
  const xp = ((actionCount || 0) * 15) + ((favCount || 0) * 50);
  const { level } = getLevel(xp);
  const access = getHistoryAccess(level);

  // 2. Haal items op voor DEZE datum
  // We simuleren hier dat er 3 items zijn geselecteerd voor deze dag.
  // In een echte DB zou je een 'day_programs' tabel joinen, of filteren op 'available_from'.
  // Voor nu halen we 3 items op die 'published' zijn, en gebruiken we de datum als seed voor variatie (zodat je terug kunt bladeren).
  
  const { data: tours } = await supabase
    .from('tours')
    .select('*')
    .eq('status', 'published')
    // In werkelijkheid: .eq('date', selectedDate)
    .limit(10); // We halen er meer op om te kunnen filteren/sorteren

  // Hack voor demo: Selecteer 3 items o.b.v. de datum string (zodat navigatie werkt)
  // In productie: Gebruik je tabel 'day_programs' -> items->tour_ids
  let dailyTours = tours || [];
  if (dailyTours.length > 3) {
      // Simpele shuffle o.b.v. datum zodat elke dag anders is, maar wel vaststaat per dag
      const dayNum = new Date(selectedDate).getDate(); 
      const start = dayNum % (dailyTours.length - 2);
      dailyTours = dailyTours.slice(start, start + 3);
  }

  // 3. Sorteer: 1 Gratis (Links), 2 Premium (Midden/Rechts)
  // We forceren de eerste op 'gratis' voor weergave als er geen echte gratis tour is
  if (dailyTours.length > 0) {
      // Zorg dat index 0 gratis lijkt (of is)
      const freeIndex = dailyTours.findIndex(t => !t.is_premium);
      if (freeIndex > 0) {
          const [freeItem] = dailyTours.splice(freeIndex, 1);
          dailyTours.unshift(freeItem);
      }
  }

  return (
    <div className="min-h-screen bg-midnight-950 text-white">
      <PageHeader 
        title="Audiotours" 
        subtitle="Het dagprogramma: Elke dag 3 nieuwe tours."
      />

      <div className="max-w-7xl mx-auto px-6 pb-20 -mt-20 relative z-20">
        
        {/* NAVIGATIE */}
        <DateNavigator 
            basePath="/tour" 
            currentDate={selectedDate} 
            maxBack={access.days} 
            mode="day" 
        />

        {dailyTours.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {dailyTours.map((tour, index) => {
                    // Logica: Index 0 is gratis, rest is premium (tenzij item zelf al premium is)
                    const isPremiumSlot = index > 0; 
                    const isLocked = (tour.is_premium || isPremiumSlot) && !user;

                    return (
                        <Link key={tour.id} href={isLocked ? '/pricing' : `/tour/${tour.id}`} className="group bg-midnight-900 border border-white/10 rounded-2xl overflow-hidden hover:border-museum-gold/40 transition-all hover:-translate-y-2 hover:shadow-2xl flex flex-col h-full">
                            <div className="h-64 relative overflow-hidden bg-black">
                                {tour.hero_image_url ? (
                                    <img src={tour.hero_image_url} className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${isLocked ? 'grayscale' : ''}`} />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-white/5"><Headphones size={48} className="opacity-20"/></div>
                                )}
                                <div className={`absolute top-4 left-4 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest text-white border border-white/10 shadow-lg ${isLocked ? 'bg-black/80' : 'bg-museum-gold text-black'}`}>
                                    {isLocked ? <span className="flex items-center gap-1"><Lock size={10}/> Premium</span> : 'Gratis'}
                                </div>
                            </div>
                            <div className="p-8 flex-1 flex flex-col">
                                <h3 className="font-serif font-bold text-2xl mb-3 text-white group-hover:text-museum-gold transition-colors">{tour.title}</h3>
                                <p className="text-gray-400 text-sm leading-relaxed mb-6 line-clamp-3 flex-1">{tour.intro}</p>
                                <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center text-sm text-gray-500">
                                    <span className="flex items-center gap-2"><Clock size={14}/> 15 min</span>
                                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest group-hover:text-white transition-colors">Start Tour <ArrowRight size={14} className="text-museum-gold"/></div>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        ) : (
            <div className="text-center py-20 bg-white/5 rounded-2xl border border-dashed border-white/10">
                <Headphones size={48} className="mx-auto text-gray-600 mb-4"/>
                <p className="text-gray-400">Geen programma gevonden voor deze datum.</p>
            </div>
        )}
      </div>
    </div>
  );
}
