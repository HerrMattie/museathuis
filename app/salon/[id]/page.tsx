import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import SalonScreensaver from '@/components/SalonScreensaver'; // <--- Importeer je nieuwe component
import Link from 'next/link';
import { Lock } from 'lucide-react';

export const revalidate = 0;

export default async function SalonDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();

  // 1. Haal de Salon op
  const { data: salon } = await supabase
    .from('salons')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!salon) return <div className="text-white p-8 bg-midnight-950 min-h-screen">Salon niet gevonden.</div>;

  // 2. Haal de items op (Maximaal 30 voor de screensaver ervaring)
  const { data: items } = await supabase
    .from('salon_items')
    .select('*, artwork:artworks(*)')
    .eq('salon_id', salon.id)
    .order('position', { ascending: true })
    .limit(30);

  const isLocked = salon.is_premium && !user;

  // Als hij op slot zit, toon de lock screen (geen screensaver)
  if (isLocked) {
    return (
       <div className="min-h-screen bg-midnight-950 flex flex-col items-center justify-center text-white relative">
          {salon.image_url && (
             <div className="absolute inset-0 opacity-30">
                <img src={salon.image_url} className="w-full h-full object-cover grayscale" />
             </div>
          )}
          <div className="relative z-10 bg-black/80 p-12 rounded-2xl border border-white/10 text-center max-w-lg">
             <Lock size={48} className="mx-auto text-museum-gold mb-6" />
             <h1 className="text-3xl font-serif font-bold mb-4">{salon.title}</h1>
             <p className="text-gray-400 mb-8">{salon.description}</p>
             <Link href="/pricing" className="bg-museum-gold text-black px-8 py-3 rounded-full font-bold hover:bg-white transition-colors">
                Word Lid om te Bekijken
             </Link>
          </div>
       </div>
    );
  }

  // Als hij open is, start direct de Screensaver Modus
  return (
    <SalonScreensaver salon={salon} items={items || []} />
  );
}
