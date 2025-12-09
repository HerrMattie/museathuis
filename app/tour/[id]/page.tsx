'use client';
import { createClient } from '@/lib/supabaseClient';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import PremiumLock from '@/components/common/PremiumLock';
import AddToCollectionButton from '@/components/collection/AddToCollectionButton';
import AudioPlayerFixed from '@/components/tour/AudioPlayerFixed'; // Nieuw
import StarRating from '@/components/common/StarRating'; // Nieuw

export default function TourDetailPage({ params }: { params: { id: string } }) {
  const [tour, setTour] = useState<any>(null);
  const [isLocked, setIsLocked] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      // Fetch tour + artwork info
      const { data } = await supabase.from('tours').select('*, artwork:artworks(*)').eq('id', params.id).single();
      
      if (data) {
        setTour(data);
        if (data.is_premium) {
           let isUserPremium = false;
           if (user) {
             const { data: profile } = await supabase.from('user_profiles').select('is_premium').eq('user_id', user.id).single();
             if (profile?.is_premium) isUserPremium = true;
           }
           if (!isUserPremium) setIsLocked(true);
        }
      }
    }
    load();
  }, [params.id]);

  if (!tour) return <div className="min-h-screen bg-midnight-950 flex items-center justify-center">Laden...</div>;

  return (
    <PremiumLock isLocked={isLocked}>
      <main className="min-h-screen bg-midnight-950 pb-32"> {/* Extra padding onderkant voor Audio Player */}
        
        {/* Navigatie kruimel */}
        <div className="container mx-auto px-6 py-6">
           <Link href="/tour" className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-sm font-medium">
             <ChevronRight className="rotate-180" size={16} /> Terug naar overzicht
           </Link>
        </div>

        <div className="container mx-auto px-6 flex flex-col lg:flex-row gap-12">
            
            {/* LINKER KOLOM: HET KUNSTWERK (80% Hoogte) */}
            <div className="lg:w-2/3 relative flex flex-col items-center">
                 {/* FIX: max-h-[80vh] zorgt dat het op het scherm past. 
                     object-contain zorgt dat de hele afbeelding zichtbaar is.
                 */}
                 <div className="relative w-full h-[60vh] md:h-[80vh] bg-black/20 rounded-xl overflow-hidden border border-white/5">
                    {tour.hero_image_url && (
                        <Image 
                            src={tour.hero_image_url} 
                            alt={tour.title} 
                            fill 
                            className="object-contain" 
                            priority
                        />
                    )}
                 </div>
                 
                 {/* Rating direct onder het werk */}
                 <div className="mt-4 flex w-full justify-between items-center">
                    <StarRating contentId={tour.id} />
                    <AddToCollectionButton artworkId={tour.artwork?.id} />
                 </div>
            </div>

            {/* RECHTER KOLOM: INFO */}
            <div className="lg:w-1/3 flex flex-col justify-center">
                 <h1 className="font-serif text-4xl md:text-5xl text-white font-bold mb-4 leading-tight">
                    {tour.title}
                 </h1>
                 <p className="text-xl text-museum-gold italic mb-8">
                    {tour.artwork?.artist || "Onbekende Meester"}
                 </p>
                 
                 <div className="prose prose-invert text-gray-300 leading-relaxed mb-8">
                    {tour.intro}
                 </div>

                 <div className="p-6 bg-white/5 rounded-xl border border-white/10">
                    <h3 className="font-bold text-white mb-2">Luister instructies</h3>
                    <p className="text-sm text-gray-400">
                        Zet uw koptelefoon op. De audio start automatisch zodra u op play drukt in de balk hieronder. 
                        Kijk rustig naar het werk terwijl u luistert.
                    </p>
                 </div>
            </div>
        </div>

        {/* HIGH END AUDIO PLAYER */}
        <AudioPlayerFixed title={tour.title} />

      </main>
    </PremiumLock>
  );
}
