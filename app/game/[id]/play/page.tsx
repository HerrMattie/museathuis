import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

// IMPORTEER ALLE 6 DE ENGINES
import QuizEngine from '@/components/game/engines/QuizEngine';
import TimelineEngine from '@/components/game/engines/TimelineEngine';
import PixelHuntEngine from '@/components/game/engines/PixelHuntEngine';
import MemoryEngine from '@/components/game/engines/MemoryEngine';
import CuratorEngine from '@/components/game/engines/CuratorEngine';
import WhoAmIEngine from '@/components/game/engines/WhoAmIEngine';

export const revalidate = 0;

export default async function PlayGamePage({ params }: { params: { id: string } }) {
  const supabase = createClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login'); 

  // 1. Haal Game Data
  const { data: game } = await supabase
    .from('games')
    .select('*, game_items(*)')
    .eq('id', params.id)
    .single();

  if (!game) return <div className="text-white p-10">Game niet gevonden</div>;

  return (
    <div className="min-h-screen bg-midnight-950 text-white flex flex-col">
      
      {/* Header tijdens spelen */}
      <div className="p-4 border-b border-white/10 flex justify-between items-center bg-midnight-950/50 backdrop-blur-md sticky top-0 z-50">
          <Link href="/game" className="text-gray-400 hover:text-white flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-colors">
              <ArrowLeft size={16}/> Stoppen
          </Link>
          <div className="font-serif font-bold text-lg text-museum-gold hidden md:block">{game.title}</div>
          <div className="w-20"></div> 
      </div>

      {/* 2. DE ENGINE KIEZER */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
          
          {/* Achtergrond sfeer */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>

          {game.type === 'quiz' && <QuizEngine game={game} items={game.game_items} userId={user.id} />}
          
          {game.type === 'timeline' && <TimelineEngine game={game} items={game.game_items} userId={user.id} />}
          
          {game.type === 'pixel_hunt' && <PixelHuntEngine game={game} items={game.game_items} userId={user.id} />}
          
          {game.type === 'memory' && <MemoryEngine game={game} items={game.game_items} userId={user.id} />}
          
          {game.type === 'curator' && <CuratorEngine game={game} items={game.game_items} userId={user.id} />}
          
          {game.type === 'who_am_i' && <WhoAmIEngine game={game} items={game.game_items} userId={user.id} />}

          {/* Foutafhandeling */}
          {!['quiz', 'timeline', 'pixel_hunt', 'memory', 'curator', 'who_am_i'].includes(game.type) && (
              <div className="text-center text-gray-400 bg-white/5 p-8 rounded-xl border border-white/10">
                  <p className="mb-2">Onbekend speltype: <span className="text-white font-mono">{game.type}</span></p>
                  <p className="text-sm">Controleer de database configuratie.</p>
              </div>
          )}

      </div>
    </div>
  );
}
