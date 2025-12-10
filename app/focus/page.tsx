import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Crosshair, ArrowRight, Clock, History, Lock, FileText } from 'lucide-react';
import LikeButton from '@/components/LikeButton';
import { getLevel } from '@/lib/levelSystem'; // <--- Level logica
import { getPastContent } from '@/lib/dailyService'; // <--- Time Travel logica

export const revalidate = 0;

export default async function FocusPage() {
  const supabase = createClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();

  // 1. HAAL PAGINA CONTENT (CMS)
  const { data: pageContent } = await supabase.from('page_content').select('*').eq('slug', 'focus').single();
  
  // 2. LEVEL & XP BEREKENEN (Voor Time Travel)
  const { count: actionCount } = await supabase.from('user_activity_logs').select('*', { count: 'exact', head: true }).eq('user_id', user?.id);
  const { count: favCount } = await supabase.from('favorites').select('*', { count: 'exact', head: true }).eq('user_id', user?.id);
  
  const xp = ((actionCount || 0) * 15) + ((favCount || 0) * 50);
  const { level } = getLevel(xp);

  // 3. BEPAAL DAGEN TERUG (De Logica: Level 10 = 3 dagen, Level 30 = 7 dagen)
  let daysBack = 0;
  if (level >= 30) daysBack = 7;      // Historicus
  else if (level >= 10) daysBack = 3; // Tijdreiziger

  // 4. HAAL CONTENT OP
  // A. Recente items (Gewoon de nieuwste lijst)
  const { data: latestItems } = await supabase
    .from('focus_items')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(6);

  // B. Historie items (Gemist in dagprogramma)
  const historyItems = await getPastContent(supabase, daysBack, 'focus');

  // Fallbacks voor teksten
  const title = pageContent?.title || "In Focus";
  const subtitle = pageContent?.subtitle || "Verdieping";
  const intro = pageContent?.intro_text || "Long-read artikelen en analyses van bijzondere werken.";

  return (
    <div className="min-h-screen bg-midnight-950 text-white pt-20 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER SECTION */}
        <div className="relative py-16 mb-12 border-b border-white/10">
             {/* Subtiel blauw accent voor Focus, maar wel in de donkere stijl */}
             <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 to-transparent pointer-events-none rounded-3xl"></div>
             <div className="relative z-10">
                <p className="text-museum-gold text-sm font-bold uppercase tracking-[0.2em] mb-3">{subtitle}</p>
                <h1 className="text-5xl md:text-7xl font-serif font-black mb-6 text-white">{title}</h1>
                <p className="text-xl text-gray-300 max-w-2xl leading-relaxed font-light">{intro}</p>
             </div>
        </div>

        {/* --- TIME TRAVEL SECTIE --- */}
        <div className="mb-16">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-serif font-bold text-white flex items-center gap-3">
                    <History className="text-museum-gold"/> Gemist in de Daily
                </h3>
                
                {daysBack === 0 && (
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-500 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                        <Lock size={12}/> Unlock historie op Level 10
                    </div>
                )}
            </div>

            {daysBack > 0 && historyItems.length > 0 ? (
                // OPTIE A: Level hoog genoeg -> Toon grid
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {historyItems.map((item: any) => (
                        <Link key={item.id} href={`/focus/${item.id}`} className="group bg-midnight-900 border border-white/10 rounded-xl p-6 hover:border-museum-gold/40 transition-all flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-900/30 text-blue-400 rounded-lg flex items-center justify-center shrink-0">
                                <FileText size={24}/>
                            </div>
                            <div>
                                <div className="text-xs text-gray-500 uppercase font-bold mb-1">Eerder deze week</div>
                                <h4 className="font-bold text-white group-hover:text-museum-gold transition-colors line-clamp-1">{item.title}</h4>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : daysBack === 0 ? (
                // OPTIE B: Level te laag -> Toon Locked State
                <div className="bg-gradient-to-r from-gray-900 to-black border border-white/10 rounded-xl p-8 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
                    <Lock size={32} className="mx-auto text-gray-600 mb-4"/>
                    <h4 className="font-bold text-gray-300 mb-2">Het archief is vergrendeld</h4>
                    <p className="text-sm text-gray-500 max-w-md mx-auto mb-4">
                        Bereik <span className="text-museum-gold font-bold">Level 10</span> om artikelen van de afgelopen 3 dagen terug te lezen.
                    </p>
                    {/* Fake progress bar ter motivatie */}
                    <div className="w-full max-w-xs mx-auto bg-gray-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-museum-gold h-full w-1/4 animate-pulse"></div> 
                    </div>
                </div>
            ) : (
                // OPTIE C: Wel level, maar geen gemiste items
                <p className="text-gray-500 text-sm italic">U bent helemaal bij! Geen gemiste artikelen in de afgelopen {daysBack} dagen.</p>
            )}
        </div>

        {/* --- REGULIERE GRID (NIEUWSTE ITEMS) --- */}
        <h3 className="text-2xl font-serif font-bold text-white mb-6">Nieuwste Artikelen</h3>
        
        {/* We gebruiken hier de List View (beter voor artikelen) */}
        <div className="grid grid-cols-1 gap-6">
            {latestItems?.map((item) => (
                <Link key={item.id} href={`/focus/${item.id}`} className="group bg-midnight-900 border border-white/10 rounded-2xl overflow-hidden hover:border-museum-gold/40 transition-all hover:bg-white/5 flex flex-col md:flex-row h-auto md:h-64">
                    
                    {/* Linkerkant: Icoon/Afbeelding placeholder */}
                    <div className="w-full md:w-80 bg-black relative shrink-0 h-48 md:h-full">
                         <div className="absolute inset-0 flex items-center justify-center opacity-30 group-hover:opacity-50 transition-opacity">
                            <Crosshair size={48} className="text-blue-200"/>
                         </div>
                         <div className="absolute top-4 left-4 bg-blue-900/80 backdrop-blur-md px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest text-white border border-white/10">
                            Artikel
                         </div>
                         <div className="absolute top-4 right-4 md:left-4 md:right-auto md:top-auto md:bottom-4 z-20">
                             <LikeButton itemId={item.id} itemType="focus" userId={user?.id} />
                         </div>
                    </div>

                    {/* Rechterkant: Tekst */}
                    <div className="p-8 flex-1 flex flex-col justify-center">
                        <h3 className="font-serif font-bold text-3xl mb-3 text-white group-hover:text-museum-gold transition-colors leading-tight">
                            {item.title}
                        </h3>
                        <p className="text-gray-400 text-base line-clamp-2 mb-6 leading-relaxed max-w-3xl">
                            {item.intro}
                        </p>
                        
                        <div className="flex items-center gap-6 mt-auto border-t border-white/5 pt-4 md:pt-0 md:border-0">
                             <span className="text-xs font-bold text-gray-500 flex items-center gap-2">
                                <Clock size={14}/> 10 min lezen
                             </span>
                             <span className="text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2 group-hover:translate-x-2 transition-transform ml-auto md:ml-0">
                                Lees Artikel <ArrowRight size={14} className="text-museum-gold"/>
                             </span>
                        </div>
                    </div>
                </Link>
            ))}
        </div>

      </div>
    </div>
  );
}
