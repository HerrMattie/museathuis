import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Headphones, ArrowRight, Lock, Clock, Crown, PlayCircle } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import DateNavigator from '@/components/ui/DateNavigator';
import { getLevel } from '@/lib/levelSystem';
import { getHistoryAccess } from '@/lib/accessControl';

export const revalidate = 0;

export default async function TourPage({ searchParams }: { searchParams: { date?: string } }) {
  const supabase = createClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();

  // 1. HAAL CRM TEKSTEN OP (NIEUW)
  const { data: content } = await supabase
    .from('site_content')
    .select('*')
    .in('key', ['tour_title', 'tour_subtitle', 'tour_label_free', 'tour_label_premium', 'tour_btn_start']);

  const texts = content?.reduce((acc: any, item: any) => ({ ...acc, [item.key]: item.content }), {}) || {};

  // 2. LOGICA VOOR LEVEL & DATUM (JOUW CODE)
  const today = new Date().toISOString().split('T')[0];
  const selectedDate = searchParams.date || today;
   
  const { count: actionCount } = await supabase.from('user_activity_logs').select('*', { count: 'exact', head: true }).eq('user_id', user?.id);
  const { count: favCount } = await supabase.from('favorites').select('*', { count: 'exact', head: true }).eq('user_id', user?.id);
  const xp = ((actionCount || 0) * 15) + ((favCount || 0) * 50);
  const { level } = getLevel(xp);
  const access = getHistoryAccess(level);

  // 3. TOURS OPHALEN
  const { data: tours } = await supabase.from('tours').select('*').eq('status', 'published').limit(10);

  // Selecteer 3 items voor de dag
  let dailyTours = tours || [];
  if (dailyTours.length > 3) {
      const dayNum = new Date(selectedDate).getDate(); 
      const start = dayNum % (dailyTours.length - 2);
      dailyTours = dailyTours.slice(start, start + 3);
  }

  // Sorteer: Gratis item op plek 1
  if (dailyTours.length > 0) {
      const freeIndex = dailyTours.findIndex(t => !t.is_premium);
      if (freeIndex > 0) {
          const [freeItem] = dailyTours.splice(freeIndex, 1);
          dailyTours.unshift(freeItem);
      }
  }

  return (
    <div className="min-h-screen bg-midnight-950 text-white">
      {/* GEBRUIK HIER NU DE CRM VARIABELEN */}
      <PageHeader 
        title={texts.tour_title || "Audiotours"} 
        subtitle={texts.tour_subtitle || "Elke dag nieuwe kunstverhalen."} 
      />

      <div className="max-w-7xl mx-auto px-6 pb-20 -mt-20 relative z-20">
        <DateNavigator basePath="/tour" currentDate={selectedDate} maxBack={access.days} mode="day" />

        {dailyTours.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {dailyTours.map((tour, index) => {
                    const isPremiumSlot = index > 0;
                    const isContentPremium = isPremiumSlot || tour.is_premium;
                    const isLocked = isContentPremium && !user;

                    return (
                        <Link key={tour.id} href={isLocked ? '/pricing' : `/tour/${tour.id}`} className="group bg-midnight-900 border border-white/10 rounded-2xl overflow-hidden hover:border-museum-gold/40 transition-all hover:-translate-y-2 hover:shadow-2xl flex flex-col h-full">
                            <div className="h-64 relative overflow-hidden bg-black group-hover:opacity-90 transition-opacity">
                                {/* Afbeelding */}
                                {tour.hero_image_url ? (
                                    <img src={tour.hero_image_url} className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${isLocked ? 'grayscale' : ''}`} />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-white/5"><Headphones size={48} className="opacity-20"/></div>
                                )}
                                
                                {/* Play Icoon Overlay (Nieuw) */}
                                {!isLocked && (
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                                        <PlayCircle size={48} className="text-museum-gold drop-shadow-md" />
                                    </div>
                                )}

                                {/* Label (Uit CRM) */}
                                <div className={`absolute top-4 left-4 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest border border-white/10 shadow-lg ${isContentPremium ? 'bg-black/80 text-white' : 'bg-museum-gold text-black'}`}>
                                    {isContentPremium ? (
                                        <span className="flex items-center gap-1">
                                            {isLocked ? <Lock size={10}/> : <Crown size={10}/>} {texts.tour_label_premium || "Premium"}
                                        </span>
                                    ) : (texts.tour_label_free || "Gratis")}
                                </div>
                            </div>

                            <div className="p-8 flex-1 flex flex-col">
                                <h3 className="font-serif font-bold text-2xl mb-3 text-white group-hover:text-museum-gold transition-colors">{tour.title}</h3>
                                <p className="text-gray-400 text-sm leading-relaxed mb-6 line-clamp-3 flex-1">{tour.intro}</p>
                                <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center text-sm text-gray-500">
                                    <span className="flex items-center gap-2"><Clock size={14}/> 15 min</span>
                                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest group-hover:text-white transition-colors">
                                        {texts.tour_btn_start || "Start Tour"} <ArrowRight size={14} className="text-museum-gold"/>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        ) : (
            <div className="text-center py-20 bg-white/5 rounded-2xl border border-dashed border-white/10 text-gray-400">Geen tours gevonden.</div>
        )}
      </div>
    </div>
  );
}
