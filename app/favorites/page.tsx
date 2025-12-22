import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { ArrowRight, Heart } from 'lucide-react';

export const revalidate = 0;

export default async function FavoritesPage() {
  const supabase = createClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return <div className="p-10 text-white">Log in om favorieten te zien.</div>;

  // 1. Haal de favorieten IDs op
  const { data: favs } = await supabase
    .from('favorites')
    .select('content_id, content_type')
    .eq('user_id', user.id);

  if (!favs || favs.length === 0) {
      return <div className="min-h-screen bg-midnight-950 text-white pt-32 text-center">Nog geen favorieten.</div>;
  }

  // 2. Splits IDs per type
  const tourIds = favs.filter(f => f.content_type === 'tour').map(f => f.content_id);
  const focusIds = favs.filter(f => f.content_type === 'focus').map(f => f.content_id);
  const salonIds = favs.filter(f => f.content_type === 'salon').map(f => f.content_id);

  // 3. Haal de echte data op (Parallel voor snelheid)
  const [tours, focusItems, salons] = await Promise.all([
     tourIds.length > 0 ? supabase.from('tours').select('*').in('id', tourIds) : { data: [] },
     focusIds.length > 0 ? supabase.from('focus_items').select('*').in('id', focusIds) : { data: [] },
     salonIds.length > 0 ? supabase.from('salons').select('*').in('id', salonIds) : { data: [] },
  ]);

  // Combineer alles voor weergave
  const allItems = [
      ...(tours.data || []).map((i: any) => ({ ...i, type: 'Tour', url: '/tour' })),
      ...(focusItems.data || []).map((i: any) => ({ ...i, type: 'Focus', url: '/focus' })),
      ...(salons.data || []).map((i: any) => ({ ...i, type: 'Salon', url: `/salon/${i.id}` })),
  ];

  return (
    <div className="min-h-screen bg-midnight-950 text-white pt-24 px-6">
        <h1 className="text-4xl font-serif font-bold mb-8">Mijn Collectie</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {allItems.map((item) => (
                <Link key={item.id} href={item.url} className="block bg-midnight-900 border border-white/10 rounded-xl p-6 hover:border-museum-gold transition-colors">
                    <span className="text-xs font-bold text-museum-gold uppercase tracking-widest mb-2 block">{item.type}</span>
                    <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                    <div className="flex justify-between items-center mt-4">
                        <span className="text-sm text-gray-400">Bekijk</span>
                        <ArrowRight size={16}/>
                    </div>
                </Link>
            ))}
        </div>
    </div>
  );
}
