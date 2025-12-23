'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { Award, X, Zap, Crown } from 'lucide-react';
import confetti from 'canvas-confetti';
import { getLevel } from '@/lib/levelSystem';

interface PopupItem {
  id: string; 
  type: 'badge' | 'level';
  title: string;
  subtitle: string;
  icon?: string;
}

export default function AchievementPopup() {
  const [queue, setQueue] = useState<PopupItem[]>([]);
  const [activeItem, setActiveItem] = useState<PopupItem | null>(null);
  
  // We gebruiken een ref om het huidige level bij te houden zonder re-renders
  const currentLevelRef = useRef<number>(1);
  const processedRef = useRef<Set<string>>(new Set());
  
  const supabase = createClient();

  useEffect(() => {
    let userId = '';

    const init = async () => {
      // 1. Haal User & Huidig Level op (zodat we een startpunt hebben)
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
              currentLevelRef.current = level; // Sla startlevel op (bijv. 1)
          }
      }

      // 2. Start de Luisteraar
      const channel = supabase.channel('achievements')
      
        // A. BADGES (INSERT)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'user_badges' },
          async (payload) => {
            if (payload.new.user_id !== userId) return;

            const eventId = `badge-${payload.new.id}`;
            if (processedRef.current.has(eventId)) return;
            processedRef.current.add(eventId);

            // Haal badge info op
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
                icon: badge.icon_name // Zorg dat dit matcht met je DB kolom
              });
            }
          }
        )

        // B. LEVEL UP (UPDATE)
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'user_profiles' },
          (payload) => {
            if (payload.new.user_id !== userId) return;

            // Nieuwe XP uit de payload halen
            const newXp = payload.new.xp || 0;
            const newLevelInfo = getLevel(newXp);
            
            // Vergelijk met wat we AL WISTEN (currentLevelRef)
            // Dit is veiliger dan payload.old gebruiken
            if (newLevelInfo.level > currentLevelRef.current) {
               
               const eventId = `level-${newLevelInfo.level}`;
               if (processedRef.current.has(eventId)) return;
               processedRef.current.add(eventId);

               // Update onze ref zodat we niet nog eens triggeren voor dit level
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

  // --- WACHTRIJ LOGICA (Hetzelfde als voorheen) ---
  useEffect(() => {
    if (!activeItem && queue.length > 0) {
      const nextItem = queue[0];
      setActiveItem(nextItem);
      fireConfetti();
      
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

  return (
    <div className="fixed top-24 right-6 z-[100] animate-in slide-in-from-right-full duration-500 fade-in">
        <div className="relative bg-midnight-900/95 backdrop-blur-md border border-museum-gold rounded-xl p-4 shadow-[0_0_30px_-5px_rgba(234,179,8,0.3)] flex items-center gap-4 max-w-sm pr-10">
            <div className="w-12 h-12 rounded-full bg-museum-gold flex items-center justify-center text-black shrink-0 shadow-lg shadow-museum-gold/20">
                {activeItem.type === 'badge' ? <Award size={24} /> : <Crown size={24} fill="black"/>}
            </div>
            <div>
                <h4 className="text-museum-gold font-bold uppercase tracking-wider text-xs mb-1">{activeItem.title}</h4>
                <p className="text-white font-serif font-bold text-sm leading-tight">{activeItem.subtitle}</p>
            </div>
            <button onClick={closePopup} className="absolute top-2 right-2 text-gray-500 hover:text-white transition-colors"><X size={14}/></button>
            <div className="absolute bottom-0 left-0 h-1 bg-museum-gold animate-[width_5s_linear_forwards]" style={{ width: '100%' }} />
        </div>
    </div>
  );
}
