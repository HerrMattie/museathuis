import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Gamepad2, ArrowRight, Trophy, Star } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';

export const revalidate = 0;

export default async function GamePage() {
  const supabase = createClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();

  // Haal games op
  const { data: games } = await supabase
    .from('games')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-midnight-950 text-white">
      
      <PageHeader 
        title="Games & Quizzes" 
        subtitle="Test je kennis en train je oog. Speel dagelijks mee voor de highscore."
        // Optioneel: backgroundImage="/images/headers/game-bg.jpg"
      />

      <div className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {games?.map((game) => {
                const isLocked = game.is_premium && !user;

                return (
                    <Link key={game.id} href={isLocked ? '/pricing' : `/game/${game.id}`} className="group bg-midnight-900 border border-white/10 rounded-2xl overflow-hidden hover:border-museum-gold/40 transition-all hover:-translate-y-2 hover:shadow-2xl flex flex-col">
                        <div className="h-48 relative bg-black flex items-center justify-center overflow-hidden">
                            {/* Games hebben vaak geen plaatje, dus we gebruiken een icoon patroon of gradient */}
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/40 to-black"></div>
                            <Gamepad2 size={64} className="text-emerald-500/20 group-hover:scale-110 transition-transform duration-500"/>
                            
                            <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-emerald-400 border border-emerald-500/30">
                                {game.type.replace('_', ' ')}
                            </div>
                        </div>

                        <div className="p-8 flex-1 flex flex-col">
                            <h3 className="font-serif font-bold text-2xl mb-3 text-white group-hover:text-museum-gold transition-colors">
                                {game.title}
                            </h3>
                            <p className="text-gray-400 text-sm leading-relaxed mb-6 line-clamp-2">
                                {game.short_description || "Speel nu en test je kennis."}
                            </p>
                            
                            <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center">
                                <span className="text-xs font-bold text-gray-500 flex items-center gap-2">
                                    <Trophy size={14} className="text-museum-gold"/> Win XP
                                </span>
                                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white">
                                    Speel Nu <ArrowRight size={14} className="text-museum-gold"/>
                                </div>
                            </div>
                        </div>
                    </Link>
                );
            })}
        </div>

        {(!games || games.length === 0) && (
            <div className="text-center py-20 bg-white/5 rounded-2xl border border-dashed border-white/10">
                <Gamepad2 size={48} className="mx-auto text-gray-600 mb-4"/>
                <p className="text-gray-400">Er zijn nog geen games beschikbaar.</p>
            </div>
        )}
      </div>
    </div>
  );
}
