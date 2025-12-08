// app/page.tsx
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { getDailyProgram } from '@/lib/data/day-program';
import TourCard from '@/components/dashboard/TourCard';

export const revalidate = 3600; // Cache deze pagina voor 1 uur (performance!)

export default async function DashboardPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // 1. Haal user info op (voor premium check)
  const { data: { user } } = await supabase.auth.getUser();
  let isPremium = false;

  if (user) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('is_premium, premium_until')
      .eq('user_id', user.id)
      .single();
    
    // Check of premium actief is (datum in toekomst)
    if (profile?.is_premium) {
       // Hier kun je evt. ook checken of premium_until > now() is
       isPremium = true; 
    }
  }

  // 2. Haal programma op
  const { tour } = await getDailyProgram();

  return (
    <main className="container mx-auto max-w-5xl px-4 py-8">
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-extrabold text-gray-900">MuseaThuis Vandaag</h1>
        <p className="mt-2 text-gray-600">Jouw dagelijkse dosis kunst en inspiratie.</p>
      </header>

      {/* Grid voor de dagkaarten */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Tour Kaart */}
        <TourCard tour={tour} isUserPremium={isPremium} />

        {/* Placeholder voor Game (komen we later aan toe) */}
        <div className="flex h-full min-h-[300px] items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50">
          <span className="text-gray-400">Game van de dag</span>
        </div>

        {/* Placeholder voor Focus */}
        <div className="flex h-full min-h-[300px] items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50">
          <span className="text-gray-400">Focus kunstwerk</span>
        </div>
      </div>
    </main>
  );
}
