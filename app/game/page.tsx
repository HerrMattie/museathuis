import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Gamepad2, ArrowRight, Clock, Lock, History } from 'lucide-react';
import LikeButton from '@/components/LikeButton';
import { getLevel } from '@/lib/levelSystem'; // <--- Nodig voor de check
import { getPastContent } from '@/lib/dailyService'; // <--- Onze nieuwe functie

export const revalidate = 0;

export default async function GamePage() {
  const supabase = createClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();

  // 1. Haal Content & Stats
  const { data: pageContent } = await supabase.from('page_content').select('*').eq('slug', 'game').single();
  const { count: actionCount } = await supabase.from('user_activity_logs').select('*', { count: 'exact', head: true }).eq('user_id', user?.id);
  const { count: favCount } = await supabase.from('favorites').select('*', { count: 'exact', head: true }).eq('user_id', user?.id);

  // 2. Bereken Level voor Time Travel
  const xp = ((actionCount || 0) * 15) + ((favCount || 0) * 50);
  const { level } = getLevel(xp);

  // 3. Bepaal hoeveel dagen terug (Time Travel Logic)
  let daysBack = 0;
  if (level >= 30) daysBack = 7;      // Historicus
  else if (level >= 10) daysBack = 3; // Tijdreiziger

  // 4. Haal data op
  // A. De "Live" games (gewoon alles, of de nieuwste)
  const { data: latestGames } = await supabase.from('games').select('*').eq('status', 'published').order('created_at', { ascending: false }).limit(6);
  
  // B. De "Time Travel" games (uit het dagprogramma van gisteren/eergisteren)
  const historyGames = await getPastContent(supabase, daysBack, 'game');

  // Fallbacks
  const title = pageContent?.title || "Kunst Quiz";
  const subtitle = pageContent?.subtitle || "Test uw kennis";
  const intro = pageContent?.intro_text || "Dagelijkse uitdagingen.";

  return (
    <div className="min-h-screen bg-midnight-950 text-white pt-20 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER (Zelfde als voorheen) */}
        <div className="relative py-16 mb-12 border-b border-white/10">
             <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/20 to-transparent pointer-events-none rounded-3xl"></div>
             <div className="relative z-10">
                <p className="text-museum-gold text-sm font-bold uppercase tracking-[0.2em] mb-3">{subtitle}</p>
                <h1 className="text-5xl md:text-7xl font-serif font-black mb-6 text-white">{title}</h1>
                <p className="text-xl text-gray-300 max-w-2xl leading-relaxed font-light">{intro}</p>
             </div>
        </div>

        {/* TIME TRAVEL SECTIE (Alleen zichtbaar als je games hebt opgehaald OF als teaser) */}
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

            {daysBack > 0 && historyGames.length > 0 ? (
                // SHOWCASE: Je mag terugkijken
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {historyGames.map((game: any) => (
                        <Link key={game.id} href={`/game/${game.id}`} className="group bg-midnight-900 border border-white/10 rounded-xl p-6 hover:border-museum-gold/40 transition-all flex items-center gap-4">
                            <div className="w-12 h-12 bg-emerald-900/30 text-emerald-400 rounded-lg flex items-center justify-center shrink-0">
                                <Gamepad2 size={24}/>
                            </div>
                            <div>
                                <div className="text-xs text-gray-500 uppercase font-bold mb-1">Eerder deze week</div>
                                <h4 className="font-bold text-white group-hover:text-museum-gold transition-colors">{game.title}</h4>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : daysBack === 0 ? (
                // TEASER: Je bent nog geen level 10
                <div className="bg-gradient-to-r from-gray-900 to-black border border-white/10 rounded-xl p-8 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
                    <Lock size={32} className="mx-auto text-gray-600 mb-4"/>
                    <h4 className="font-bold text-gray-300 mb-2">Het archief is vergrendeld</h4>
                    <p className="text-sm text-gray-500 max-w-md mx-auto mb-4">
                        Bereik <span className="text-museum-gold font-bold">Level 10</span> om games van de afgelopen 3 dagen terug te spelen.
                    </p>
                    <div className="w-full max-w-xs mx-auto bg-gray-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-museum-gold h-full w-1/3"></div> {/* Fake progress ter motivatie */}
                    </div>
                </div>
            ) : (
                <p className="text-gray-500 text-sm italic">Geen gemiste games in de afgelopen {daysBack} dagen.</p>
            )}
        </div>

        {/* REGULIERE GRID (Nieuwste Games) */}
        <h3 className="text-2xl font-serif font-bold text-white mb-6">Nieuwste Games</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {latestGames?.map((game) => (
                // ... (Hier plak je de bestaande Game Card code van eerder) ...
                <Link key={game.id} href={`/game/${game.id}`} className="group bg-midnight-900 border border-white/10 rounded-2xl overflow-hidden hover:border-museum-gold/40 transition-all hover:-translate-y-2 hover:shadow-2xl flex flex-col">
                    <div className="h-48 relative bg-white/5 flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                        <Gamepad2 size={64} className="text-gray-600 group-hover:text-museum-gold transition-colors duration-500 group-hover:scale-110"/>
                        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest text-white border border-white/10">Quiz</div>
                    </div>
                    <div className="p-8 flex-1 flex flex-col">
                        <h3 className="font-serif font-bold text-2xl mb-3 text-white group-hover:text-museum-gold transition-colors">{game.title}</h3>
                        <p className="text-gray-400 text-sm line-clamp-2 mb-6 leading-relaxed flex-1">{game.short_description}</p>
                        <div className="flex justify-between items-center border-t border-white/5 pt-4 mt-auto">
                             <span className="text-xs font-bold text-gray-500 flex items-center gap-2"><Clock size={14}/> 2 min</span>
                             <span className="text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2 group-hover:gap-3 transition-all">Start <ArrowRight size={14} className="text-museum-gold"/></span>
                        </div>
                    </div>
                </Link>
            ))}
        </div>

      </div>
    </div>
  );
}
