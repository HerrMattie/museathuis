import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import Image from 'next/image';
import Link from 'next/link';
import { X, Clock } from 'lucide-react';
import { Metadata } from 'next';
import PremiumLock from '@/components/common/PremiumLock'; // Ook hier beveiligen we de content

// 1. GENERATE METADATA
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const supabase = createClient(cookies());
  
  const { data: focus } = await supabase
    .from('focus_items')
    .select('title, intro, artwork:artworks(image_url)')
    .eq('id', params.id)
    .single();

  if (!focus) return { title: 'Focus' };

  return {
    title: `Focus: ${focus.title} | MuseaThuis`,
    description: focus.intro,
    openGraph: {
      images: focus.artwork?.image_url ? [focus.artwork.image_url] : [],
    },
  };
}

// 2. MAIN PAGE COMPONENT
export default async function FocusPage({ params }: { params: { id: string } }) {
  const supabase = createClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();

  // A. Haal Focus Item op
  const { data: focus } = await supabase
    .from('focus_items')
    .select('*, artwork:artworks(*)')
    .eq('id', params.id)
    .single();

  if (!focus) return <div className="text-white p-10">Niet gevonden</div>;

  // B. Check Premium
  let isUserPremium = false;
  if (user) {
    const { data: profile } = await supabase.from('user_profiles').select('is_premium').eq('user_id', user.id).single();
    isUserPremium = profile?.is_premium || false;
  }

  const isLocked = focus.is_premium && !isUserPremium;

  // C. Render
  return (
    <PremiumLock isLocked={isLocked}>
      <main className="relative h-screen w-full bg-black overflow-hidden flex flex-col md:flex-row">
        
        {/* AFBEELDING */}
        <div className="relative w-full md:w-3/4 h-1/2 md:h-full">
           {focus.artwork?.image_url && (
             <Image 
               src={focus.artwork.image_url} 
               alt={focus.title} 
               fill 
               className="object-cover" 
             />
           )}
           <div className="absolute inset-0 bg-gradient-to-t from-midnight-950 via-transparent to-transparent md:bg-gradient-to-r" />
        </div>

        {/* TEKST PANEEL */}
        <div className="relative w-full md:w-1/4 h-1/2 md:h-full bg-midnight-950 flex flex-col p-8 md:p-12 overflow-y-auto border-l border-white/5">
          <Link href="/" className="absolute top-6 right-6 p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors z-50">
            <X size={24} />
          </Link>

          <div className="mt-auto md:mt-20">
            <div className="flex items-center gap-2 text-museum-gold mb-4 text-sm font-bold uppercase tracking-widest">
              <Clock size={16} /> <span>Focus Moment</span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl text-white font-bold mb-6 leading-tight">
              {focus.title}
            </h1>
            <div className="prose prose-invert prose-lg text-gray-300">
               <p className="leading-relaxed">{focus.intro}</p>
               <div className="mt-8 pt-8 border-t border-white/10">
                 <p className="text-sm text-gray-500 italic">
                   "Kijk niet om te begrijpen, maar kijk om te voelen. Wat doet het licht met de compositie?"
                 </p>
               </div>
            </div>
          </div>
        </div>
      </main>
    </PremiumLock>
  );
}
