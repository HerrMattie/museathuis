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
      <div className="bg-midnight-950 min-h-screen text-gray-200 font-sans pb-20">
        
        {/* HERO HEADER - MET HOOGTE FIX (Max 80vh) */}
        <header className="relative w-full h-[80vh] overflow-hidden">
           {focus.artwork.image_url && (
             <Image 
               src={focus.artwork.image_url} 
               alt={focus.title} 
               fill 
               className="object-contain bg-black/50" // object-contain zorgt dat alles zichtbaar is
               priority
             />
           )}
           
           {/* Overlay voor leesbaarheid */}
           <div className="absolute inset-0 bg-gradient-to-t from-midnight-950 via-transparent to-transparent" />

           <div className="absolute top-0 left-0 right-0 p-6 z-20 flex justify-between">
             <Link href="/focus" className="inline-flex items-center gap-2 text-white/80 hover:text-white bg-black/30 backdrop-blur-md px-4 py-2 rounded-full transition-colors text-sm font-medium">
               <ChevronRight className="rotate-180" size={16} /> Terug
             </Link>
             <AddToCollectionButton artworkId={focus.artwork.id} />
           </div>

           <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 z-20 max-w-4xl">
             <h1 className="font-serif text-4xl md:text-6xl text-white font-bold mb-4 leading-tight drop-shadow-2xl">
               {focus.title}
             </h1>
             
             {/* HIER KOMT DE RATING */}
             <div className="mb-6">
                <StarRating contentId={focus.id} />
             </div>

             <p className="text-xl text-gray-200 max-w-2xl leading-relaxed drop-shadow-lg">
               {focus.intro}
             </p>
           </div>
        </header>

        {/* ... De rest van de content (I, II, III) ... */}

      </div>
    </PremiumLock>
  );
