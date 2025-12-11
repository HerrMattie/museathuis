import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { ArrowLeft, Heart, Headphones, Crosshair, Gamepad2, Brush, Filter } from 'lucide-react';

export const revalidate = 0;

export default async function FavoritesPage({ searchParams }: { searchParams: { filter?: string } }) {
  const supabase = createClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();
  const filter = searchParams.filter || 'all';

  // 1. Haal Favorieten op
  let query = supabase.from('favorites').select('*').eq('user_id', user?.id);
  if (filter !== 'all') {
      query = query.eq('item_type', filter);
  }
  const { data: favorites } = await query;

  if (!favorites || favorites.length === 0) {
      return (
        <div className="min-h-screen bg-midnight-950 text-white flex flex-col items-center justify-center p-6 text-center">
            <Heart size={64} className="text-gray-700 mb-6" />
            <h1 className="text-3xl font-serif font-bold text-white mb-2">Nog geen collectie</h1>
            <p className="text-gray-400 mb-8 max-w-md">
                U heeft nog geen items bewaard. Ga op ontdekkingstocht en klik op het hartje om uw persoonlijke museum samen te stellen.
            </p>
            <Link href="/tour" className="bg-museum-gold text-black px-6 py-3 rounded-xl font-bold hover:bg-white transition-colors">
                Start Ontdekkingstocht
            </Link>
        </div>
      );
  }

  // 2. Haal de details op van de bewaarde items (Tours, Focus, etc)
  // We verzamelen de ID's per type
  const tourIds = favorites.filter(f => f.item_type === 'tour').map(f => f.item_id);
  const focusIds = favorites.filter(f => f.item_type === 'focus').map(f => f.item_id);
  const gameIds = favorites.filter(f => f.item_type === 'game').map(f => f.item_id);
  const artworkIds = favorites.filter(f => f.item_type === 'artwork').map(f => f.item_id);

  // We halen de data parallel op voor snelheid
  const [toursRes, focusRes, gameRes, artworkRes] = await Promise.all([
      tourIds.length > 0 ? supabase.from('tours').select('id, title, intro').in('id', tourIds) : { data: [] },
      focusIds.length > 0 ? supabase.from('focus_items').select('id, title, intro').in('id', focusIds) : { data: [] },
      gameIds.length > 0 ? supabase.from('games').select('id, title, short_description').in('id', gameIds) : { data: [] },
      artworkIds.length > 0 ? supabase.from('artworks').select('id, title, artist, image_url').in('id', artworkIds) : { data: [] },
  ]);

  // Helper om item terug te vinden
  const getItemDetails = (fav: any) => {
      if (fav.item_type === 'tour') return toursRes.data?.find((t: any) => t.id === fav.item_id);
      if (fav.item_type === 'focus') return focusRes.data?.find((f: any) => f.id === fav.item_id);
      if (fav.item_type === 'game') return gameRes.data?.find((g: any) => g.id === fav.item_id);
      if (fav.item_type === 'artwork') return artworkRes.data?.find((a: any) => a.id === fav.item_id);
      return null;
  };

  return (
    <div className="min-h-screen bg-midnight-950 text-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 border-b border-white/10 pb-8">
            <div>
                <Link href="/profile" className="text-gray-400 hover:text-white flex items-center gap-2 mb-4 text-sm font-bold uppercase tracking-widest transition-colors">
                    <ArrowLeft size={16}/> Terug naar Profiel
                </Link>
                <h1 className="text-4xl font-serif font-bold text-white flex items-center gap-3">
                    <Heart className="text-rose-600 fill-rose-600" size={32} /> Mijn Collectie
                </h1>
            </div>

            {/* FILTERS */}
            <div className="flex flex-wrap gap-2">
                {[
                    { id: 'all', label: 'Alles' },
                    { id: 'tour', label: 'Tours', icon: <Headphones size={14}/> },
                    { id: 'focus', label: 'Artikelen', icon: <Crosshair size={14}/> },
                    { id: 'game', label: 'Games', icon: <Gamepad2 size={14}/> },
                    { id: 'artwork', label: 'Kunstwerken', icon: <Brush size={14}/> },
                ].map(f => (
                    <Link 
                        key={f.id} 
                        href={f.id === 'all' ? '/favorites' : `/favorites?filter=${f.id}`}
                        className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-all ${
                            filter === f.id 
                            ? 'bg-white text-black' 
                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                        }`}
                    >
                        {f.icon} {f.label}
                    </Link>
                ))}
            </div>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((fav) => {
                const details = getItemDetails(fav);
                if (!details) return null; // Item misschien verwijderd

                // Bepaal icoon & link per type
                let Icon = Heart;
                let link = '#';
                let label = 'Item';
                let desc = '';
                let bgImage = null;

                // FIX: We gebruiken 'as any' om TypeScript tevreden te stellen
                const d = details as any;

                if (fav.item_type === 'tour') { Icon = Headphones; link = `/tour/${fav.item_id}`; label = 'Audio Tour'; desc = d.intro; }
                if (fav.item_type === 'focus') { Icon = Crosshair; link = `/focus/${fav.item_id}`; label = 'Focus Item'; desc = d.intro; }
                if (fav.item_type === 'game') { Icon = Gamepad2; link = `/game/${fav.item_id}`; label = 'Quiz'; desc = d.short_description; }
                if (fav.item_type === 'artwork') { 
                    Icon = Brush; 
                    link = '#'; // Artworks hebben voor nu geen eigen pagina
                    label = 'Kunstwerk'; 
                    desc = d.artist; 
                    bgImage = d.image_url;
                }

                return (
                    <Link key={fav.id} href={link} className="group relative bg-midnight-900 border border-white/10 rounded-xl overflow-hidden hover:border-museum-gold/50 transition-all hover:-translate-y-1">
                        
                        {/* Afbeelding (voor artworks) of Patroon */}
                        <div className="h-40 bg-white/5 relative">
                            {bgImage ? (
                                <img src={bgImage} alt={d.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Icon size={64} />
                                </div>
                            )}
                            <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 text-white border border-white/10">
                                <Icon size={10} /> {label}
                            </div>
                        </div>

                        <div className="p-6">
                            <h3 className="font-serif font-bold text-xl text-white mb-2 group-hover:text-museum-gold transition-colors line-clamp-1">
                                {d.title}
                            </h3>
                            <p className="text-sm text-gray-400 line-clamp-2">
                                {desc || 'Geen beschrijving beschikbaar.'}
                            </p>
                        </div>
                    </Link>
                );
            })}
        </div>

      </div>
    </div>
  );
}
