import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import DailyGrid from '@/components/home/DailyGrid';
import { getDailyProgram } from '@/lib/dailyService';

export const revalidate = 0;

export default async function Home() {
  const supabase = createClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();
  const dailyProgram = await getDailyProgram(supabase);
  const { data: randomArts } = await supabase.from('artworks').select('image_url').limit(3);
  const randomUrls = randomArts?.map(a => a.image_url) || [];

  // Fallback data als er niets is ingepland
  const date = dailyProgram?.date ? new Date(dailyProgram.date) : new Date();
  const dateString = date.toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <main className="min-h-screen bg-midnight-950">
      
      {/* HERO SECTION */}
      <div className="relative h-[60vh] flex items-center justify-center text-center px-4">
        
        {/* Achtergrond: Kunstwerk i.p.v. Publiek */}
        <div 
            className="absolute inset-0 bg-cover bg-center opacity-40"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1577720580479-7d839d829c73?q=80&w=2532&auto=format&fit=crop')" }} // Klassieke kunst sfeer
        ></div>
        
        {/* Gradient Overlay (Zorgt voor de donkere 'Midnight' look, weg met het rood) */}
        <div className="absolute inset-0 bg-gradient-to-b from-midnight-950/80 via-midnight-950/60 to-midnight-950"></div>

        <div className="relative z-10 max-w-3xl mx-auto mt-10">
          <div className="inline-block px-3 py-1 mb-4 border border-museum-gold/30 rounded-full bg-black/40 backdrop-blur-md">
            <span className="text-museum-gold text-xs font-bold uppercase tracking-widest">
                📅 Dagprogramma • {dateString}
            </span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-serif font-black text-white mb-6 drop-shadow-lg">
            {dailyProgram?.theme.title || "Kunst Ontdekken"}
          </h1>
          
          <p className="text-xl text-gray-200 leading-relaxed font-light drop-shadow-md">
             {dailyProgram?.theme.description || "Uw dagelijkse dosis inspiratie en geschiedenis."}
          </p>
        </div>
      </div>

      {/* DAILY GRID (De kaarten doen het werk) */}
      <div className="-mt-32 relative z-20 pb-20">
         <DailyGrid items={dailyProgram?.items || {}} />
         <DailyGrid items={dailyItems} randomArtworks={randomUrls} />
      </div>

    </main>
  );
}
