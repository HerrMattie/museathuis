'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { Crown, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { getLevel } from '@/lib/levelSystem'; // Zorg dat deze import klopt, of kopieer de logica

export default function LevelUpListener({ userId }: { userId: string }) {
  const [showPopup, setShowPopup] = useState(false);
  const [newLevel, setNewLevel] = useState<any>(null);
  const previousLevelRef = useRef<number>(0);
  const supabase = createClient();

  // Helper om XP en Level te berekenen
  const calculateCurrentLevel = async () => {
      const { count: actionCount } = await supabase.from('user_activity_logs').select('*', { count: 'exact', head: true }).eq('user_id', userId);
      const { count: favCount } = await supabase.from('favorites').select('*', { count: 'exact', head: true }).eq('user_id', userId);
      
      const xp = ((actionCount || 0) * 15) + ((favCount || 0) * 50);
      return getLevel(xp); // Geeft { level: 1, title: 'Novice' } terug
  };

  useEffect(() => {
    if (!userId) return;

    // 1. Initialiseer huidig level (zonder popup)
    calculateCurrentLevel().then(lvl => {
        previousLevelRef.current = lvl.level;
    });

    // 2. Luister naar acties (die XP geven)
    const channel = supabase
      .channel('level-tracker')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'user_activity_logs', filter: `user_id=eq.${userId}` }, 
        async () => {
            const currentData = await calculateCurrentLevel();
            
            // Als het nieuwe level hoger is dan het oude -> LEVEL UP!
            if (currentData.level > previousLevelRef.current) {
                previousLevelRef.current = currentData.level;
                setNewLevel(currentData);
                setShowPopup(true);
                triggerConfetti();
            }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  const triggerConfetti = () => {
    const duration = 3000;
    const end = Date.now() + duration;
    (function frame() {
      confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 } });
      confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 } });
      if (Date.now() < end) requestAnimationFrame(frame);
    }());
  };

  if (!showPopup || !newLevel) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in zoom-in duration-300">
        <div className="bg-gradient-to-br from-museum-gold to-yellow-600 p-1 rounded-3xl shadow-2xl max-w-sm w-full relative">
            <button onClick={() => setShowPopup(false)} className="absolute top-4 right-4 text-black/50 hover:text-black bg-white/20 rounded-full p-1"><X size={20}/></button>
            
            <div className="bg-midnight-950 rounded-[22px] p-8 text-center text-white relative overflow-hidden">
                {/* Glow effect */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-museum-gold/40 blur-[50px]"></div>
                
                <Crown size={64} className="mx-auto text-museum-gold mb-6 relative z-10 animate-bounce" />
                
                <h2 className="text-3xl font-serif font-bold text-museum-gold mb-2">Level Up!</h2>
                <p className="text-gray-300 mb-6">Gefeliciteerd, je bent gestegen naar level {newLevel.level}.</p>
                
                <div className="bg-white/10 border border-white/10 rounded-xl p-4 mb-6">
                    <span className="block text-xs uppercase tracking-widest text-gray-400 mb-1">Nieuwe Titel</span>
                    <span className="text-2xl font-bold text-white">{newLevel.title || `Kunstkenner Lvl ${newLevel.level}`}</span>
                </div>

                <button onClick={() => setShowPopup(false)} className="w-full py-3 bg-museum-gold text-black font-bold rounded-xl hover:bg-yellow-400 transition-colors">
                    Geweldig!
                </button>
            </div>
        </div>
    </div>
  );
}
