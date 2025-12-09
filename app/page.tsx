import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import { getDailyProgram } from '@/lib/data/day-program';
import Link from 'next/link';
import Image from 'next/image';
import { Play, Brain, Eye, LayoutGrid, GraduationCap, Trophy } from 'lucide-react';

export const revalidate = 3600;

export default async function DashboardPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  
  // Haal user & programma data op
  const { data: { user } } = await supabase.auth.getUser();
  const { tour, game, focus } = await getDailyProgram();

  // Premium check logic
  let isUserPremium = false;
  if (user) {
    const { data: profile } = await supabase.from('user_profiles').select('is_premium').eq('user_id', user.id).single();
    if (profile?.is_premium) isUserPremium = true;
  }

  return (
    <main className="container mx-auto max-w-7xl px-4 pb-20 animate-fade-in-up">
      
      {/* 1. HEADER: Datum & Begroeting */}
      <header className="mb-8 mt-4">
        <p className="text-sm font-medium uppercase tracking-widest text-museum-gold">
          {new Date().toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
        <h1 className="mt-2 font-serif text-4xl md:text-5xl font-bold text-white">
          Goedemorgen{user ? ',' : '.'} {user?.user_metadata?.full_name?.split(' ')[0]}
        </h1>
        <p className="mt-2 text-gray-400 max-w-2xl">
          Uw dagelijkse dosis inspiratie staat klaar. Begin met de tour of kies voor verdieping.
        </p>
      </header>

      {/* 2. BENTO GRID: De Dagkaart */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-12 md:grid-rows-2 h-auto md:h-[600px]">
        
        {/* A. HERO: DE TOUR (Grootste blok) */}
        <Link 
          href={tour ? `/tour/${tour.id}` : '#'}
          className="group relative col-span-1 md:col-span-8 md:row-span-2 overflow-hidden rounded-3xl bg-midnight-900 border border-white/5 hover:border-museum-lime/50 transition-all duration-500 shadow-2xl"
        >
          {tour?.hero_image_url ? (
            <Image 
              src={tour.hero_image_url} 
              alt={tour.title} 
              fill 
              className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-60 group-hover:opacity-40"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-midnight-900 to-midnight-950" />
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-midnight-950 via-transparent to-transparent" />
          
          <div className="absolute bottom-0 left-0 p-8">
            <div className="mb-3 flex items-center gap-2">
              <span className="rounded bg-museum-lime px-2 py-1 text-xs font-bold text-black">TOUR VAN VANDAAG</span>
              {tour?.is_premium && <span className="text-xs text-museum-gold font-medium">PREMIUM</span>}
            </div>
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-white mb-2 leading-tight max-w-lg">
              {tour?.title || 'Laden...'}
            </h2>
            <p className="text-gray-300 line-clamp-2 max-w-md mb-6">
              {tour?.intro || 'Ontdek het verhaal achter het meesterwerk.'}
            </p>
            <button className="flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-black transition-colors group-hover:bg-museum-lime">
              <Play size={18} fill="currentColor" />
              Start Rondleiding
            </button>
          </div>
        </Link>

        {/* B. SECUNDAIR: GAME (Rechtsboven) */}
        <Link 
          href={game ? `/game/${game.id}` : '#'}
          className="group relative col-span-1 md:col-span-4 overflow-hidden rounded-3xl bg-midnight-900 border border-white/5 p-6 hover:bg-midnight-800 transition-all"
        >
          <div className="flex h-full flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className="rounded-full bg-blue-500/10 p-3 text-blue-400">
                <Brain size={24} />
              </div>
              {game?.is_premium && <span className="text-xs text-museum-gold">PREMIUM</span>}
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-white mb-1">{game?.title || 'Game van de dag'}</h3>
              <p className="text-sm text-gray-400 line-clamp-2">{game?.short_description}</p>
            </div>
          </div>
        </Link>

        {/* C. SECUNDAIR: FOCUS (Rechtsonder) */}
        <Link 
          href={focus ? `/focus/${focus.id}` : '#'}
          className="group relative col-span-1 md:col-span-4 overflow-hidden rounded-3xl bg-midnight-900 border border-white/5 p-6 hover:bg-midnight-800 transition-all"
        >
          {focus?.artwork?.image_url && (
            <Image src={focus.artwork.image_url} alt="Focus" fill className="object-cover opacity-20 transition-opacity group-hover:opacity-30" />
          )}
          <div className="relative z-10 flex h-full flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className="rounded-full bg-purple-500/10 p-3 text-purple-400">
                <Eye size={24} />
              </div>
              {focus?.is_premium && <span className="text-xs text-museum-gold">PREMIUM</span>}
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-white mb-1">{focus?.title || 'Focus moment'}</h3>
              <p className="text-sm text-gray-400">Neem een moment voor rust en verdieping.</p>
            </div>
          </div>
        </Link>
      </div>

      {/* 3. VERDIEPING: Salon & Academie & Best Of (Onderaan) */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Salon */}
        <Link href="/salon" className="flex items-center gap-4 rounded-2xl border border-white/5 bg-white/5 p-4 hover:bg-white/10 transition-colors">
          <div className="rounded-xl bg-midnight-950 p-3 text-gray-300">
            <LayoutGrid size={24} />
          </div>
          <div>
            <h4 className="font-bold text-white">De Salon</h4>
            <p className="text-xs text-gray-400">Blader door collecties</p>
          </div>
        </Link>

        {/* Academie */}
        <Link href="/academie" className="flex items-center gap-4 rounded-2xl border border-white/5 bg-white/5 p-4 hover:bg-white/10 transition-colors">
          <div className="rounded-xl bg-midnight-950 p-3 text-gray-300">
            <GraduationCap size={24} />
          </div>
          <div>
            <h4 className="font-bold text-white">Academie</h4>
            <p className="text-xs text-gray-400">Verdiep je kennis</p>
          </div>
        </Link>

        {/* Best of */}
        <Link href="/best-of" className="flex items-center gap-4 rounded-2xl border border-white/5 bg-white/5 p-4 hover:bg-white/10 transition-colors">
          <div className="rounded-xl bg-midnight-950 p-3 text-gray-300">
            <Trophy size={24} />
          </div>
          <div>
            <h4 className="font-bold text-white">Best of</h4>
            <p className="text-xs text-gray-400">De favorieten van deze maand</p>
          </div>
        </Link>

      </div>
    </main>
  );
}
