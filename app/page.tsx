import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default async function Home() {
  const supabase = createClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();

  // Als ingelogd: Start Tour. Als niet ingelogd: Inloggen/Registreren.
  const ctaLink = user ? '/tour' : '/login'; 
  const ctaText = user ? 'Start Uw Dagelijkse Tour' : 'Start Gratis';

  return (
    <main className="min-h-screen relative flex items-center justify-center overflow-hidden">
        {/* Background met overlay */}
        <div className="absolute inset-0 z-0">
             {/* Hier zou een mooie Next/Image moeten komen met priority */}
             <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1554907984-15263bfd63bd?q=80&w=2400')] bg-cover bg-center opacity-40" />
             <div className="absolute inset-0 bg-gradient-to-t from-midnight-950 via-midnight-950/80 to-transparent" />
        </div>

        <div className="relative z-10 container mx-auto px-6 text-center max-w-4xl">
            <h1 className="font-serif text-5xl md:text-7xl font-bold text-white mb-6 leading-tight drop-shadow-2xl">
               Het museum komt <br/> <span className="text-museum-gold italic">naar u toe.</span>
            </h1>
            <p className="text-xl text-gray-200 mb-10 leading-relaxed max-w-2xl mx-auto drop-shadow-lg">
               Elke dag een nieuwe audiotour, een verdiepend focusmoment en een speelse quiz. Samengesteld door AI, gecureerd voor u.
            </p>
            
            <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
               <Link href={ctaLink} className="group bg-white text-black px-8 py-4 rounded-full font-bold text-lg hover:bg-museum-lime transition-all flex items-center gap-2">
                  {ctaText} <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform"/>
               </Link>
               
               {!user && (
                   <Link href="/tour" className="text-white hover:text-museum-gold underline underline-offset-4 decoration-white/30 hover:decoration-museum-gold transition-all">
                      Bekijk eerst een voorbeeld
                   </Link>
               )}
            </div>
        </div>
    </main>
  );
}
