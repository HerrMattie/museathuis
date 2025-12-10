import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { User, CreditCard, LogOut, Crown, Star, Settings } from 'lucide-react';

export const revalidate = 0;

export default async function ProfilePage() {
  const supabase = createClient(cookies());
  
  // 1. Check Sessie
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // 2. Haal Profiel Data
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  const isPremium = profile?.is_premium === true;

  return (
    <div className="min-h-screen bg-midnight-950 text-white font-sans p-6 md:p-12 flex flex-col items-center">
      
      <div className="max-w-2xl w-full">
        {/* HEADER */}
        <header className="flex justify-between items-center mb-12">
            <h1 className="font-serif text-4xl font-bold">Mijn Profiel</h1>
            <Link href="/" className="text-gray-400 hover:text-white text-sm">Terug naar Home</Link>
        </header>

        {/* MEMBER CARD */}
        <div className={`relative overflow-hidden rounded-2xl p-8 mb-8 border ${isPremium ? 'bg-gradient-to-br from-museum-gold/20 to-black border-museum-gold' : 'bg-white/5 border-white/10'}`}>
            
            {/* Achtergrond gloed */}
            <div className="absolute top-[-50%] right-[-50%] w-full h-full bg-gradient-to-b from-white/10 to-transparent rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-center gap-6">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl font-serif font-bold ${isPremium ? 'bg-museum-gold text-black' : 'bg-white/10 text-white'}`}>
                        {profile?.display_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">{profile?.display_name || 'Kunstliefhebber'}</h2>
                        <p className="text-gray-400">{user.email}</p>
                        <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-black/30 border border-white/10">
                            {isPremium ? <><Crown size={14} className="text-museum-gold"/> Premium Lid</> : "Gratis Account"}
                        </div>
                    </div>
                </div>

                {!isPremium && (
                    <Link href="/pricing" className="bg-museum-gold hover:bg-yellow-500 text-black px-6 py-3 rounded-full font-bold flex items-center gap-2 transition-transform hover:scale-105 shadow-lg shadow-museum-gold/20">
                        <Star size={18} fill="black" /> Upgrade Nu
                    </Link>
                )}
            </div>
        </div>

        {/* MENU GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Account Settings (Placeholder voor nu) */}
            <div className="bg-midnight-900 p-6 rounded-xl border border-white/5 hover:border-white/20 transition-colors group cursor-not-allowed opacity-75">
                <div className="flex items-center gap-4 mb-3">
                    <div className="bg-white/5 p-3 rounded-lg group-hover:bg-white/10 transition-colors"><Settings size={20}/></div>
                    <h3 className="font-bold">Instellingen</h3>
                </div>
                <p className="text-sm text-gray-500">Wijzig uw wachtwoord of voorkeuren. (Binnenkort)</p>
            </div>

            {/* Facturatie (Alleen zichtbaar als feature, placeholder) */}
            <div className="bg-midnight-900 p-6 rounded-xl border border-white/5 hover:border-white/20 transition-colors group cursor-not-allowed opacity-75">
                <div className="flex items-center gap-4 mb-3">
                    <div className="bg-white/5 p-3 rounded-lg group-hover:bg-white/10 transition-colors"><CreditCard size={20}/></div>
                    <h3 className="font-bold">Facturatie</h3>
                </div>
                <p className="text-sm text-gray-500">Beheer uw abonnement en facturen. (Binnenkort)</p>
            </div>

            {/* Admin Toegang (Alleen voor admins zichtbaar) */}
            {profile?.is_admin && (
                <Link href="/crm" className="bg-gradient-to-br from-blue-900/40 to-midnight-900 p-6 rounded-xl border border-blue-500/30 hover:border-blue-400 transition-colors group md:col-span-2">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="bg-blue-500/20 text-blue-400 p-3 rounded-lg"><Settings size={20}/></div>
                        <div>
                            <h3 className="font-bold text-blue-100">Naar CRM Dashboard</h3>
                            <p className="text-xs text-blue-300">U heeft beheerdersrechten.</p>
                        </div>
                    </div>
                </Link>
            )}

        </div>

        {/* LOGOUT */}
        <div className="mt-12 text-center">
            <form action="/auth/signout" method="post">
                <button className="text-red-400 hover:text-red-300 flex items-center justify-center gap-2 mx-auto font-medium transition-colors">
                    <LogOut size={18} /> Uitloggen
                </button>
            </form>
        </div>

      </div>
    </div>
  );
}
