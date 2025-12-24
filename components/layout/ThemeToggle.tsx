'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Zorg dat we pas renderen als de pagina geladen is (voorkomt hydration errors)
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Toon een lege placeholder van dezelfde grootte om verspringen te voorkomen
    return <div className="w-9 h-9" />; 
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="p-2 rounded-full border border-white/10 bg-white/5 hover:bg-museum-gold hover:text-black transition-all duration-300 group"
      title={isDark ? "Zet licht aan" : "Zet licht uit"}
      aria-label="Wissel thema"
    >
      {isDark ? (
        // Icoontje voor als het DONKER is (laat een Zon zien)
        <Sun size={20} className="text-white group-hover:text-black group-hover:rotate-90 transition-transform duration-500" />
      ) : (
        // Icoontje voor als het LICHT is (laat een Maan zien)
        <Moon size={20} className="text-midnight-950 group-hover:text-black group-hover:-rotate-12 transition-transform duration-500" />
      )}
    </button>
  );
}
