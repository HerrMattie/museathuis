import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Layers, ArrowRight, Lock, Crown } from 'lucide-react';
import DateNavigator from '@/components/ui/DateNavigator';
import { getLevel } from '@/lib/levelSystem';
import { getHistoryAccess } from '@/lib/accessControl';

//date-fns is niet nodig, we doen het met native JS voor minder dependencies
export const revalidate = 0;

export default async function SalonPage({ searchParams }: { searchParams: { date?: string } }) {
  const supabase = createClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();

  const today = new Date().toISOString().split('T')[0];
  const selectedDate = searchParams.date || today;

  // -------------------------------------------------------
  // 1. BEREKEN START EN EIND VAN DE WEEK (Native JS)
  // -------------------------------------------------------
  const current = new Date(selectedDate);
  // Native JS getDay() geeft 0 voor zondag, 1 voor maandag, etc.
  // We willen maandag als start (1).
  const dayOfWeek = current.getDay(); 
  const diffToMonday = current.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  
  const monday = new Date(current.setDate(diffToMonday));
  const sunday = new Date(current.setDate(monday.getDate() + 6));

  const mondayStr = monday.toISOString().split('T')[0];
  const sundayStr = sunday.toISOString().split('T')[0];

  // -------------------------------------------------------
  // 2. HAAL CRM TEKSTEN OP
  // -------------------------------------------------------
  const { data: content } = await supabase
    .from('site_content')
    .select('*')
    .in('key', ['salon_title', 'salon_subtitle', 'salon_premium_notice', 'salon_unlock_btn']);
  const texts = content?.reduce((acc: any, item: any) => ({ ...acc, [item.key]: item.content }), {}) || {};

  // -------------------------------------------------------
  // 3. LEVEL & ACCESS (History)
  // -------------------------------------------------------
  const { count: actionCount } = await supabase.from('user_activity_logs').select('*', { count: 'exact', head: true }).eq('user_id', user?.id);
  const { count: favCount } = await supabase.from('favorites').select('*', { count: 'exact', head: true }).eq('user_id', user?.id);
  const xp = ((actionCount || 0) * 15) + ((favCount || 0) * 50);
  const { level } = getLevel(xp);
  const access = getHistoryAccess(level);

  // -------------------------------------------------------
  // 4. HAAL SALONS OP VOOR DEZE SPECIFIEKE WEEK
  // -------------------------------------------------------
  // We filteren strictly op status published én of day_date valt binnen monday-sunday
  const { data: weeklySalons } = await supabase
    .from('salons')
    .select('*')
    .eq('status', 'published')
    .gte('day_date', mondayStr) // Groter dan of gelijk aan maandag
    .lte('day_date', sundayStr) // Kleiner dan of gelijk aan zondag
    .order('day_date', { ascending: true }) // Sorteer op datum
    .limit(3); // We tonen er max 3 in de grid

  return (
    <div className="min-h-screen bg-midnight-950 text-white pt-24 px-6 pb-20">
       {/* HEADER SECTIE */}
       <div className="max-w-6xl mx-auto text-center flex flex-col items-center mb-16">
          <div className="flex items-center gap-2 text-museum-gold text-xs font-bold tracking-widest uppercase mb-4 animate-in fade-in slide-in-from-bottom-4">
              <Crown size={16} /> Premium Only
          </div>
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-4">
            {texts.salon_title || "De Salon"}
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mb-8">
            {texts.salon_subtitle || "Wekelijkse exclusieve collecties voor rust en inspiratie."}
          </p>
          <div className="flex items-center justify-center gap-4">
             {/* DateNavigator zorgt voor de week-selectie UI */}
             <DateNavigator basePath="/salon" currentDate={selectedDate} maxBack={access.weeks} mode="week" />
          </div>
       </div>

      {/* GRID SECTIE */}
      <div className="max-w-7xl mx-auto relative z-20">
        {weeklySalons && weeklySalons.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {weeklySalons.map((salon) => {
                    // Check access control: Is de salon ouder dan je level toestaat?
                    const salonDate = new Date(salon.day_date);
                    const isLocked = !user || salonDate < access.cutoffDate;

                    return (
                        <Link key={salon.id} href={isLocked ? '/pricing' : `/salon/${salon.id}`} className="group bg-midnight-900 border border-white/10 rounded-2xl overflow-hidden hover:border-museum-gold/40 transition-all hover:-translate-y-2 hover:shadow-2xl flex flex-col h-full">
                            {/* Afbeelding Cover */}
                            <div className="h-64 relative overflow-hidden bg-black">
                                {salon.image_url ? (
                                    <img src={salon.image_url} alt={salon.title} className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${isLocked ? 'grayscale' : ''}`} />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-white/5"><Layers size={48} className="opacity-20"/></div>
                                )}
                                
                                {/* Slotje voor History Access */}
                                {isLocked && (
                                   <div className="absolute top-4 left-4 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest text-white border border-white/10 shadow-lg bg-black/80 flex items-center gap-1">
                                      <Lock size={10}/> Lidmaatschap
                                   </div>
                                )}
                            </div>
                            {/* Inhoud Kaart */}
                            <div className="p-8 flex-1 flex flex-col">
                                <h3 className="font-serif font-bold text-2xl mb-3 text-white group-hover:text-museum-gold transition-colors">{salon.title}</h3>
                                <p className="text-gray-400 text-sm leading-relaxed mb-6 line-clamp-3 flex-1">{salon.description}</p>
                                
                                {/* Actie Balk */}
                                <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center">
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                                        {isLocked ? (texts.salon_unlock_btn || 'Word lid om te openen') : 'Open Collectie'}
                                    </span>
                                    <ArrowRight size={16} className={`transition-transform group-hover:translate-x-1 ${isLocked ? 'text-gray-600' : 'text-museum-gold'}`}/>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        ) : (
            // Lege staat als er niets is ingepland voor deze week
             <div className="text-center py-20 text-gray-400 border border-dashed border-white/10 rounded-2xl font-serif italic text-lg">
                Geen collecties gevonden voor deze week. Kom maandag terug voor nieuwe inspiratie.
             </div>
        )}
      </div>
    </div>
  );
}
