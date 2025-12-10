import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { ArrowLeft, Clock, MapPin } from 'lucide-react';
import LikeButton from '@/components/LikeButton';
import AudioPlayer from '@/components/tour/AudioPlayer'; // <--- Import

export const revalidate = 0;

export default async function TourDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();

  const { data: tour } = await supabase
    .from('tours')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!tour) return <div className="text-center p-20 text-white">Tour niet gevonden.</div>;

  // De stops zitten in een JSONB kolom 'stops_data'
  // Structuur verwacht: { stops: [{ title: "", description: "" }] }
  const stops = tour.stops_data?.stops || [];

  return (
    <div className="min-h-screen bg-midnight-950 text-white pb-32"> {/* Extra padding onderkant voor de speler */}
      
      {/* HEADER IMAGE */}
      <div className="relative h-[50vh] w-full">
          <div className="absolute inset-0 bg-gradient-to-t from-midnight-950 to-transparent z-10"></div>
          {tour.hero_image_url && (
              <img src={tour.hero_image_url} alt={tour.title} className="w-full h-full object-cover opacity-60" />
          )}
          
          <div className="absolute bottom-0 left-0 w-full z-20 p-6 md:p-12">
              <div className="max-w-4xl mx-auto">
                  <Link href="/tour" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-museum-gold mb-4 hover:underline">
                      <ArrowLeft size={16}/> Alle Tours
                  </Link>
                  <div className="flex justify-between items-start gap-6">
                      <h1 className="text-4xl md:text-6xl font-serif font-bold leading-tight drop-shadow-lg">{tour.title}</h1>
                      <div className="shrink-0 pt-2">
                          <LikeButton itemId={tour.id} itemType="tour" userId={user?.id} />
                      </div>
                  </div>
              </div>
          </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
          {/* INTRO */}
          <p className="text-xl text-gray-300 leading-relaxed mb-12 border-l-4 border-museum-gold pl-6">
              {tour.intro}
          </p>

          {/* STOPS LIJST (Visueel) */}
          <h3 className="font-serif text-2xl text-white mb-8 flex items-center gap-3">
              <MapPin className="text-museum-gold"/> {stops.length} Stops in deze tour
          </h3>

          <div className="space-y-8">
              {stops.map((stop: any, index: number) => (
                  <div key={index} className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-colors">
                      <div className="flex items-center gap-4 mb-4">
                          <div className="w-8 h-8 rounded-full bg-museum-gold text-black flex items-center justify-center font-bold">
                              {index + 1}
                          </div>
                          <h4 className="text-lg font-bold">{stop.title}</h4>
                      </div>
                      <p className="text-gray-400 text-sm leading-relaxed">{stop.description}</p>
                  </div>
              ))}
          </div>
      </div>

      {/* DE SPELER (Fixed Bottom) */}
      {/* Wordt alleen getoond als er stops zijn */}
      {stops.length > 0 && (
          <AudioPlayer stops={stops} title={tour.title} />
      )}

    </div>
  );
}
