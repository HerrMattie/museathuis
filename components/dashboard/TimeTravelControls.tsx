'use client';

import { ChevronLeft, ChevronRight, Lock, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { canUnlock } from '@/lib/unlocks';
import { useState } from 'react';

type Props = {
  currentDate: string; // YYYY-MM-DD
  userLevel: number;
};

export default function TimeTravelControls({ currentDate, userLevel }: Props) {
  const router = useRouter();
  const [showLockMsg, setShowLockMsg] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const isToday = currentDate === today;
  
  // Bereken gisteren en morgen
  const curr = new Date(currentDate);
  const prevDate = new Date(curr); prevDate.setDate(curr.getDate() - 1);
  const nextDate = new Date(curr); nextDate.setDate(curr.getDate() + 1);
  
  const prevStr = prevDate.toISOString().split('T')[0];
  const nextStr = nextDate.toISOString().split('T')[0];

  // CHECK: Mag deze user tijdreizen?
  const hasAccess = canUnlock('time_travel_3', userLevel);

  // Als je te ver terug wilt (bijv. 4 dagen) terwijl je maar 3 dagen mag, zou je hier extra checks kunnen doen.
  // Voor nu is het een simpele Ja/Nee op de feature.

  const handlePrev = () => {
    if (hasAccess) {
      router.push(`/?date=${prevStr}`);
    } else {
      setShowLockMsg(true);
      setTimeout(() => setShowLockMsg(false), 3000);
    }
  };

  const handleNext = () => {
    // Naar de toekomst reizen kan nooit verder dan vandaag
    if (!isToday) {
      router.push(`/?date=${nextStr}`);
    }
  };

  // Formatteer de datum mooi (bijv. "maandag 12 oktober")
  const displayDate = new Date(currentDate).toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="flex flex-col items-center mb-8 relative">
      <div className="flex items-center gap-6 bg-white/5 border border-white/10 rounded-full px-6 py-2 backdrop-blur-md">
        
        {/* VORIGE KNOP */}
        <button 
          onClick={handlePrev}
          className={`p-2 rounded-full transition-colors ${hasAccess ? 'hover:bg-white/10 text-white' : 'text-gray-600 cursor-not-allowed'}`}
        >
          {hasAccess ? <ChevronLeft size={20} /> : <Lock size={16} />}
        </button>

        {/* DATUM DISPLAY */}
        <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-museum-gold min-w-[150px] justify-center">
          <Calendar size={14} /> {isToday ? 'Vandaag' : displayDate}
        </div>

        {/* VOLGENDE KNOP */}
        <button 
          onClick={handleNext}
          disabled={isToday}
          className={`p-2 rounded-full transition-colors ${isToday ? 'text-gray-700 cursor-default' : 'hover:bg-white/10 text-white'}`}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* LOCK MELDING (Foutboodschap) */}
      {showLockMsg && (
        <div className="absolute top-14 bg-red-500/90 text-white text-xs px-4 py-2 rounded-lg shadow-lg animate-in fade-in slide-in-from-top-2">
          🔒 Time Travel is beschikbaar vanaf <strong>Level 10</strong>.
        </div>
      )}
    </div>
  );
}
