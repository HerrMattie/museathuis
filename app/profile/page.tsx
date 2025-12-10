import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { LogOut, LayoutDashboard, Heart } from 'lucide-react';
import LevelCard from '@/components/profile/LevelCard';
import BadgeGrid from '@/components/profile/BadgeGrid';
import OnboardingWizard from '@/components/profile/OnboardingWizard';

export const revalidate = 0;

export default async function ProfilePage() {
  const supabase = createClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // 1. Haal Profiel & Voorkeuren
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  // 2. Haal Statistieken (XP basis)
  // We tellen het aantal acties in de logs om je XP te bepalen
  const { count: actionCount } = await supabase
    .from('user_activity_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);
  
  const { count: favCount } = await supabase
    .from('favorites')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  // 3. Haal BADGES (Uit de database!)
  const { data: userBadges } = await supabase
    .from('user_badges') // Zorg dat deze tabel bestaat!
    .select('badge_id')
    .eq('user_id', user.id);

  // Maak een simpele array van ID's: ['early_bird', 'quiz_master']
  const earnedBadgeIds = userBadges?.map((b: any) => b.badge_id) || [];

  // Bereken XP (Simulatie: 1 actie = 15 XP, 1 like = 50 XP)
  // Later kun je dit opslaan in een 'xp' kolom in user_profiles
  const calculatedXp = ((actionCount || 0) * 15) + ((favCount || 0) * 50);

  const stats = {
      total_actions: actionCount || 0,
      fav_count: favCount || 0,
      current_xp: calculatedXp 
  };

  return (
    <div className="min-h-screen bg-midnight-950 text-white font-sans p-6 md:p-12 flex flex-col items-center">
      
      <div className="max-w-4xl w-full">
        
        {/* HEADER: GAMIFICATION CARD (Met levels 1-50 logica) */}
        {/* We geven de berekende XP direct mee in stats */}
        <LevelCard userProfile={profile} stats={stats} />

        {/* BADGE COLLECTIE */}
        <BadgeGrid earnedBadges={earnedBadgeIds} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LINKER KOLOM: MIJN GEGEVENS */}
            <div className="lg:col-span-2 space-y-8">
                {/* De Data Wizard (Interesses, etc) */}
                <OnboardingWizard profile={profile} user={user} isOnboardingPage={false} />
            </div>

            {/* RECHTER KOLOM: ACTIES */}
            <div className="space-y-6">
                
                {/* Favorieten Widget */}
                <div className="bg-midnight-900 border border-white/10 rounded-xl p-6">
                    <h3 className="font-bold mb-4 flex items-center gap-2"><Heart className="text-red-500" size={18}/> Collectie</h3>
                    <div className="text-center py-6 bg-black/20 rounded-lg">
                        <div className="text-3xl font-serif font-bold text-white mb-1">{favCount}</div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider">Items bewaard</div>
                    </div>
                    <Link href="/favorites" className="block mt-4 text-center text-sm text-museum-gold hover:underline">
                        Bekijk alles &rarr;
                    </Link>
                </div>

                {/* Admin Knop */}
                {profile?.is_admin && (
                    <Link href="/crm" className="flex items-center gap-3 p-4 rounded-xl bg-blue-900/20 border border-blue-500/30 text-blue-200 hover:bg-blue-900/40 transition-colors">
                        <div className="bg-blue-500 p-2 rounded-lg text-white"><LayoutDashboard size={18}/></div>
                        <div>
                            <div className="font-bold text-sm">CRM Dashboard</div>
                            <div className="text-xs opacity-70">Beheerders toegang</div>
                        </div>
                    </Link>
                )}

                {/* Uitloggen */}
                <form action="/auth/signout" method="post">
                    <button className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border border-white/5 hover:bg-red-900/20 hover:text-red-400 hover:border-red-900/30 transition-colors text-gray-400">
                        <LogOut size={18} /> Uitloggen
                    </button>
                </form>

            </div>
        </div>

      </div>
    </div>
  );
}
