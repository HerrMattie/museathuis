import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Crosshair, ArrowRight, Lock, Calendar, FileText } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import DateNavigator from '@/components/ui/DateNavigator';
import { getLevel } from '@/lib/levelSystem';
import { getHistoryAccess } from '@/lib/accessControl';

export const revalidate = 0;

export default async function FocusPage({ searchParams }: { searchParams: { date?: string } }) {
  const supabase = createClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();

  const today = new Date().toISOString().split('T')[0];
  const selectedDate = searchParams.date || today;

  // Level logic
  const { count: actionCount } = await supabase.from('user_activity_logs').select('*', { count: 'exact', head: true }).eq('user_id', user?.id);
  const { count: favCount } = await supabase.from('favorites').select('*', { count: 'exact', head: true }).eq('user_id', user?.id);
  const xp = ((actionCount || 0) * 15) + ((favCount || 0) * 50);
  const { level } = getLevel(xp);
  const access = getHistoryAccess(level);

  // Haal artikelen
  const { data: articles } = await supabase.from('focus_items').select('*').eq('status', 'published').limit(10);
  
  let dailyFocus = articles || [];
  if (dailyFocus.length > 3) {
      const dayNum = new Date(selectedDate).getDate();
      const start = dayNum % (dailyFocus.length - 2);
      dailyFocus = dailyFocus.slice(start, start + 3);
  }

  // Sort: 1 Free, 2 Premium
  if (dailyFocus.length > 0) {
      const freeIndex = dailyFocus.findIndex(a => !a.is_premium);
      if (freeIndex > 0) {
          const [free] = dailyFocus.splice(freeIndex, 1);
          dailyFocus.unshift(free);
      }
  }

  return (
    <div className="min-h-screen bg-midnight-950 text-white">
      <PageHeader title="In Focus" subtitle="Verdiepende achtergrondverhalen bij de collectie van vandaag." />

      <div className="max-w-7xl mx-auto px-6 pb-20 -mt-20 relative z-20">
        <DateNavigator basePath="/focus" currentDate={selectedDate} maxBack={access.days} mode="day" />

        {dailyFocus.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {dailyFocus.map((item, index) => {
                    const isPremiumSlot = index > 0;
                    const isLocked = (item.is_premium || isPremiumSlot) && !user;

                    return (
                        <Link key={item.id} href={isLocked ? '/pricing' : `/focus/${item.id}`} className="group bg-midnight-900 border border-white/10 rounded-2xl overflow-hidden hover:border-museum-gold/40 transition-all hover:-translate-y-2 hover:shadow-2xl flex flex-col h-full">
                            <div className="h-56 relative overflow-hidden bg-black">
                                {item.cover_image ? (
                                    <img src={item.cover_image} alt={item.title} className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${isLocked ? 'grayscale' : ''}`} />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-white/5"><FileText size={48} className="opacity-20"/></div>
                                )}
                                <div className={`absolute top-4 left-4 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest text-white border border-white/10 shadow-lg ${isLocked ? 'bg-black/80' : 'bg-museum-gold text-black'}`}>
                                    {isLocked ? <span className="flex items-center gap-1"><Lock size={10}/> Premium</span> : 'Artikel'}
                                </div>
                            </div>
                            <div className="p-8 flex-1 flex flex-col">
                                <h3 className="font-serif font-bold text-2xl mb-3 text-white group-hover:text-museum-gold transition-colors">{item.title}</h3>
                                <p className="text-gray-400 text-sm leading-relaxed mb-6 line-clamp-3 flex-1">{item.intro}</p>
                                <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center text-sm text-gray-500">
                                    <span className="flex items-center gap-2"><Calendar size={14}/> {new Date(item.created_at).toLocaleDateString('nl-NL')}</span>
                                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest group-hover:text-white transition-colors">Lees Verder <ArrowRight size={14} className="text-museum-gold"/></div>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        ) : (
            <div className="text-center py-20 text-gray-400">Geen artikelen vandaag.</div>
        )}
      </div>
    </div>
  );
}
