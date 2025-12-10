import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import EditTourForm from './EditTourForm';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export const revalidate = 0;

export default async function EditTourPage({ params }: { params: { id: string } }) {
  const supabase = createClient(cookies());
  const tourId = params.id;

  // Haal de tour op
  const { data: tour } = await supabase
    .from('tours')
    .select(`
        id, title, summary, scheduled_date, type,
        artwork_ids,
        artworks (id, title, artist)
    `)
    .eq('id', tourId)
    .single();

  if (!tour) {
    // Redirect naar overzicht als tour niet bestaat
    redirect('/crm/tours');
  }

  // De TourForm is een Client Component, dus we moeten data serieel doorgeven.
  const initialTourData = {
    id: tour.id,
    title: tour.title,
    summary: tour.summary,
    scheduled_date: tour.scheduled_date,
    type: tour.type,
    // De stops zijn de Artwork IDs, met de titel en artiest.
    stops: tour.artworks,
    artwork_ids: tour.artwork_ids,
  };

  return (
    <div>
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Tour Bewerken: "{tour.title}"</h2>
        <p className="text-slate-500">Pas de details van de geselecteerde tour aan.</p>
      </header>
      
      <Link href="/crm/tours" className="text-blue-600 hover:text-blue-800 text-sm mb-4 inline-block">
        ← Terug naar Tours Overzicht
      </Link>

      <EditTourForm initialTourData={initialTourData} />
    </div>
  );
}
