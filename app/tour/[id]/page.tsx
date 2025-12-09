import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import TheaterView from '@/components/tour/TheaterView';
import { notFound } from 'next/navigation';

export const revalidate = 60;

export default async function TourPlayerPage({ params }: { params: { id: string } }) {
  const supabase = createClient(cookies());

  // 1. Haal de Tour
  const { data: tour } = await supabase
    .from('tours')
    .select('id, title')
    .eq('id', params.id)
    .single();

  if (!tour) return notFound();

  // 2. Haal de Items + Artworks
  // Let op de nested select syntax van Supabase
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

  // Flatten array issues (Supabase returns array for single relations sometimes)
  const formattedItems = items.map(item => ({
    ...item,
    artwork: Array.isArray(item.artwork) ? item.artwork[0] : item.artwork
  })) as any[];

  return <TheaterView tourTitle={tour.title} items={formattedItems} />;
}
