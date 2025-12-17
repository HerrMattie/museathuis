'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { Award, X, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PopupState {
  visible: boolean;
  type: 'badge' | 'level';
  title: string;
  subtitle: string;
  icon?: string; // Voor badge icoon naam
}

export default function AchievementPopup() {
  const [popup, setPopup] = useState<PopupState>({ visible: false, type: 'badge', title: '', subtitle: '' });
  const supabase = createClient();

  useEffect(() => {
    // 1. Haal User ID op
    let userId = '';
    const init = async () => {
        const { data } = await supabase.auth.getUser();
        if (data.user) userId = data.user.id;
    };
    init();

    // 2. Luister naar Database Veranderingen
    const channel = supabase.channel('achievements')
      
      // A. NIEUWE BADGE (Luister naar INSERT op user_badges)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'user_badges' },
        async (payload) => {
          if (payload.new.user_id !== userId) return; // Alleen voor mijzelf

          // Haal badge info op (naam, icon)
          const { data: badge } = await supabase
            .from('badges')
            .select('name, description, icon_name')
            .eq('id', payload.new.badge_id)
            .single();

          if (badge) {
            triggerPopup({
                type: 'badge',
                title: 'Nieuwe Badge!',
                subtitle: badge.name,
                icon: badge.icon_name
            });
            fireConfetti();
          }
        }
      )
      // B. LEVEL UP (Luister naar UPDATE op user_profiles)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'user_profiles' },
        (payload) => {
           if (payload.new.user_id !== userId) return;

           // Check of level omhoog is gegaan
           if (payload.new.level > payload.old.level) {
               triggerPopup({
                   type: 'level',
                   title: 'Level Omhoog!',
                   subtitle: `Je bent nu level ${payload.new.level}: ${payload.new.role || 'Kunstkenner'}`,
               });
               fireConfetti();
           }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const triggerPopup = (data: Omit<PopupState, 'visible'>) => {
      setPopup({ ...data, visible: true });
      // Geluidje afspelen? (Optioneel)
      // const audio = new Audio('/sounds/success.mp3');
      // audio.play().catch(() => {}); // Catch error als browser auto-play blokkeert
      
      // Verberg na 5 seconden
      setTimeout(() => {
          setPopup(prev => ({ ...prev, visible: false }));
      }, 5000);
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

  if (!popup.visible) return null;

  return (
    <div className="fixed top-24 right-6 z-50 animate-in slide-in-from-right-full duration-500 fade-in">
        <div className="relative bg-midnight-900/90 backdrop-blur-md border border-museum-gold rounded-xl p-4 shadow-[0_0_30px_-5px_rgba(234,179,8,0.3)] flex items-center gap-4 max-w-sm pr-10">
            
            {/* Icoon Links */}
            <div className="w-12 h-12 rounded-full bg-museum-gold flex items-center justify-center text-black shrink-0 shadow-lg shadow-museum-gold/20">
                {popup.type === 'badge' ? <Award size={24} /> : <Zap size={24} fill="black"/>}
            </div>

            {/* Tekst */}
            <div>
                <h4 className="text-museum-gold font-bold uppercase tracking-wider text-xs mb-1">
                    {popup.title}
                </h4>
                <p className="text-white font-serif font-bold text-lg leading-tight">
                    {popup.subtitle}
                </p>
            </div>

            {/* Sluit Knop */}
            <button 
                onClick={() => setPopup(prev => ({ ...prev, visible: false }))}
                className="absolute top-2 right-2 text-gray-500 hover:text-white"
            >
                <X size={14}/>
            </button>
        </div>
    </div>
  );
}
