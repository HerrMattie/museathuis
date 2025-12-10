'use client';

import { Trophy, Lock, Unlock } from 'lucide-react';
import { getLevel } from '@/lib/levelSystem';

export default function LevelCard({ userProfile, stats }: { userProfile: any, stats: any }) {
    // XP Simulatie (of haal uit DB)
    const xp = (stats?.total_actions * 15) + (stats?.fav_count * 50) || 0; 
    
    const { level, title, nextLevelXp, progress, nextReward } = getLevel(xp);

    // Bepaal randkleur op basis van level (Fase 2, 4, 5)
    let borderColor = 'border-white/20'; // Standaard
    if (level >= 50) borderColor = 'border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)]'; // Diamant
    else if (level >= 40) borderColor = 'border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.5)]'; // Goud
    else if (level >= 20) borderColor = 'border-slate-300 shadow-[0_0_15px_rgba(203,213,225,0.5)]'; // Zilver
    else if (level >= 5) borderColor = 'border-orange-400'; // Brons

    return (
        <div className="relative overflow-hidden rounded-2xl p-8 mb-8 bg-gradient-to-br from-gray-900 to-black border border-white/10 text-white shadow-2xl">
            
            {/* Achtergrond Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-museum-gold/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3"></div>

            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                
                {/* Avatar met Dynamische Rand */}
                <div className="relative">
                    <div className={`w-28 h-28 rounded-full bg-black flex items-center justify-center text-4xl font-serif font-bold border-4 ${borderColor} transition-all duration-500`}>
                        {userProfile?.display_name?.charAt(0) || '?'}
                    </div>
                    <div className="absolute -bottom-3 -right-3 bg-museum-gold text-black font-black text-sm w-10 h-10 rounded-full flex items-center justify-center border-4 border-black shadow-lg">
                        {level}
                    </div>
                </div>

                {/* Info & Progress */}
                <div className="flex-1 w-full text-center md:text-left space-y-2">
                    <div>
                        <h2 className="text-3xl font-serif font-bold">{userProfile?.display_name}</h2>
                        <p className="text-museum-gold font-bold uppercase tracking-widest text-xs">{title}</p>
                    </div>
                    
                    {/* XP Bar */}
                    <div className="relative pt-2">
                        <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden">
                            <div className="bg-gradient-to-r from-museum-gold to-yellow-600 h-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(234,179,8,0.5)]" style={{ width: `${progress}%` }}></div>
                        </div>
                        <div className="flex justify-between text-[10px] font-bold mt-1 text-gray-400 font-mono">
                            <span>{xp} XP</span>
                            <span>{nextLevelXp} XP</span>
                        </div>
                    </div>

                    {/* Volgende Beloning Teaser */}
                    {nextReward && (
                        <div className="mt-4 inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-lg text-xs text-gray-300">
                            <Lock size={12} className="text-gray-500"/>
                            <span>Volgende unlock: <span className="text-white font-bold">{nextReward}</span></span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
