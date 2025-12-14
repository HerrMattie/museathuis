import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { ArrowRight, Calendar } from 'lucide-react';
import DailyGrid from '@/components/home/DailyGrid';
import OnboardingCheck from '@/components/onboarding/OnboardingCheck';

export const revalidate = 0; 

export default async function Home() {
  const supabase = createClient(cookies());
  const today = new Date().toISOString().split('T')[0];

  // 1. FIX: Gebruik de JUISTE tabel (dayprogram_schedule)
  const { data: dailyProgram } = await supabase
    .from('dayprogram_schedule') // <--- DIT WAS DE FOUT
    .select('*')
    .eq('day_date', today) // Let op: kolom heet vaak 'day_date' in de nieuwe tabel
    .single();

  // Haal random artwork op voor de fallback/sfeer
  const { data: randomArts } = await supabase.rpc('get_random_artworks', { limit_count: 3 });
  const randomUrls = randomArts?.map((a: any) => a.image_url) || [];

  // Content Titels
  const { data: content } = await supabase.from('site_content').select('*').in('key', ['home_title', 'home_subtitle']);
  const texts = content?.reduce((acc: any, item: any) => ({ ...acc, [item.key]: item.content }), {}) || {};

  return (
    <div className="min-h-screen bg-midnight-950 text-white">
      <OnboardingCheck />
      
      {/* HERO */}
      <div className="relative pt-48 pb-48 px-6 overflow-hidden text-center">
         <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/40 via-midnight-950 to-midnight-950 z-0"></div>
         <div className="relative z-10 max-w-4xl mx-auto">
             <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-6">
                  <Calendar size={12} className="text-museum-gold"/>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-300">
                      Dagprogramma • {new Date().toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </span>
             </div>
             <h1 className="text-5xl md:text-8xl font-serif font-black mb-6 drop-shadow-2xl">
                 {texts.home_title || "Kunst Ontdekken"}
             </h1>
             <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 font-light">
                 {texts.home_subtitle || "Een prachtige collectie voor vandaag, speciaal voor jou geselecteerd."}
             </p>
         </div>
      </div>

      {/* DAILY GRID - Nu met juiste data */}
      <div className="-mt-32 relative z-20 pb-20 px-4">
          {/* We mappen de nieuwe datastructuur naar wat DailyGrid verwacht */}
          <DailyGrid 
            schedule={dailyProgram} 
            randomArtworks={randomUrls} 
          />
      </div>
      
      {/* CTA */}
      <div className="bg-museum-gold text-black py-16 px-6 text-center">
          <h2 className="text-3xl font-serif font-bold mb-4">Word Lid van MuseaThuis</h2>
          <Link href="/pricing" className="inline-flex items-center gap-2 bg-black text-white px-8 py-4 rounded-xl font-bold hover:scale-105 transition-transform">
              Start Gratis Proefperiode <ArrowRight size={18}/>
          </Link>
      </div>
    </div>
  );
}
