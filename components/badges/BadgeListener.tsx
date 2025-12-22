'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { Trophy, X, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function BadgeListener({ userId }: { userId: string }) {
  // We gebruiken een wachtrij (queue) voor als er meerdere badges tegelijk komen
  const [badgeQueue, setBadgeQueue] = useState<any[]>([]);
  const [currentBadge, setCurrentBadge] = useState<any>(null);
  
  const supabase = createClient();

  // 1. LUISTER NAAR NIEUWE BADGES
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('badge-popups')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_badges',
          filter: `user_id=eq.${userId}`,
        },
        async (payload) => {
          const badgeId = payload.new.badge_id;
          
          // Haal badge info op
          const { data: badgeDetails } = await supabase
            .from('badges')
            .select('*')
            .eq('id', badgeId)
            .single();

          if (badgeDetails) {
            // Voeg toe aan de wachtrij in plaats van direct tonen
            setBadgeQueue((prev) => [...prev, badgeDetails]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, supabase]);


  // 2. VERWERK DE WACHTRIJ (Eén voor één tonen)
  useEffect(() => {
    // Als we al een badge laten zien, doe niks.
    // Als de wachtrij leeg is, doe niks.
    if (currentBadge || badgeQueue.length === 0) return;

    // Pak de eerste uit de rij
    const nextBadge = badgeQueue[0];
    
    // Verwijder hem uit de wachtrij en zet hem als 'huidige'
    setBadgeQueue((prev) => prev.slice(1));
    setCurrentBadge(nextBadge);
    
    // Feestje!
    triggerConfetti();

    // Wacht 5 seconden en maak dan plaats voor de volgende
    const timer = setTimeout(() => {
        setCurrentBadge(null);
    }, 5000);

    return () => clearTimeout(timer);
  }, [badgeQueue, currentBadge]); // Draait elke keer als de queue of status verandert


  const triggerConfetti = () => {
    const duration = 2 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };
    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);
      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  };

  // Als er niks te tonen is, render niks
  if (!currentBadge) return null;

  return (
    <div className="fixed top-24 right-6 z-[100] animate-in slide-in-from-right-10 fade-in duration-500">
      <div className="bg-midnight-900 border border-museum-gold/50 text-white p-6 rounded-2xl shadow-[0_0_30px_rgba(212,175,55,0.2)] max-w-sm relative overflow-hidden backdrop-blur-md">
        
        {/* Achtergrond Glow */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-museum-gold/20 rounded-full blur-3xl"></div>

        {/* Sluit knop (slaat huidige over, volgende komt direct) */}
        <button 
            onClick={() => setCurrentBadge(null)}
            className="absolute top-2 right-2 text-gray-400 hover:text-white p-1"
        >
            <X size={16} />
        </button>

        <div className="flex items-start gap-4 relative z-10">
            <div className="bg-museum-gold/10 p-3 rounded-full border border-museum-gold/20 text-museum-gold">
                <Trophy size={32} />
            </div>
            <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-museum-gold mb-1">Nieuwe Badge Verdiend!</h4>
                <h3 className="text-xl font-serif font-bold mb-1">{currentBadge.name}</h3>
                <p className="text-sm text-gray-400">{currentBadge.description}</p>
            </div>
        </div>
        
        {/* Footer info */}
        <div className="mt-4 pt-3 border-t border-white/10 flex justify-between items-center text-xs font-bold text-gray-300">
            {badgeQueue.length > 0 ? (
                <span className="flex items-center gap-1 text-museum-gold animate-pulse">
                   Nog {badgeQueue.length} te gaan... <ArrowRight size={12}/>
                </span>
            ) : (
                <span>Bekijk in profiel</span>
            )}
            <span className="text-museum-gold">+ {currentBadge.xp_reward || 50} XP</span>
        </div>
      </div>
    </div>
  );
}
