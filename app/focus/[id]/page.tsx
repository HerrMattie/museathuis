import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import Image from 'next/image';
import Link from 'next/link';
import { X } from 'lucide-react';

export default async function FocusPage({ params }: { params: { id: string } }) {
  const supabase = createClient(cookies());
  
  const { data: focus } = await supabase
    .from('focus_items')
    .select('*, artwork:artworks(*)')
    .eq('id', params.id)
    .single();

  if (!focus) return <div>Niet gevonden</div>;

  return (
    <main className="relative h-screen w-full bg-black overflow-hidden flex">
      {/* Linker kant: Beeld */}
      <div className="relative w-full md:w-2/3 h-full">
         <Image 
           src={focus.artwork.image_url} 
           alt={focus.title} 
           fill 
           className="object-cover opacity-80" 
         />
         <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-midnight-950 md:hidden" />
      </div>

      {/* Rechter kant: Tekst (Zen panel) */}
      <div className="absolute md:relative inset-y-0 right-0 w-full md:w-1/3 bg-midnight-950/90 md:bg-midnight-950 p-8 md:p-12 flex flex-col justify-center backdrop-blur-md md:backdrop-blur-none">
        <Link href="/" className="absolute top-6 right-6 text-gray-400 hover:text-white">
          <X size={32} />
        </Link>

        <span className="text-museum-gold text-xs font-bold uppercase tracking-[0.2em] mb-4">Focus Moment</span>
        <h1 className="font-serif text-4xl text-white font-bold mb-6">{focus.title}</h1>
        <div className="prose prose-invert prose-lg text-gray-300">
           <p className="lead">{focus.intro}</p>
           <p className="text-base text-gray-500 mt-8 italic">
             "Kijk niet om te begrijpen, maar kijk om te voelen. Wat doet het licht met de compositie?"
           </p>
        </div>
      </div>
    </main>
  );
}
