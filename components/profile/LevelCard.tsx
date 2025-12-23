'use client';
import { useState } from 'react';
import { Lock, Edit2, Flame } from 'lucide-react';
import { getLevel } from '@/lib/levelSystem';
import { AVATARS } from '@/lib/gamificationConfig';
// import Image from 'next/image'; <--- Next Image is streng, gebruik gewone <img> voor externe avatars tenzij geconfigureerd
import AvatarSelector from './AvatarSelector';

export default function LevelCard({ userProfile, stats }: { userProfile: any, stats: any }) {
    const [showAvatarSelect, setShowAvatarSelect] = useState(false);

    // XP & Level Logic (Zorg dat XP uit profiel komt, of bereken fallback)
    const xp = userProfile?.xp || ((stats?.total_actions * 15) + (stats?.fav_count * 50)) || 0; 
    const { level, title, nextLevelXp, progress, nextReward } = getLevel(xp);
    const streak = userProfile?.current_streak || 0;

    // Avatar Logic (Gebruik .url ipv .src en zoek op URL)
    let avatarUrl = userProfile?.avatar_url;
    
    // Fallback: zoek op ID als URL leeg is
    if (!avatarUrl && userProfile?.avatar_id) {
        const def = AVATARS.find(a => a.id === userProfile.avatar_id);
        if (def) avatarUrl = def.url;
    }
    
    // Laatste fallback
    if (!avatarUrl) avatarUrl = AVATARS[0].url;

    // Border Color Logic
    let borderColor = 'border-white/20';
    if (level >= 40) borderColor = 'border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)]';
    else if (level >= 30) borderColor = 'border-gray-200 shadow-[0_0_15px_rgba(255,255,255,0.5)]';
    else if (level >= 20) borderColor = 'border-museum-gold shadow-[0_0_15px_rgba(212,175,55,0.5)]';
    else if (level >= 15) borderColor = 'border-slate-300';
    else if (level >= 5) borderColor = 'border-orange-400';

    return (
        <>
            <div className="relative overflow-hidden rounded-2xl p-8 mb-8 bg-gradient-to-br from-gray-900 to-black border border-white/10 text-white shadow-2xl">
                {/* Streak Vlammetje */}
                <div className="absolute top-6 right-6 flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full" title="Dagen op rij actief">
                    <Flame size={16} className={`${streak > 0 ? 'text-orange-500 fill-orange-500 animate-pulse' : 'text-gray-500'}`} />
                    <span className="font-bold text-sm">{streak} <span className="text-xs text-gray-400 font-normal">dagen</span></span>
                </div>

                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    
                    {/* Avatar Sectie */}
                    <div className="relative group cursor-pointer" onClick={() => setShowAvatarSelect(true)}>
                        <div className={`w-28 h-28 rounded-full bg-black flex items-center justify-center text-4xl font-serif font-bold border-4 ${borderColor} overflow-hidden relative`}>
                            {/* Gebruik gewone img voor flexibiliteit met externe URLS */}
                            <img 
                                src={avatarUrl} 
                                alt="Avatar" 
                                className="w-full h-full object-cover" 
                            />
                            
                            {/* Edit Overlay */}
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Edit2 size={24} className="text-white"/>
                            </div>
                        </div>
                        {/* Level Badge */}
                        <div className="absolute -bottom-3 -right-3 bg-museum-gold text-black font-black text-sm w-10 h-10 rounded-full flex items-center justify-center border-4 border-black shadow-lg">
                            {level}
                        </div>
                    </div>

                    {/* Info Sectie */}
                    <div className="flex-1 w-full text-center md:text-left space-y-2">
                        <div>
                            <h2 className="text-3xl font-serif font-bold">{userProfile?.full_name || userProfile?.display_name || "Kunstliefhebber"}</h2>
                            <p className="text-museum-gold font-bold uppercase tracking-widest text-xs">{title}</p>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="relative pt-2">
                            <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden">
                                <div className="bg-gradient-to-r from-museum-gold to-yellow-600 h-full transition-all duration-1000 ease-out" style={{ width: `${progress}%` }}></div>
                            </div>
                            <div className="flex justify-between text-[10px] font-bold mt-1 text-gray-400 font-mono">
                                <span>{xp} XP</span>
                                <span>{nextLevelXp} XP</span>
                            </div>
                        </div>

                        {nextReward && (
                            <div className="mt-4 inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-lg text-xs text-gray-300">
                                <Lock size={12} className="text-gray-500"/>
                                <span>Volgende unlock: <span className="text-white font-bold">{nextReward}</span></span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Popup */}
            {showAvatarSelect && (
                <AvatarSelector 
                    currentAvatarUrl={avatarUrl}
                    userLevel={level}
                    onClose={() => setShowAvatarSelect(false)} 
                />
            )}
        </> 
    );
}
