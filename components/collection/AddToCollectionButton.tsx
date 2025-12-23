'use client';

import { ChevronLeft, ChevronRight, Lock, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { PERMISSIONS } from '@/lib/permissions'; // Zorg dat dit pad klopt

type Props = {
  currentDate: string; // YYYY-MM-DD
  userLevel: number;
  isPremium?: boolean; // Voeg dit toe als prop in je Dashboard page!
};

export default function TimeTravelControls({ currentDate, userLevel, isPremium = false }: Props) {
  const router = useRouter();
  const [showLockMsg, setShowLockMsg] = useState(false);

  const today = new Date();
  today.setHours(0,0,0,0);
  
  const curr = new Date(currentDate);
  curr.setHours(0,0,0,0);

  const isToday = curr.getTime() === today.getTime();
  
  // Bereken gisteren en morgen
  const prevDate = new Date(curr); prevDate.setDate(curr.getDate() - 1);
  const nextDate = new Date(curr); nextDate.setDate(curr.getDate() + 1);
  
  const prevStr = prevDate.toISOString().split('T')[0];
  const nextStr = nextDate.toISOString().split('T')[0];

  // --- PERMISSIE LOGICA ---
  // Hoeveel dagen mag deze gebruiker terug in de tijd?
  const allowedHistoryDays = PERMISSIONS.getHistoryDays(userLevel, isPremium);
  
  // Hoeveel dagen is de 'vorige' datum geleden?
  const diffTime = Math.abs(today.getTime() - prevDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

  // Mag je naar 'vorige'?
  // Ja, als de diffDays kleiner of gelijk is aan wat je mag.
  const canGoBack = diffDays <= allowedHistoryDays;

  const handlePrev = () => {
    if (canGoBack) {
      router.push(`/?date=${prevStr}`);
    } else {
      setShowLockMsg(true);
      setTimeout(() => setShowLockMsg(false), 3000);
    }
  };

  const handleNext = () => {
    if (!isToday) {
      router.push(`/?date=${nextStr}`);
    }
  };

  const displayDate = curr.toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="flex flex-col items-center mb-8 relative z-20">
      <div className="flex items-center gap-6 bg-white/5 border border-white/10 rounded-full px-6 py-2 backdrop-blur-md">
        
        {/* VORIGE KNOP */}
        <button 
          onClick={handlePrev}
          className={`p-2 rounded-full transition-colors ${canGoBack ? 'hover:bg-white/10 text-white' : 'text-gray-600 cursor-not-allowed'}`}
        >
          {canGoBack ? <ChevronLeft size={20} /> : <Lock size={16} />}
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

      {/* LOCK MELDING */}
      {showLockMsg && (
        <div className="absolute top-14 bg-red-500/90 text-white text-xs px-4 py-2 rounded-lg shadow-lg animate-in fade-in slide-in-from-top-2 w-64 text-center">
          🔒 Je hebt je limiet bereikt.<br/>
          Level up naar <strong>Historicus</strong> (Lvl 12) voor 7 dagen historie!
        </div>
      )}
    </div>
  );
}
