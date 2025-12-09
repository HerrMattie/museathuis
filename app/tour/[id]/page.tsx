import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import TheaterView from '@/components/tour/TheaterView';
import PremiumLock from '@/components/common/PremiumLock';
import { notFound } from 'next/navigation';

export const revalidate = 60;

export default async function TourPlayerPage({ params }: { params: { id: string } }) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // 1. Haal de ingelogde gebruiker op
  const { data: { user } } = await supabase.auth.getUser();

  // 2. Check de Premium Status van de gebruiker
  let isUserPremium = false;
  if (user) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('is_premium')
      .eq('user_id', user.id)
      .single();
    
    isUserPremium = profile?.is_premium || false;
  }

  // 3. Haal de Tour Informatie op (inclusief is_premium flag)
  const { data: tour } = await supabase
    .from('tours')
    .select('id, title, is_premium')
    .eq('id', params.id)
    .single();

  if (!tour) return notFound();

  // 4. Bepaal of de content op slot moet
  // Slotje gaat erop als: Tour is Premium ÉN Gebruiker is NIET Premium
  const isLocked = tour.is_premium && !isUserPremium;

  // 5. Haal de Tour Items en Kunstwerken op
  const { data: items } = await supabase
    .from('tour_items')
    .select(`
      id, 
      position, 
      text_short, 
      audio_url,
      artwork:artworks (
        id, title, artist, image_url, description_primary
      )
    `)
    .eq('tour_id', tour.id)
    .order('position');

  if (!items || items.length === 0) {
    return (
      <div className="h-screen w-full bg-midnight-950 flex items-center justify-center text-white">
        <p>Deze tour wordt momenteel samengesteld.</p>
      </div>
    );
  }

  // 6. Data formatteren voor de TheaterView component
  // (Supabase geeft soms arrays terug bij relaties, hier maken we het plat)
  const formattedItems = items.map(item => ({
    ...item,
    artwork: Array.isArray(item.artwork) ? item.artwork[0] : item.artwork
  })) as any[];

  // 7. Render de pagina met het Premium Slot eromheen
  return (
    <PremiumLock isLocked={isLocked}>
       <TheaterView tourTitle={tour.title} items={formattedItems} />
    </PremiumLock>
  );
}
