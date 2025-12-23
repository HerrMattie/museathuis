'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { Award, X, Crown, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import { getLevel } from '@/lib/levelSystem';

interface PopupItem {
  id: string;
  type: 'badge' | 'level';
  title: string;
  subtitle: string;
  icon?: any;
}

export default function AchievementPopup() {
  const [queue, setQueue] = useState<PopupItem[]>([]);
  const [activeItem, setActiveItem] = useState<PopupItem | null>(null);
  
  // We houden het huidige level bij in een Ref (zodat het niet reset bij renders)
  const currentLevelRef = useRef<number>(1);
  const processedRef = useRef<Set<string>>(new Set());
  
  const supabase = createClient();

  useEffect(() => {
    let userId = '';

    const init = async () => {
      // 1. INIT: Haal gebruiker en huidig level op
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      userId = user.id;

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('xp')
        .eq('user_id', userId)
        .single();
      
      if (profile) {
          const { level } = getLevel(profile.xp || 0);
          currentLevelRef.current = level;
          console.log(`🎮 [Popup Init] Huidig Level: ${level} (XP: ${profile.xp})`);
      }

      // 2. REALTIME LUISTEREN
      const channel = supabase.channel('global-achievements')
      
        // --- A. BADGES (Werkt al goed) ---
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'user_badges' },
          async (payload) => {
            if (payload.new.user_id !== userId) return;
            console.log('🏅 [Badge Event] Nieuwe badge ontvangen!');

            const eventId = `badge-${payload.new.id}`;
            if (processedRef.current.has(eventId)) return;
            processedRef.current.add(eventId);

            // Haal badge details op
            const { data: badge } = await supabase
              .from('badges')
              .select('name')
              .eq('id', payload.new.badge_id)
              .single();

            if (badge) {
              addToQueue({
                id: eventId,
                type: 'badge',
                title: 'Nieuwe Badge!',
                subtitle: badge.name,
                icon: Award
              });
            }
          }
        )

        // --- B. LEVELS (De fix) ---
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'user_profiles' },
          (payload) => {
            // Check of het over MIJ gaat
            if (payload.new.user_id !== userId) return;

            // 1. Wat is de nieuwe XP?
            const newXp = payload.new.xp;
            
            // 2. Bereken het nieuwe level met je rekenmachine
            const { level: newLevel, title: newTitle } = getLevel(newXp);

            console.log(`📈 [XP Update] XP is nu ${newXp}. Berekend Level: ${newLevel}. Oude Ref Level: ${currentLevelRef.current}`);

            // 3. De VERGELIJKING: Is het nieuwe level HOGER dan wat we wisten?
            if (newLevel > currentLevelRef.current) {
                console.log('🚀 LEVEL UP GEDETECTEERD! Toevoegen aan wachtrij...');
                
                const eventId = `level-${newLevel}`;
                if (processedRef.current.has(eventId)) return;
                processedRef.current.add(eventId);

                // Update direct onze ref, zodat we niet nog eens triggeren
                currentLevelRef.current = newLevel;

                addToQueue({
                    id: eventId,
                    type: 'level',
                    title: 'Level Omhoog!',
                    subtitle: `Level ${newLevel}: ${newTitle}`,
                    icon: Crown
                });
            }
          }
        )
        .subscribe((status) => {
            console.log(`🔌 [Supabase Status] ${status}`);
        });

      return () => {
        supabase.removeChannel(channel);
      };
    };

    init();
  }, [supabase]);

  // --- WACHTRIJ VERWERKING (Identiek voor beide) ---
  useEffect(() => {
    if (!activeItem && queue.length > 0) {
      const nextItem = queue[0];
      setActiveItem(nextItem);
      fireConfetti();
      
      // Sluit na 5 seconden
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
    setQueue((prev) => prev.slice(1));
  };

  const fireConfetti = () => {
      const end = Date.now() + 1000;
      const colors = ['#EAB308', '#ffffff'];
      (function frame() {
        confetti({ particleCount: 2, angle: 60, spread: 55, origin: { x: 0 }, colors });
        confetti({ particleCount: 2, angle: 120, spread: 55, origin: { x: 1 }, colors });
        if (Date.now() < end) requestAnimationFrame(frame);
      }());
  };

  if (!activeItem) return null;

  const Icon = activeItem.icon || Zap;

  return (
    <div className="fixed top-24 right-6 z-[100] animate-in slide-in-from-right-full duration-500 fade-in">
        <div className="relative bg-midnight-900/95 backdrop-blur-md border border-museum-gold rounded-xl p-4 shadow-[0_0_30px_-5px_rgba(234,179,8,0.3)] flex items-center gap-4 max-w-sm pr-10">
            
            <div className="w-12 h-12 rounded-full bg-museum-gold flex items-center justify-center text-black shrink-0 shadow-lg shadow-museum-gold/20">
                <Icon size={24} strokeWidth={2.5} />
            </div>

            <div>
                <h4 className="text-museum-gold font-bold uppercase tracking-wider text-xs mb-1">
                    {activeItem.title}
                </h4>
                <p className="text-white font-serif font-bold text-sm leading-tight">
                    {activeItem.subtitle}
                </p>
            </div>

            <button 
                onClick={closePopup}
                className="absolute top-2 right-2 text-gray-500 hover:text-white transition-colors"
            >
                <X size={14}/>
            </button>
            
            {/* Tijdlijn Balkje */}
            <div className="absolute bottom-0 left-0 h-1 bg-museum-gold animate-[width_5s_linear_forwards]" style={{ width: '100%' }} />
        </div>
    </div>
  );
}
