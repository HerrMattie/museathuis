import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Layers, ArrowRight, Lock, Crown } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import DateNavigator from '@/components/ui/DateNavigator';
import { getLevel } from '@/lib/levelSystem';
import { getHistoryAccess } from '@/lib/accessControl';

export const revalidate = 0;

export default async function SalonPage({ searchParams }: { searchParams: { date?: string } }) {
  const supabase = createClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();

  const today = new Date().toISOString().split('T')[0];
  const selectedDate = searchParams.date || today;

  // Level Logic
  const { count: actionCount } = await supabase.from('user_activity_logs').select('*', { count: 'exact', head: true }).eq('user_id', user?.id);
  const { count: favCount } = await supabase.from('favorites').select('*', { count: 'exact', head: true }).eq('user_id', user?.id);
  const xp = ((actionCount || 0) * 15) + ((favCount || 0) * 50);
  const { level } = getLevel(xp);
  const access = getHistoryAccess(level);

  // Haal salons op (we halen er meer op om te kunnen navigeren)
  const { data: salons } = await supabase.from('salons').select('*').eq('status', 'published').limit(20);
  
  let weeklySalons = salons || [];
  
  // Wekelijkse Selectie Logica
  if (weeklySalons.length > 3) {
      // Bereken weeknummer sinds 1 jan
      const date = new Date(selectedDate);
      const onejan = new Date(date.getFullYear(), 0, 1);
      const weekNum = Math.ceil((((date.getTime() - onejan.getTime()) / 86400000) + onejan.getDay() + 1) / 7);
      
      const start = weekNum % (weeklySalons.length - 2);
      weeklySalons = weeklySalons.slice(start, start + 3);
  }

  return (
    <div className="min-h-screen bg-midnight-950 text-white">
      <PageHeader title="De Salon" subtitle="Wekelijkse exclusieve collecties." />

      <div className="max-w-7xl mx-auto px-6 pb-20 -mt-20 relative z-20">
        
        {/* PREMIUM HEADER & NAVIGATIE */}
        <div className="flex flex-col items-center mb-12">
            <div className="bg-museum-gold/10 border border-museum-gold/20 text-museum-gold px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 mb-6">
                <Crown size={14}/> Premium Only
            </div>
            
            {/* WEEK NAVIGATIE (Mode = week) */}
            <DateNavigator basePath="/salon" currentDate={selectedDate} maxBack={access.weeks} mode="week" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {weeklySalons.map((salon) => {
                const isLocked = !user; // Altijd locked als je geen user bent

                return (
                    <Link key={salon.id} href={isLocked ? '/pricing' : `/salon/${salon.id}`} className="group bg-midnight-900 border border-white/10 rounded-2xl overflow-hidden hover:border-museum-gold/40 transition-all hover:-translate-y-2 hover:shadow-2xl flex flex-col h-full">
                        <div className="h-64 relative overflow-hidden bg-black">
                            {salon.image_url ? (
                                <img src={salon.image_url} alt={salon.title} className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${isLocked ? 'grayscale' : ''}`} />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-white/5"><Layers size={48} className="opacity-20"/></div>
                            )}
                            <div className="absolute top-4 left-4 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest text-white border border-white/10 shadow-lg bg-black/80">
                                <span className="flex items-center gap-1"><Lock size={10}/> Premium</span>
                            </div>
                        </div>
                        <div className="p-8 flex-1 flex flex-col">
                            <h3 className="font-serif font-bold text-2xl mb-3 text-white group-hover:text-museum-gold transition-colors">{salon.title}</h3>
                            <p className="text-gray-400 text-sm leading-relaxed mb-6 line-clamp-3 flex-1">{salon.description}</p>
                            <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center">
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{isLocked ? 'Word lid' : 'Open Collectie'}</span>
                                <ArrowRight size={16} className={`transition-transform group-hover:translate-x-1 ${isLocked ? 'text-gray-600' : 'text-museum-gold'}`}/>
                            </div>
                        </div>
                    </Link>
                );
            })}
        </div>
        
        {weeklySalons.length === 0 && (
             <div className="text-center py-20 text-gray-400">Geen salons gevonden voor deze week.</div>
        )}
      </div>
    </div>
  );
}
