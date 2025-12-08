import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { getDailyProgram } from '@/lib/data/day-program';
import DayCard from '@/components/tour/DayCard';

export const revalidate = 3600; // Cache 1 uur

export default async function DashboardPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // 1. Check User Premium Status
  const { data: { user } } = await supabase.auth.getUser();
  let isUserPremium = false;

  if (user) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('is_premium, premium_until')
      .eq('user_id', user.id)
      .single();
    
    // Simpele check: is_premium flag óf geldige datum
    if (profile?.is_premium) isUserPremium = true;
  }

  // 2. Haal Programma Data
  const { tour, game, focus } = await getDailyProgram();

  return (
    <main className="container mx-auto max-w-5xl px-4 py-8">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">MuseaThuis Vandaag</h1>
        <p className="mt-3 text-lg text-gray-600">Jouw dagelijkse dosis kunst en inspiratie.</p>
      </header>

      {/* Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        
        {/* TOUR CARD */}
        {tour ? (
          <DayCard 
            type="tour"
            title={tour.title}
            description={tour.intro}
            imageUrl={tour.hero_image_url}
            href={`/tour/${tour.id}`}
            isPremium={tour.is_premium}
            isLocked={tour.is_premium && !isUserPremium}
          />
        ) : (
          <div className="rounded-xl border border-dashed p-10 text-center text-gray-400">Geen tour vandaag</div>
        )}

        {/* GAME CARD */}
        {game ? (
          <DayCard 
            type="game"
            title={game.title}
            description={game.short_description}
            href={`/game/${game.id}`}
            isPremium={game.is_premium}
            isLocked={game.is_premium && !isUserPremium}
          />
        ) : (
          <div className="rounded-xl border border-dashed p-10 text-center text-gray-400">Geen game vandaag</div>
        )}

        {/* FOCUS CARD */}
        {focus ? (
          <DayCard 
            type="focus"
            title={focus.title}
            description={focus.intro}
            imageUrl={focus.artwork?.image_url}
            href={`/focus/${focus.id}`}
            isPremium={focus.is_premium}
            isLocked={focus.is_premium && !isUserPremium}
          />
        ) : (
          <div className="rounded-xl border border-dashed p-10 text-center text-gray-400">Geen focus item vandaag</div>
        )}

      </div>
    </main>
  );
}
