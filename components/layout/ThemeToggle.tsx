'use client';

import { useState, useEffect } from 'react';
import { Moon, Sun, Lock } from 'lucide-react';
import { PERMISSIONS } from '@/lib/permissions';
import { createClient } from '@/lib/supabaseClient';
import { getLevel } from '@/lib/levelSystem';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);
  const [canToggle, setCanToggle] = useState(false);
  const [userLevel, setUserLevel] = useState(1); // Houden we bij voor de melding
  const supabase = createClient();

  useEffect(() => {
    const checkAccess = async () => {
       const { data: { user } } = await supabase.auth.getUser();
       if (user) {
           const { data: profile } = await supabase.from('user_profiles').select('xp, is_premium').eq('user_id', user.id).single();
           if (profile) {
               const { level } = getLevel(profile.xp || 0);
               setUserLevel(level);
               setCanToggle(PERMISSIONS.canUseDarkMode(level, profile.is_premium || false));
           }
       }
    };
    checkAccess();

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        setIsDark(false);
        document.documentElement.classList.add('light-mode');
    }
  }, []);

  const toggleTheme = () => {
      // HARDE FEEDBACK ALS HET NIET MAG
      if (!canToggle) {
          alert(`⛔️ Functie vergrendeld!\n\nJe bent nu Level ${userLevel}. Bereik Level 18 (Estheet) om de Nachtwacht Modus te ontgrendelen.`);
          return;
      }
      
      if (isDark) {
          document.documentElement.classList.add('light-mode');
          localStorage.setItem('theme', 'light');
          setIsDark(false);
      } else {
          document.documentElement.classList.remove('light-mode');
          localStorage.setItem('theme', 'dark');
          setIsDark(true);
      }
  };

  return (
    <div className="relative group">
        <button 
            onClick={toggleTheme}
            className={`p-2 rounded-full border transition-all duration-300 relative ${
                canToggle 
                ? 'bg-white/5 border-white/10 hover:bg-white/10 text-museum-gold hover:scale-110' 
                : 'bg-black/40 border-white/5 text-gray-700 cursor-not-allowed opacity-70'
            }`}
        >
            {isDark ? <Moon size={20}/> : <Sun size={20}/>}
            
            {!canToggle && (
                <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg border border-black animate-pulse">
                    <Lock size={10} strokeWidth={3}/>
                </div>
            )}
        </button>
    </div>
  );
}
