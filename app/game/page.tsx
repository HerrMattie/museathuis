import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Gamepad2, ArrowRight, Clock } from 'lucide-react';
import LikeButton from '@/components/LikeButton';

export const revalidate = 0;

export default async function GamePage() {
  const supabase = createClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();

  // 1. HAAL PAGINA TEKST UIT CRM
  const { data: pageContent } = await supabase
    .from('page_content')
    .select('*')
    .eq('slug', 'game')
    .single();

  // 2. Haal Games op
  const { data: items } = await supabase
    .from('games')
    .select('*, game_items(count)')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  // Fallbacks
  const title = pageContent?.title || "Kunst Quiz";
  const subtitle = pageContent?.subtitle || "Test uw kennis";
  const intro = pageContent?.intro_text || "Dagelijkse uitdagingen om uw kunstkennis aan te scherpen.";

  return (
    <div className="min-h-screen bg-midnight-950 text-white pt-20 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="relative py-16 mb-12 border-b border-white/10">
             <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/20 to-transparent pointer-events-none rounded-3xl"></div>
             <div className="relative z-10">
                <p className="text-museum-gold text-sm font-bold uppercase tracking-[0.2em] mb-3">{subtitle}</p>
                <h1 className="text-5xl md:text-7xl font-serif font-black mb-6 text-white">{title}</h1>
                <p className="text-xl text-gray-300 max-w-2xl leading-relaxed font-light">{intro}</p>
             </div>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {items?.map((game) => (
                <Link key={game.id} href={`/game/${game.id}`} className="group bg-midnight-900 border border-white/10 rounded-2xl overflow-hidden hover:border-museum-gold/40 transition-all hover:-translate-y-2 hover:shadow-2xl flex flex-col">
                    
                    <div className="h-48 relative bg-white/5 flex items-center justify-center overflow-hidden">
                        {/* Abstract patroon of icoon */}
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                        <Gamepad2 size={64} className="text-gray-600 group-hover:text-museum-gold transition-colors duration-500 group-hover:scale-110"/>
                        
                        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest text-white border border-white/10">
                            Quiz
                        </div>
                        <div className="absolute top-4 right-4 z-20">
                             <LikeButton itemId={game.id} itemType="game" userId={user?.id} />
                        </div>
                    </div>
                    
                    <div className="p-8 flex-1 flex flex-col">
                        <h3 className="font-serif font-bold text-2xl mb-3 text-white group-hover:text-museum-gold transition-colors">{game.title}</h3>
                        <p className="text-gray-400 text-sm line-clamp-2 mb-6 leading-relaxed flex-1">{game.short_description}</p>
                        
                        <div className="flex justify-between items-center border-t border-white/5 pt-4 mt-auto">
                             <span className="text-xs font-bold text-gray-500 flex items-center gap-2">
                                <Clock size={14}/> 2 min
                             </span>
                             <span className="text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2 group-hover:gap-3 transition-all">
                                Start <ArrowRight size={14} className="text-museum-gold"/>
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
