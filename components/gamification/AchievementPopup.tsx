'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { Award, X, Zap, Crown } from 'lucide-react';
import confetti from 'canvas-confetti';
import { getLevel } from '@/lib/levelSystem'; // We hebben de rekenmachine nodig!

interface PopupItem {
  id: string; // Unieke ID voor de queue key
  type: 'badge' | 'level';
  title: string;
  subtitle: string;
  icon?: string;
}

export default function AchievementPopup() {
  // We gebruiken een array als wachtrij
  const [queue, setQueue] = useState<PopupItem[]>([]);
  // Het item dat NU getoond wordt
  const [activeItem, setActiveItem] = useState<PopupItem | null>(null);
  
  const supabase = createClient();
  const processedRef = useRef<Set<string>>(new Set()); // Voorkom dubbele popups

  // 1. DATA LUISTEREN
  useEffect(() => {
    let userId = '';

    const init = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) userId = data.user.id;

      const channel = supabase.channel('achievements')
      
        // A. BADGES (INSERT op user_badges)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'user_badges' },
          async (payload) => {
            if (payload.new.user_id !== userId) return;

            // Voorkom dubbele verwerking
            const eventId = `badge-${payload.new.id}`;
            if (processedRef.current.has(eventId)) return;
            processedRef.current.add(eventId);

            // Haal badge details op
            const { data: badge } = await supabase
              .from('badges')
              .select('name, icon_name')
              .eq('id', payload.new.badge_id)
              .single();

            if (badge) {
              addToQueue({
                id: eventId,
                type: 'badge',
                title: 'Nieuwe Badge!',
                subtitle: badge.name,
                icon: badge.icon_name
              });
            }
          }
        )

        // B. LEVEL UP (UPDATE op user_profiles -> kijk naar XP)
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'user_profiles' },
          (payload) => {
            if (payload.new.user_id !== userId) return;

            // BEREKEN LEVELS OP BASIS VAN XP
            // We kijken niet naar payload.new.level, want dat staat niet in de DB
            const oldXp = payload.old.xp || 0;
            const newXp = payload.new.xp || 0;

            const oldLevelInfo = getLevel(oldXp);
            const newLevelInfo = getLevel(newXp);

            // Is het level gestegen?
            if (newLevelInfo.level > oldLevelInfo.level) {
               const eventId = `level-${newLevelInfo.level}`;
               if (processedRef.current.has(eventId)) return;
               processedRef.current.add(eventId);

               addToQueue({
                 id: eventId,
                 type: 'level',
                 title: 'Level Omhoog!',
                 subtitle: `Je bent nu Level ${newLevelInfo.level}: ${newLevelInfo.title}`,
               });
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    init();
  }, [supabase]);

  // 2. WACHTRIJ VERWERKER
  useEffect(() => {
    // Als er niets getoond wordt, en er staat iets in de rij -> Toon het
    if (!activeItem && queue.length > 0) {
      const nextItem = queue[0];
      setActiveItem(nextItem);
      fireConfetti();
      
      // Geluid (optioneel, browser policy kan dit blokkeren)
      // const audio = new Audio('/sounds/success.mp3');
      // audio.volume = 0.5;
      // audio.play().catch(() => {});

      // Verwijder uit wachtrij na 5 seconden (of animatie duur)
      const timer = setTimeout(() => {
        closePopup();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [activeItem, queue]);

  const addToQueue = (item: PopupItem) => {
    setQueue((prev) => [...prev, item]);
  };

  const closePopup = () => {
    setActiveItem(null);
    // Verwijder het eerste item uit de wachtrij zodat de volgende kan komen
    setQueue((prev) => prev.slice(1));
  };

  const fireConfetti = () => {
      const end = Date.now() + 1000;
      const colors = ['#EAB308', '#ffffff'];
      (function frame() {
        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors
        });
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors
        });
        if (Date.now() < end) requestAnimationFrame(frame);
      }());
  };

  if (!activeItem) return null;

  return (
    <div className="fixed top-24 right-6 z-[100] animate-in slide-in-from-right-full duration-500 fade-in">
        <div className="relative bg-midnight-900/95 backdrop-blur-md border border-museum-gold rounded-xl p-4 shadow-[0_0_30px_-5px_rgba(234,179,8,0.3)] flex items-center gap-4 max-w-sm pr-10">
            
            {/* Icoon Links */}
            <div className="w-12 h-12 rounded-full bg-museum-gold flex items-center justify-center text-black shrink-0 shadow-lg shadow-museum-gold/20">
                {activeItem.type === 'badge' ? <Award size={24} /> : <Crown size={24} fill="black"/>}
            </div>

            {/* Tekst */}
            <div>
                <h4 className="text-museum-gold font-bold uppercase tracking-wider text-xs mb-1">
                    {activeItem.title}
                </h4>
                <p className="text-white font-serif font-bold text-sm leading-tight">
                    {activeItem.subtitle}
                </p>
            </div>

            {/* Sluit Knop (Handmatig eerder sluiten) */}
            <button 
                onClick={closePopup}
                className="absolute top-2 right-2 text-gray-500 hover:text-white transition-colors"
            >
                <X size={14}/>
            </button>
            
            {/* Tijdlijn Balkje (optioneel, laat zien hoe lang hij nog blijft staan) */}
            <div className="absolute bottom-0 left-0 h-1 bg-museum-gold animate-[width_5s_linear_forwards]" style={{ width: '100%' }} />
        </div>
    </div>
  );
}
