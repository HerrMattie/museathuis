import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Brain, Lock, ChevronRight, Calendar, Play } from 'lucide-react';
import { notFound } from 'next/navigation';

export const revalidate = 60;

export default async function GameOverviewPage({ searchParams }: { searchParams: { date?: string } }) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  let isUserPremium = false;
  if (user) {
    const { data: profile } = await supabase.from('user_profiles').select('is_premium').eq('user_id', user.id).single();
    if (profile?.is_premium) isUserPremium = true;
  }

  const dateParam = searchParams.date;
  let games: any[] = [];
  let headerText = "Alle Quizzen";

  if (dateParam) {
    // SCENARIO 1: TIJDREIS MODUS (Toon alle 3 de scheduled games)
    const { data: schedule } = await supabase
      .from('dayprogram_schedule')
      .select('game_ids')
      .eq('day_date', dateParam)
      .single();

    if (schedule?.game_ids && schedule.game_ids.length > 0) {
        // Haal alle games op die in de array van die dag staan
        const { data } = await supabase.from('games').select('*').in('id', schedule.game_ids);
        if (data) games = data;
    }
    headerText = `Quiz Selectie van ${new Date(dateParam).toLocaleDateString('nl-NL')}`;

  } else {
    // SCENARIO 2: STANDAARD MODUS (Archief)
    const { data } = await supabase
      .from('games')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(12);
    games = data || [];
  }

  return (
    <main className="min-h-screen bg-midnight-950 pb-20 pt-12 animate-fade-in-up">
      <div className="container mx-auto px-6">
        
        <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-white mb-8 transition-colors text-sm font-medium">
          <ChevronRight className="rotate-180" size={16} /> Terug naar Dashboard
        </Link>

        <header className="mb-12 max-w-4xl">
          <p className="text-museum-gold text-xs font-bold uppercase tracking-[0.2em] mb-4">
            {dateParam ? 'Dagelijks Archief' : 'Train uw oog'}
          </p>
          <h1 className="font-serif text-5xl md:text-6xl text-white font-bold mb-6">{headerText}</h1>
          <p className="text-xl text-gray-400 leading-relaxed max-w-3xl">
            {dateParam ? 'Dit was de volledige selectie voor deze datum.' : 'Test uw kennis van de kunsthistorie.'}
          </p>
        </header>

        {/* GAMES GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => {
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
                  {game.is_premium && <Lock size={20} className="text-museum-gold" />}
                </div>

                <h3 className="font-serif text-2xl text-white font-bold mb-2 group-hover:text-blue-300 transition-colors">
                  {game.title}
                </h3>
                <p className="text-gray-400 text-sm mb-6 flex-1">
                  {game.short_description}
                </p>

                <div className="flex items-center gap-2 text-sm font-bold text-white group-hover:translate-x-1 transition-transform">
                  {isLocked ? 'Ontgrendel Quiz' : 'Start Quiz'} <ChevronRight size={16} />
                </div>
              </Link>
            )
          })}
          
          {games.length === 0 && (
             <div className="col-span-full py-10 text-center text-gray-500">
                Er zijn geen quizzen gevonden voor deze datum.
             </div>
          )}
        </div>
      </div>
    </main>
  );
}
