'use client';
import { Lock } from 'lucide-react';

interface LockedInputProps {
    level: number;
    requiredLevel: number;
    label: string;
    children: React.ReactNode;
}

export default function LockedInput({ level, requiredLevel, label, children }: LockedInputProps) {
  // Als level hoog genoeg is, toon gewoon het veld
  if (level >= requiredLevel) {
    return (
        <div className="mb-6">
            <label className="block text-xs font-bold uppercase text-gray-400 mb-2">{label}</label>
            {children}
        </div>
    );
  }

  // De "Locked" staat
  return (
    <div className="mb-6 opacity-60 relative group cursor-not-allowed select-none">
      <div className="flex justify-between items-center mb-2">
        <label className="block text-xs font-bold uppercase text-gray-500">{label}</label>
        <span className="text-[10px] bg-black/40 px-2 py-0.5 rounded text-museum-gold flex items-center gap-1">
            <Lock size={10} /> Lvl {requiredLevel}
        </span>
      </div>
      
      {/* Fake input look */}
      <div className="bg-midnight-900/50 border border-white/5 rounded-xl p-3 text-gray-600 italic flex items-center justify-between">
        <span>Nog niet beschikbaar</span>
        <Lock size={16} className="text-gray-700" />
      </div>

      {/* Tooltip on hover */}
      <div className="absolute -top-8 right-0 hidden group-hover:block bg-black text-white text-xs p-2 rounded shadow-xl border border-white/20 z-10 whitespace-nowrap">
        Bereik Level {requiredLevel} om dit veld te ontgrendelen!
      </div>
    </div>
  );
}
