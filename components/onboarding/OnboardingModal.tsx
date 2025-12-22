'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { X, ArrowRight, Check, Compass, Trophy, Crown } from 'lucide-react';
import confetti from 'canvas-confetti';

interface OnboardingModalProps {
    user: any;
    onComplete: () => void;
}

export default function OnboardingModal({ user, onComplete }: OnboardingModalProps) {
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const supabase = createClient();

    const slides = [
        {
            title: "Welkom bij MuseaThuis",
            text: "Ontdek dagelijks nieuwe kunstwerken, audiotours en games, gewoon vanuit je woonkamer.",
            icon: <Compass size={64} className="text-museum-gold" />,
            bg: "from-blue-900/40 to-black"
        },
        {
            title: "Hoe het werkt",
            text: "Elke dag krijg je een nieuw programma. 1 Tour en Game zijn gratis. Wil je meer verdieping? Dan is er Premium.",
            icon: <Crown size={64} className="text-museum-gold" />,
            bg: "from-purple-900/40 to-black"
        },
        {
            title: "Verdien XP & Badges",
            text: "Hoe meer je leert, hoe hoger je level. Spaar kunstwerken in je profiel en word een meester-kenner.",
            icon: <Trophy size={64} className="text-museum-gold" />,
            bg: "from-emerald-900/40 to-black"
        }
    ];

    const handleNext = async () => {
        if (step < slides.length - 1) {
            setStep(step + 1);
        } else {
            // Afronden
            setLoading(true);
            
            // Update profiel in database
            if (user) {
                await supabase.from('user_profiles').update({ has_completed_onboarding: true }).eq('user_id', user.id);
            }

            // Confetti effect!
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
            
            // Wacht heel even zodat de gebruiker het ziet
            setTimeout(() => {
                 onComplete();
                 setLoading(false);
            }, 500);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-midnight-950 border border-white/10 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl relative flex flex-col min-h-[500px]">
                
                {/* ACHTERGROND SFEER */}
                <div className={`absolute inset-0 bg-gradient-to-b ${slides[step].bg} transition-colors duration-700`}></div>

                {/* SLUIT KNOP */}
                <button onClick={handleNext} className="absolute top-4 right-4 text-white/50 hover:text-white z-20">
                    <X size={24}/>
                </button>

                {/* CONTENT */}
                <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-8 text-center mt-8">
                    {/* Icoon met key prop voor animatie herstart */}
                    <div 
                        key={`icon-${step}`} 
                        className="mb-8 p-6 bg-white/5 rounded-full border border-white/10 shadow-[0_0_30px_rgba(234,179,8,0.2)] animate-in zoom-in duration-500"
                    >
                        {slides[step].icon}
                    </div>
                    
                    <h2 
                        key={`title-${step}`}
                        className="text-3xl font-serif font-bold text-white mb-4 animate-in slide-in-from-bottom-4 duration-500"
                    >
                        {slides[step].title}
                    </h2>
                    
                    <p 
                        key={`text-${step}`}
                        className="text-gray-300 leading-relaxed animate-in slide-in-from-bottom-8 duration-500"
                    >
                        {slides[step].text}
                    </p>
                </div>

                {/* FOOTER / NAVIGATIE */}
                <div className="relative z-10 p-8 pt-0">
                    {/* Progress Dots */}
                    <div className="flex justify-center gap-2 mb-6">
                        {slides.map((_, i) => (
                            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-museum-gold' : 'w-2 bg-white/20'}`} />
                        ))}
                    </div>

                    <button 
                        onClick={handleNext}
                        disabled={loading}
                        className="w-full bg-white text-black py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-all hover:scale-105 active:scale-95 shadow-lg"
                    >
                        {loading ? 'Afronden...' : step === slides.length - 1 ? 'Start Ontdekking' : 'Volgende'}
                        {step === slides.length - 1 ? <Check size={20}/> : <ArrowRight size={20}/>}
                    </button>
                </div>

            </div>
        </div>
    );
}
