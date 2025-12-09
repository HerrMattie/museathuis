import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import { User, Settings, CreditCard, LogOut, Heart } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

// Zorg dat de pagina altijd vers is (voor nieuwe likes)
export const revalidate = 0;

export default async function ProfilePage() {
  const supabase = createClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="container mx-auto px-6 py-20 text-center text-white">
        <h1 className="text-3xl mb-4">Niet ingelogd</h1>
        <Link href="/login" className="text-museum-gold underline">Inloggen</Link>
      </main>
    );
  }

  // Haal favorieten op
  const { data: favorites } = await supabase
    .from('favorites')
    .select('*, artwork:artworks(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  // Haal profiel op
  const { data: profile } = await supabase.from('user_profiles').select('*').eq('user_id', user.id).single();

  return (
    <main className="container mx-auto px-6 py-12 animate-fade-in-up">
      
      {/* 1. HEADER & INFO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 border-b border-white/10 pb-8 gap-6">
        <div className="flex items-center gap-6">
          <div className="h-24 w-24 rounded-full bg-museum-gold flex items-center justify-center text-black font-bold text-3xl shadow-lg shadow-museum-gold/20">
            {user.email?.[0].toUpperCase()}
          </div>
          <div>
            <h1 className="font-serif text-4xl text-white font-bold mb-2">Mijn Collectie</h1>
            <p className="text-gray-400">{user.email}</p>
            <div className="mt-2 flex gap-2">
               {profile?.is_premium ? (
                 <span className="inline-block px-3 py-1 bg-museum-gold text-black text-xs font-bold rounded uppercase tracking-wider">Mecenas Lid</span>
               ) : (
                 <span className="inline-block px-3 py-1 bg-white/10 text-white text-xs font-bold rounded uppercase tracking-wider">Gratis Lid</span>
               )}
               {profile?.is_admin && <span className="inline-block px-3 py-1 bg-red-500/20 text-red-400 text-xs font-bold rounded uppercase tracking-wider">Admin</span>}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
           <form action="/auth/signout" method="post">
             <button className="p-3 bg-midnight-900 border border-white/10 rounded-full text-gray-400 hover:text-white hover:bg-white/5 transition-colors" title="Uitloggen">
               <LogOut size={20} />
             </button>
           </form>
           {profile?.is_admin && (
             <Link href="/crm" className="px-6 py-3 bg-white/10 border border-white/10 rounded-full text-white font-bold hover:bg-white/20 transition-colors">
               CRM
             </Link>
           )}
           <Link href="/pricing" className="px-6 py-3 bg-museum-gold text-black rounded-full font-bold hover:bg-white transition-colors shadow-lg">
             {profile?.is_premium ? 'Beheer Lidmaatschap' : 'Upgrade naar Premium'}
           </Link>
        </div>
      </div>

      {/* 2. FAVORIETEN GRID */}
      <h2 className="flex items-center gap-3 text-2xl font-serif text-white font-bold mb-6">
        <Heart className="text-red-500 fill-current" /> Opgeslagen Werken ({favorites?.length || 0})
      </h2>

      {favorites && favorites.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {favorites.map((fav: any) => (
            <div key={fav.id} className="group relative aspect-square bg-midnight-900 rounded-xl overflow-hidden border border-white/5 hover:border-white/20 transition-all">
              <Image 
                src={fav.artwork.image_url} 
                alt={fav.artwork.title} 
                fill 
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                <h3 className="text-white font-bold text-sm truncate">{fav.artwork.title}</h3>
                <p className="text-gray-400 text-xs truncate">{fav.artwork.artist}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white/5 border border-white/5 rounded-2xl p-12 text-center">
          <p className="text-gray-400 text-lg mb-6">U heeft nog geen werken opgeslagen.</p>
          <Link href="/tour" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-bold rounded-full hover:bg-museum-lime transition-colors">
            Start een tour en ontdek kunst
          </Link>
        </div>
      )}
    </main>
  );
}
