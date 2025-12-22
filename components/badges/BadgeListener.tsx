'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { Trophy, X } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function BadgeListener({ userId }: { userId: string }) {
  const [newBadge, setNewBadge] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    if (!userId) return;

    // 1. Abonneer op de 'user_badges' tabel
    const channel = supabase
      .channel('badge-popups')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_badges',
          filter: `user_id=eq.${userId}`, // BELANGRIJK: Luister alleen naar JE EIGEN badges
        },
        async (payload) => {
          // 2. Er is een badge verdiend! Haal de details op (naam, icon)
          const badgeId = payload.new.badge_id;
          
          const { data: badgeDetails } = await supabase
            .from('badges')
            .select('*')
            .eq('id', badgeId)
            .single();

          if (badgeDetails) {
            setNewBadge(badgeDetails);
            triggerConfetti();
            
            // Sluit automatisch na 5 seconden
            setTimeout(() => setNewBadge(null), 5000);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, supabase]);

  const triggerConfetti = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  };

  if (!newBadge) return null;

  return (
    <div className="fixed top-24 right-6 z-[100] animate-in slide-in-from-right-10 fade-in duration-500">
      <div className="bg-midnight-900 border border-museum-gold/50 text-white p-6 rounded-2xl shadow-[0_0_30px_rgba(212,175,55,0.2)] max-w-sm relative overflow-hidden">
        
        {/* Achtergrond Glow */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-museum-gold/20 rounded-full blur-3xl"></div>

        <button 
            onClick={() => setNewBadge(null)}
            className="absolute top-2 right-2 text-gray-400 hover:text-white"
        >
            <X size={16} />
        </button>

        <div className="flex items-start gap-4 relative z-10">
            <div className="bg-museum-gold/10 p-3 rounded-full border border-museum-gold/20 text-museum-gold">
                <Trophy size={32} />
            </div>
            <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-museum-gold mb-1">Nieuwe Badge Verdiend!</h4>
                <h3 className="text-xl font-serif font-bold mb-1">{newBadge.name}</h3>
                <p className="text-sm text-gray-400">{newBadge.description}</p>
            </div>
        </div>
        
        {/* XP Beloning */}
        <div className="mt-4 pt-3 border-t border-white/10 flex justify-between items-center text-xs font-bold text-gray-300">
            <span>Bekijk in profiel</span>
            <span className="text-museum-gold">+ {newBadge.xp_reward || 50} XP</span>
        </div>
      </div>
    </div>
  );
}
