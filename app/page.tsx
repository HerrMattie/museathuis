import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import Link from 'next/link';
// We gebruiken weer gewone HTML img om next.config gedoe te vermijden
import { ArrowRight, Calendar } from 'lucide-react';
import DailyGrid from '@/components/home/DailyGrid';
import OnboardingCheck from '@/components/onboarding/OnboardingCheck';

export const revalidate = 0; 

export default async function Home() {
  const supabase = createClient(cookies());
  const today = new Date().toISOString().split('T')[0];

  // 1. DATA
  const { data: dailyProgram } = await supabase
    .from('dayprogram_schedule')
    .select('*')
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
         
         {/* NIEUWE BRON: Wikimedia Commons (Rijksmuseum Eregalerij) - Werkt altijd */}
         <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Rijksmuseum_honor_gallery.jpg/1920px-Rijksmuseum_honor_gallery.jpg"
            alt="Rijksmuseum Hall"
            className="absolute inset-0 w-full h-full object-cover"
         />
         
         {/* De Fade overlay */}
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
              <DailyGrid 
                schedule={dailyProgram} 
                randomArtworks={randomUrls} 
              />
          </div>
          
          {/* CTA */}
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
