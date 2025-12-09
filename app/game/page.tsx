import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Brain, Lock, Trophy, ChevronRight, Play } from 'lucide-react';

export const revalidate = 60;

export default async function GameOverviewPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  let isUserPremium = false;
  if (user) {
    const { data: profile } = await supabase.from('user_profiles').select('is_premium').eq('user_id', user.id).single();
    if (profile?.is_premium) isUserPremium = true;
  }

  const { data: games } = await supabase
    .from('games')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(12);

  return (
    <main className="min-h-screen bg-midnight-950 pb-20 pt-12 animate-fade-in-up">
      <div className="container mx-auto px-6">
        
        <Link href="/" className="inline-flex items-center gap-2 text-museum-text-secondary hover:text-white mb-8 transition-colors text-sm font-medium">
          <ChevronRight className="rotate-180" size={16} /> Terug naar Dashboard
        </Link>

        <header className="mb-12 max-w-3xl">
          <p className="text-museum-gold text-xs font-bold uppercase tracking-[0.2em] mb-4">
            Train uw oog
          </p>
          <h1 className="font-serif text-5xl md:text-6xl text-white font-bold mb-6">De Kunst Quiz</h1>
          <p className="text-xl text-museum-text-secondary leading-relaxed max-w-2xl">
            Test uw kennis. Van de Vlaamse Primitieven tot Modernisme. 
            Elke dag een nieuwe uitdaging.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games?.map((game) => {
            const isLocked = game.is_premium && !isUserPremium;

            return (
              <Link 
                key={game.id} 
                href={isLocked ? '/pricing' : `/game/${game.id}`}
                className={`group flex flex-col p-6 bg-midnight-900 border rounded-2xl transition-all hover:-translate-y-1 hover:shadow-xl ${isLocked ? 'border-museum-gold/30' : 'border-white/10 hover:border-white/30'}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 rounded-full bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 transition-colors">
                    <Brain size={28} />
                  </div>
                  {game.is_premium ? (
                     <Lock size={20} className="text-museum-gold" />
                  ) : (
                     <span className="text-[10px] bg-museum-lime text-black px-2 py-1 rounded font-bold">GRATIS</span>
                  )}
                </div>

                <h3 className="font-serif text-2xl text-white font-bold mb-2 group-hover:text-blue-300 transition-colors">
                  {game.title}
                </h3>
                <p className="text-gray-400 text-sm mb-6 flex-1">
                  {game.short_description}
                </p>

                <div className="flex items-center gap-2 text-sm font-bold text-white group-hover:translate-x-2 transition-transform">
                  {isLocked ? 'Ontgrendel Quiz' : 'Start Quiz'} <ChevronRight size={16} />
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </main>
  );
}
