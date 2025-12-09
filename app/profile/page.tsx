import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import { User, Settings, CreditCard } from 'lucide-react';

export default async function ProfilePage() {
  const supabase = createClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <main className="min-h-screen bg-midnight-950 px-6 py-12">
      <div className="container mx-auto max-w-3xl">
        <h1 className="font-serif text-4xl text-white font-bold mb-8">Mijn Profiel</h1>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-8 flex items-center gap-6">
          <div className="h-20 w-20 rounded-full bg-museum-lime flex items-center justify-center text-black font-bold text-2xl">
            {user?.email?.[0].toUpperCase() || 'U'}
          </div>
          <div>
            <h2 className="text-2xl text-white font-bold">{user?.user_metadata?.full_name || 'Gebruiker'}</h2>
            <p className="text-gray-400">{user?.email}</p>
            <span className="inline-block mt-2 px-3 py-1 bg-museum-gold/20 text-museum-gold text-xs font-bold rounded">
              Gratis Account
            </span>
          </div>
        </div>

        <div className="grid gap-4">
          <button className="flex items-center justify-between p-4 bg-midnight-900 rounded-lg border border-white/5 hover:border-white/20 text-white">
            <span className="flex items-center gap-3"><Settings size={20} /> Instellingen</span>
          </button>
          <button className="flex items-center justify-between p-4 bg-midnight-900 rounded-lg border border-white/5 hover:border-white/20 text-white">
            <span className="flex items-center gap-3"><CreditCard size={20} /> Abonnement Beheren</span>
          </button>
        </div>
      </div>
    </main>
  );
}
