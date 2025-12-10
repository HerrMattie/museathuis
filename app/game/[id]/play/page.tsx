import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import QuizEngine from '@/components/game/engines/QuizEngine';
import TimelineEngine from '@/components/game/engines/TimelineEngine'; // Die maken we zo
import Link from 'next/link';
import { ArrowLeft, Lock } from 'lucide-react';

export const revalidate = 0;

export default async function PlayGamePage({ params }: { params: { id: string } }) {
  const supabase = createClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login'); // Alleen leden

  // 1. Haal Game Info & Items op
  const { data: game } = await supabase
    .from('games')
    .select('*, game_items(*)')
    .eq('id', params.id)
    .single();

  if (!game) return <div>Game niet gevonden</div>;

  // 2. Check Daily Limit (Optioneel: hier kun je de checkDailyLimit functie inbouwen)
  // Voor nu laten we iedereen spelen.

  return (
    <div className="min-h-screen bg-midnight-950 text-white flex flex-col">
      
      {/* Simpele Header tijdens spelen */}
      <div className="p-4 border-b border-white/10 flex justify-between items-center bg-midnight-950/50 backdrop-blur-md sticky top-0 z-50">
          <Link href="/game" className="text-gray-400 hover:text-white flex items-center gap-2 text-sm font-bold uppercase tracking-widest">
              <ArrowLeft size={16}/> Stoppen
          </Link>
          <div className="font-serif font-bold text-lg text-museum-gold">{game.title}</div>
          <div className="w-20"></div> {/* Spacer voor centreren */}
      </div>

      {/* 3. DE ENGINE KIEZER */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
          
          {game.type === 'quiz' && (
              <QuizEngine game={game} items={game.game_items} userId={user.id} />
          )}

          {game.type === 'timeline' && (
              <TimelineEngine game={game} items={game.game_items} userId={user.id} />
          )}

          {/* Fallback voor nieuwe types die we nog niet gebouwd hebben */}
          {!['quiz', 'timeline'].includes(game.type) && (
              <div className="text-center text-gray-400">
                  <p>Dit speltype ({game.type}) wordt binnenkort ondersteund.</p>
              </div>
          )}

      </div>
    </div>
  );
}
