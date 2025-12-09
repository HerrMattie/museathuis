import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import { User, Settings, CreditCard, LogOut } from 'lucide-react';
import Link from 'next/link';

export default async function ProfilePage() {
  const supabase = createClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="container mx-auto px-6 py-20 text-center">
        <h1 className="text-3xl text-white mb-4">Niet ingelogd</h1>
        <Link href="/login" className="text-museum-gold underline">Inloggen</Link>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-6 py-12 animate-fade-in-up">
      <h1 className="font-serif text-4xl text-white font-bold mb-8">Mijn Profiel</h1>

      <div className="bg-midnight-900 border border-white/10 rounded-2xl p-8 mb-8 flex items-center gap-6">
        <div className="h-24 w-24 rounded-full bg-museum-gold flex items-center justify-center text-black font-bold text-3xl">
          {user.email?.[0].toUpperCase()}
        </div>
        <div>
          <h2 className="text-2xl text-white font-bold mb-1">{user.user_metadata?.full_name || 'Kunstliefhebber'}</h2>
          <p className="text-gray-400 mb-3">{user.email}</p>
          <span className="inline-block px-3 py-1 bg-museum-lime/20 text-museum-lime text-xs font-bold rounded uppercase tracking-wider">
            Free Member
          </span>
        </div>
      </div>

      <div className="grid gap-3 max-w-xl">
        <button className="flex items-center justify-between p-4 bg-midnight-900 rounded-xl border border-white/5 hover:border-white/20 text-white transition-all">
          <span className="flex items-center gap-4"><Settings size={20} className="text-gray-400" /> Instellingen</span>
        </button>
        <button className="flex items-center justify-between p-4 bg-midnight-900 rounded-xl border border-white/5 hover:border-white/20 text-white transition-all">
          <span className="flex items-center gap-4"><CreditCard size={20} className="text-gray-400" /> Abonnement & Premium</span>
        </button>
        <form action="/auth/signout" method="post">
           <button className="w-full flex items-center justify-between p-4 bg-red-500/10 rounded-xl border border-red-500/20 hover:bg-red-500/20 text-red-400 transition-all mt-4">
             <span className="flex items-center gap-4"><LogOut size={20} /> Uitloggen</span>
           </button>
        </form>
      </div>
    </main>
  );
}
