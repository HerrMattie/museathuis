import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, Lock, Clock, BookOpen, ChevronRight } from 'lucide-react';
import { notFound } from 'next/navigation';

export const revalidate = 60;

export default async function FocusOverviewPage({ searchParams }: { searchParams: { date?: string } }) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  let isUserPremium = false;
  if (user) {
    const { data: profile } = await supabase.from('user_profiles').select('is_premium').eq('user_id', user.id).single();
    if (profile?.is_premium) isUserPremium = true;
  }

  const dateParam = searchParams.date;
  let focusItems: any[] = [];
  let headerText = "Alle Deep Dives";

  if (dateParam) {
    // SCENARIO 1: TIJDREIS MODUS (Toon alle 3 de scheduled Focus items)
    const { data: schedule } = await supabase
      .from('dayprogram_schedule')
      .select('focus_ids')
      .eq('day_date', dateParam)
      .single();

    if (schedule?.focus_ids && schedule.focus_ids.length > 0) {
        // Haal alle Focus items op die in de array van die dag staan
        const { data } = await supabase
          .from('focus_items')
          .select('*, artwork:artworks(image_url, artist)')
          .in('id', schedule.focus_ids);
        if (data) focusItems = data;
    }
    headerText = `Focus Selectie van ${new Date(dateParam).toLocaleDateString('nl-NL')}`;

  } else {
    // SCENARIO 2: STANDAARD MODUS (Archief)
    const { data } = await supabase
      .from('focus_items')
      .select('*, artwork:artworks(image_url, artist)')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(12);
    focusItems = data || [];
  }

  return (
    <main className="min-h-screen bg-midnight-950 pb-20 pt-12 animate-fade-in-up">
      <div className="container mx-auto px-6">
        
        <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-white mb-8 transition-colors text-sm font-medium">
          <ChevronRight className="rotate-180" size={16} /> Terug naar Dashboard
        </Link>

        <header className="mb-12 max-w-4xl">
          <p className="text-museum-gold text-xs font-bold uppercase tracking-[0.2em] mb-4">
            {dateParam ? 'Dagelijks Archief' : 'Verdieping & Context'}
          </p>
          <h1 className="font-serif text-5xl md:text-6xl text-white font-bold mb-6">{headerText}</h1>
          <p className="text-xl text-gray-400 leading-relaxed max-w-3xl">
            {dateParam ? 'Dit was de volledige selectie voor deze datum.' : 'Duik in de diepte van de kunsthistorie.'}
          </p>
        </header>

        {/* FOCUS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {focusItems.map((item) => {
            const isLocked = item.is_premium && !isUserPremium;

            return (
              <Link 
                key={item.id} 
                href={isLocked ? '/pricing' : `/focus/${item.id}`}
                className={`group relative flex flex-col bg-midnight-900 border rounded-2xl overflow-hidden transition-all hover:-translate-y-1 hover:shadow-2xl ${isLocked ? 'border-museum-gold/30' : 'border-white/10 hover:border-white/30'}`}
              >
                {/* Image */}
                <div className="relative h-64 w-full overflow-hidden">
                  {item.artwork?.image_url && (
                    <Image 
                      src={item.artwork.image_url} 
                      alt={item.title} 
                      fill 
                      className={`object-cover transition-transform duration-700 group-hover:scale-105 ${isLocked ? 'grayscale opacity-60' : ''}`}
                    />
                  )}
                  
                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    {item.is_premium ? (
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
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-2 uppercase tracking-wider font-bold">
                    <Clock size={14} /> 10 Minuten
                  </div>
                  <h3 className="font-serif text-2xl text-white font-bold mb-1 group-hover:text-museum-gold transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-400 line-clamp-3 mb-6 flex-1">
                    {item.intro}
                  </p>

                  <div className="mt-auto">
                    {/* CTA BUTTONS (Ongeveer 10 min leestijd) */}
                    <div className="w-full py-3 text-center rounded-lg bg-white/5 border border-white/10 text-white font-bold text-sm uppercase tracking-wider group-hover:bg-white group-hover:text-black transition-all flex items-center justify-center gap-2">
                      <BookOpen size={16} /> {isLocked ? 'Ontgrendel' : 'Lees Verder'}
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
          
          {focusItems.length === 0 && (
             <div className="col-span-full py-10 text-center text-gray-500">
                Er zijn geen focus items gevonden voor deze datum.
             </div>
          )}
        </div>
      </div>
    </main>
  );
}
