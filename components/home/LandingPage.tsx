'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Play, Shield, Sparkles, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="bg-midnight-950 min-h-screen">
      
      {/* 1. HERO SECTION */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Achtergrond Video/Image */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="https://images.unsplash.com/photo-1554907984-15263bfd63bd?q=80&w=2400&auto=format&fit=crop" 
            alt="Museum Hall" 
            fill 
            className="object-cover opacity-40 scale-105 animate-pulse-slow" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-midnight-950 via-midnight-950/20 to-black/60" />
        </div>

        <div className="relative z-10 text-center max-w-4xl px-6">
          <span className="inline-block py-1 px-3 rounded-full border border-museum-gold/30 bg-museum-gold/10 text-museum-gold text-xs font-bold tracking-[0.2em] mb-6 uppercase backdrop-blur-md">
            Dagelijkse Kunstbeleving
          </span>
          <h1 className="font-serif text-5xl md:text-8xl text-white font-bold mb-8 leading-tight tracking-tight">
            Het museum komt <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-museum-gold to-white">naar u toe.</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-10 leading-relaxed max-w-2xl mx-auto">
            Elke dag een nieuwe audiotour, een verdiepend focusmoment en een speelse quiz. Samengesteld door AI, gecureerd voor u.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
            <Link href="/login" className="px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-museum-lime transition-all flex items-center gap-2 text-lg">
              Start Gratis <ArrowRight size={20} />
            </Link>
            <Link href="/tour" className="px-8 py-4 bg-white/10 text-white font-bold rounded-full border border-white/20 hover:bg-white/20 transition-all backdrop-blur-sm">
              Bekijk voorbeeld
            </Link>
          </div>
        </div>
      </section>

      {/* 2. FEATURES GRID */}
      <section className="py-24 px-6 bg-midnight-950">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            
            {/* Feature 1: Tour */}
            <div className="group text-center">
              <div className="w-16 h-16 mx-auto bg-midnight-900 border border-white/10 rounded-2xl flex items-center justify-center mb-6 group-hover:border-museum-gold/50 transition-colors">
                <Play className="text-white group-hover:text-museum-gold" size={32} />
              </div>
              <h3 className="font-serif text-2xl text-white font-bold mb-4">De Dagelijkse Tour</h3>
              <p className="text-gray-400 leading-relaxed">
                Elke ochtend om 07:00 staat er een nieuwe tour van 15 minuten klaar. Een thema, drie meesterwerken, volledig audio-begeleid.
              </p>
            </div>

            {/* Feature 2: Focus */}
            <div className="group text-center">
              <div className="w-16 h-16 mx-auto bg-midnight-900 border border-white/10 rounded-2xl flex items-center justify-center mb-6 group-hover:border-museum-gold/50 transition-colors">
                <Sparkles className="text-white group-hover:text-museum-gold" size={32} />
              </div>
              <h3 className="font-serif text-2xl text-white font-bold mb-4">Focus & Rust</h3>
              <p className="text-gray-400 leading-relaxed">
                Ontsnap aan de waan van de dag. Onze focusmodus helpt u om 3 minuten écht te kijken naar één detail.
              </p>
            </div>

            {/* Feature 3: Kwaliteit */}
            <div className="group text-center">
              <div className="w-16 h-16 mx-auto bg-midnight-900 border border-white/10 rounded-2xl flex items-center justify-center mb-6 group-hover:border-museum-gold/50 transition-colors">
                <Shield className="text-white group-hover:text-museum-gold" size={32} />
              </div>
              <h3 className="font-serif text-2xl text-white font-bold mb-4">Museum Kwaliteit</h3>
              <p className="text-gray-400 leading-relaxed">
                Geen pixels, maar 4K beelden. Geen wikipedia-tekstjes, maar diepgravende verhalen gegenereerd door onze slimme kunst-engine.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 3. CTA FOOTER */}
      <section className="py-24 px-6 border-t border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-museum-gold/5" />
        <div className="container mx-auto text-center relative z-10">
          <h2 className="font-serif text-4xl md:text-6xl text-white font-bold mb-8">
            Klaar voor uw dagelijkse dosis schoonheid?
          </h2>
          <Link href="/pricing" className="inline-flex items-center gap-2 px-10 py-5 bg-museum-gold text-black font-bold rounded-full hover:bg-white transition-all text-xl shadow-2xl shadow-museum-gold/20">
            Word Lid
          </Link>
          <p className="mt-6 text-sm text-gray-500">Al vanaf €4,99 per maand. Gratis proberen.</p>
        </div>
      </section>

    </div>
  );
}
