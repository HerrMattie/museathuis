import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import { getDailyProgram } from '@/lib/data/day-program';
import Link from 'next/link';
import Image from 'next/image';
import { Play, Brain, Eye, LayoutGrid, GraduationCap, Trophy, Lock } from 'lucide-react';

export const revalidate = 3600;

export default async function DashboardPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  
  // 1. Haal user & programma data op
  const { data: { user } } = await supabase.auth.getUser();
  const { tour, game, focus } = await getDailyProgram();

  // 2. Premium check logic
  let isUserPremium = false;
  if (user) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('is_premium')
      .eq('user_id', user.id)
      .single();
    if (profile?.is_premium) isUserPremium = true;
  }

  // Helper voor de datum
  const todayDate = new Date().toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <main className="container mx-auto max-w-7xl px-6 pb-20 animate-fade-in-up">
      
      {/* 1. HEADER: Datum & Begroeting */}
      <header className="mb-10 mt-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-museum-gold">
          {todayDate}
        </p>
        <h1 className="mt-2 font-serif text-4xl md:text-5xl font-bold text-white leading-tight">
          Goedemorgen{user ? ',' : ''} {user?.user_metadata?.full_name?.split(' ')[0]}
        </h1>
        <p className="mt-3 text-lg text-museum-text-secondary max-w-2xl">
          Uw dagelijkse dosis kunst en inspiratie staat klaar.
        </p>
      </header>

      {/* 2. BENTO GRID: De Dagkaart */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-12 md:grid-rows-2 h-auto md:h-[600px]">
        
        {/* A. HERO: DE TOUR (Grootste blok) */}
        {tour ? (
         <Link 
  href="/tour"  // <-- VERANDERD: Linkt nu naar de landingspagina
  className="group relative col-span-1 md:col-span-8 md:row-span-2 overflow-hidden rounded-3xl bg-midnight-900 border border-white/5 hover:border-museum-lime/50 transition-all duration-500 shadow-2xl"
>
  {/* ... (Image code blijft hetzelfde) ... */}
  
  <div className="absolute bottom-0 left-0 p-8 w-full">
    <div className="mb-4 flex items-center gap-3">
      <span className="rounded bg-museum-lime px-3 py-1 text-xs font-bold text-black tracking-wide">UITGELICHT</span>
    </div>
    <h2 className="font-serif text-3xl md:text-5xl font-bold text-white mb-4 leading-tight max-w-2xl">
      {tour.title}
    </h2>
    <p className="text-gray-200 text-lg line-clamp-2 max-w-xl mb-8 font-light">
      {tour.intro}
    </p>
    <button className="flex items-center gap-3 rounded-full bg-white px-8 py-4 text-sm font-bold text-black transition-colors group-hover:bg-museum-lime">
      <Play size={20} fill="currentColor" />
      Bekijk Tours & Start {/* <-- VERANDERD: Tekst aangepast */}
    </button>
  </div>
</Link>
        ) : (
          /* FALLBACK TOUR (Geen data) */
          <div className="group relative col-span-1 md:col-span-8 md:row-span-2 overflow-hidden rounded-3xl bg-midnight-900 border border-white/5 flex flex-col items-center justify-center text-center p-8">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544531586-fde5298cdd40?q=80&w=2000&auto=format&fit=crop')] bg-cover opacity-20 grayscale" />
            <div className="absolute inset-0 bg-gradient-to-t from-midnight-950 via-midnight-950/80 to-transparent" />
            <div className="relative z-10 max-w-lg">
              <h2 className="font-serif text-3xl font-bold text-white mb-3">De collectie wordt voorbereid</h2>
              <p className="text-museum-text-secondary text-lg">
                Onze curatoren selecteren momenteel de meesterwerken voor morgen. Kom later terug voor een nieuwe dagelijkse tour.
              </p>
            </div>
          </div>
        )}

        {/* B. SECUNDAIR: GAME (Rechtsboven) */}
        {game ? (
          <Link 
            href={`/game/${game.id}`}
            className="group relative col-span-1 md:col-span-4 overflow-hidden rounded-3xl bg-midnight-800 border border-white/5 p-8 hover:bg-midnight-700 transition-all flex flex-col justify-between"
          >
             <div className="absolute top-0 right-0 p-32 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />
             
             <div className="relative z-10 flex justify-between items-start">
                <div className="rounded-2xl bg-blue-500/20 p-4 text-blue-400">
                  <Brain size={28} />
                </div>
                {game.is_premium && !isUserPremium && <Lock size={16} className="text-museum-gold" />}
             </div>
             
             <div className="relative z-10">
                <h3 className="font-serif text-2xl font-bold text-white mb-2">{game.title}</h3>
                <p className="text-sm text-museum-text-secondary line-clamp-2">{game.short_description}</p>
             </div>
          </Link>
        ) : (
          /* FALLBACK GAME */
          <div className="relative col-span-1 md:col-span-4 overflow-hidden rounded-3xl bg-midnight-900 border border-white/5 p-8 flex flex-col justify-center items-center text-center">
            <div className="rounded-full bg-white/5 p-4 mb-4 text-gray-500">
              <Brain size={24} />
            </div>
            <h3 className="font-serif text-lg font-bold text-gray-400">Geen game beschikbaar</h3>
          </div>
        )}

        {/* C. SECUNDAIR: FOCUS (Rechtsonder) */}
        {focus ? (
          <Link 
            href={`/focus/${focus.id}`}
            className="group relative col-span-1 md:col-span-4 overflow-hidden rounded-3xl bg-midnight-800 border border-white/5 p-8 hover:bg-midnight-700 transition-all flex flex-col justify-between"
          >
            {focus.artwork?.image_url && (
              <Image src={focus.artwork.image_url} alt="Focus" fill className="object-cover opacity-20 transition-opacity group-hover:opacity-30" />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-midnight-950/90" />
            
            <div className="relative z-10 flex justify-between items-start">
               <div className="rounded-2xl bg-purple-500/20 p-4 text-purple-400">
                 <Eye size={28} />
               </div>
               {focus.is_premium && !isUserPremium && <Lock size={16} className="text-museum-gold" />}
            </div>
            
            <div className="relative z-10">
               <h3 className="font-serif text-2xl font-bold text-white mb-2">{focus.title}</h3>
               <p className="text-sm text-museum-text-secondary">Neem een moment voor rust en verdieping.</p>
            </div>
          </Link>
        ) : (
          /* FALLBACK FOCUS */
          <div className="relative col-span-1 md:col-span-4 overflow-hidden rounded-3xl bg-midnight-900 border border-white/5 p-8 flex flex-col justify-center items-center text-center">
            <div className="rounded-full bg-white/5 p-4 mb-4 text-gray-500">
              <Eye size={24} />
            </div>
            <h3 className="font-serif text-lg font-bold text-gray-400">Geen focus moment</h3>
          </div>
        )}
      </div>

      {/* 3. VERDIEPING: Salon & Academie & Best Of (Onderaan) */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Salon */}
        <Link href="/salon" className="group flex items-center gap-5 rounded-2xl border border-white/5 bg-white/[0.02] p-6 hover:bg-white/[0.05] transition-colors">
          <div className="rounded-xl bg-midnight-900 p-4 text-museum-text-secondary group-hover:text-white group-hover:bg-midnight-800 transition-all">
            <LayoutGrid size={28} />
          </div>
          <div>
            <h4 className="font-serif text-lg font-bold text-white">De Salon</h4>
            <p className="text-sm text-museum-text-secondary">Blader door curaties & collecties</p>
          </div>
        </Link>

        {/* Academie */}
        <Link href="/academie" className="group flex items-center gap-5 rounded-2xl border border-white/5 bg-white/[0.02] p-6 hover:bg-white/[0.05] transition-colors">
          <div className="rounded-xl bg-midnight-900 p-4 text-museum-text-secondary group-hover:text-white group-hover:bg-midnight-800 transition-all">
            <GraduationCap size={28} />
          </div>
          <div>
            <h4 className="font-serif text-lg font-bold text-white">Academie</h4>
            <p className="text-sm text-museum-text-secondary">Verdiep je kennis met cursussen</p>
          </div>
        </Link>

        {/* Best of */}
        <Link href="/best-of" className="group flex items-center gap-5 rounded-2xl border border-white/5 bg-white/[0.02] p-6 hover:bg-white/[0.05] transition-colors">
          <div className="rounded-xl bg-midnight-900 p-4 text-museum-text-secondary group-hover:text-white group-hover:bg-midnight-800 transition-all">
            <Trophy size={28} />
          </div>
          <div>
            <h4 className="font-serif text-lg font-bold text-white">Best of</h4>
            <p className="text-sm text-museum-text-secondary">De favorieten van deze maand</p>
          </div>
        </Link>

      </div>
    </main>
  );
}
