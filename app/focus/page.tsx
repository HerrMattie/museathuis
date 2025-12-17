import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { ArrowRight, Lock, FileText, Crown, Clock } from 'lucide-react';
import DateNavigator from '@/components/ui/DateNavigator';
import { getLevel } from '@/lib/levelSystem';
import { getHistoryAccess } from '@/lib/accessControl';

// Zorg dat de pagina altijd vers is
export const revalidate = 0;

export default async function FocusPage({ searchParams }: { searchParams: { date?: string } }) {
  const supabase = createClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();

  const today = new Date().toISOString().split('T')[0];
  const selectedDate = searchParams.date || today;

  // 1. HAAL CRM TEKSTEN
  const { data: content } = await supabase
    .from('site_content')
    .select('*')
    .in('key', ['focus_title', 'focus_subtitle']);
  const texts = content?.reduce((acc: any, item: any) => ({ ...acc, [item.key]: item.content }), {}) || {};

  // 2. LEVEL & ACCESS LOGIC
  const { count: actionCount } = await supabase.from('user_activity_logs').select('*', { count: 'exact', head: true }).eq('user_id', user?.id);
  const { count: favCount } = await supabase.from('favorites').select('*', { count: 'exact', head: true }).eq('user_id', user?.id);
  const xp = ((actionCount || 0) * 15) + ((favCount || 0) * 50);
  const { level } = getLevel(xp);
  const access = getHistoryAccess(level);

  // 3. ARTIKELEN OPHALEN
  // Eerst kijken we in de planning van vandaag
  const { data: schedule } = await supabase
      .from('dayprogram_schedule')
      .select('focus_ids')
      .eq('day_date', selectedDate)
      .single();

  let dailyFocus: any[] = [];

  if (schedule?.focus_ids && schedule.focus_ids.length > 0) {
      // Haal geplande items op
      const { data } = await supabase
          .from('focus_items')
          .select('*')
          .in('id', schedule.focus_ids)
          .eq('status', 'published'); // <--- CHECK DEZE STATUS IN JE DATABASE!
      if (data) dailyFocus = data;
  } else {
      // FALLBACK: Geen planning? Haal de 3 nieuwste op.
      const { data } = await supabase
          .from('focus_items')
          .select('*')
          .eq('status', 'published') // <--- EN DEZE OOK
          .order('created_at', { ascending: false })
          .limit(3);
      if (data) dailyFocus = data;
  }

  // Sorteer: Gratis op plek 1 (als het kan)
  if (dailyFocus.length > 0) {
      const freeIndex = dailyFocus.findIndex(a => !a.is_premium);
      if (freeIndex > 0) {
          const [free] = dailyFocus.splice(freeIndex, 1);
          dailyFocus.unshift(free);
      }
  }

  return (
    <div className="min-h-screen bg-midnight-950 text-white pt-24 px-6 pb-20">
      
      {/* HEADER */}
      <div className="max-w-4xl mx-auto text-center flex flex-col items-center mb-16">
          <div className="flex items-center gap-2 text-museum-gold text-xs font-bold tracking-widest uppercase mb-4 animate-in fade-in slide-in-from-bottom-4">
              <FileText size={16} /> Verdieping & Analyse
          </div>

          <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6">
            {texts.focus_title || "In Focus"}
          </h1>
          
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl leading-relaxed mb-8">
            {texts.focus_subtitle || "Verdiepende artikelen en analyses over kunst en cultuur."}
          </p>

          <div className="flex justify-center">
             <DateNavigator basePath="/focus" currentDate={selectedDate} maxBack={access.days} mode="day" />
          </div>
      </div>

      <div className="max-w-7xl mx-auto relative z-20">
        {dailyFocus.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {dailyFocus.map((item, index) => {
                    const isPremiumSlot = index > 0;
                    const isContentPremium = isPremiumSlot || item.is_premium;
                    const isLocked = isContentPremium && !user;

                    return (
                        <Link key={item.id} href={isLocked ? '/pricing' : `/focus/${item.id}`} className="group bg-midnight-900 border border-white/10 rounded-2xl overflow-hidden hover:border-museum-gold/40 transition-all hover:-translate-y-2 hover:shadow-2xl flex flex-col h-full">
                            
                            {/* Afbeelding */}
                            <div className="h-56 relative overflow-hidden bg-black">
                                {item.cover_image || item.image_url ? (
                                    <img src={item.cover_image || item.image_url} alt={item.title} className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${isLocked ? 'grayscale opacity-50' : ''}`} />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-white/5"><FileText size={48} className="opacity-20"/></div>
                                )}
                                
                                {/* Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-midnight-900 via-transparent to-transparent opacity-90"></div>

                                {/* Label - CONSISTENTE STIJL */}
                                <div className="absolute top-4 left-4 z-10">
                                    {isContentPremium ? (
                                        <span className="flex items-center gap-1.5 bg-black/90 backdrop-blur-md text-museum-gold text-[10px] font-bold px-2.5 py-1 rounded border border-museum-gold/30 uppercase tracking-wider shadow-lg">
                                            {isLocked ? <Lock size={10} /> : <Crown size={10} />}
                                            <span>Premium</span>
                                        </span>
                                    ) : (
                                        <span className="bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded border border-emerald-400/30 uppercase tracking-wider shadow-lg">
                                            Gratis
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-8 flex-1 flex flex-col relative">
                                <h3 className="font-serif font-bold text-2xl mb-3 text-white group-hover:text-museum-gold transition-colors line-clamp-2">{item.title}</h3>
                                <p className="text-gray-400 text-sm leading-relaxed mb-6 line-clamp-3 flex-1">
                                    {item.intro || item.summary || "Lees het volledige achtergrondverhaal."}
                                </p>
                                
                                <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center text-sm text-gray-500">
                                    <span className="flex items-center gap-2 text-xs uppercase tracking-widest"><Clock size={12}/> {item.read_time || '5 MIN'}</span>
                                    <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors ${isLocked ? 'text-gray-600' : 'text-museum-gold group-hover:text-white'}`}>
                                        {isLocked ? 'Ontgrendel' : 'Lees Verder'} <ArrowRight size={14} />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        ) : (
            <div className="text-center py-20 text-gray-500 italic border border-white/5 rounded-2xl bg-white/5">
                Geen artikelen gevonden voor deze datum.
                <br/><span className="text-xs mt-2 block opacity-50">(Check of items op 'published' staan in de database)</span>
            </div>
        )}
      </div>
    </div>
  );
}
