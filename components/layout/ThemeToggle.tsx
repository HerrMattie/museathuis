'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle() {
  // We beginnen met 'true' (Donker) als default state om flikkering te voorkomen
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Check of de gebruiker al een voorkeur had
    const savedTheme = localStorage.getItem('theme');
    
    // LOGICA: Als er 'dark' is opgeslagen OF de gebruiker is nieuw (null) -> Zet Nachtmodus aan
    if (savedTheme === 'dark' || !savedTheme) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      // Schakel naar DAG (Wit met blauwe letters)
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      // Schakel naar NACHT (Blauw met witte letters)
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full border border-white/10 bg-white/5 hover:bg-museum-gold hover:text-black transition-all duration-300 group"
      title={isDark ? "Zet licht aan" : "Zet licht uit"}
    >
      {isDark ? (
        // Icoontje voor als het DONKER is (laat een Zon zien om naar licht te gaan)
        <Sun size={20} className="text-white group-hover:text-black group-hover:rotate-90 transition-transform duration-500" />
      ) : (
        // Icoontje voor als het LICHT is (laat een Maan zien om naar donker te gaan)
        // Let op: text-midnight-950 zorgt dat het maantje zichtbaar is op de witte achtergrond
        <Moon size={20} className="text-midnight-950 group-hover:text-black group-hover:-rotate-12 transition-transform duration-500" />
      )}
    </button>
  );
}
