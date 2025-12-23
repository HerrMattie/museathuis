'use client';

import { 
  Info, TrendingUp, Palette, 
  Clock, Zap, User, Image as ImageIcon 
} from 'lucide-react';
import { useState } from 'react';

// De 5 Pijlers definities
const PIJLERS = [
  { id: 'vorm', label: 'Vorm', left: 'Realistisch', right: 'Abstract', icon: ImageIcon },
  { id: 'tijd', label: 'Tijd', left: 'Klassiek', right: 'Modern', icon: Clock },
  { id: 'sfeer', label: 'Sfeer', left: 'Harmonie', right: 'Dramatiek', icon: Zap },
  { id: 'palet', label: 'Palet', left: 'Sober', right: 'Levendig', icon: Palette },
  { id: 'focus', label: 'Focus', left: 'Mens', right: 'Omgeving', icon: User },
];

// Mock data (later haal je dit uit je Supabase profiel kolom 'art_dna')
// Waarde tussen 0 (links) en 100 (rechts)
interface DnaProps {
    stats?: {
        vorm: number;
        tijd: number;
        sfeer: number;
        palet: number;
        focus: number;
    }
}

export default function ArtDNA({ stats }: DnaProps) {
  // Fallback data als er nog geen data is
  const data = stats || {
    vorm: 30,  // Meer realistisch
    tijd: 70,  // Meer modern
    sfeer: 80, // Houdt van drama
    palet: 40, // Houdt van wat donkerder/sober
    focus: 20  // Voorkeur voor portretten
  };

  const [activePillar, setActivePillar] = useState<string | null>(null);

  // Helper om een "Archetype" te bepalen op basis van de scores
  const getArchetype = () => {
    if (data.tijd > 70 && data.vorm > 70) return "De Avant-Gardist";
    if (data.tijd < 30 && data.sfeer > 60) return "De Romiticus";
    if (data.focus < 30 && data.vorm < 30) return "De Humanist";
    if (data.palet > 70 && data.sfeer < 40) return "De Impressionist";
    return "De Eclectische Verzamelaar";
  };

  return (
    <div className="bg-midnight-900 border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
      
      {/* Achtergrond gloed */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-museum-gold/5 rounded-full blur-[80px] pointer-events-none"></div>

      <div className="flex flex-col md:flex-row gap-8 items-center">
        
        {/* LINKS: DE RADAR CHART (VISUEEL) */}
        <div className="w-full md:w-1/2 flex flex-col items-center justify-center relative">
           <RadarChart data={data} />
           <div className="mt-4 text-center">
             <div className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Jouw Archetype</div>
             <div className="text-2xl font-serif font-bold text-museum-gold">{getArchetype()}</div>
           </div>
        </div>

        {/* RECHTS: DE UITLEG (DATA) */}
        <div className="w-full md:w-1/2 space-y-6">
            <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="text-museum-gold" />
                <h3 className="text-xl font-bold text-white">Jouw Kunst DNA</h3>
            </div>
            
            <p className="text-gray-400 text-sm leading-relaxed">
                Op basis van je kijkgedrag en favorieten hebben we jouw unieke profiel samengesteld.
                Jij neigt naar <strong className="text-white">{data.tijd > 50 ? 'moderne' : 'klassieke'}</strong> werken 
                met veel <strong className="text-white">{data.sfeer > 50 ? 'emotie en drama' : 'rust en balans'}</strong>.
            </p>

            <div className="space-y-4">
                {PIJLERS.map((pijler) => {
                    const value = data[pijler.id as keyof typeof data];
                    const Icon = pijler.icon;
                    
                    return (
                        <div 
                            key={pijler.id} 
                            className="group cursor-default"
                            onMouseEnter={() => setActivePillar(pijler.id)}
                            onMouseLeave={() => setActivePillar(null)}
                        >
                            <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-2 text-gray-500 group-hover:text-white transition-colors">
                                <span>{pijler.left}</span>
                                <span className="text-museum-gold flex items-center gap-2">
                                    {pijler.label} <Icon size={12}/>
                                </span>
                                <span>{pijler.right}</span>
                            </div>
                            
                            {/* Progress Bar Container */}
                            <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden border border-white/5 relative">
                                {/* De Bar */}
                                <div 
                                    className="h-full bg-gradient-to-r from-museum-gold/40 to-museum-gold transition-all duration-1000"
                                    style={{ width: `${value}%` }}
                                ></div>
                                {/* Het streepje (indicator) */}
                                <div 
                                    className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_white] transition-all duration-1000"
                                    style={{ left: `${value}%` }}
                                ></div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
      </div>
    </div>
  );
}

// --- INTERNE COMPONENT: SVG RADAR CHART ---
// Dit tekent een "Pentagon" (vijfhoek) grafiek
function RadarChart({ data }: { data: any }) {
    // Helper om waarde (0-100) om te zetten naar coördinaten
    const getPoint = (value: number, index: number, total: number, radius: number) => {
        const angle = (Math.PI * 2 * index) / total - (Math.PI / 2); // Start bovenaan
        // We normaliseren 0-100 naar 0-1 (maar minimaal 0.1 voor zichtbaarheid)
        const normalized = Math.max(value, 10) / 100; 
        const x = 100 + radius * normalized * Math.cos(angle);
        const y = 100 + radius * normalized * Math.sin(angle);
        return `${x},${y}`;
    };

    const total = 5;
    const radius = 80;
    
    // Volgorde moet matchen met PIJLERS array!
    const values = [data.vorm, data.tijd, data.sfeer, data.palet, data.focus];
    const points = values.map((v, i) => getPoint(v, i, total, radius)).join(" ");

    // Achtergrond grid (3 ringen)
    const gridLevels = [100, 66, 33]; 

    return (
        <div className="relative w-64 h-64">
            <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl">
                {/* Grid Ringen (Vijfhoeken) */}
                {gridLevels.map((level, i) => {
                    const gridPoints = Array.from({ length: 5 }).map((_, idx) => 
                        getPoint(level, idx, 5, radius)
                    ).join(" ");
                    return (
                        <polygon 
                            key={i} 
                            points={gridPoints} 
                            fill="none" 
                            stroke="rgba(255,255,255,0.1)" 
                            strokeWidth="1" 
                        />
                    );
                })}

                {/* Assen (Lijnen naar het midden) */}
                {Array.from({ length: 5 }).map((_, i) => {
                    const p = getPoint(100, i, 5, radius);
                    return (
                         <line key={i} x1="100" y1="100" x2={p.split(',')[0]} y2={p.split(',')[1]} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                    );
                })}

                {/* DE DATA (Het DNA Vlak) */}
                <polygon 
                    points={points} 
                    fill="rgba(212, 175, 55, 0.4)" // Museum Gold semi-transparent
                    stroke="#d4af37" 
                    strokeWidth="2"
                    className="animate-in fade-in duration-1000"
                />

                {/* Bolletjes op de hoeken */}
                {values.map((v, i) => {
                    const [x, y] = getPoint(v, i, total, radius).split(',');
                    return (
                        <circle key={i} cx={x} cy={y} r="3" fill="white" className="animate-pulse" />
                    );
                })}
            </svg>
            
            {/* Labels rondom */}
            {/* Dit is complex om perfect te positioneren in SVG, dus we doen het met CSS absolute positioning voor simpelheid */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 text-[10px] font-bold text-museum-gold">VORM</div>
            <div className="absolute top-[35%] right-0 translate-x-2 text-[10px] font-bold text-museum-gold">TIJD</div>
            <div className="absolute bottom-[10%] right-0 text-[10px] font-bold text-museum-gold">SFEER</div>
            <div className="absolute bottom-[10%] left-0 text-[10px] font-bold text-museum-gold">PALET</div>
            <div className="absolute top-[35%] left-0 -translate-x-3 text-[10px] font-bold text-museum-gold">FOCUS</div>
        </div>
    );
}
