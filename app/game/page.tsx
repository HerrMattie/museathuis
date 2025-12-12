import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Gamepad2, ArrowRight, Trophy, Lock, Crown } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import DateNavigator from '@/components/ui/DateNavigator';
import { getLevel } from '@/lib/levelSystem';
import { getHistoryAccess } from '@/lib/accessControl';

export const revalidate = 0;

export default async function GamePage({ searchParams }: { searchParams: { date?: string } }) {
  const supabase = createClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();

  const today = new Date().toISOString().split('T')[0];
  const selectedDate = searchParams.date || today;

  // Level Check
  const { count: actionCount } = await supabase.from('user_activity_logs').select('*', { count: 'exact', head: true }).eq('user_id', user?.id);
  const { count: favCount } = await supabase.from('favorites').select('*', { count: 'exact', head: true }).eq('user_id', user?.id);
  const xp = ((actionCount || 0) * 15) + ((favCount || 0) * 50);
  const { level } = getLevel(xp);
  const access = getHistoryAccess(level);

  // Games ophalen
  const { data: games } = await supabase.from('games').select('*').eq('status', 'published').limit(10);
  
  let dailyGames = games || [];
  if (dailyGames.length > 3) {
      const dayNum = new Date(selectedDate).getDate();
      const start = dayNum % (dailyGames.length - 2);
      dailyGames = dailyGames.slice(start, start + 3);
  }

  // Sorteer: Index 0 = Gratis
  if (dailyGames.length > 0) {
      const freeIndex = dailyGames.findIndex(g => !g.is_premium);
      if (freeIndex > 0) {
          const [free] = dailyGames.splice(freeIndex, 1);
          dailyGames.unshift(free);
      }
  }

  return (
    <div className="min-h-screen bg-midnight-950 text-white">
      <PageHeader title="Games & Quizzes" subtitle="Train je kennis. 1 Gratis game, 2 Premium uitdagingen per dag." />

      <div className="max-w-7xl mx-auto px-6 pb-20 -mt-20 relative z-20">
        <DateNavigator basePath="/game" currentDate={selectedDate} maxBack={access.days} mode="day" />

        {dailyGames.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {dailyGames.map((game, index) => {
                    const isPremiumSlot = index > 0;
                    const isContentPremium = isPremiumSlot || game.is_premium;
                    const isLocked = isContentPremium && !user;

                    return (
                        <Link key={game.id} href={isLocked ? '/pricing' : `/game/${game.id}`} className="group bg-midnight-900 border border-white/10 rounded-2xl overflow-hidden hover:border-museum-gold/40 transition-all hover:-translate-y-2 hover:shadow-2xl flex flex-col">
                            <div className="h-48 relative bg-black flex items-center justify-center overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/40 to-black"></div>
                                <Gamepad2 size={64} className="text-emerald-500/20 group-hover:scale-110 transition-transform duration-500"/>
                                
                                <div className={`absolute top-4 right-4 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest border border-white/10 shadow-lg ${isContentPremium ? 'bg-black/80 text-white' : 'bg-emerald-600 text-white'}`}>
                                    {isContentPremium ? (
                                        <span className="flex items-center gap-1">{isLocked ? <Lock size={10}/> : <Crown size={10}/>} Premium</span>
                                    ) : 'Gratis'}
                                </div>
                            </div>
                            <div className="p-8 flex-1 flex flex-col">
                                <h3 className="font-serif font-bold text-2xl mb-3 text-white group-hover:text-museum-gold transition-colors">{game.title}</h3>
                                <p className="text-gray-400 text-sm leading-relaxed mb-6 line-clamp-2">{game.short_description}</p>
                                <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center">
                                    <span className="text-xs font-bold text-gray-500 flex items-center gap-2"><Trophy size={14} className="text-museum-gold"/> Win XP</span>
                                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white">Speel Nu <ArrowRight size={14} className="text-museum-gold"/></div>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        ) : (
            <div className="text-center py-20 text-gray-400">Geen games voor vandaag.</div>
        )}
      </div>
    </div>
  );
}
