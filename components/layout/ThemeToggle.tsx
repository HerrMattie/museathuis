'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // 1. Check bij laden wat de instelling is
    const savedTheme = localStorage.getItem('theme');
    
    // Als er 'dark' is opgeslagen OF als er niks is opgeslagen (default dark)
    if (savedTheme === 'dark' || (!savedTheme)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      // Switch naar Licht
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      // Switch naar Donker
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full border border-white/10 bg-white/5 hover:bg-museum-gold hover:text-black transition-all duration-300 group"
      title={isDark ? "Wissel naar lichte modus" : "Wissel naar donkere modus"}
    >
      {isDark ? (
        <Sun size={20} className="group-hover:rotate-90 transition-transform duration-500" />
      ) : (
        <Moon size={20} className="group-hover:-rotate-12 transition-transform duration-500" />
      )}
    </button>
  );
}
