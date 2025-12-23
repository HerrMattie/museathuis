import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Layers, ArrowRight, Lock, Crown } from 'lucide-react';
import DateNavigator from '@/components/ui/DateNavigator';
import { getLevel } from '@/lib/levelSystem';
import { getHistoryAccess } from '@/lib/accessControl';

export const revalidate = 0;

export default async function SalonPage({ searchParams }: { searchParams: { date?: string } }) {
  const supabase = createClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();

  // 1. DATUM LOGICA
  const selectedDateStr = searchParams.date || new Date().toISOString().split('T')[0];
  const selectedDate = new Date(selectedDateStr);
  
  const day = selectedDate.getDay(); 
  const diff = selectedDate.getDate() - day + (day === 0 ? -6 : 1); 
  
  const monday = new Date(selectedDate);
  monday.setDate(diff);
  const mondayStr = monday.toISOString().split('T')[0];

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const sundayStr = sunday.toISOString().split('T')[0];

  // 2. HAAL CRM TEKSTEN OP
  const { data: content } = await supabase
    .from('site_content')
    .select('*')
    .in('key', ['salon_title', 'salon_subtitle', 'salon_unlock_btn']);
  const texts = content?.reduce((acc: any, item: any) => ({ ...acc, [item.key]: item.content }), {}) || {};

  // 3. LEVEL & ACCESS CHECK
  // We moeten checken of de user premium is OF level toegang heeft
  // Haal premium status op
  let isPremium = false;
  let userLevel = 1;

  if (user) {
      const { data: profile } = await supabase.from('user_profiles').select('is_premium, xp').eq('user_id', user.id).single();
      isPremium = profile?.is_premium || false;
      const { level } = getLevel(profile?.xp || 0);
      userLevel = level;
  }

  const access = getHistoryAccess(userLevel);
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - (access.weeks * 7));

  // 4. HAAL SALONS OP
  const { data: weeklySalons } = await supabase
    .from('salons')
    .select('*')
    .eq('status', 'published')
    .gte('day_date', mondayStr)
    .lte('day_date', sundayStr)
    .order('day_date', { ascending: true })
    .limit(3);

  return (
    <div className="min-h-screen bg-midnight-950 text-white pt-24 px-6 pb-20">
       
       {/* HEADER */}
       <div className="max-w-6xl mx-auto text-center flex flex-col items-center mb-16">
          <div className="flex items-center gap-2 text-museum-gold text-xs font-bold tracking-widest uppercase mb-4 animate-in fade-in slide-in-from-bottom-4">
              <Crown size={16} /> Premium Only
          </div>
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-4">
            {texts.salon_title || "De Salon"}
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mb-8">
            {texts.salon_subtitle || "Wekelijkse exclusieve collecties voor rust en inspiratie."}
          </p>
          
          <div className="flex items-center justify-center gap-4">
             <DateNavigator basePath="/salon" currentDate={selectedDateStr} maxBack={access.weeks} mode="week" />
          </div>
       </div>

      {/* GRID */}
      <div className="max-w-7xl mx-auto relative z-20">
        {weeklySalons && weeklySalons.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {weeklySalons.map((salon) => {
                    const salonDate = new Date(salon.day_date);
                    
                    // Logic: Is Locked?
                    // Locked als: Geen user, OF geen premium (want Salon is premium-first feature)
                    // OF datum is te oud voor je level (als we levels gebruiken voor archief toegang)
                    // In jouw huidige model is Salon "Premium Only", dus we checken puur op isPremium.
                    
                    const isLocked = !isPremium; 

                    return (
                        <div key={salon.id} className="relative group flex flex-col h-full">
                            
                            {/* DE CARD (Link werkt alleen als unlocked) */}
                            <Link 
                                href={isLocked ? '/pricing' : `/salon/${salon.id}`} 
                                className={`flex flex-col h-full bg-midnight-900 border border-white/10 rounded-2xl overflow-hidden transition-all hover:border-museum-gold/40 hover:-translate-y-2 hover:shadow-2xl ${isLocked ? 'cursor-default' : ''}`}
                            >
                                {/* Afbeelding */}
                                <div className="h-64 relative overflow-hidden bg-black">
                                    {salon.image_url ? (
                                        <img 
                                            src={salon.image_url} 
                                            alt={salon.title} 
                                            className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${isLocked ? 'grayscale opacity-50' : ''}`} 
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-white/5"><Layers size={48} className="opacity-20"/></div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className={`p-8 flex-1 flex flex-col relative ${isLocked ? 'opacity-50 blur-[2px]' : ''}`}>
                                    <h3 className="font-serif font-bold text-2xl mb-3 text-white group-hover:text-museum-gold transition-colors">{salon.title}</h3>
                                    <p className="text-gray-400 text-sm leading-relaxed mb-6 line-clamp-3 flex-1">{salon.description}</p>
                                    
                                    <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center">
                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                                            Open Collectie
                                        </span>
                                        <ArrowRight size={16} className="text-museum-gold group-hover:translate-x-1 transition-transform"/>
                                    </div>
                                </div>
                            </Link>

                            {/* LOCK OVERLAY (Alleen als !isPremium) */}
                            {isLocked && (
                                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 rounded-2xl backdrop-blur-[1px] p-6 text-center border border-museum-gold/20">
                                    <div className="w-14 h-14 bg-museum-gold/20 rounded-full flex items-center justify-center mb-4 text-museum-gold animate-pulse">
                                        <Lock size={24} />
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-2">Alleen voor Leden</h3>
                                    <p className="text-gray-400 text-xs mb-6 max-w-[200px]">
                                        Deze samengestelde collectie is exclusief beschikbaar voor Mecenassen.
                                    </p>
                                    <Link 
                                        href="/pricing" 
                                        className="inline-flex items-center gap-2 bg-museum-gold text-black px-5 py-2.5 rounded-full text-sm font-bold hover:bg-white transition-colors"
                                    >
                                        <Crown size={14} />
                                        Word Mecenas
                                    </Link>
                                </div>
                            )}

                        </div>
                    );
                })}
            </div>
        ) : (
             <div className="text-center py-20 text-gray-400 border border-dashed border-white/10 rounded-2xl font-serif italic text-lg">
                Geen collecties gevonden voor deze week. Kom maandag terug voor nieuwe inspiratie.
             </div>
        )}
      </div>
    </div>
  );
}
