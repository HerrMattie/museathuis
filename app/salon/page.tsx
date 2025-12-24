import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Coffee, ArrowRight, Lock, Crown, Calendar } from 'lucide-react';
import DateNavigator from '@/components/ui/DateNavigator';
import { getLevel } from '@/lib/levelSystem';
import { getHistoryAccess } from '@/lib/accessControl';

export const revalidate = 0;

export default async function SalonPage({ searchParams }: { searchParams: { date?: string } }) {
  const supabase = createClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();

  // 1. DATUM LOGICA
  const todayDate = new Date();
  const todayStr = todayDate.toISOString().split('T')[0];
  const selectedDate = searchParams.date || todayStr;

  const currentObj = new Date(selectedDate);
  const day = currentObj.getDay(); 
  const diff = currentObj.getDate() - day + (day === 0 ? -6 : 1);
  const mondayDate = new Date(currentObj.setDate(diff)).toISOString().split('T')[0];

  // 2. HAAL ROOSTERS OP
  const { data: schedules } = await supabase
      .from('dayprogram_schedule')
      .select('salon_ids, day_date')
      .in('day_date', [selectedDate, mondayDate]);

  const todaySchedule = schedules?.find(s => s.day_date === selectedDate);
  const mondaySchedule = schedules?.find(s => s.day_date === mondayDate);

  let activeSalonIds = todaySchedule?.salon_ids;
  if (!activeSalonIds || activeSalonIds.length === 0) {
      activeSalonIds = mondaySchedule?.salon_ids || [];
  }

  // 3. DATA OPHALEN
  let salonItems: any[] = [];
  if (activeSalonIds.length > 0) {
      const { data } = await supabase
          .from('salons')
          .select('*')
          .in('id', activeSalonIds)
          .eq('status', 'published');
      
      if (data) salonItems = data;
  }

  // 4. CONTENT & LEVEL
  const { count: actionCount } = await supabase.from('user_activity_logs').select('*', { count: 'exact', head: true }).eq('user_id', user?.id);
  const { count: favCount } = await supabase.from('favorites').select('*', { count: 'exact', head: true }).eq('user_id', user?.id);
  const xp = ((actionCount || 0) * 15) + ((favCount || 0) * 50);
  const { level } = getLevel(xp);
  const access = getHistoryAccess(level);

  const { data: content } = await supabase.from('site_content').select('*').in('key', ['salon_title', 'salon_subtitle']);
  const texts = content?.reduce((acc: any, item: any) => ({ ...acc, [item.key]: item.content }), {}) || {};

  return (
    <div className="min-h-screen bg-midnight-950 text-white pt-24 px-6 pb-20">
      
      {/* HEADER */}
      <div className="max-w-4xl mx-auto text-center flex flex-col items-center mb-16">
          <div className="flex items-center gap-2 text-museum-gold text-xs font-bold tracking-widest uppercase mb-4 animate-in fade-in slide-in-from-bottom-4">
              <Coffee size={16} /> De Salon
          </div>
          
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6">
            {texts.salon_title || "Het Gesprek"}
          </h1>
          
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl leading-relaxed mb-8">
            {texts.salon_subtitle || "Het thema van deze week. Praat mee, deel je mening en ontmoet anderen."}
          </p>
          
          <div className="flex justify-center">
             <DateNavigator basePath="/salon" currentDate={selectedDate} maxBack={access.days} mode="day" />
          </div>
      </div>

      {/* CONTENT GRID (Nu in Tour-stijl!) */}
      <div className="max-w-7xl mx-auto relative z-20">
        {salonItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {salonItems.map((item) => {
                    const isPremium = item.is_premium;
                    const isLocked = isPremium && !user;

                    // Afbeelding logic
                    let imgUrl = item.image_url;
                    if (imgUrl && imgUrl.includes('images.unsplash.com')) {
                        imgUrl = `${imgUrl.split('?')[0]}?w=600&q=60&fm=webp&fit=crop`;
                    }

                    return (
                        <Link key={item.id} href={isLocked ? '/pricing' : `/salon/${item.id}`} className="group bg-midnight-900 border border-white/10 rounded-2xl overflow-hidden hover:border-museum-gold/40 transition-all hover:-translate-y-2 hover:shadow-2xl flex flex-col h-full">
                            
                            {/* AFBEELDING */}
                            <div className="h-64 relative overflow-hidden bg-black group-hover:opacity-90 transition-opacity">
                                {imgUrl ? (
                                    <img 
                                        src={imgUrl} 
                                        alt={item.title} 
                                        className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${isLocked ? 'grayscale opacity-60' : ''}`} 
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-white/5"><Coffee size={48} className="opacity-20"/></div>
                                )}
                                
                                <div className="absolute inset-0 bg-gradient-to-t from-midnight-900 via-transparent to-transparent opacity-60"></div>

                                {/* Label */}
                                <div className="absolute top-4 left-4 z-10">
                                    {isPremium ? (
                                        <span className="flex items-center gap-1.5 bg-black/90 backdrop-blur-md text-museum-gold text-[10px] font-bold px-2.5 py-1 rounded border border-museum-gold/30 uppercase tracking-wider shadow-lg">
                                            {isLocked ? <Lock size={10} /> : <Crown size={10} />}
                                            <span>Mecenas</span>
                                        </span>
                                    ) : (
                                        <span className="bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded border border-emerald-400/30 uppercase tracking-wider shadow-lg">
                                            Gratis
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* CONTENT */}
                            <div className="p-8 flex-1 flex flex-col">
                                <div className="flex items-center gap-2 text-museum-gold text-[10px] font-bold uppercase tracking-widest mb-3">
                                    <Calendar size={12} /> Week Thema
                                </div>

                                <h3 className="font-serif font-bold text-2xl mb-3 text-white group-hover:text-museum-gold transition-colors line-clamp-2">
                                    {item.title}
                                </h3>
                                
                                <p className="text-gray-400 text-sm leading-relaxed mb-6 line-clamp-3 flex-1">
                                    {item.description}
                                </p>
                                
                                <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center text-sm text-gray-500">
                                    <span className="flex items-center gap-2 text-xs uppercase tracking-widest">
                                        <Coffee size={12}/> Salon
                                    </span>
                                    <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors ${isLocked ? 'text-gray-600' : 'text-museum-gold group-hover:text-white'}`}>
                                        {isLocked ? 'Ontgrendel' : 'Open Salon'} <ArrowRight size={14} />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        ) : (
            <div className="text-center py-20 bg-white/5 rounded-2xl border border-dashed border-white/10 text-gray-400">
                <Coffee size={48} className="mx-auto text-gray-600 mb-4"/>
                <h3 className="text-xl font-bold text-gray-400 mb-2">De Salon is gesloten</h3>
                <p className="text-gray-500">Er is deze week geen thema geselecteerd.</p>
            </div>
        )}
      </div>
    </div>
  );
}
