import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Heart, Play, Headphones, BookOpen } from 'lucide-react';

export const revalidate = 0;

export default async function FavoritesPage() {
  const supabase = createClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // 1. Haal alle favorieten op
  const { data: favorites } = await supabase
    .from('favorites')
    .select('*')
    .eq('user_id', user.id);

  if (!favorites || favorites.length === 0) {
    return <EmptyState />;
  }

  // 2. Sorteer ID's per type
  // FIX: Gebruik Array.from() in plaats van [...new Set()] om de TS error te voorkomen
  const tourIds = Array.from(new Set(favorites.filter(f => f.item_type === 'tour').map(f => f.item_id)));
  const gameIds = Array.from(new Set(favorites.filter(f => f.item_type === 'game').map(f => f.item_id)));
  const focusIds = Array.from(new Set(favorites.filter(f => f.item_type === 'focus').map(f => f.item_id)));

  // 3. Haal de details op
  let tours: any[] = [];
  let games: any[] = [];
  let focusItems: any[] = [];

  if (tourIds.length > 0) {
    const { data } = await supabase.from('tours').select('id, title, image_url, intro').in('id', tourIds);
    if (data) tours = data;
  }

  if (gameIds.length > 0) {
    const { data } = await supabase.from('games').select('id, title, image_url, short_description').in('id', gameIds);
    if (data) games = data;
  }

  if (focusIds.length > 0) {
    const { data } = await supabase
        .from('focus_items') 
        .select('id, title, image_url, summary') 
        .in('id', focusIds);
    if (data) focusItems = data;
  }

  // 4. Combineer
  const combinedItems = favorites.map(fav => {
    if (fav.item_type === 'tour') {
      const details = tours.find(t => t.id === fav.item_id);
      return details ? { ...details, type: 'tour', url: `/tour/${details.id}`, desc: details.intro } : null;
    }
    if (fav.item_type === 'game') {
      const details = games.find(t => t.id === fav.item_id);
      return details ? { ...details, type: 'game', url: `/game/${details.id}`, desc: details.short_description } : null;
    }
    if (fav.item_type === 'focus') {
      const details = focusItems.find(t => t.id === fav.item_id);
      return details ? { ...details, type: 'focus', url: `/focus/${details.id}`, desc: details.summary } : null;
    }
    return null;
  }).filter(Boolean);

  if (combinedItems.length === 0) return <EmptyState />;

  return (
    <div className="min-h-screen bg-midnight-950 text-white pt-24 pb-12 px-6">
      <div className="max-w-6xl mx-auto">
        <Link href="/profile" className="text-gray-400 hover:text-white flex items-center gap-2 mb-8 text-sm font-bold uppercase tracking-widest transition-colors">
            <ArrowLeft size={16}/> Terug naar Profiel
        </Link>

        <div className="flex items-center gap-4 mb-12">
            <div className="p-3 bg-red-500 rounded-2xl shadow-lg shadow-red-500/20">
                <Heart size={32} className="text-white fill-white"/>
            </div>
            <div>
                <h1 className="text-4xl font-serif font-bold text-white">Mijn Collectie</h1>
                <p className="text-gray-400">U heeft {combinedItems.length} items bewaard.</p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {combinedItems.map((item: any) => (
                <Link key={`${item.type}-${item.id}`} href={item.url} className="group block bg-midnight-900 border border-white/10 rounded-2xl overflow-hidden hover:border-museum-gold/50 transition-all hover:-translate-y-1 shadow-xl">
                    <div className="relative h-48 bg-black">
                        {item.image_url ? (
                            <img src={item.image_url} alt={item.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"/>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-white/5 text-gray-600">
                                {item.type === 'tour' && <Headphones size={40}/>}
                                {item.type === 'game' && <Play size={40}/>}
                                {item.type === 'focus' && <BookOpen size={40}/>}
                            </div>
                        )}
                        <div className="absolute top-3 left-3 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wide border border-white/10 flex items-center gap-2">
                            {item.type === 'tour' && <><Headphones size={12}/> Audio Tour</>}
                            {item.type === 'game' && <><Play size={12}/> Game</>}
                            {item.type === 'focus' && <><BookOpen size={12}/> Focus</>}
                        </div>
                    </div>
                    <div className="p-6">
                        <h3 className="text-xl font-bold font-serif mb-2 group-hover:text-museum-gold transition-colors line-clamp-1">{item.title}</h3>
                        <p className="text-gray-400 text-sm line-clamp-2 mb-4 h-10 leading-relaxed">
                            {item.desc || "Geen beschrijving beschikbaar."}
                        </p>
                        <div className="flex items-center text-xs font-bold uppercase tracking-widest text-gray-500 group-hover:text-white transition-colors">
                            Bekijk {item.type} <ArrowLeft size={12} className="rotate-180 ml-1"/>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
    return (
        <div className="min-h-screen bg-midnight-950 text-white pt-24 pb-12 px-6 flex flex-col items-center">
             <Link href="/profile" className="text-gray-400 hover:text-white flex items-center gap-2 mb-12 text-sm font-bold uppercase tracking-widest self-start max-w-6xl w-full mx-auto">
                <ArrowLeft size={16}/> Terug naar Profiel
            </Link>
            <div className="max-w-2xl w-full text-center py-20 bg-midnight-900/50 rounded-3xl border border-white/5">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Heart size={40} className="text-gray-600"/>
                </div>
                <h1 className="text-3xl font-serif font-bold mb-4">Nog geen favorieten</h1>
                <p className="text-gray-400 mb-8 max-w-md mx-auto">
                    Markeer items met het hartje om ze hier terug te vinden.
                </p>
                <div className="flex gap-4 justify-center">
                    <Link href="/tour" className="px-6 py-3 bg-museum-gold text-black font-bold rounded-full hover:bg-white transition-colors">
                        Ontdek Tours
                    </Link>
                </div>
            </div>
        </div>
    );
}
