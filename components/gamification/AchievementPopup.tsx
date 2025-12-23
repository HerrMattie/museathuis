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
  
  // Ref om het level bij te houden zonder re-renders
  const currentLevelRef = useRef<number>(1);
  // Ref om te voorkomen dat we dezelfde event dubbel tonen
  const processedRef = useRef<Set<string>>(new Set());
  
  const supabase = createClient();

  useEffect(() => {
    let userId = '';

    const init = async () => {
      // 1. Haal User & Start Level op
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
          userId = user.id;
          
          // Haal huidige XP op om start-level te weten
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('xp')
            .eq('user_id', user.id)
            .single();
          
          if (profile) {
              const { level } = getLevel(profile.xp || 0);
              currentLevelRef.current = level;
              console.log(`🎯 [Popup Init] Start level is: ${level} (XP: ${profile.xp})`);
          }
      }

      // 2. Start de Luisteraar
      const channel = supabase.channel('achievements')
      
        // A. BADGES (INSERT) - Dit werkte al
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'user_badges' },
          async (payload) => {
            if (payload.new.user_id !== userId) return;

            console.log('🏅 [Realtime] Nieuwe Badge gedetecteerd:', payload.new);

            const eventId = `badge-${payload.new.id}`;
            if (processedRef.current.has(eventId)) return;
            processedRef.current.add(eventId);

            // Haal badge info op uit 'badges' tabel
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

        // B. LEVEL UP (UPDATE) - Dit was het probleem
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'user_profiles' },
          (payload) => {
            if (payload.new.user_id !== userId) return;

            console.log('📈 [Realtime] Profiel Update Ontvangen:', payload);

            // Bereken levels op basis van XP in de payload
            const oldXp = payload.old?.xp || 0; // Let op: payload.old is soms leeg in Supabase
            const newXp = payload.new.xp || 0;
            
            // Als payload.old leeg is, gebruiken we onze interne ref als fallback
            const oldLevelInfo = getLevel(oldXp);
            const newLevelInfo = getLevel(newXp);
            
            console.log(`📊 Check: XP ging van ${oldXp} naar ${newXp}. Level check: ${currentLevelRef.current} -> ${newLevelInfo.level}`);

            // Is het level hoger dan wat we wisten?
            if (newLevelInfo.level > currentLevelRef.current) {
               
               console.log('🚀 LEVEL UP GEDETECTEERD!');

               const eventId = `level-${newLevelInfo.level}`;
               if (processedRef.current.has(eventId)) return;
               processedRef.current.add(eventId);

               // Update direct onze ref zodat we niet dubbel triggeren
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
        .subscribe((status) => {
            console.log(`🔌 [Realtime] Status: ${status}`);
        });

      return () => {
        supabase.removeChannel(channel);
      };
    };

    init();
  }, [supabase]);

  // --- WACHTRIJ VERWERKER ---
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
