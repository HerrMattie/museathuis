import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { ArrowRight, Calendar } from 'lucide-react';
import DailyGrid from '@/components/home/DailyGrid';
import OnboardingCheck from '@/components/onboarding/OnboardingCheck';

// Zorgt dat de pagina altijd vers wordt opgebouwd (voor random items en dagprogramma)
export const revalidate = 0; 

export default async function Home() {
  const supabase = createClient(cookies());

  // 1. Haal dagprogramma op voor vandaag
  const today = new Date().toISOString().split('T')[0];
  const { data: dailyProgram } = await supabase
    .from('day_programs')
    .select('*')
    .eq('date', today)
    .single();

  // 2. Haal Site Content (Titels) op
  const { data: content } = await supabase
    .from('site_content')
    .select('*')
    .in('key', ['home_title', 'home_subtitle']);
  
  // Zet om naar een handig object: { home_title: "...", home_subtitle: "..." }
  const texts = content?.reduce((acc: any, item: any) => ({ ...acc, [item.key]: item.content }), {}) || {};

  // 3. Haal 3 willekeurige kunstwerken op voor de homepage blokken (sfeerplaatjes)
  const { data: randomArts } = await supabase
    .from('artworks')
    .select('image_url')
    .not('image_url', 'is', null) // Alleen items met een foto
    .limit(10);

  // Hussel ze en pak de eerste 3
  const shuffled = randomArts ? randomArts.sort(() => 0.5 - Math.random()) : [];
  const randomUrls = shuffled.slice(0, 3).map(a => a.image_url);

  // Veiligheid: Als er te weinig kunstwerken zijn, vul aan met placeholders
  while (randomUrls.length < 3) {
      randomUrls.push('https://images.unsplash.com/photo-1578320339910-410a3048c105'); 
  }

  return (
    <div className="min-h-screen bg-midnight-950 text-white">
      
      {/* ONBOARDING CHECK: Toont pop-up voor nieuwe gebruikers */}
      <OnboardingCheck />

      {/* HERO SECTIE */}
      <div className="relative pt-32 pb-48 px-6 overflow-hidden">
          {/* Sfeervolle achtergrond */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/40 via-midnight-950 to-midnight-950 z-0"></div>
          
          <div className="relative z-10 max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-6 backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <Calendar size={12} className="text-museum-gold"/>
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-300">
                      Dagprogramma • {new Date().toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </span>
              </div>

              <h1 className="text-5xl md:text-8xl font-serif font-black mb-6 text-white drop-shadow-2xl animate-in fade-in zoom-in duration-1000">
                  {texts.home_title || "Kunst Ontdekken"}
              </h1>
              
              <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed font-light animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                  {texts.home_subtitle || "Een prachtige collectie voor vandaag, speciaal voor jou geselecteerd."}
              </p>
          </div>
      </div>

      {/* DAILY GRID (Navigatie naar Tour/Game/Focus) */}
      <div className="-mt-32 relative z-20 pb-20">
          <DailyGrid items={dailyProgram?.items || {}} randomArtworks={randomUrls} />
      </div>

      {/* CALL TO ACTION (Onderaan) */}
      <div className="bg-museum-gold text-black py-16 px-6 relative overflow-hidden">
          <div className="max-w-4xl mx-auto text-center relative z-10">
              <h2 className="text-3xl font-serif font-bold mb-4">Word Lid van MuseaThuis</h2>
              <p className="text-lg mb-8 max-w-xl mx-auto opacity-80">
                  Krijg onbeperkt toegang tot alle audiotours, verdiepende artikelen en de volledige game-ervaring.
              </p>
              <Link href="/pricing" className="inline-flex items-center gap-2 bg-black text-white px-8 py-4 rounded-xl font-bold hover:bg-slate-800 transition-all hover:scale-105 shadow-xl">
                  Start Gratis Proefperiode <ArrowRight size={18}/>
              </Link>
          </div>
          {/* Decoratieve cirkels */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-black/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
      </div>

    </div>
  );
}
