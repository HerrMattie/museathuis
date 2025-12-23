'use client';

import { useState, useEffect } from 'react';
import { Moon, Sun, Lock } from 'lucide-react';
import { PERMISSIONS } from '@/lib/permissions';
import { createClient } from '@/lib/supabaseClient';
import { getLevel } from '@/lib/levelSystem';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);
  const [canToggle, setCanToggle] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    // 1. Check permissies (Level 18+)
    const checkAccess = async () => {
       const { data: { user } } = await supabase.auth.getUser();
       if (user) {
           const { data: profile } = await supabase.from('user_profiles').select('xp, is_premium').eq('user_id', user.id).single();
           if (profile) {
               const { level } = getLevel(profile.xp || 0);
               setCanToggle(PERMISSIONS.canUseDarkMode(level, profile.is_premium || false));
           }
       }
    };
    checkAccess();

    // 2. Check of de gebruiker al eerder light mode had gekozen
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        setIsDark(false);
        document.documentElement.classList.add('light-mode');
    }
  }, []);

  const toggleTheme = () => {
      if (!canToggle) {
          setShowTooltip(true);
          setTimeout(() => setShowTooltip(false), 3000);
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
    <div className="relative">
        <button 
            onClick={toggleTheme}
            className={`p-2 rounded-full border transition-colors ${
                canToggle 
                ? 'bg-white/5 border-white/10 hover:bg-white/10 text-museum-gold' 
                : 'bg-transparent border-transparent text-gray-600 cursor-not-allowed'
            }`}
            title={canToggle ? "Wissel Dag/Nacht" : "Nog niet beschikbaar"}
        >
            {isDark ? <Moon size={20}/> : <Sun size={20}/>}
            
            {!canToggle && (
                <div className="absolute -top-1 -right-1 bg-black rounded-full p-0.5 border border-gray-700">
                    <Lock size={10} className="text-gray-500"/>
                </div>
            )}
        </button>

        {showTooltip && (
            <div className="absolute right-0 top-12 w-48 bg-black/90 border border-white/20 text-white text-xs p-3 rounded-xl shadow-xl z-50">
                <p className="font-bold text-museum-gold mb-1">🔒 Functie Vergrendeld</p>
                Bereik <strong>Level 18 (Estheet)</strong> om het licht aan te doen.
            </div>
        )}
    </div>
  );
}
