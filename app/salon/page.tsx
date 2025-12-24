import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Coffee, Clock, ArrowRight, Lock, Crown } from 'lucide-react';
import DateNavigator from '@/components/ui/DateNavigator';
import { getLevel } from '@/lib/levelSystem';
import { getHistoryAccess } from '@/lib/accessControl';
import FavoriteButton from '@/components/artwork/FavoriteButton';

export const revalidate = 0;

export default async function SalonPage({ searchParams }: { searchParams: { date?: string } }) {
  const supabase = createClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();

  // 1. DATUM LOGICA
  const todayDate = new Date();
  const todayStr = todayDate.toISOString().split('T')[0];
  const selectedDate = searchParams.date || todayStr;

  // Bereken de datum van de afgelopen maandag (t.o.v. de geselecteerde datum)
  const currentObj = new Date(selectedDate);
  const day = currentObj.getDay(); // 0=Zon, 1=Maa
  const diff = currentObj.getDate() - day + (day === 0 ? -6 : 1);
  const mondayDate = new Date(currentObj.setDate(diff)).toISOString().split('T')[0];

  // 2. HAAL ROOSTERS OP
  const { data: schedules } = await supabase
      .from('dayprogram_schedule')
      .select('salon_ids, day_date')
      .in('day_date', [selectedDate, mondayDate]);

  const todaySchedule = schedules?.find(s => s.day_date === selectedDate);
  const mondaySchedule = schedules?.find(s => s.day_date === mondayDate);

  // BEPAAL WELKE SALON WE TONEN
  let activeSalonIds = todaySchedule?.salon_ids;
  
  // Fallback naar maandag als vandaag leeg is
  if (!activeSalonIds || activeSalonIds.length === 0) {
      activeSalonIds = mondaySchedule?.salon_ids || [];
  }

  // 3. HAAL DE INHOUD OP (SALONS)
  let salonItems: any[] = [];
  if (activeSalonIds.length > 0) {
      // FIX: We zoeken nu in de juiste tabel 'salons'
      const { data } = await supabase
          .from('salons') 
          .select(`*`) // Haal salon info op
          .in('id', activeSalonIds)
          .eq('status', 'published');
      
      if (data) salonItems = data;
  }

  // 4. LEVEL CHECK & CONTENT (CRM Teksten)
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

      {/* CONTENT GRID */}
      <div className="max-w-5xl mx-auto relative z-20">
        {salonItems.length > 0 ? (
            <div className="grid grid-cols-1 gap-12">
                {salonItems.map((item) => {
                    const isPremium = item.is_premium;
                    const isLocked = isPremium && !user;

                    // Afbeelding logic
                    let imgUrl = item.image_url; // Salons hebben direct een image_url kolom
                    if (imgUrl && imgUrl.includes('images.unsplash.com')) {
                        imgUrl = `${imgUrl.split('?')[0]}?w=800&q=70&fm=webp&fit=crop`;
                    }

                    return (
                        <div key={item.id} className="group bg-midnight-900 border border-white/10 rounded-3xl overflow-hidden hover:border-museum-gold/30 transition-all shadow-2xl">
                            
                            {/* GROTE AFBEELDING */}
                            <div className="h-64 md:h-96 relative overflow-hidden bg-black">
                                {imgUrl ? (
                                    <img 
                                        src={imgUrl} 
                                        alt={item.title} 
                                        className={`w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 ${isLocked ? 'grayscale opacity-50' : ''}`} 
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-white/5"><Coffee size={64} className="opacity-20"/></div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-midnight-900 via-transparent to-transparent"></div>

                                {/* Premium Label */}
                                {isPremium && (
                                    <div className="absolute top-6 left-6 z-10">
                                        <span className="flex items-center gap-1.5 bg-black/90 backdrop-blur-md text-museum-gold text-xs font-bold px-3 py-1.5 rounded-lg border border-museum-gold/30 uppercase tracking-wider shadow-lg">
                                            {isLocked ? <Lock size={12} /> : <Crown size={12} />}
                                            <span>Mecenas Only</span>
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* TEKST & ACTIE */}
                            <div className="p-8 md:p-12 relative -mt-20">
                                <div className="bg-midnight-900/90 backdrop-blur-xl p-8 rounded-2xl border border-white/5 shadow-xl">
                                    <div className="flex flex-col md:flex-row gap-6 md:items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 text-museum-gold text-xs font-bold uppercase tracking-widest mb-3">
                                                <span>Week Thema</span>
                                                <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                                                <span className="flex items-center gap-1"><Clock size={12}/> {new Date(mondayDate).toLocaleDateString('nl-NL', {day: 'numeric', month: 'long'})} - {new Date(mondayDate).getDate()+6}</span>
                                            </div>
                                            
                                            <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4 leading-tight">
                                                {item.title}
                                            </h2>
                                            
                                            <div className="prose prose-invert text-gray-400 mb-6 line-clamp-3">
                                                {item.description}
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <Link 
                                                    href={isLocked ? '/pricing' : `/salon/${item.id}`} 
                                                    className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-colors ${isLocked ? 'bg-white/10 text-gray-400' : 'bg-museum-gold text-black hover:bg-white'}`}
                                                >
                                                    {isLocked ? 'Word Lid om te Lezen' : 'Lees & Praat Mee'} <ArrowRight size={16}/>
                                                </Link>
                                            </div>
                                        </div>

                                        {/* STATS */}
                                        <div className="hidden md:flex flex-col gap-4 min-w-[150px] border-l border-white/10 pl-8">
                                            <div>
                                                <span className="block text-2xl font-bold text-white">24</span>
                                                <span className="text-xs text-gray-500 uppercase tracking-wider">Reacties</span>
                                            </div>
                                            <div>
                                                <span className="block text-2xl font-bold text-white">128</span>
                                                <span className="text-xs text-gray-500 uppercase tracking-wider">Deelnemers</span>
                                            </div>
                                            <div className="pt-4 mt-auto">
                                                <div className="flex -space-x-3">
                                                    {[1,2,3,4].map(i => (
                                                        <div key={i} className="w-8 h-8 rounded-full bg-white/10 border-2 border-midnight-900"></div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    );
                })}
            </div>
        ) : (
            <div className="text-center py-24 bg-white/5 rounded-3xl border border-dashed border-white/10">
                <Coffee size={48} className="mx-auto text-gray-600 mb-4"/>
                <h3 className="text-xl font-bold text-gray-400 mb-2">De Salon is gesloten</h3>
                <p className="text-gray-500">Er is deze week geen thema geselecteerd.</p>
            </div>
        )}
      </div>
    </div>
  );
}
