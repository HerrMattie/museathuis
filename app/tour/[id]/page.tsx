import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Info, Share2, Heart } from 'lucide-react';
import AudioPlayer from '@/components/tour/AudioPlayer';

// Mock data (totdat we echte AI audio in je database zetten)
const MOCK_AUDIO_URL = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"; 

export default async function TourPage({ params }: { params: { id: string } }) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: tour } = await supabase
    .from('tours')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!tour) return <div className="p-10 text-white">Tour niet gevonden</div>;

  return (
    <main className="relative h-[100dvh] w-full bg-black overflow-hidden">
      
      {/* 1. ACHTERGROND (Kunstwerk) */}
      <div className="absolute inset-0 z-0">
        {tour.hero_image_url && (
          <Image
            src={tour.hero_image_url}
            alt={tour.title || 'Kunstwerk'}
            fill
            className="object-contain md:object-cover opacity-90"
            priority
          />
        )}
        {/* Gradient overlay zodat tekst leesbaar blijft */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
      </div>

      {/* 2. NAVIGATIE (Bovenin) */}
      <div className="absolute top-0 left-0 right-0 z-10 flex justify-between p-6">
        <Link href="/" className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/60 transition-colors">
          <ArrowLeft size={24} />
        </Link>
        
        <div className="flex gap-3">
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/60 transition-colors">
            <Heart size={20} />
          </button>
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/60 transition-colors">
            <Share2 size={20} />
          </button>
        </div>
      </div>

      {/* 3. PLAYER CONTENT (Onderin) */}
      <div className="absolute bottom-0 left-0 right-0 z-20 p-6 pb-10 md:p-12 md:max-w-2xl">
        
        {/* Titel & Info */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-yellow-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-widest">Huidig Werk</span>
            <div className="h-px w-8 bg-yellow-500/50" />
          </div>
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-white mb-2 leading-tight">
            {tour.title}
          </h1>
          <p className="text-gray-300 text-lg line-clamp-2 md:line-clamp-none">
            {tour.intro}
          </p>
        </div>

        {/* Audio Player Component */}
        <div className="mb-6">
          <AudioPlayer src={MOCK_AUDIO_URL} />
        </div>

        {/* Focus Trigger */}
        <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/5 py-3 text-sm font-medium text-white backdrop-blur-sm hover:bg-white/10 transition-colors">
          <Info size={18} />
          Lees volledige analyse (Focus)
        </button>
      </div>
    </main>
  );
}
