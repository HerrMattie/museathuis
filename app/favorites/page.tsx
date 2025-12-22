import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Heart, Star, Compass, BookOpen, Coffee, Layers } from 'lucide-react';

export const revalidate = 0;

export default async function FavoritesPage() {
  const supabase = createClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
      return (
          <div className="min-h-screen bg-midnight-950 text-white pt-32 px-6 text-center">
              <h1 className="text-3xl font-serif font-bold mb-4">Mijn Collectie</h1>
              <p className="text-gray-400 mb-8">Log in om je favoriete kunstwerken te bewaren.</p>
              <Link href="/login" className="bg-white text-black px-6 py-3 rounded-full font-bold">Inloggen</Link>
          </div>
      );
  }

  // 1. HAAL FAVORIETEN OP
  // We halen letterlijk alles op (*) zodat we kunnen zien welke kolom gevuld is
  const { data: favs } = await supabase
    .from('favorites')
    .select('*') 
    .eq('user_id', user.id);

  if (!favs || favs.length === 0) {
      return (
        <div className="min-h-screen bg-midnight-950 text-white pt-24 px-6">
            <div className="max-w-6xl mx-auto border border-dashed border-white/10 rounded-3xl p-12 text-center">
                <Heart size={48} className="mx-auto text-museum-gold mb-4 opacity-50"/>
                <h1 className="text-3xl font-serif font-bold mb-2">Nog geen favorieten</h1>
                <p className="text-gray-400">Klik op het hartje bij een Tour, Game of Artikel om hem hier te bewaren.</p>
            </div>
        </div>
      );
  }

  // 2. ID EXTRACTIE LOGICA (De "Hufter-proof" fix)
  const getRealId = (f: any) => {
      // Probeer alle varianten die in je CSV stonden
      const id = f.item_id || f.item_ID || f.content_id || f.artwork_id;
      // Filter rare lege ID's eruit
      if (id && id.length > 5) return id;
      return null;
  };

  const tourIds = favs.filter(f => f.item_type === 'tour').map(getRealId).filter(Boolean);
  const focusIds = favs.filter(f => f.item_type === 'focus').map(getRealId).filter(Boolean);
  const salonIds = favs.filter(f => f.item_type === 'salon').map(getRealId).filter(Boolean);

  // 3. OPHALEN CONTENT
  const [tours, focusItems, salons] = await Promise.all([
     tourIds.length > 0 ? supabase.from('tours').select('*').in('id', tourIds) : { data: [] },
     focusIds.length > 0 ? supabase.from('focus_items').select('*').in('id', focusIds) : { data: [] },
     salonIds.length > 0 ? supabase.from('salons').select('*').in('id', salonIds) : { data: [] },
  ]);

  // 4. COMBINEREN
  const allItems = [
      ...(tours.data || []).map((i: any) => ({ 
          ...i, typeLabel: 'Tour', typeIcon: <Compass size={16}/>, url: '/tour', image: i.image_url 
      })),
      ...(focusItems.data || []).map((i: any) => ({ 
          ...i, typeLabel: 'Focus', typeIcon: <BookOpen size={16}/>, url: `/focus`, image: i.cover_image || i.image_url 
      })),
      ...(salons.data || []).map((i: any) => ({ 
          ...i, typeLabel: 'Salon', typeIcon: <Coffee size={16}/>, url: `/salon/${i.id}`, image: i.image_url 
      })),
  ];

  // Helper voor plaatjes
  const getOptimizedImage = (url: string | null | undefined) => {
     if (!url) return undefined;
     if (url.includes('images.unsplash.com')) return `${url.split('?')[0]}?w=600&q=70&auto=format&fit=crop`;
     return url;
  };

  return (
    <div className="min-h-screen bg-midnight-950 text-white pt-24 px-6 pb-20">
        <div className="max-w-7xl mx-auto">
            <header className="mb-12 flex items-center gap-4">
                <div className="w-12 h-12 bg-museum-gold rounded-xl flex items-center justify-center text-black shadow-[0_0_20px_rgba(212,175,55,0.3)]">
                    <Star fill="black" size={24} />
                </div>
                <div>
                    <h1 className="text-4xl font-serif font-bold">Mijn Collectie</h1>
                    <p className="text-gray-400">Je bewaarde items ({allItems.length})</p>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {allItems.map((item) => (
                    <Link key={item.id} href={item.url} className="group relative h-72 bg-midnight-900 rounded-2xl overflow-hidden border border-white/10 hover:border-museum-gold/50 transition-all hover:-translate-y-2 hover:shadow-2xl">
                        {item.image ? (
                            <img src={getOptimizedImage(item.image) || ""} alt={item.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                        ) : (
                            <div className="absolute inset-0 bg-midnight-800 flex items-center justify-center"><Layers className="text-white/10" size={64}/></div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-midnight-950 via-midnight-950/50 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 right-0 p-6">
                            <span className="bg-museum-gold text-black text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md inline-flex items-center gap-1 mb-2">
                                {item.typeIcon} {item.typeLabel}
                            </span>
                            <h3 className="text-xl font-serif font-bold text-white mb-1 line-clamp-2 leading-tight group-hover:text-museum-gold transition-colors">{item.title}</h3>
                        </div>
                    </Link>
                ))}
            </div>
            
            {allItems.length === 0 && (
                 <div className="text-center text-gray-500 py-10">
                    <p>Er zijn favorieten gevonden, maar de gekoppelde items (Tours/Focus) lijken verwijderd of niet opvraagbaar.</p>
                 </div>
            )}
        </div>
    </div>
  );
}
