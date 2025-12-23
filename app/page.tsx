import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import Image from 'next/image';
import { Calendar } from 'lucide-react';
import DailyGrid from '@/components/home/DailyGrid';
import OnboardingCheck from '@/components/onboarding/OnboardingCheck';

export const revalidate = 0; 

export default async function Home() {
  const supabase = createClient(cookies());
  const today = new Date().toISOString().split('T')[0];

  // 1. DATA (AANGEPAST VOOR KUNST DNA 🧬)
  // We halen niet alleen het rooster op, maar ook de details van de kunstwerken.
  // Dit is nodig zodat de FavoriteButton straks weet wat de stijl/jaar/etc is.
  const { data: dailyProgram } = await supabase
    .from('dayprogram_schedule')
    .select(`
        *,
        // Hier halen we de gekoppelde kunstwerken op.
        // Pas de naam 'artworks' aan als je foreign key anders heet (bijv. artwork_id)
        highlight_work:artworks!highlight_id (*),
        morning_work:artworks!morning_id (*),
        afternoon_work:artworks!afternoon_id (*),
        evening_work:artworks!evening_id (*)
    `)
    .eq('day_date', today)
    .single();

  // 2. RANDOM ART
  const { data: randomArts } = await supabase.rpc('get_random_artworks', { limit_count: 3 });
  const randomUrls = randomArts?.map((a: any) => a.image_url) || [];

  // 3. CONTENT
  const { data: content } = await supabase.from('site_content').select('*').in('key', ['home_title', 'home_subtitle']);
  const texts = content?.reduce((acc: any, item: any) => ({ ...acc, [item.key]: item.content }), {}) || {};

  return (
    <main className="relative min-h-screen bg-midnight-950 text-white">
      <OnboardingCheck />

      {/* --- ACHTERGROND LAAG --- */}
      <div className="absolute inset-0 z-0 h-[85vh] overflow-hidden">
          <Image
            src="/hero-background.jpg" 
            alt="Museum Hall"
            fill={true}
            priority={true}
            className="object-cover"
            quality={90}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-midnight-950/70 to-midnight-950" />
      </div>

      {/* --- CONTENT LAAG --- */}
      <div className="relative z-10">
          
          {/* HERO SECTIE */}
          <div className="pt-32 pb-24 px-6 text-center">
             <div className="max-w-4xl mx-auto">
                 <div className="inline-flex items-center gap-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-full px-4 py-1.5 mb-6 shadow-lg animate-in fade-in slide-in-from-top-4 duration-700">
                      <Calendar size={12} className="text-museum-gold"/>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-200">
                          {new Date().toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' })}
                      </span>
                 </div>
                 
                 <h1 className="text-5xl md:text-8xl font-serif font-black mb-6 drop-shadow-2xl text-white animate-in zoom-in-95 duration-700">
                     {texts.home_title || "Kunst Ontdekken"}
                 </h1>
                 
                 <p className="text-xl text-gray-200 max-w-2xl mx-auto mb-10 font-light drop-shadow-md animate-in fade-in duration-1000 delay-200">
                     {texts.home_subtitle || "Een prachtige collectie voor vandaag, speciaal voor jou geselecteerd."}
                 </p>
             </div>
          </div>

          {/* DAILY GRID */}
          <div className="px-4 pb-20 max-w-7xl mx-auto animate-in slide-in-from-bottom-8 duration-700 delay-300">
              {/* We geven nu het 'verrijkte' dailyProgram door aan de grid.
                  Zorg dat je in DailyGrid.tsx de <FavoriteButton artwork={item} /> gebruikt!
              */}
              <DailyGrid 
                schedule={dailyProgram} 
                randomArtworks={randomUrls} 
              />
          </div>
          
      </div>
    </main>
  );
}
