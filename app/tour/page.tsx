import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import Link from 'next/link';
import Image from 'next/image';
import { Lock, Play, ChevronRight, Headphones, Clock } from 'lucide-react';
import TimeTravelControls from '@/components/dashboard/TimeTravelControls'; // Hergebruik!

export const revalidate = 0; // Altijd vers voor de tijdreis

export default async function TourLandingPage({ searchParams }: { searchParams: { date?: string } }) {
  const supabase = createClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();

  // 1. Level Check voor Premium/Slotjes
  let userLevel = 1;
  let isUserPremium = false;
  if (user) {
    const { data: profile } = await supabase.from('user_profiles').select('level, is_premium').eq('user_id', user.id).single();
    if (profile) {
        userLevel = profile.level;
        isUserPremium = profile.is_premium;
    }
  }

  // 2. Datum Bepaling (Vandaag of Tijdreis)
  const today = new Date().toISOString().split('T')[0];
  const dateParam = searchParams.date || today;
  const isToday = dateParam === today;

  // 3. Haal de 3 Tours van deze datum op
  let dailyTours: any[] = [];
  
  const { data: schedule } = await supabase
    .from('dayprogram_schedule')
    .select('tour_ids') // <--- LET OP: Meervoud!
    .eq('day_date', dateParam)
    .single();

  if (schedule?.tour_ids && schedule.tour_ids.length > 0) {
      const { data } = await supabase
        .from('tours')
        .select('*')
        .in('id', schedule.tour_ids)
        .order('is_premium', { ascending: true }); // Gratis eerst
      
      if (data) dailyTours = data;
  }

  // Fallback: Als er geen rooster is (bijv in verre verleden), toon niks of een placeholder
  
  return (
    <main className="min-h-screen bg-midnight-950 pb-20 pt-12 animate-fade-in-up">
      <div className="container mx-auto px-6">
        
        <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-white mb-8 transition-colors text-sm font-medium">
          <ChevronRight className="rotate-180" size={16} /> Terug naar Dashboard
        </Link>

        {/* TIME TRAVEL CONTROLS (Hierdoor kan Level 10+ terugbladeren) */}
        <div className="mb-8">
            <TimeTravelControls currentDate={dateParam} userLevel={userLevel} />
        </div>

        {/* HERO HEADER: Wat is dit voor pagina? */}
        <header className="mb-16 max-w-4xl border-b border-white/10 pb-10">
          <div className="flex items-center gap-3 text-museum-gold text-xs font-bold uppercase tracking-[0.2em] mb-4">
             <Headphones size={18} /> Audiotours
          </div>
          <h1 className="font-serif text-5xl md:text-6xl text-white font-bold mb-6">
            {isToday ? 'Het Programma van Vandaag' : `Het Programma van ${new Date(dateParam).toLocaleDateString('nl-NL')}`}
          </h1>
          <p className="text-xl text-gray-300 leading-relaxed max-w-2xl">
            Laat u meevoeren door onze curatoren. Elke dag selecteren wij drie unieke verhalen. 
            Zet uw koptelefoon op en sluit u af van de wereld.
          </p>
        </header>

        {/* DE 3 DAGELIJKSE OPTIES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {dailyTours.map((tour, index) => {
            const isLocked = tour.is_premium && !isUserPremium;
            
            // Eerste kaart is vaak groter of uitgelicht in design, maar hier houden we ze gelijk
            // index 0 = Gratis, index 1 & 2 = Premium

            return (
              <Link 
                key={tour.id} 
                href={isLocked ? '/pricing' : `/tour/${tour.id}`}
                className={`group flex flex-col h-full bg-midnight-900 border rounded-2xl overflow-hidden transition-all hover:-translate-y-2 hover:shadow-2xl ${isLocked ? 'border-museum-gold/30 opacity-90' : 'border-white/10 hover:border-white/30'}`}
              >
                {/* Image Area */}
                <div className="relative h-64 w-full overflow-hidden">
                  {tour.hero_image_url && (
                    <Image 
                      src={tour.hero_image_url} 
                      alt={tour.title} 
                      fill 
                      className={`object-cover transition-transform duration-700 group-hover:scale-105 ${isLocked ? 'grayscale' : ''}`}
                    />
                  )}
                  
                  {/* Status Badge */}
                  <div className="absolute top-4 left-4">
                     {isLocked ? (
                        <span className="flex items-center gap-1 bg-black/80 text-museum-gold px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md border border-museum-gold/20">
                           <Lock size={12} /> PREMIUM
                        </span>
                     ) : (
                        <span className="bg-museum-lime text-black px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                           VRIJ TOEGANKELIJK
                        </span>
                     )}
                  </div>
                </div>

                {/* Content Area */}
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-3 font-bold uppercase tracking-wider">
                     <Clock size={14} /> 15 Minuten
                  </div>
                  
                  <h3 className="font-serif text-2xl text-white font-bold mb-3 group-hover:text-museum-gold transition-colors leading-tight">
                    {tour.title}
                  </h3>
                  
                  <p className="text-gray-400 text-sm line-clamp-3 mb-6 flex-1 leading-relaxed">
                    {tour.intro}
                  </p>

                  <div className="pt-6 border-t border-white/5">
                     {isLocked ? (
                        <div className="flex items-center justify-center gap-2 w-full py-3 rounded-lg border border-museum-gold text-museum-gold font-bold text-sm uppercase tracking-wider hover:bg-museum-gold hover:text-black transition-all">
                           Ontgrendel
                        </div>
                     ) : (
                        <div className="flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-white text-black font-bold text-sm uppercase tracking-wider group-hover:bg-museum-lime transition-all">
                           <Play size={16} fill="black" /> Start Nu
                        </div>
                     )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* EMPTY STATE */}
        {dailyTours.length === 0 && (
          <div className="py-20 text-center bg-white/5 rounded-3xl border border-white/10">
            <h3 className="text-2xl text-white font-serif mb-2">Het archief is stil.</h3>
            <p className="text-gray-400">Er zijn geen tours gevonden voor deze datum ({dateParam}).</p>
            {!isToday && (
               <Link href="/tour" className="inline-block mt-4 text-museum-gold underline">Terug naar vandaag</Link>
            )}
          </div>
        )}

      </div>
    </main>
  );
}
