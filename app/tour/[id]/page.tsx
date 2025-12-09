import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import TheaterView from '@/components/tour/TheaterView';
import PremiumLock from '@/components/common/PremiumLock';
import { notFound } from 'next/navigation';
import { Metadata, ResolvingMetadata } from 'next';

export const revalidate = 60;

// 1. GENERATE METADATA (Voor SEO & Sharing)
export async function generateMetadata(
  { params }: { params: { id: string } },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: tour } = await supabase
    .from('tours')
    .select('title, intro, hero_image_url')
    .eq('id', params.id)
    .single();

  if (!tour) return { title: 'Tour Niet Gevonden' };

  return {
    title: tour.title,
    description: tour.intro || 'Luister naar deze audiotour op MuseaThuis.',
    openGraph: {
      title: `${tour.title} | MuseaThuis`,
      description: tour.intro || 'Een interactieve audiotour.',
      images: tour.hero_image_url ? [tour.hero_image_url] : [],
    },
  };
}

// 2. MAIN PAGE COMPONENT
export default async function TourPlayerPage({ params }: { params: { id: string } }) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // A. Haal User & Profiel op (voor Premium Check)
  const { data: { user } } = await supabase.auth.getUser();
  let isUserPremium = false;
  
  if (user) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('is_premium')
      .eq('user_id', user.id)
      .single();
    isUserPremium = profile?.is_premium || false;
  }

  // B. Haal Tour Info op
  const { data: tour } = await supabase
    .from('tours')
    .select('id, title, is_premium')
    .eq('id', params.id)
    .single();

  if (!tour) return notFound();

  // C. Bepaal Slot Status
  const isLocked = tour.is_premium && !isUserPremium;

  // D. Haal Items op
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

  // E. Data formatteren (Flatten array)
  const formattedItems = items.map(item => ({
    ...item,
    artwork: Array.isArray(item.artwork) ? item.artwork[0] : item.artwork
  })) as any[];

  // F. Render met Slotje
  return (
    <PremiumLock isLocked={isLocked}>
       <TheaterView tourTitle={tour.title} items={formattedItems} />
    </PremiumLock>
  );
}
