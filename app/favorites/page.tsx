import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { ArrowRight, Heart, Star, Compass, BookOpen, Coffee, Layers } from 'lucide-react';

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

  // 1. HAAL FAVORIETEN OP (Met fix voor de kolom-verwarring)
  // We selecteren gewoon alle varianten, zodat we zeker weten dat we de ID hebben.
  const { data: favs } = await supabase
    .from('favorites')
    .select('item_id, item_ID, content_id, item_type, created_at') // <--- We pakken ze allebei
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

  // 2. DATA SORTEREN EN OPHALEN
  // Helper om de echte ID te vinden uit de rommelige kolommen
  const getRealId = (f: any) => f.item_id || f.item_ID || f.content_id;

  const tourIds = favs.filter(f => f.item_type === 'tour').map(getRealId).filter(Boolean);
  const focusIds = favs.filter(f => f.item_type === 'focus').map(getRealId).filter(Boolean);
  const salonIds = favs.filter(f => f.item_type === 'salon').map(getRealId).filter(Boolean);

  // Parallel ophalen voor snelheid
  const [tours, focusItems, salons] = await Promise.all([
     tourIds.length > 0 ? supabase.from('tours').select('*').in('id', tourIds) : { data: [] },
     focusIds.length > 0 ? supabase.from('focus_items').select('*').in('id', focusIds) : { data: [] },
     salonIds.length > 0 ? supabase.from('salons').select('*').in('id', salonIds) : { data: [] },
  ]);

  // 3. COMBINEREN TOT VISUELE ITEMS
  const allItems = [
      ...(tours.data || []).map((i: any) => ({ 
          ...i, 
          typeLabel: 'Tour', 
          typeIcon: <Compass size={16}/>, 
          url: '/tour', // Tours hebben vaak geen detailpagina, link naar overzicht of speel af
          image: i.image_url 
      })),
      ...(focusItems.data || []).map((i: any) => ({ 
          ...i, 
          typeLabel: 'Focus', 
          typeIcon: <BookOpen size={16}/>, 
          url: `/focus`, // Of `/focus/${i.id}` als je detailpagina's hebt
          image: i.cover_image || i.image_url 
      })),
      ...(salons.data || []).map((i: any) => ({ 
          ...i, 
          typeLabel: 'Salon', 
          typeIcon: <Coffee size={16}/>, 
          url: `/salon/${i.id}`,
          image: i.image_url 
      })),
  ];

  // Helper voor afbeelding optimalisatie
  const getOptimizedImage = (url: string) => {
     if (!url) return null;
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
                    <p className="text-gray-400">Je bewaarde tours, artikelen en collecties.</p>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {allItems.map((item) => (
                    <Link key={item.id} href={item.url} className="group relative h-72 bg-midnight-900 rounded-2xl overflow-hidden border border-white/10 hover:border-museum-gold/50 transition-all hover:-translate-y-2 hover:shadow-2xl">
                        
                        {/* AFBEELDING */}
                        {item.image ? (
                            <img 
                                src={getOptimizedImage(item.image)} 
                                alt={item.title} 
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                loading="lazy"
                            />
                        ) : (
                            <div className="absolute inset-0 bg-midnight-800 flex items-center justify-center">
                                <Layers className="text-white/10" size={64}/>
                            </div>
                        )}

                        {/* OVERLAY & GRADIENT */}
                        <div className="absolute inset-0 bg-gradient-to-t from-midnight-950 via-midnight-950/50 to-transparent"></div>

                        {/* CONTENT */}
                        <div className="absolute bottom-0 left-0 right-0 p-6">
                            {/* Label */}
                            <div className="flex items-center gap-2 mb-2">
                                <span className="bg-museum-gold text-black text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md flex items-center gap-1">
                                    {item.typeIcon} {item.typeLabel}
                                </span>
                            </div>
                            
                            {/* Titel */}
                            <h3 className="text-xl font-serif font-bold text-white mb-1 line-clamp-2 leading-tight group-hover:text-museum-gold transition-colors">
                                {item.title}
                            </h3>
                            
                            {/* Datum (optioneel, anders description) */}
                            <p className="text-sm text-gray-400 line-clamp-1">
                                {item.intro || item.description || "Geen beschrijving beschikbaar"}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>

        </div>
    </div>
  );
}
