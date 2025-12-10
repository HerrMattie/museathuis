import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Settings, CreditCard, LogOut, Heart, LayoutDashboard } from 'lucide-react';
import ProfileHeader from '@/components/profile/ProfileHeader';

export const revalidate = 0;

export default async function ProfilePage() {
  const supabase = createClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  // Haal favorieten op (Placeholder query voor nu, later uitbreiden met join)
  const { data: favorites, count: favCount } = await supabase
    .from('favorites')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id);

  return (
    <div className="min-h-screen bg-midnight-950 text-white font-sans p-6 md:p-12 flex flex-col items-center">
      
      <div className="max-w-3xl w-full">
        <header className="flex justify-between items-center mb-8">
            <h1 className="font-serif text-3xl font-bold">Mijn Profiel</h1>
            <Link href="/" className="text-gray-400 hover:text-white text-sm">Terug naar Home</Link>
        </header>

        {/* 1. INTERACTIEVE HEADER */}
        <ProfileHeader profile={profile} user={user} />

        {/* 2. MIJN COLLECTIE (NIEUW) */}
        <div className="mb-8">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Heart className="text-red-500" size={20} /> Mijn Favorieten
            </h3>
            
            {favCount === 0 ? (
                <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
                    <p className="text-gray-400 mb-4">U heeft nog geen kunstwerken of tours bewaard.</p>
                    <Link href="/tour" className="text-museum-gold hover:underline">Ontdek de collectie &rarr;</Link>
                </div>
            ) : (
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <p className="text-white font-bold">{favCount} items bewaard.</p>
                    {/* Hier komt later de grid met cards */}
                </div>
            )}
        </div>

        {/* 3. MENU GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="bg-midnight-900 p-6 rounded-xl border border-white/5 hover:border-white/20 transition-colors group cursor-pointer">
                <div className="flex items-center gap-4 mb-3">
                    <div className="bg-white/5 p-3 rounded-lg group-hover:bg-white/10 transition-colors"><Settings size={20}/></div>
                    <h3 className="font-bold">Instellingen</h3>
                </div>
                <p className="text-sm text-gray-500">Wijzig wachtwoord en notificaties.</p>
            </div>

            <div className="bg-midnight-900 p-6 rounded-xl border border-white/5 hover:border-white/20 transition-colors group cursor-pointer">
                <div className="flex items-center gap-4 mb-3">
                    <div className="bg-white/5 p-3 rounded-lg group-hover:bg-white/10 transition-colors"><CreditCard size={20}/></div>
                    <h3 className="font-bold">Facturatie</h3>
                </div>
                <p className="text-sm text-gray-500">Beheer uw lidmaatschap.</p>
            </div>

            {profile?.is_admin && (
                <Link href="/crm" className="bg-gradient-to-br from-blue-900/40 to-midnight-900 p-6 rounded-xl border border-blue-500/30 hover:border-blue-400 transition-colors group md:col-span-2">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="bg-blue-500/20 text-blue-400 p-3 rounded-lg"><LayoutDashboard size={20}/></div>
                        <div>
                            <h3 className="font-bold text-blue-100">Naar CRM Dashboard</h3>
                            <p className="text-xs text-blue-300">U heeft beheerdersrechten.</p>
                        </div>
                    </div>
                </Link>
            )}
        </div>

        <div className="mt-12 text-center">
            <form action="/auth/signout" method="post">
                <button className="text-red-400 hover:text-red-300 flex items-center justify-center gap-2 mx-auto font-medium transition-colors text-sm">
                    <LogOut size={16} /> Uitloggen
                </button>
            </form>
        </div>

      </div>
    </div>
  );
}
