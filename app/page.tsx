import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Play, Brain, Eye } from 'lucide-react';

export const revalidate = 60; // Cache 1 minuut

export default async function DashboardPage() {
  const supabase = createClient(cookies());
  const today = new Date().toISOString().split('T')[0];

  // Haal dagprogramma op
  const { data: schedule } = await supabase
    .from('dayprogram_schedule')
    .select('*, tour:tours(*), game:games(*), focus:focus_items(*, artwork:artworks(*))')
    .eq('day_date', today)
    .single();

  const tour = schedule?.tour;
  const game = schedule?.game;
  const focus = schedule?.focus;

  return (
    <main className="container mx-auto px-6 py-10 animate-fade-in-up">
      <header className="mb-10">
        <p className="text-museum-gold text-xs font-bold uppercase tracking-widest mb-2">Vandaag</p>
        <h1 className="font-serif text-5xl text-white font-bold">Uw dagelijkse curatie</h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 md:grid-rows-2 gap-6 h-auto md:h-[600px]">
        
        {/* TOUR CARD */}
        <Link href={tour ? `/tour/${tour.id}` : '#'} className="group relative col-span-1 md:col-span-8 md:row-span-2 bg-midnight-900 rounded-3xl border border-white/5 overflow-hidden hover:border-museum-gold/30 transition-all">
          {tour?.hero_image_url ? (
            <>
              <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: `url(${tour.hero_image_url})` }} />
              <div className="absolute inset-0 bg-gradient-to-t from-midnight-950 via-midnight-950/50 to-transparent" />
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-600">Geen tour beschikbaar</div>
          )}
          
          <div className="absolute bottom-0 left-0 p-8">
            {tour && <span className="inline-block bg-museum-lime text-black text-xs font-bold px-2 py-1 rounded mb-3">TOUR</span>}
            <h2 className="font-serif text-4xl text-white font-bold mb-2">{tour?.title || 'Binnenkort verwacht'}</h2>
            <p className="text-gray-300 line-clamp-2 max-w-xl mb-6">{tour?.intro || 'Onze curatoren zijn bezig.'}</p>
            {tour && (
              <button className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-bold group-hover:bg-museum-lime transition-colors">
                <Play size={18} fill="black" /> Start
              </button>
            )}
          </div>
        </Link>

        {/* GAME CARD */}
        <Link href={game ? `/game/${game.id}` : '#'} className="col-span-1 md:col-span-4 bg-midnight-900 rounded-3xl border border-white/5 p-6 hover:bg-midnight-800 transition-all flex flex-col justify-between">
          <div className="flex justify-between">
            <div className="p-3 rounded-full bg-blue-500/10 text-blue-400"><Brain size={24} /></div>
          </div>
          <div>
            <h3 className="font-serif text-xl text-white font-bold mb-1">{game?.title || 'Geen game'}</h3>
            <p className="text-sm text-gray-400">{game?.short_description}</p>
          </div>
        </Link>

        {/* FOCUS CARD */}
        <Link href={focus ? `/focus/${focus.id}` : '#'} className="col-span-1 md:col-span-4 bg-midnight-900 rounded-3xl border border-white/5 p-6 hover:bg-midnight-800 transition-all flex flex-col justify-between relative overflow-hidden">
          {focus?.artwork?.image_url && (
            <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: `url(${focus.artwork.image_url})` }} />
          )}
          <div className="relative z-10 flex justify-between">
            <div className="p-3 rounded-full bg-purple-500/10 text-purple-400"><Eye size={24} /></div>
          </div>
          <div className="relative z-10">
            <h3 className="font-serif text-xl text-white font-bold mb-1">{focus?.title || 'Geen focus'}</h3>
            <p className="text-sm text-gray-400">Neem een moment van rust.</p>
          </div>
        </Link>
      </div>
    </main>
  );
}
