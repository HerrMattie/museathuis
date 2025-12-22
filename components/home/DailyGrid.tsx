'use client';

import Link from 'next/link';
import { Headphones, Eye, Gamepad2, ArrowRight } from 'lucide-react';

interface DailyGridProps {
    schedule: any;
    randomArtworks: string[];
}

export default function DailyGrid({ schedule, randomArtworks }: DailyGridProps) {
    
    if (!schedule) {
        return (
            <div className="text-center py-12 text-gray-500">
                <p>Nog geen programma geladen voor vandaag.</p>
            </div>
        );
    }

    // Agressieve optimalisatie voor afbeeldingen
    const getBg = (index: number) => {
        let url = randomArtworks?.[index];
        
        // Fallback afbeelding (ook geoptimaliseerd)
        if (!url) return "https://images.unsplash.com/photo-1578320339910-410a3048c105?w=600&q=60&fm=webp&auto=format";

        if (url.includes('images.unsplash.com')) {
            // Stap 1: Strip oude parameters
            const baseUrl = url.split('?')[0];
            // Stap 2: Voeg nieuwe parameters toe
            // w=600   -> Breedte beperken (scheelt MB's)
            // q=60    -> Iets lagere kwaliteit (niet zichtbaar door dark overlay)
            // fm=webp -> WebP formaat (veel sneller dan JPG)
            return `${baseUrl}?w=600&q=60&fm=webp&fit=crop&auto=format`;
        }
        
        // Supabase storage optimalisatie (werkt alleen als je transformaties aan hebt staan)
        if (url.includes('supabase.co')) {
             return `${url}?width=600&quality=60&format=webp`;
        }

        return url;
    };

    return (
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* 1. TOUR KAART */}
            <Link href="/tour" className="group relative h-96 rounded-3xl overflow-hidden border border-white/10 shadow-2xl transition-transform hover:-translate-y-2 block">
                <img 
                    src={getBg(0)} 
                    alt="Tour Achtergrond"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="eager" // Direct laden!
                    decoding="async"
                />
                
                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-midnight-950 via-midnight-950/60 to-transparent"></div>
                
                <div className="absolute bottom-0 left-0 right-0 p-6 relative z-10">
                    <div className="bg-museum-gold w-10 h-10 rounded-full flex items-center justify-center mb-4 text-black">
                        <Headphones size={20} />
                    </div>
                    <h3 className="text-2xl font-serif font-bold text-white mb-2">Audiotours</h3>
                    <p className="text-sm text-gray-300 mb-4 line-clamp-2">
                        {schedule.theme_title ? `Thema: ${schedule.theme_title}` : 'Luister naar de verhalen achter de meesterwerken.'}
                    </p>
                    <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-museum-gold">
                        Start Tour <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform"/>
                    </span>
                </div>
            </Link>

            {/* 2. FOCUS KAART */}
            <Link href="/focus" className="group relative h-96 rounded-3xl overflow-hidden border border-white/10 shadow-2xl transition-transform hover:-translate-y-2 block">
                <img 
                    src={getBg(1)} 
                    alt="Focus Achtergrond"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="eager" // Direct laden!
                    decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-midnight-950 via-midnight-950/60 to-transparent"></div>
                
                <div className="absolute bottom-0 left-0 right-0 p-6 relative z-10">
                    <div className="bg-white/20 backdrop-blur-md w-10 h-10 rounded-full flex items-center justify-center mb-4 text-white">
                        <Eye size={20} />
                    </div>
                    <h3 className="text-2xl font-serif font-bold text-white mb-2">In Focus</h3>
                    <p className="text-sm text-gray-300 mb-4">
                        Verdiepende artikelen en analyses van de werken van vandaag.
                    </p>
                    <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white">
                        Lees Artikel <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform"/>
                    </span>
                </div>
            </Link>

            {/* 3. GAME KAART */}
            <Link href="/game" className="group relative h-96 rounded-3xl overflow-hidden border border-white/10 shadow-2xl transition-transform hover:-translate-y-2 block">
                <img 
                    src={getBg(2)} 
                    alt="Game Achtergrond"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="eager" // Direct laden!
                    decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-midnight-950 via-midnight-950/60 to-transparent"></div>
                
                <div className="absolute bottom-0 left-0 right-0 p-6 relative z-10">
                    <div className="bg-white/20 backdrop-blur-md w-10 h-10 rounded-full flex items-center justify-center mb-4 text-white">
                        <Gamepad2 size={20} />
                    </div>
                    <h3 className="text-2xl font-serif font-bold text-white mb-2">De Uitdaging</h3>
                    <p className="text-sm text-gray-300 mb-4">
                        Test je kennis en train je oog met de dagelijkse quiz.
                    </p>
                    <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white">
                        Speel Nu <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform"/>
                    </span>
                </div>
            </Link>

        </div>
    );
}
