import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { ArrowLeft, Headphones, Clock } from 'lucide-react';
import PageAudioController from '@/components/PageAudioController';
import LikeButton from '@/components/LikeButton';           // <--- Nieuw
import FeedbackButtons from '@/components/FeedbackButtons'; // <--- Nieuw

export const revalidate = 0;

export default async function TourDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient(cookies());
  
  // Haal user op voor de LikeButton status
  const { data: { user } } = await supabase.auth.getUser();

  // 1. HAAL DE TOUR DATA OP
  const { data: tour } = await supabase
    .from('tours')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!tour) return <div className="p-20 text-white bg-midnight-950 min-h-screen">Tour niet gevonden</div>;

  const allStops = tour.stops_data?.stops || [];
  const tourStops = allStops.slice(0, 8);

  return (
    <div className="min-h-screen bg-midnight-950 text-slate-200 pb-32">
      
      {/* HEADER */}
      <div className="relative bg-slate-900 border-b border-white/5">
        <div className="max-w-4xl mx-auto px-6 py-16 md:py-24">
             
             <div className="flex justify-between items-start mb-8">
                 <Link href="/tour" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-museum-gold hover:text-white transition-colors">
                    <ArrowLeft size={14}/> Terug naar Overzicht
                 </Link>
                 
                 {/* HARTJE (Favoriet) in de Header */}
                 <LikeButton 
                    itemId={tour.id} 
                    itemType="tour" 
                    userId={user?.id} 
                    className="bg-white/10 hover:bg-white/20"
                 />
             </div>

             <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6 leading-tight">
                {tour.title}
             </h1>

             <div className="prose prose-invert prose-lg text-gray-300 mb-8 border-l-4 border-museum-gold pl-6">
                <p className="font-serif italic text-xl leading-relaxed">
                   {tour.intro || "Welkom bij deze tour..."}
                </p>
             </div>

             <div className="flex items-center gap-4">
                 <PageAudioController 
                    title={`Intro: ${tour.title}`} 
                    audioSrc={tour.audio_url || "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"} 
                    btnLabel="Luister Inleiding (1 min)"
                 />
                 <div className="flex items-center gap-2 text-sm text-gray-500 font-bold uppercase tracking-wider">
                    <Clock size={16}/> Totaal: 25 min
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
                   {/* ... (Jouw bestaande code voor lijntjes en afbeeldingen) ... */}
                   {index !== tourStops.length - 1 && (
                      <div className="absolute left-4 md:left-[16%] top-64 bottom-[-64px] w-px bg-white/10 hidden md:block"></div>
                   )}
                   <div className="w-full md:w-1/3 shrink-0">
                       <div className="relative aspect-square bg-black rounded-xl overflow-hidden shadow-2xl border border-white/10">
                           <span className="absolute top-0 left-0 bg-museum-gold text-black font-bold px-3 py-1 rounded-br-lg z-10">
                               Stop {index + 1}
                           </span>
                           {stop.image_url ? (
                              <img src={stop.image_url} alt={stop.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                           ) : (
                              <div className="w-full h-full flex items-center justify-center bg-white/5"><Headphones className="opacity-20"/></div>
                           )}
                       </div>
                   </div>

                   <div className="flex-1 pt-2">
                       <h3 className="text-2xl font-serif font-bold text-white mb-2">{stop.title}</h3>
                       <p className="text-sm font-bold text-museum-gold mb-6 uppercase tracking-widest">{stop.artist}</p>
                       <div className="prose prose-invert text-gray-400 mb-6 leading-relaxed">
                           <p>{stop.description}</p>
                       </div>
                       <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex items-center justify-between hover:bg-white/10 transition-colors">
                           <div className="flex items-center gap-3">
                               <div className="bg-black/40 p-2 rounded-full text-museum-gold"><Headphones size={20}/></div>
                               <span className="text-sm font-bold text-gray-300">Het Verhaal</span>
                           </div>
                           <div className="scale-90 origin-right">
                               <PageAudioController 
                                   title={stop.title} 
                                   audioSrc={stop.audio_url || tour.audio_url} 
                                   btnLabel="Luister (3 min)"
                               />
                           </div>
                       </div>
                   </div>
                </div>
             ))}
          </div>

          {/* FEEDBACK SECTIE (Helemaal onderaan) */}
          <div className="mt-24 pt-12 border-t border-white/10 flex flex-col items-center text-center">
              <h3 className="text-xl font-serif font-bold mb-4">Hoe was uw gids vandaag?</h3>
              <FeedbackButtons 
                  entityId={tour.id} 
                  entityType="tour" 
              />
          </div>
      </div>
    </div>
  );
}
