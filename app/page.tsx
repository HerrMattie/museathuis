import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import DailyHero from '@/components/home/DailyHero';
import DailyGrid from '@/components/home/DailyGrid';
import { getDailyProgram } from '@/lib/dailyService';
import Link from 'next/link';

export const revalidate = 0; // Zorg dat de homepage altijd vers is (elke refresh checkt date)

export default async function Home() {
  const supabase = createClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();

  // 1. Haal de gebruikersnaam op (voor begroeting)
  let userName = "Kunstliefhebber";
  if (user) {
    const { data: profile } = await supabase.from('user_profiles').select('display_name').eq('user_id', user.id).single();
    if (profile?.display_name) userName = profile.display_name;
  }

  // 2. Haal het programma van VANDAAG op
  const dailyProgram = await getDailyProgram(supabase);

  // Fallback als er ECHT niks is (DB leeg)
  if (!dailyProgram) {
    return (
        <div className="min-h-screen bg-midnight-950 flex items-center justify-center text-white">
            <div className="text-center">
                <h1 className="text-3xl font-bold mb-4">Welkom bij MuseaThuis</h1>
                <p className="text-gray-400 mb-8">Het museum wordt momenteel ingericht. Kom later terug.</p>
                {user?.email && <Link href="/crm" className="bg-museum-gold text-black px-4 py-2 rounded">Naar Admin</Link>}
            </div>
        </div>
    );
  }

  return (
    <main className="min-h-screen bg-midnight-950 text-white">
      
      {/* 1. HERO SECTION */}
      <DailyHero daily={dailyProgram} userName={userName} />

      {/* 2. CONTENT GRID (Zweeft deels over Hero heen) */}
      <DailyGrid items={dailyProgram.items} />

      {/* 3. CTA VOOR NIET-LEDEN */}
      {!user && (
          <div className="container mx-auto px-6 pb-20 text-center">
              <div className="bg-gradient-to-r from-museum-gold/10 to-transparent p-12 rounded-2xl border border-museum-gold/20">
                  <h2 className="text-3xl font-serif font-bold mb-4">Ontdek elke dag iets nieuws</h2>
                  <p className="text-gray-300 max-w-2xl mx-auto mb-8">
                      Word lid en krijg onbeperkt toegang tot alle audiotours, verdiepende artikelen en de historische archieven.
                  </p>
                  <Link href="/pricing" className="bg-museum-gold text-black px-8 py-3 rounded-full font-bold hover:bg-white transition-colors">
                      Start je lidmaatschap
                  </Link>
              </div>
          </div>
      )}

    </main>
  );
}
