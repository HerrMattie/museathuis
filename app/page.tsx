import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import Link from 'next/link';
import Image from 'next/image'; // Nodig voor de achtergrond
import { ArrowRight, Calendar } from 'lucide-react';
import DailyGrid from '@/components/home/DailyGrid';
import OnboardingCheck from '@/components/onboarding/OnboardingCheck';

export const revalidate = 0; 

export default async function Home() {
  const supabase = createClient(cookies());
  const today = new Date().toISOString().split('T')[0];

  // 1. DATA: Haal het dagprogramma op
  const { data: dailyProgram } = await supabase
    .from('dayprogram_schedule')
    .select('*')
    .eq('day_date', today)
    .single();

  // 2. DATA: Haal random artwork op voor de fallback/sfeer in de grid
  const { data: randomArts } = await supabase.rpc('get_random_artworks', { limit_count: 3 });
  const randomUrls = randomArts?.map((a: any) => a.image_url) || [];

  // 3. DATA: Content Titels
  const { data: content } = await supabase.from('site_content').select('*').in('key', ['home_title', 'home_subtitle']);
  const texts = content?.reduce((acc: any, item: any) => ({ ...acc, [item.key]: item.content }), {}) || {};

  return (
    <main className="relative min-h-screen bg-midnight-950 text-white">
      <OnboardingCheck />

      {/* --- ACHTERGROND LAAG (De sfeer) --- */}
      <div className="absolute inset-0 z-0 h-[80vh] overflow-hidden">
         {/* De Afbeelding */}
         <Image
            src="https://images.unsplash.com/photo-1566095843020-70796470556c?q=80&w=2000&auto=format&fit=crop"
            alt="Museum Background"
            fill
            className="object-cover"
            quality={85}
            priority
         />
         {/* De Fade naar de kleur van de grid (zodat het naadloos overloopt) */}
         <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-midnight-950/80 to-midnight-950" />
      </div>

      {/* --- CONTENT LAAG --- */}
      <div className="relative z-10">
          
          {/* HERO SECTIE */}
          <div className="pt-32 pb-24 px-6 text-center">
             <div className="max-w-4xl mx-auto">
                 {/* Datum Label */}
                 <div className="inline-flex items-center gap-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-full px-4 py-1.5 mb-6 shadow-lg">
                      <Calendar size={12} className="text-museum-gold"/>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-200">
                          {new Date().toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' })}
                      </span>
                 </div>
                 
                 {/* Titel */}
                 <h1 className="text-5xl md:text-8xl font-serif font-black mb-6 drop-shadow-2xl text-white">
                     {texts.home_title || "Kunst Ontdekken"}
                 </h1>
                 
                 {/* Subtitel */}
                 <p className="text-xl text-gray-200 max-w-2xl mx-auto mb-10 font-light drop-shadow-md">
                     {texts.home_subtitle || "Een prachtige collectie voor vandaag, speciaal voor jou geselecteerd."}
                 </p>
             </div>
          </div>

          {/* DAILY GRID - De content kaarten */}
          <div className="px-4 pb-20 max-w-7xl mx-auto">
              <DailyGrid 
                schedule={dailyProgram} 
                randomArtworks={randomUrls} 
              />
          </div>
          
          {/* CTA - Lidmaatschap */}
          <div className="relative z-20 bg-museum-gold text-black py-20 px-6 text-center">
              <div className="max-w-2xl mx-auto">
                  <h2 className="text-3xl font-serif font-bold mb-6">Nog geen lid?</h2>
                  <p className="mb-8 text-black/80 font-medium">Ontgrendel elke dag de volledige tour, alle games en de salon.</p>
                  <Link href="/pricing" className="inline-flex items-center gap-2 bg-black text-white px-8 py-4 rounded-xl font-bold hover:scale-105 transition-transform shadow-xl">
                      Start Gratis Proefperiode <ArrowRight size={18}/>
                  </Link>
              </div>
          </div>
      </div>
    </main>
  );
}
