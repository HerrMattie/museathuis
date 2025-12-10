import { BADGE_ASSETS } from '@/lib/gamificationConfig';
import { Lock } from 'lucide-react';

export default function BadgeGrid({ earnedBadges }: { earnedBadges: string[] }) {
    // We tonen alle badges die in je config staan. 
    // Degene die je hebt zijn gekleurd, de rest is grijs (lock).
    const allBadges = Object.entries(BADGE_ASSETS);

    return (
        <div className="mb-8">
            <h3 className="text-white font-serif text-xl mb-4 flex items-center gap-2">
                <span className="text-museum-gold">✦</span> Mijn Ere-Galerij
            </h3>
            
            <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                {allBadges.map(([id, badge]) => {
                    const isEarned = earnedBadges.includes(id);
                    
                    return (
                        <div key={id} className={`relative p-4 rounded-xl border flex flex-col items-center text-center transition-all group ${
                            isEarned 
                            ? 'bg-gradient-to-br from-white/10 to-black border-museum-gold/50 shadow-[0_0_15px_rgba(234,179,8,0.1)]' 
                            : 'bg-white/5 border-white/5 opacity-40 grayscale'
                        }`}>
                            <div className={`text-4xl mb-2 transition-transform ${isEarned ? 'group-hover:scale-110' : ''}`}>
                                {badge.icon}
                            </div>
                            
                            <div className={`font-bold text-xs md:text-sm ${isEarned ? 'text-white' : 'text-gray-500'}`}>
                                {badge.label}
                            </div>
                            
                            {/* Beschrijving (alleen zichtbaar bij hover of als earned) */}
                            {isEarned && (
                                <div className="text-[10px] text-gray-400 mt-1 leading-tight">
                                    {badge.desc}
                                </div>
                            )}

                            {/* Slotje voor niet-behaald */}
                            {!isEarned && (
                                <div className="absolute top-2 right-2 text-white/20">
                                    <Lock size={12}/>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
