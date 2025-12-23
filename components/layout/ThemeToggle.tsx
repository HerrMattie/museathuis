'use client';

import { useState, useEffect } from 'react';
import { Moon, Sun, Lock } from 'lucide-react';
import { PERMISSIONS } from '@/lib/permissions';
import { createClient } from '@/lib/supabaseClient';
import { getLevel } from '@/lib/levelSystem';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(true); // Default dark in MuseaThuis
  const [canToggle, setCanToggle] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    // Check permissies bij laden
    const checkAccess = async () => {
       const { data: { user } } = await supabase.auth.getUser();
       if (user) {
           const { data: profile } = await supabase.from('user_profiles').select('xp, is_premium').eq('user_id', user.id).single();
           if (profile) {
               const { level } = getLevel(profile.xp || 0);
               // Mag je Dark Mode (of eigenlijk Light Mode toggle) gebruiken?
               setCanToggle(PERMISSIONS.canUseDarkMode(level, profile.is_premium || false));
           }
       }
    };
    checkAccess();
  }, []);

  const toggleTheme = () => {
      if (!canToggle) {
          setShowTooltip(true);
          setTimeout(() => setShowTooltip(false), 3000);
          return;
      }
      
      setIsDark(!isDark);
      // Hier zou je document.documentElement.classList.toggle('light') doen
      // Of je global CSS aanpassen. Voor nu is het een visual toggle.
      alert("Nachtwacht Modus geactiveerd! (UI update vereist)"); 
  };

  return (
    <div className="relative">
        <button 
            onClick={toggleTheme}
            className={`p-2 rounded-full border border-white/10 transition-colors ${canToggle ? 'bg-white/5 hover:bg-white/10 text-museum-gold' : 'bg-transparent text-gray-600 cursor-not-allowed'}`}
        >
            {isDark ? <Moon size={20}/> : <Sun size={20}/>}
            {!canToggle && (
                <div className="absolute -top-1 -right-1 bg-black rounded-full p-0.5 border border-gray-700">
                    <Lock size={10} className="text-gray-500"/>
                </div>
            )}
        </button>

        {showTooltip && (
            <div className="absolute right-0 top-12 w-48 bg-black/90 border border-white/20 text-white text-xs p-2 rounded shadow-xl z-50">
                🔒 Bereik <strong>Level 18 (Estheet)</strong> om de lichtschakelaar te bedienen.
            </div>
        )}
    </div>
  );
}
