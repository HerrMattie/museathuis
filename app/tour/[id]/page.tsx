'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabaseClient'; // Gebruik Client in 'use client' files
import Link from 'next/link';
import { ArrowLeft, Headphones, Clock, Play } from 'lucide-react';
import AudioPlayer from '@/components/ui/AudioPlayer'; // De nieuwe speler
import LikeButton from '@/components/LikeButton';            
import FeedbackButtons from '@/components/FeedbackButtons';

export default function TourDetailPage({ params }: { params: { id: string } }) {
  const [tour, setTour] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // State voor welke audio er speelt
  // Als dit null is, is de speler verborgen
  const [activeAudio, setActiveAudio] = useState<{src: string, title: string} | null>(null);

  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
        // 1. User ophalen
        const { data: u } = await supabase.auth.getUser();
        setUser(u?.user);

        // 2. Tour ophalen
        const { data, error } = await supabase
            .from('tours')
            .select('*')
            .eq('id', params.id)
            .single();

        if (error) console.error(error);
        setTour(data);
        setLoading(false);
    };
    fetchData();
  }, [params.id, supabase]);

  if (loading) return <div className="min-h-screen bg-midnight-950 text-white pt-32 text-center">Laden...</div>;
  if (!tour) return <div className="min-h-screen bg-midnight-950 text-white pt-32 text-center">Tour niet gevonden.</div>;

  // Stops data ophalen
  const allStops = tour.stops_data?.stops || [];
  const tourStops = allStops.slice(0, 8); // Bijv. max 8 tonen

  // Hulpfunctie om audio te starten
  const playAudio = (src: string, title: string) => {
      setActiveAudio({ src, title });
  };

  return (
    <div className="min-h-screen bg-midnight-950 text-slate-200 pb-32">
      
      {/* HEADER */}
      <div className="relative bg-slate-900 border-b border-white/5">
        <div className="max-w-4xl mx-auto px-6 py-16 md:py-24">
              
             <div className="flex justify-between items-start mb-8">
                 <Link href="/tour" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-museum-gold hover:text-white transition-colors">
                    <ArrowLeft size={14}/> Terug naar Overzicht
                 </Link>
                 
                 {user && (
                     <LikeButton 
                        itemId={tour.id} 
                        itemType="tour" 
                        userId={user.id} 
                        className="bg-white/10 hover:bg-white/20 rounded-full p-2"
                     />
                 )}
             </div>

             <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6 leading-tight">
                {tour.title}
             </h1>

             <div className="prose prose-invert prose-lg text-gray-300 mb-8 border-l-4 border-museum-gold pl-6">
                <p className="font-serif italic text-xl leading-relaxed">
                   {tour.intro || "Welkom bij deze tour..."}
                </p>
             </div>

             {/* INTRO AUDIO KNOP */}
             <div className="flex items-center gap-4">
                 <button 
                    onClick={() => playAudio(tour.audio_url || "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", `Intro: ${tour.title}`)}
                    className="flex items-center gap-3 bg-museum-gold hover:bg-yellow-500 text-black px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-yellow-500/20 group"
                 >
                    <div className="w-8 h-8 bg-black/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Play size={16} fill="black" />
                    </div>
                    <span>Start Inleiding</span>
                 </button>

                 <div className="flex items-center gap-2 text-sm text-gray-500 font-bold uppercase tracking-wider pl-4">
                    <Clock size={16}/> 25 min
                 </div>
             </div>
        </div>
      </div>

      {/* DE STOPS */}
      <div className="max-w-4xl mx-auto px-6 py-12">
          <h2 className="text-2xl font-bold text-white mb-12 flex items-center gap-3">
             <span className="bg-museum-gold text-black w-8 h-8 rounded-full flex items-center justify-center text-sm">8</span>
             Geselecteerde Meesterwerken
          </h2>

          <div className="space-y-16">
             {tourStops.map((stop: any, index: number) => (
                <div key={index} className="flex flex-col md:flex-row gap-8 relative group">
                   
                   {/* Verbindingslijn (alleen desktop) */}
                   {index !== tourStops.length - 1 && (
                      <div className="absolute left-4 md:left-[16%] top-64 bottom-[-64px] w-px bg-white/10 hidden md:block"></div>
                   )}

                   {/* Afbeelding Stop */}
                   <div className="w-full md:w-1/3 shrink-0">
                       <div className="relative aspect-square bg-black rounded-xl overflow-hidden shadow-2xl border border-white/10">
                           <span className="absolute top-0 left-0 bg-museum-gold text-black font-bold px-3 py-1 rounded-br-lg z-10 text-sm">
                               Stop {index + 1}
                           </span>
                           {stop.image_url ? (
                              <img src={stop.image_url} alt={stop.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                           ) : (
                              <div className="w-full h-full flex items-center justify-center bg-white/5"><Headphones className="opacity-20"/></div>
                           )}
                       </div>
                   </div>

                   {/* Info Stop */}
                   <div className="flex-1 pt-2">
                       <h3 className="text-2xl font-serif font-bold text-white mb-2">{stop.title}</h3>
                       <p className="text-sm font-bold text-museum-gold mb-4 uppercase tracking-widest">{stop.artist}</p>
                       <div className="prose prose-invert text-gray-400 mb-6 leading-relaxed line-clamp-3">
                           <p>{stop.description}</p>
                       </div>
                       
                       {/* Audio Knop voor DEZE stop */}
                       <div 
                            onClick={() => playAudio(stop.audio_url || tour.audio_url, stop.title)}
                            className="bg-white/5 p-4 rounded-xl border border-white/5 flex items-center justify-between hover:bg-white/10 transition-colors cursor-pointer group/audio"
                       >
                           <div className="flex items-center gap-3">
                               <div className="bg-black/40 p-2 rounded-full text-museum-gold group-hover/audio:bg-museum-gold group-hover/audio:text-black transition-colors">
                                   <Headphones size={20}/>
                               </div>
                               <span className="text-sm font-bold text-gray-300 group-hover/audio:text-white">Luister Verhaal</span>
                           </div>
                           <span className="text-xs text-gray-500 font-mono">3 min</span>
                       </div>
                   </div>
                </div>
             ))}
          </div>

          {/* FEEDBACK SECTIE */}
          <div className="mt-24 pt-12 border-t border-white/10 flex flex-col items-center text-center">
              <h3 className="text-xl font-serif font-bold mb-4">Hoe was deze tour?</h3>
              <FeedbackButtons 
                  entityId={tour.id} 
                  entityType="tour" 
              />
          </div>
      </div>

      {/* DE GLOBALE AUDIO PLAYER */}
      {/* Deze verschijnt onderin als activeAudio gevuld is */}
      {activeAudio && (
          <AudioPlayer 
              src={activeAudio.src}
              title={activeAudio.title}
              variant="fixed"
              autoPlay={true}
              onClose={() => setActiveAudio(null)}
          />
      )}

    </div>
  );
}
