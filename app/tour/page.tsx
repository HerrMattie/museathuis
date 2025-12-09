import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import Link from 'next/link';
import Image from 'next/image';
import { Lock, Play, ChevronRight, Calendar } from 'lucide-react';

export const revalidate = 60;

export default async function TourOverviewPage({ searchParams }: { searchParams: { date?: string } }) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  let isUserPremium = false;
  if (user) {
    const { data: profile } = await supabase.from('user_profiles').select('is_premium').eq('user_id', user.id).single();
    if (profile?.is_premium) isUserPremium = true;
  }

  // Bepaal of we een specifieke dag moeten tonen (Time Travel modus)
  const dateParam = searchParams.date;
  
  let tours: any[] = [];
  let headerText = "Alle Tours";

  if (dateParam) {
    // SCENARIO 1: TIJDREIS MODUS
    const { data: schedule } = await supabase
      .from('dayprogram_schedule')
      .select('tour_id')
      .eq('day_date', dateParam)
      .single();

    if (schedule?.tour_id) {
        // Haal de geschedulede tour op
        const { data } = await supabase.from('tours').select('*').eq('id', schedule.tour_id);
        if (data) tours = data;
    }
    headerText = `Tour van ${new Date(dateParam).toLocaleDateString('nl-NL')}`;

  } else {
    // SCENARIO 2: STANDAARD MODUS (Archief)
    const { data } = await supabase
      .from('tours')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(12);
    tours = data || [];
  }

  return (
    <main className="min-h-screen bg-midnight-950 pb-20 pt-12 animate-fade-in-up">
      <div className="container mx-auto px-6">
        
        <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-white mb-8 transition-colors text-sm font-medium">
          <ChevronRight className="rotate-180" size={16} /> Terug naar Dashboard
        </Link>

        {/* HEADER */}
        <header className="mb-12 max-w-4xl">
          <p className="text-museum-gold text-xs font-bold uppercase tracking-[0.2em] mb-4">
            {dateParam ? 'Dagelijks Archief' : 'De Bibliotheek'}
          </p>
          <h1 className="font-serif text-5xl md:text-6xl text-white font-bold mb-6">{headerText}</h1>
          <p className="text-xl text-gray-400 leading-relaxed max-w-3xl">
            {dateParam ? 'Dit was de selectie op die datum.' : 'Blader door al onze audiotours.'}
          </p>
        </header>

        {/* TOURS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {tours.map((tour) => {
            const isLocked = tour.is_premium && !isUserPremium;

            return (
              <Link 
                key={tour.id} 
                href={isLocked ? '/pricing' : `/tour/${tour.id}`}
                className={`group relative flex flex-col bg-midnight-900 border rounded-2xl overflow-hidden transition-all hover:-translate-y-1 hover:shadow-2xl ${isLocked ? 'border-museum-gold/30' : 'border-white/10 hover:border-white/30'}`}
              >
                {/* Image */}
                <div className="relative h-48 w-full overflow-hidden">
                  {tour.hero_image_url && (
                    <Image 
                      src={tour.hero_image_url} 
                      alt={tour.title} 
                      fill 
                      className={`object-cover transition-transform duration-700 group-hover:scale-105 ${isLocked ? 'grayscale opacity-60' : ''}`}
                    />
                  )}
                  
                  {/* Badge */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    {tour.is_premium ? (
                      <span className="flex items-center gap-1.5 bg-museum-gold text-black px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                        <Lock size={12} /> PREMIUM
                      </span>
                    ) : (
                      <span className="bg-museum-lime text-black px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                        GRATIS
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-serif text-2xl text-white font-bold mb-2 group-hover:text-museum-gold transition-colors line-clamp-2">
                    {tour.title}
                  </h3>
                  <p className="text-gray-400 text-sm line-clamp-3 mb-4 flex-1">
                    {tour.intro}
                  </p>

                  <div className="mt-auto">
                    {isLocked ? (
                      <div className="w-full py-3 text-center rounded-lg border border-museum-gold text-museum-gold font-bold text-sm uppercase tracking-wider hover:bg-museum-gold hover:text-black transition-all">
                        Ontgrendel
                      </div>
                    ) : (
                      <div className="w-full py-3 text-center rounded-lg bg-white/5 border border-white/10 text-white font-bold text-sm uppercase tracking-wider group-hover:bg-white group-hover:text-black transition-all flex items-center justify-center gap-2">
                        <Play size={16} /> Start Tour
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
          
          {tours.length === 0 && (
             <div className="col-span-full py-10 text-center text-gray-500">
                Er zijn geen tours gevonden voor deze datum.
             </div>
          )}

        </div>
      </div>
    </main>
  );
}
