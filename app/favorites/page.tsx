import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Heart, ArrowLeft, Image as ImageIcon, Headphones, Gamepad2, FileText, Layers } from 'lucide-react';

export const revalidate = 0;

export default async function FavoritesPage() {
  const supabase = createClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // Haal favorieten op
  const { data: favorites } = await supabase
    .from('favorites')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  // We moeten nu de details ophalen van de items.
  // Dit kan complex zijn in SQL, dus we doen het even 'lazy' in JavaScript door ID's te groeperen.
  
  const itemsByType: any = { artwork: [], tour: [], game: [], focus: [], salon: [] };
  favorites?.forEach(f => {
      if (itemsByType[f.entity_type]) itemsByType[f.entity_type].push(f.entity_id);
  });

  // Haal de echte data op per type
  const [artworks, tours, games, focus, salons] = await Promise.all([
      itemsByType.artwork.length > 0 ? supabase.from('artworks').select('id, title, image_url, artist').in('id', itemsByType.artwork) : { data: [] },
      itemsByType.tour.length > 0 ? supabase.from('tours').select('id, title, hero_image_url').in('id', itemsByType.tour) : { data: [] },
      itemsByType.game.length > 0 ? supabase.from('games').select('id, title').in('id', itemsByType.game) : { data: [] },
      itemsByType.focus.length > 0 ? supabase.from('focus_items').select('id, title').in('id', itemsByType.focus) : { data: [] },
      itemsByType.salon.length > 0 ? supabase.from('salons').select('id, title, image_url').in('id', itemsByType.salon) : { data: [] },
  ]);

  // Combineer alles tot één lijst voor weergave
  const allItems = favorites?.map(fav => {
      let details = null;
      let image = null;
      let label = '';
      let link = '';

      if (fav.entity_type === 'artwork') {
          details = artworks.data?.find((x: any) => x.id === fav.entity_id);
          image = details?.image_url;
          label = details?.artist || 'Kunstwerk';
          link = '#'; // Artworks hebben (nog) geen eigen pagina, of maak /artworks/[id]
      } else if (fav.entity_type === 'tour') {
          details = tours.data?.find((x: any) => x.id === fav.entity_id);
          image = details?.hero_image_url;
          label = 'Audiotour';
          link = `/tour/${fav.entity_id}`;
      } else if (fav.entity_type === 'game') {
          details = games.data?.find((x: any) => x.id === fav.entity_id);
          label = 'Game';
          link = `/game/${fav.entity_id}`;
      } else if (fav.entity_type === 'focus') {
          details = focus.data?.find((x: any) => x.id === fav.entity_id);
          label = 'Artikel';
          link = `/focus/${fav.entity_id}`;
      } else if (fav.entity_type === 'salon') {
          details = salons.data?.find((x: any) => x.id === fav.entity_id);
          image = details?.image_url;
          label = 'Salon Collectie';
          link = `/salon/${fav.entity_id}`;
      }

      if (!details) return null; // Item bestaat niet meer

      return { ...fav, details, image, label, link };
  }).filter(Boolean);

  return (
    <div className="min-h-screen bg-midnight-950 text-white pt-24 pb-12 px-6">
      <div className="max-w-6xl mx-auto">
        
        <Link href="/profile" className="text-gray-400 hover:text-white flex items-center gap-2 mb-8 text-sm font-bold uppercase tracking-widest transition-colors">
            <ArrowLeft size={16}/> Terug naar Profiel
        </Link>

        <header className="flex items-center gap-4 mb-12 border-b border-white/10 pb-8">
            <div className="p-4 bg-rose-600 rounded-2xl shadow-lg shadow-rose-900/20">
                <Heart size={32} className="text-white"/>
            </div>
            <div>
                <h1 className="text-4xl font-serif font-bold text-white mb-1">Mijn Collectie</h1>
                <p className="text-gray-400">U heeft {allItems?.length || 0} items bewaard.</p>
            </div>
        </header>

        {allItems?.length === 0 ? (
            <div className="text-center py-20 bg-white/5 rounded-2xl border border-dashed border-white/10">
                <Heart size={48} className="mx-auto text-gray-700 mb-4"/>
                <p className="text-gray-500">Uw collectie is nog leeg. Ga op ontdekkingstocht!</p>
                <div className="flex justify-center gap-4 mt-6">
                    <Link href="/tour" className="px-6 py-2 bg-museum-gold text-black rounded-full font-bold text-sm hover:bg-white transition-colors">Ontdek Tours</Link>
                    <Link href="/crm/import" className="px-6 py-2 bg-slate-800 text-white rounded-full font-bold text-sm hover:bg-slate-700 transition-colors">Art Curator</Link>
                </div>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {allItems?.map((item: any) => (
                    <Link key={item.id} href={item.link} className="group bg-midnight-900 border border-white/10 rounded-xl overflow-hidden hover:border-museum-gold/50 transition-all hover:-translate-y-1">
                        <div className="h-48 bg-black relative">
                            {item.image ? (
                                <img src={item.image} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-white/5 text-gray-700">
                                    {item.entity_type === 'game' && <Gamepad2 size={32}/>}
                                    {item.entity_type === 'focus' && <FileText size={32}/>}
                                </div>
                            )}
                            <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded text-[10px] font-bold uppercase tracking-widest text-museum-gold border border-museum-gold/20">
                                {item.label}
                            </div>
                        </div>
                        <div className="p-4">
                            <h3 className="font-bold text-white mb-1 line-clamp-1 group-hover:text-museum-gold transition-colors">{item.details.title}</h3>
                            <p className="text-xs text-gray-500">Bewaard op {new Date(item.created_at).toLocaleDateString('nl-NL')}</p>
                        </div>
                    </Link>
                ))}
            </div>
        )}

      </div>
    </div>
  );
}
