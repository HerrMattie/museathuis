import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import PageAudioController from '@/components/PageAudioController'; // <--- Zorg dat je deze hebt aangemaakt!
import { Clock, Calendar } from 'lucide-react';
import Image from 'next/image';

export default async function TourDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient(cookies());

  // 1. HAAL TOUR DATA OP (Server Side = Veilig & Snel)
  const { data: tour } = await supabase
    .from('tours')
    .select('*')
    .eq('id', params.id)
    .single();

  // 2. HAAL CRM LABELS OP
  const { data: content } = await supabase
    .from('site_content')
    .select('*')
    .in('key', ['tour_player_listen', 'tour_player_back']);
  
  const texts = content?.reduce((acc: any, item: any) => ({ ...acc, [item.key]: item.content }), {}) || {};

  if (!tour) return <div className="p-20 text-center text-white">Tour niet gevonden</div>;

  return (
    <div className="min-h-screen bg-midnight-950 text-slate-200 pb-32">
      
      {/* HERO SECTION */}
      <div className="h-[60vh] relative w-full bg-slate-900">
        {tour.hero_image_url && (
             <Image 
                src={tour.hero_image_url} 
                alt={tour.title} 
                fill 
                className="object-cover opacity-60"
             />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-midnight-950 via-midnight-950/20 to-transparent"></div>
        
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 max-w-5xl mx-auto">
             <div className="flex items-center gap-3 mb-4 text-sm text-museum-gold font-bold uppercase tracking-widest">
                <span className="bg-museum-gold/10 px-2 py-1 rounded border border-museum-gold/20">Audiotour</span>
                <span className="flex items-center gap-1"><Clock size={14}/> 15 min</span>
             </div>

             <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6 drop-shadow-lg leading-tight">
                {tour.title}
             </h1>
             
             {/* DE "SMART" AUDIO KNOP */}
             <div className="flex flex-wrap gap-4">
                 <PageAudioController 
                    title={tour.title} 
                    // Hier gebruiken we de ECHTE audio uit de DB, of een fallback als die leeg is
                    audioSrc={tour.audio_url || "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"} 
                    btnLabel={texts.tour_player_listen || "Luister Verhaal"}
                 />
             </div>
        </div>
      </div>

      {/* CONTENT SECTIE */}
      <div className="max-w-3xl mx-auto px-6 py-12">
          <div className="prose prose-invert prose-lg prose-headings:font-serif prose-a:text-museum-gold leading-relaxed">
             <p className="lead text-xl text-slate-300 font-serif italic mb-8 border-l-4 border-museum-gold pl-4">
                {tour.intro}
             </p>
             
             {/* Als je 'stops' data hebt (JSONB), kun je die hier mappen */}
             {tour.stops_data?.stops?.map((stop: any, index: number) => (
                <div key={index} className="mb-12 bg-white/5 p-6 rounded-xl border border-white/5">
                    <h3 className="text-2xl font-bold text-white mb-2">{stop.title}</h3>
                    <p className="text-slate-400">{stop.description}</p>
                </div>
             ))}

             {!tour.stops_data && (
                 <p className="text-slate-500 italic">Geen verdere stop-informatie beschikbaar voor deze tour.</p>
             )}
          </div>
      </div>

    </div>
  );
}
