import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, Play, Lock, ListMusic } from 'lucide-react';

export const revalidate = 0;

export default async function TourDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();

  const { data: tour } = await supabase
    .from('tours')
    .select('*, artwork:artworks(*)')
    .eq('id', params.id)
    .single();

  if (!tour) return <div className="text-white p-10">Tour niet gevonden.</div>;

  // Check Premium
  let isLocked = false;
  if (tour.is_premium) {
      const { data: profile } = await supabase.from('user_profiles').select('is_premium').eq('user_id', user?.id).single();
      if (!profile?.is_premium) isLocked = true;
  }

  // DATA LOGICA: Hebben we 'stops_data' (Nieuwe AI) of gekoppelde artworks (Oude manier)?
  const stops = tour.stops_data?.stops || []; 
  // Als stops_data leeg is, kunnen we fallbacken op tour.artwork (als dat een array was, maar dat is complexer).
  // We gaan er even vanuit dat de AI tours nu stops_data hebben.

  return (
    <div className="min-h-screen bg-midnight-950 text-white font-sans pb-32">
        
        {/* HERO */}
        <div className="relative h-[50vh] w-full">
            <Image 
                src={tour.hero_image_url || '/placeholder.jpg'} 
                alt={tour.title} 
                fill 
                className="object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-midnight-950 via-midnight-950/20 to-transparent" />
            
            <div className="absolute top-6 left-6 z-10">
                <Link href="/tour" className="inline-flex items-center gap-2 text-white/80 hover:text-white bg-black/40 px-4 py-2 rounded-full border border-white/10">
                    <ChevronLeft size={16} /> Alle Tours
                </Link>
            </div>

            <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 max-w-4xl">
                <span className="text-museum-gold text-xs font-bold uppercase tracking-widest mb-2 block">Audiotour</span>
                <h1 className="font-serif text-4xl md:text-6xl font-bold mb-4">{tour.title}</h1>
                <p className="text-lg text-gray-200 max-w-2xl">{tour.intro}</p>
            </div>
        </div>

        {/* CONTENT */}
        <div className="container mx-auto px-6 md:px-12 mt-8">
            {isLocked ? (
                <div className="bg-white/5 border border-museum-gold/30 p-8 rounded-xl text-center">
                    <Lock className="mx-auto text-museum-gold mb-4" size={32}/>
                    <h3 className="text-xl font-bold mb-2">Premium Tour</h3>
                    <p className="text-gray-400 mb-6">Upgrade uw account om deze tour te starten.</p>
                    <Link href="/pricing" className="bg-museum-gold text-black px-6 py-2 rounded-full font-bold">Upgrade</Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    
                    {/* LINKS: PLAYLIST */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-midnight-900 border border-white/10 rounded-xl overflow-hidden">
                            <div className="p-4 bg-white/5 border-b border-white/10 flex justify-between items-center">
                                <h3 className="font-bold flex items-center gap-2"><ListMusic size={18}/> De Route</h3>
                                <span className="text-xs text-gray-500">{stops.length} Stops</span>
                            </div>
                            <div className="divide-y divide-white/5">
                                {stops.map((stop: any, idx: number) => (
                                    <div key={idx} className="p-4 hover:bg-white/5 transition-colors cursor-pointer group">
                                        <div className="flex items-start gap-3">
                                            <span className="text-museum-gold font-serif font-bold text-lg w-6">{idx + 1}.</span>
                                            <div>
                                                <h4 className="font-bold text-sm group-hover:text-museum-gold transition-colors">{stop.title}</h4>
                                                <p className="text-xs text-gray-500 line-clamp-1">{stop.artist || "Toelichting"}</p>
                                            </div>
                                            <Play size={16} className="ml-auto mt-1 opacity-0 group-hover:opacity-100 text-museum-gold transition-opacity" />
                                        </div>
                                    </div>
                                ))}
                                {stops.length === 0 && (
                                    <div className="p-6 text-center text-gray-500 text-sm">
                                        Geen stops gevonden. Genereer deze tour opnieuw met de AI.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* RECHTS: HUIDIGE STOP (Placeholder functionaliteit) */}
                    <div className="lg:col-span-2">
                        <div className="bg-white/5 border border-white/10 rounded-xl p-8 min-h-[400px] flex flex-col justify-center items-center text-center">
                            <p className="text-museum-gold uppercase tracking-widest text-xs font-bold mb-4">Start de tour</p>
                            <h2 className="font-serif text-3xl mb-6">Welkom bij "{tour.title}"</h2>
                            <p className="text-gray-400 max-w-lg mb-8">
                                Klik op de eerste stop in de lijst hiernaast (of hieronder op mobiel) om de audiotour te beginnen.
                            </p>
                            <button className="bg-white text-black px-8 py-3 rounded-full font-bold flex items-center gap-2 hover:scale-105 transition-transform">
                                <Play size={20} fill="black" /> Start Volledige Tour
                            </button>
                        </div>
                    </div>

                </div>
            )}
        </div>
    </div>
  );
}
