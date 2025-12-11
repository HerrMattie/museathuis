import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Headphones, ArrowRight, Clock, Calendar, History } from 'lucide-react';
import LikeButton from '@/components/LikeButton';
import { getPastContent } from '@/lib/dailyService';
import { getLevel } from '@/lib/levelSystem';

export const revalidate = 0;

export default async function TourPage() {
  const supabase = createClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();

  // 1. HAAL CONTENT UIT CMS (Header teksten)
  const { data: pageContent } = await supabase.from('page_content').select('*').eq('slug', 'tour').single();

  // 2. HAAL DAGPROGRAMMA VAN VANDAAG
  const today = new Date().toISOString().split('T')[0];
  const { data: schedule } = await supabase
      .from('dayprogram_schedule')
      .select('tour_ids')
      .eq('day_date', today)
      .single();

  let todayTours = [];
  if (schedule?.tour_ids && schedule.tour_ids.length > 0) {
      const { data } = await supabase.from('tours').select('*').in('id', schedule.tour_ids);
      todayTours = data || [];
  } else {
      // Fallback: Pak de 3 nieuwste als er geen schedule is
      const { data } = await supabase.from('tours').select('*').eq('status', 'published').order('created_at', { ascending: false }).limit(3);
      todayTours = data || [];
  }

  // 3. HAAL HISTORIE OP (Op basis van Level)
  // ... (Level logica van eerder)
  const { count: actionCount } = await supabase.from('user_activity_logs').select('*', { count: 'exact', head: true }).eq('user_id', user?.id);
  const xp = (actionCount || 0) * 15; 
  const { level } = getLevel(xp);
  
  let daysBack = 0;
  if (level >= 30) daysBack = 7;
  else if (level >= 10) daysBack = 3;

  const historyTours = await getPastContent(supabase, daysBack, 'tour');

  // Fallbacks texts
  const title = pageContent?.title || "Audiotours";
  const subtitle = pageContent?.subtitle || "Luister & Ontdek";
  const intro = pageContent?.intro_text || "Laat u meevoeren door de verhalen.";

  return (
    <div className="min-h-screen bg-midnight-950 text-white pt-20 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="relative py-16 mb-12 border-b border-white/10">
             <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-transparent pointer-events-none rounded-3xl"></div>
             <div className="relative z-10">
                <p className="text-museum-gold text-sm font-bold uppercase tracking-[0.2em] mb-3">{subtitle}</p>
                <h1 className="text-5xl md:text-7xl font-serif font-black mb-6 text-white">{title}</h1>
                <p className="text-xl text-gray-300 max-w-2xl leading-relaxed font-light">{intro}</p>
             </div>
        </div>

        {/* VANDAAG */}
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3"><Calendar className="text-museum-gold"/> Vandaag op het programma</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {todayTours.map((tour) => (
                <Link key={tour.id} href={`/tour/${tour.id}`} className="group bg-midnight-900 border border-white/10 rounded-2xl overflow-hidden hover:border-museum-gold/40 transition-all hover:-translate-y-2 hover:shadow-2xl flex flex-col">
                    <div className="h-64 relative overflow-hidden bg-black">
                        <img src={tour.hero_image_url} alt={tour.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"/>
                        
                        {/* Premium Label */}
                        <div className={`absolute top-4 left-4 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest text-white border border-white/10 ${tour.is_premium ? 'bg-museum-gold text-black' : 'bg-black/50 backdrop-blur-md'}`}>
                            {tour.is_premium ? 'Premium' : 'Gratis'}
                        </div>
                        <div className="absolute top-4 right-4 z-20">
                             <LikeButton itemId={tour.id} itemType="tour" userId={user?.id} />
                        </div>
                    </div>
                    
                    <div className="p-8 flex-1 flex flex-col">
                        <h3 className="font-serif font-bold text-2xl mb-3 text-white group-hover:text-museum-gold transition-colors line-clamp-2">{tour.title}</h3>
                        <p className="text-gray-400 text-sm line-clamp-3 mb-6 leading-relaxed font-light flex-1">{tour.intro}</p>
                        
                        <div className="flex justify-between items-center border-t border-white/5 pt-4 mt-auto">
                             <span className="text-xs font-bold text-gray-500 flex items-center gap-2"><Clock size={14}/> 15 min</span>
                             <span className="text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2 group-hover:gap-3 transition-all">Start <ArrowRight size={14} className="text-museum-gold"/></span>
                        </div>
                    </div>
                </Link>
            ))}
        </div>

        {/* HISTORIE (Alleen tonen als er historie is) */}
        {historyTours.length > 0 && (
            <>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 border-t border-white/10 pt-12">
                    <History className="text-gray-500"/> Eerder deze week
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-80">
                    {historyTours.map((tour: any) => (
                        <Link key={tour.id} href={`/tour/${tour.id}`} className="flex items-center gap-4 bg-white/5 p-4 rounded-xl hover:bg-white/10 transition-colors">
                            <div className="w-16 h-16 bg-black rounded-lg overflow-hidden shrink-0">
                                <img src={tour.hero_image_url} className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm line-clamp-1">{tour.title}</h4>
                                <span className="text-xs text-gray-500">Beschikbaar door Level {level}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </>
        )}

      </div>
    </div>
  );
}
