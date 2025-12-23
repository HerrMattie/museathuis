'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { Award, X, Crown } from 'lucide-react';
import confetti from 'canvas-confetti';
import { getLevel } from '@/lib/levelSystem';

interface PopupItem {
  id: string; 
  type: 'badge' | 'level';
  title: string;
  subtitle: string;
}

export default function AchievementPopup() {
  const [queue, setQueue] = useState<PopupItem[]>([]);
  const [activeItem, setActiveItem] = useState<PopupItem | null>(null);
  
  // We onthouden het huidige level in het geheugen
  const currentLevelRef = useRef<number>(1);
  // We onthouden welke events we al gehad hebben om dubbele popups te voorkomen
  const processedRef = useRef<Set<string>>(new Set());
  
  const supabase = createClient();

  useEffect(() => {
    let userId = '';

    const init = async () => {
      // 1. Haal User & Start Level op (Nulmeting)
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
          userId = user.id;
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('xp')
            .eq('user_id', user.id)
            .single();
          
          if (profile) {
              const { level } = getLevel(profile.xp || 0);
              currentLevelRef.current = level;
          }
      }

      // 2. Start de Luisteraar
      const channel = supabase.channel('achievements')
      
        // A. BADGES (Nieuwe rij in user_badges)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'user_badges' },
          async (payload) => {
            if (payload.new.user_id !== userId) return;

            const eventId = `badge-${payload.new.id}`;
            if (processedRef.current.has(eventId)) return;
            processedRef.current.add(eventId);

            // Haal de mooie naam en icoon op uit de badges tabel
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
                subtitle: badge.name
              });
            }
          }
        )

        // B. LEVEL UP (Verandering in user_profiles)
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'user_profiles' },
          (payload) => {
            if (payload.new.user_id !== userId) return;

            // TRUC: Kijk naar de nieuwe XP en bereken het level
            const newXp = payload.new.xp || 0;
            const newLevelInfo = getLevel(newXp);
            
            // Vergelijk met wat we al wisten (currentLevelRef)
            if (newLevelInfo.level > currentLevelRef.current) {
               
               const eventId = `level-${newLevelInfo.level}`;
               
               // Voorkom dubbele meldingen voor hetzelfde level
               if (processedRef.current.has(eventId)) return;
               processedRef.current.add(eventId);

               // Update direct onze 'kennis' zodat we klaar zijn voor het volgende level
               currentLevelRef.current = newLevelInfo.level;

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

  // --- WACHTRIJ VERWERKER ---
  useEffect(() => {
    // Als er geen popup is, maar wel iets in de wachtrij -> Toon de volgende
    if (!activeItem && queue.length > 0) {
      const nextItem = queue[0];
      setActiveItem(nextItem);
      fireConfetti();
      
      // Sluit automatisch na 5 seconden
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
    setQueue((prev) => prev.slice(1)); // Verwijder de eerste uit de rij
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

  return (
    <div className="fixed top-24 right-6 z-[100] animate-in slide-in-from-right-full duration-500 fade-in">
        <div className="relative bg-midnight-900/95 backdrop-blur-md border border-museum-gold rounded-xl p-4 shadow-[0_0_30px_-5px_rgba(234,179,8,0.3)] flex items-center gap-4 max-w-sm pr-10">
            
            <div className="w-12 h-12 rounded-full bg-museum-gold flex items-center justify-center text-black shrink-0 shadow-lg shadow-museum-gold/20">
                {activeItem.type === 'badge' ? <Award size={24} /> : <Crown size={24} fill="black"/>}
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
