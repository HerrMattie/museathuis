'use client';

import Link from 'next/link';
import { Headphones, Eye, Gamepad2, Crown, ArrowRight, Lock } from 'lucide-react';

// Hier definiëren we wat de component mag verwachten
interface DailyGridProps {
    schedule: any; // Dit is het object uit 'dayprogram_schedule'
    randomArtworks: string[]; // De array met plaatjes voor de achtergrond
}

export default function DailyGrid({ schedule, randomArtworks }: DailyGridProps) {
    
    // Veiligheid: als er geen schedule is (bijv. database leeg of cron niet gedraaid)
    if (!schedule) {
        return (
            <div className="text-center py-12 text-gray-500">
                <p>Nog geen programma geladen voor vandaag.</p>
            </div>
        );
    }

    // We halen de data uit het nieuwe schedule object
    // De tabel bevat arrays met ID's: tour_ids, focus_ids, game_ids, salon_ids
    const hasTours = schedule.tour_ids && schedule.tour_ids.length > 0;
    const hasFocus = schedule.focus_ids && schedule.focus_ids.length > 0;
    const hasGames = schedule.game_ids && schedule.game_ids.length > 0;
    
    // Salon is altijd premium
    const hasSalon = schedule.salon_ids && schedule.salon_ids.length > 0;

    // Helper om een random plaatje te pakken (met fallback)
    const getBg = (index: number) => {
        return randomArtworks?.[index] || "https://images.unsplash.com/photo-1578320339910-410a3048c105";
    };

    return (
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* 1. TOUR KAART */}
            <Link href="/tour" className="group relative h-96 rounded-3xl overflow-hidden border border-white/10 shadow-2xl transition-transform hover:-translate-y-2">
                {/* Achtergrond Plaatje */}
                <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                    style={{ backgroundImage: `url(${getBg(0)})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-midnight-950 via-midnight-950/60 to-transparent"></div>
                
                <div className="absolute bottom-0 left-0 right-0 p-6">
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
            <Link href="/focus" className="group relative h-96 rounded-3xl overflow-hidden border border-white/10 shadow-2xl transition-transform hover:-translate-y-2">
                <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                    style={{ backgroundImage: `url(${getBg(1)})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-midnight-950 via-midnight-950/60 to-transparent"></div>
                
                <div className="absolute bottom-0 left-0 right-0 p-6">
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
            <Link href="/game" className="group relative h-96 rounded-3xl overflow-hidden border border-white/10 shadow-2xl transition-transform hover:-translate-y-2">
                <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                    style={{ backgroundImage: `url(${getBg(2)})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-midnight-950 via-midnight-950/60 to-transparent"></div>
                
                <div className="absolute bottom-0 left-0 right-0 p-6">
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

            {/* 4. SALON (PREMIUM) KAART */}
            <Link href="/pricing" className="group relative h-96 rounded-3xl overflow-hidden border border-museum-gold/30 shadow-2xl transition-transform hover:-translate-y-2">
                {/* De Salon is Premium, dus we maken hem visueel anders */}
                <div 
                    className="absolute inset-0 bg-cover bg-center grayscale group-hover:grayscale-0 transition-all duration-700"
                    style={{ backgroundImage: `url(${getBg(3)})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent"></div>
                
                <div className="absolute top-4 right-4 bg-museum-gold text-black text-[10px] font-bold px-2 py-1 rounded uppercase flex items-center gap-1">
                    <Lock size={10} /> Premium
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="bg-gradient-to-br from-museum-gold to-yellow-600 w-10 h-10 rounded-full flex items-center justify-center mb-4 text-black shadow-lg shadow-museum-gold/20">
                        <Crown size={20} />
                    </div>
                    <h3 className="text-2xl font-serif font-bold text-white mb-2">De Salon</h3>
                    <p className="text-sm text-gray-300 mb-4">
                        Exclusieve wekelijkse collecties voor de fijnproever.
                    </p>
                    <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-museum-gold">
                        Word Lid <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform"/>
                    </span>
                </div>
            </Link>

        </div>
    );
}
