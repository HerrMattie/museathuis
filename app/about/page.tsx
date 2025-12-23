'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { 
    Heart, Globe, Lightbulb, Trophy, 
    Palette, Code, Sparkles, ArrowRight, Coffee, Users, Image as ImageIcon 
} from 'lucide-react';
import Link from 'next/link';
import PageHeader from '@/components/ui/PageHeader';
import { checkPageVisitBadge } from '@/lib/gamification/checkBadges';
import { trackActivity } from '@/lib/tracking';

export default function AboutPage() {
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        // 1. Track dat de gebruiker de About pagina bezoekt (voor statistieken)
        trackActivity(supabase, user.id, 'visit_about');

        // 2. GAMIFICATION: Trigger de 'Supporter' badge!
        // De checkBadges functie regelt de database insert en de popup.
        await checkPageVisitBadge(supabase, user.id, 'about');
      }
    };
    init();
  }, []);

  return (
    <div className="min-h-screen bg-midnight-950 text-white pb-24">
      
      {/* 1. HERO HEADER */}
      <PageHeader 
        title="Over MuseaThuis" 
        subtitle="Kunst voor iedereen, elke dag, overal."
        parentLink="/"
        parentLabel="Terug naar Home"
        backgroundImage="https://images.unsplash.com/photo-1544531586-fde5298cdd40?q=80&w=2070&auto=format&fit=crop"
      />

      <div className="max-w-4xl mx-auto px-6 -mt-20 relative z-20">
        
        {/* 2. MISSIE STATEMENT */}
        <div className="bg-midnight-900/90 border border-white/10 p-8 rounded-2xl backdrop-blur-md shadow-2xl mb-16 text-center">
            <Sparkles className="w-12 h-12 text-museum-gold mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6">
                Het museum zonder wachtrijen.
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed max-w-2xl mx-auto">
                MuseaThuis is ontstaan vanuit een simpel idee: kunst moet toegankelijk zijn voor iedereen. 
                Geen dure tickets, geen reistijd, maar een dagelijkse dosis schoonheid direct op je scherm.
                Of je nu een kenner bent of net begint met kijken: hier is plek voor jouw nieuwsgierigheid.
            </p>
        </div>

        {/* 3. KERNWAARDEN GRID */}
        <div className="grid md:grid-cols-3 gap-6 mb-24">
            <FeatureCard 
                icon={Globe}
                title="Toegankelijk"
                text="Ontdek meesterwerken vanuit je luie stoel. Wij brengen het museum naar jou toe."
            />
            <FeatureCard 
                icon={Lightbulb}
                title="Verdiepend"
                text="Geen droge feitjes, maar verhalen die raken. Leer de mens achter de kunstenaar kennen."
            />
            <FeatureCard 
                icon={Trophy}
                title="Spelenderwijs"
                text="Verdien XP, unlock levels en verzamel badges terwijl je leert. Kunst was nog nooit zo leuk."
            />
        </div>

        {/* 4. HET VERHAAL & TECHNIEK */}
        <div className="flex flex-col md:flex-row gap-12 items-center mb-24">
            <div className="w-full md:w-1/2">
                <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl border border-white/10 group">
                    <img 
                        src="https://images.unsplash.com/photo-1569388330292-79cc1ec67270?q=80&w=2070&auto=format&fit=crop" 
                        alt="Kunst kijken" 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-midnight-950/80 to-transparent"></div>
                    <div className="absolute bottom-6 left-6 text-white">
                        <p className="font-serif italic text-xl">"Kunst wast het stof van het dagelijks leven van de ziel."</p>
                        <p className="text-museum-gold text-sm font-bold mt-2">— Pablo Picasso</p>
                    </div>
                </div>
            </div>
            
            <div className="w-full md:w-1/2">
                <h3 className="text-2xl font-serif font-bold text-white mb-4 flex items-center gap-3">
                    <Code className="text-museum-gold"/> Onder de motorkap
                </h3>
                <div className="prose prose-invert text-gray-400 leading-relaxed mb-8">
                    <p className="mb-4">
                        MuseaThuis is gebouwd met passie voor kunst én code. We gebruiken de nieuwste technologieën om een zo soepel mogelijke ervaring te bieden.
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Next.js & React</strong> voor een bliksemsnelle interface.</li>
                        <li><strong>Tailwind CSS</strong> voor het moderne design.</li>
                        <li><strong>Supabase</strong> voor real-time data en gamification.</li>
                        <li><strong>AI Integratie</strong> voor slimme aanbevelingen.</li>
                    </ul>
                </div>

                {/* STATISTIEKEN */}
                <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-8">
                    <StatCard number="250+" label="Kunstwerken" icon={ImageIcon} />
                    <StatCard number="1.2k" label="Gebruikers" icon={Users} />
                    <StatCard number="∞" label="Inspiratie" icon={Heart} />
                </div>
            </div>
        </div>

        {/* 5. CTA / TEAM */}
        <div className="bg-gradient-to-r from-museum-gold/20 to-midnight-900 border border-museum-gold/30 rounded-2xl p-8 md:p-12 text-center relative overflow-hidden">
             {/* Decoratie */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-museum-gold/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
             
             <h2 className="text-2xl md:text-3xl font-serif font-bold mb-4 relative z-10">Bouw mee aan de toekomst</h2>
             <p className="text-gray-300 mb-8 max-w-xl mx-auto relative z-10">
                Vind je MuseaThuis tof? Help ons groeien door Premium lid te worden of deel de app met je vrienden.
             </p>
             
             <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
                <Link href="/pricing" className="bg-museum-gold text-black px-8 py-3 rounded-full font-bold hover:bg-white transition-colors flex items-center justify-center gap-2">
                    <Heart size={18} fill="black" /> Word Supporter
                </Link>
                <Link href="/contact" className="bg-white/10 text-white px-8 py-3 rounded-full font-bold hover:bg-white/20 transition-colors">
                    Neem Contact Op
                </Link>
             </div>
        </div>

      </div>
    </div>
  );
}

// --- HELPER COMPONENTS ---

function FeatureCard({ icon: Icon, title, text }: { icon: any, title: string, text: string }) {
    return (
        <div className="bg-midnight-900/50 border border-white/5 p-6 rounded-xl hover:bg-midnight-900 hover:border-museum-gold/30 transition-all duration-300 group">
            <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center mb-4 group-hover:bg-museum-gold group-hover:text-black transition-colors">
                <Icon size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2 text-white">{title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">{text}</p>
        </div>
    );
}

function StatCard({ number, label, icon: Icon }: { number: string, label: string, icon: any }) {
    return (
        <div className="text-center">
            <div className="flex justify-center mb-2 text-museum-gold/50">
                <Icon size={20} />
            </div>
            <div className="text-2xl font-bold text-white mb-1">{number}</div>
            <div className="text-xs font-bold uppercase tracking-wider text-gray-500">{label}</div>
        </div>
    );
}
