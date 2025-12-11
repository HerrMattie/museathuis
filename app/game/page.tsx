import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Gamepad2, ArrowRight, Clock, Calendar, ChevronLeft, ChevronRight, Lock } from 'lucide-react';
import LikeButton from '@/components/LikeButton';
import { getLevel } from '@/lib/levelSystem';

export const revalidate = 0;

export default async function GamePage({ searchParams }: { searchParams: { date?: string } }) {
  const supabase = createClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();

  // 1. Datum & Level
  const todayStr = new Date().toISOString().split('T')[0];
  const selectedDateStr = searchParams.date || todayStr;
  const selectedDate = new Date(selectedDateStr);
  const prevDate = new Date(selectedDate); prevDate.setDate(prevDate.getDate() - 1);
  const nextDate = new Date(selectedDate); nextDate.setDate(nextDate.getDate() + 1);
  const prevStr = prevDate.toISOString().split('T')[0];
  const nextStr = nextDate.toISOString().split('T')[0];
  const isToday = selectedDateStr === todayStr;

  const { count: actionCount } = await supabase.from('user_activity_logs').select('*', { count: 'exact', head: true }).eq('user_id', user?.id);
  const xp = (actionCount || 0) * 15;
  const { level } = getLevel(xp);
  const diffDays = Math.ceil((new Date(todayStr).getTime() - selectedDate.getTime()) / (1000 * 60 * 60 * 24));
  const isLocked = diffDays > 0 && ((diffDays > 3 && level < 30) || (diffDays > 0 && level < 10));

  // 2. Content
  const { data: schedule } = await supabase.from('dayprogram_schedule').select('game_ids').eq('day_date', selectedDateStr).single();
  let items = [];
  if (schedule?.game_ids && schedule.game_ids.length > 0) {
      const { data } = await supabase.from('games').select('*').in('id', schedule.game_ids);
      items = data || [];
  } else if (isToday) {
      const { data } = await supabase.from('games').select('*').eq('status', 'published').limit(3);
      items = data || [];
  }

  // 3. Sorteren & Fixen
  items.sort((a, b) => Number(a.is_premium) - Number(b.is_premium));
  if (items.length >= 3) {
      items[0].is_premium = false; items[1].is_premium = true; items[2].is_premium = true;
  }

  return (
    <div className="min-h-screen bg-midnight-950 text-white pt-20 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="relative py-12 mb-8 border-b border-white/10">
             <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/20 to-transparent pointer-events-none rounded-3xl"></div>
             <div className="relative z-10">
                <p className="text-museum-gold text-sm font-bold uppercase tracking-[0.2em] mb-2">Uitdaging</p>
                <h1 className="text-5xl font-serif font-black text-white">Games</h1>
             </div>
        </div>

        <div className="flex items-center justify-between mb-8 bg-white/5 p-4 rounded-xl border border-white/10">
            <Link href={`/game?date=${prevStr}`} className="flex items-center gap-2 text-sm font-bold hover:text-museum-gold transition-colors"><ChevronLeft size={16}/> Vorige Dag</Link>
            <div className="flex items-center gap-2 text-museum-gold font-serif font-bold text-lg"><Calendar size={20}/> {selectedDate.toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
            {!isToday ? <Link href={`/game?date=${nextStr}`} className="flex items-center gap-2 text-sm font-bold hover:text-museum-gold transition-colors">Volgende Dag <ChevronRight size={16}/></Link> : <div className="w-24"></div>}
        </div>

        {isLocked ? (
             <div className="bg-black/50 border border-white/10 rounded-xl p-12 text-center">
                 <Lock size={48} className="mx-auto text-gray-600 mb-4"/>
                 <h3 className="text-2xl font-bold text-white mb-2">Archief Vergrendeld</h3>
                 <p className="text-gray-400">Bereik Level 10 om terug te kijken in de tijd.</p>
             </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {items.map((game) => (
                    <Link key={game.id} href={`/game/${game.id}`} className="group bg-midnight-900 border border-white/10 rounded-2xl overflow-hidden hover:border-museum-gold/40 transition-all hover:-translate-y-2 hover:shadow-2xl flex flex-col">
                        <div className="h-48 relative bg-white/5 flex items-center justify-center overflow-hidden">
                            <Gamepad2 size={64} className="text-gray-600 group-hover:text-museum-gold transition-colors duration-500 group-hover:scale-110"/>
                            <div className={`absolute top-4 left-4 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest text-white border border-white/10 z-10 ${game.is_premium ? 'bg-museum-gold text-black' : 'bg-black/50 backdrop-blur-md'}`}>{game.is_premium ? 'Premium' : 'Gratis'}</div>
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
                {items.length === 0 && <p className="text-gray-500 col-span-3 text-center py-10">Geen games voor deze datum.</p>}
            </div>
        )}
      </div>
    </div>
  );
}
