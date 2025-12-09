import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import Link from 'next/link';
import Image from 'next/image';
import { Play, Brain, Eye, Lock, ArrowRight } from 'lucide-react';

export default async function DashboardPage({ user }: { user: any }) {
  const supabase = createClient(cookies());
  const today = new Date().toISOString().split('T')[0];
  const dateString = new Date().toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' });

  // 1. HAAL HET SCHEMA OP
  // We halen eerst het schema op. Omdat game_ids en focus_ids nu arrays zijn,
  // kunnen we niet makkelijk in één keer 'joinen'. We doen het in stappen.
  const { data: schedule } = await supabase
    .from('dayprogram_schedule')
    .select('*')
    .eq('day_date', today)
    .single();

  let tour = null;
  let game = null;
  let focus = null;

  if (schedule) {
    // A. Haal de Tour (Enkelvoudig ID)
    if (schedule.tour_id) {
      const { data } = await supabase
        .from('tours')
        .select('*')
        .eq('id', schedule.tour_id)
        .single();
      tour = data;
    }

    // B. Haal de Game (Eerste item uit de array game_ids)
    if (schedule.game_ids && schedule.game_ids.length > 0) {
      const { data } = await supabase
        .from('games')
        .select('*')
        .eq('id', schedule.game_ids[0]) // Pak de eerste (Gratis daghap)
        .single();
      game = data;
    }

    // C. Haal het Focus Item (Eerste item uit de array focus_ids)
    if (schedule.focus_ids && schedule.focus_ids.length > 0) {
      const { data } = await supabase
        .from('focus_items')
        .select('*, artwork:artworks(image_url)')
        .eq('id', schedule.focus_ids[0]) // Pak de eerste (Gratis daghap)
        .single();
      focus = data;
    }
  }

  // 2. BEPAAL HEADER CONTENT (Gast vs Lid)
  let headerContent;
  
  if (user) {
    // SCENARIO A: INGELOGD
    const firstName = user.user_metadata?.full_name?.split(' ')[0] || 'Kunstliefhebber';
    headerContent = (
      <>
        <p className="text-museum-gold text-xs font-bold uppercase tracking-widest mb-2">{dateString}</p>
        <h1 className="font-serif text-4xl md:text-5xl text-white font-bold leading-tight">
          Goedemorgen, {firstName}
        </h1>
      </>
    );
  } else {
    // SCENARIO B: GAST (Niet ingelogd)
    headerContent = (
      <div className="bg-gradient-to-r from-midnight-900 to-midnight-800 p-8 rounded-3xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl text-white font-bold mb-3">Welkom bij MuseaThuis</h1>
          <p className="text-gray-300 max-w-xl text-lg leading-relaxed">
            Ontdek elke dag één kunstwerk gratis. Wilt u onbeperkt toegang tot alle verdiepende tours en de academie?
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 shrink-0 w-full md:w-auto">
           <Link href="/login" className="px-6 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-colors text-center border border-white/20">
             Inloggen
           </Link>
           <Link href="/pricing" className="px-6 py-3 bg-museum-gold text-black font-bold rounded-xl hover:bg-white transition-colors text-center flex items-center justify-center gap-2">
             Bekijk Premium <ArrowRight size={18} />
           </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-6 py-10 animate-fade-in-up">
      {/* HEADER */}
      <header className="mb-10">
        {headerContent}
      </header>

      {/* BENTO GRID */}
      <div className="grid grid-cols-1 md:grid-cols-12 md:grid-rows-2 gap-6 h-auto md:h-[600px]">
        
        {/* --- TOUR KAART (GROOT) --- */}
        <Link href={tour ? `/tour/${tour.id}` : '#'} className="group relative col-span-1 md:col-span-8 md:row-span-2 bg-midnight-900 rounded-3xl border border-white/5 overflow-hidden hover:border-museum-gold/30 transition-all shadow-xl">
          {tour?.hero_image_url ? (
            <>
              <Image 
                src={tour.hero_image_url} 
                alt={tour.title} 
                fill 
                className={`object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-60 ${tour.is_premium && !user ? 'grayscale' : ''}`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-midnight-950 via-midnight-950/50 to-transparent" />
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-600 bg-midnight-900">
                <p>Nog geen tour voor vandaag.</p>
            </div>
          )}
          
          <div className="absolute bottom-0 left-0 p-8 w-full">
            <div className="flex gap-2 mb-3">
               {tour && <span className="inline-block bg-museum-lime text-black text-xs font-bold px-2 py-1 rounded">TOUR VAN VANDAAG</span>}
               {tour?.is_premium && <span className="inline-flex items-center gap-1 bg-museum-gold text-black text-xs font-bold px-2 py-1 rounded"><Lock size={10} /> PREMIUM</span>}
            </div>
            
            <h2 className="font-serif text-3xl md:text-5xl text-white font-bold mb-3 leading-tight drop-shadow-lg">
              {tour?.title || 'Binnenkort verwacht'}
            </h2>
            <p className="text-gray-200 line-clamp-2 max-w-xl mb-6 font-light text-lg drop-shadow-md">
              {tour?.intro || 'Onze curatoren zijn bezig met de selectie.'}
            </p>
            
            {tour && (
              <button className="flex items-center gap-2 bg-white text-black px-8 py-4 rounded-full font-bold group-hover:bg-museum-lime transition-colors">
                <Play size={18} fill="black" /> 
                {tour.is_premium && !user ? 'Bekijk Preview' : 'Start Rondleiding'}
              </button>
            )}
          </div>
        </Link>

        {/* --- GAME KAART (KLEIN) --- */}
        <Link href={game ? `/game/${game.id}` : '#'} className="col-span-1 md:col-span-4 bg-midnight-900 rounded-3xl border border-white/5 p-6 hover:bg-midnight-800 transition-all flex flex-col justify-between group shadow-lg">
          <div className="flex justify-between items-start">
            <div className="p-3 rounded-full bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 transition-colors">
              <Brain size={28} />
            </div>
            {game?.is_premium && <Lock size={16} className="text-museum-gold" />}
          </div>
          <div>
            <h3 className="font-serif text-2xl text-white font-bold mb-2">{game?.title || 'Geen game'}</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              {game?.short_description || 'Check later terug voor de dagelijkse quiz.'}
            </p>
          </div>
        </Link>

        {/* --- FOCUS KAART (KLEIN) --- */}
        <Link href={focus ? `/focus/${focus.id}` : '#'} className="col-span-1 md:col-span-4 bg-midnight-900 rounded-3xl border border-white/5 p-6 hover:bg-midnight-800 transition-all flex flex-col justify-between relative overflow-hidden group shadow-lg">
          {focus?.artwork?.image_url && (
            <Image src={focus.artwork.image_url} alt="Focus" fill className="object-cover opacity-20 group-hover:opacity-30 transition-opacity" />
          )}
          <div className="relative z-10 flex justify-between items-start">
            <div className="p-3 rounded-full bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20 transition-colors">
              <Eye size={28} />
            </div>
            {focus?.is_premium && <Lock size={16} className="text-museum-gold" />}
          </div>
          <div className="relative z-10">
            <h3 className="font-serif text-2xl text-white font-bold mb-2">{focus?.title || 'Geen focus'}</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Neem een moment van rust. Kijk 3 minuten langzaam.
            </p>
          </div>
        </Link>

      </div>
    </main>
  );
}
