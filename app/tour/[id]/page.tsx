import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import TheaterView from '@/components/tour/TheaterView';
import { notFound } from 'next/navigation';

export const revalidate = 3600;

export default async function TourPage({ params }: { params: { id: string } }) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // 1. Haal de Tour Titel
  const { data: tour } = await supabase
    .from('tours')
    .select('id, title')
    .eq('id', params.id)
    .single();

  if (!tour) return notFound();

  // 2. Haal de Items en gekoppelde Artworks
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
      <div className="flex h-screen items-center justify-center bg-midnight-950 text-white">
        <p>Deze tour wordt momenteel samengesteld.</p>
      </div>
    );
  }

  // Flatten data structuur voor de component
  const formattedItems = items.map(item => ({
    ...item,
    artwork: Array.isArray(item.artwork) ? item.artwork[0] : item.artwork
  })) as any[];

  return <TheaterView tourTitle={tour.title || 'Tour'} items={formattedItems} />;
}
