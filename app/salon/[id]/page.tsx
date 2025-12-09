import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, Calendar, Info, Lock } from 'lucide-react';
import { notFound } from 'next/navigation';
import PremiumLock from '@/components/common/PremiumLock';

export const revalidate = 3600; 

export default async function SalonDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();

  // 1. Haal de Salon Set op
  const { data: salonSet } = await supabase
    .from('salon_sets')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!salonSet) return notFound();

  // 2. Haal de gekoppelde Kunstwerken op
  // Dit vereist dat je een 'salon_set_items' tabel hebt die artworks koppelt!
  const { data: setItems } = await supabase
    .from('salon_set_items')
    .select(`
      artwork_id, 
      artwork:artworks(id, title, artist, image_url, description_primary)
    `)
    .eq('collection_id', salonSet.id)
    .order('added_at');
    
  // 3. Premium Check
  let isUserPremium = false;
  if (user) {
    const { data: profile } = await supabase.from('user_profiles').select('is_premium').eq('user_id', user.id).single();
    if (profile?.is_premium) isUserPremium = true;
  }
  const isLocked = salonSet.is_premium && !isUserPremium;

  return (
    <PremiumLock isLocked={isLocked}>
      <main className="min-h-screen bg-midnight-950 pb-20 pt-12 animate-fade-in-up">
        <div className="container mx-auto px-6">
          
          <Link href="/salon" className="inline-flex items-center gap-2 text-gray-500 hover:text-white mb-8 transition-colors text-sm font-medium">
            <ChevronRight className="rotate-180" size={16} /> Terug naar Salon
          </Link>

          {/* HEADER */}
          <header className="mb-12 max-w-4xl">
            <h1 className="font-serif text-5xl md:text-6xl text-white font-bold mb-4">{salonSet.title}</h1>
            <p className="text-xl text-museum-text-secondary leading-relaxed mb-4">
              {salonSet.description}
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-2"><Calendar size={16} /> Wekelijkse Selectie</span>
              <span className="flex items-center gap-2"><Info size={16} /> {setItems?.length || 0} Werken</span>
              {salonSet.is_premium && <span className="text-museum-gold font-bold">PREMIUM COLLECTIE</span>}
            </div>
          </header>

          {/* KUNSTWERKEN GRID */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {setItems?.map((item: any) => (
              <div key={item.artwork.id} className="group relative aspect-[3/4] bg-midnight-900 rounded-xl overflow-hidden border border-white/5 hover:border-white/20 transition-all">
                <Image 
                  src={item.artwork.image_url} 
                  alt={item.artwork.title} 
                  fill 
                  className="object-cover transition-transform duration-500 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                  <h3 className="text-white font-bold text-sm truncate">{item.artwork.title}</h3>
                  <p className="text-gray-400 text-xs truncate">{item.artwork.artist}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </main>
    </PremiumLock>
  );
}
