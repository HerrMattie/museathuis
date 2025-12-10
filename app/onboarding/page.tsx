import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import OnboardingWizard from '@/components/profile/OnboardingWizard'; // We hergebruiken je component!
import { Sparkles } from 'lucide-react';

export const revalidate = 0;

export default async function OnboardingPage() {
  const supabase = createClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // Haal profiel op om te zien of het al ingevuld is
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  return (
    <div className="min-h-screen bg-midnight-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Decoratieve achtergrond */}
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1544531586-fde5298cdd40?q=80&w=2000&auto=format&fit=crop')] bg-cover opacity-10 blur-sm pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-midnight-950 via-midnight-950/90 to-transparent"></div>

      <div className="relative z-10 max-w-2xl w-full">
        <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-museum-gold text-black mb-4 shadow-[0_0_20px_rgba(234,179,8,0.3)]">
                <Sparkles size={32} />
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">Welkom bij MuseaThuis</h1>
            <p className="text-xl text-gray-300">
                Om uw ervaring persoonlijker te maken, leren we u graag wat beter kennen.
            </p>
        </div>

        {/* De Wizard Component die we al hadden! */}
        {/* We voegen een wrapper toe voor styling */}
        <div className="bg-black/40 backdrop-blur-md rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
            <div className="p-1">
                <OnboardingWizard profile={profile} user={user} isOnboardingPage={true} />
            </div>
        </div>

        <p className="text-center text-gray-500 text-sm mt-8">
            U kunt deze voorkeuren later altijd aanpassen in uw profiel.
        </p>
      </div>
    </div>
  );
}
