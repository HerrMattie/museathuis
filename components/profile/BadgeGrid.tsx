import { Lock, Award, Brain, Crown, LayoutGrid, Star, BookOpen, Eye, Target, Globe, Map, Flame, Library, Trophy, Scroll, Coffee, Search, MoonStar, UserCheck, Compass, PenTool, Heart, CloudRain, Moon, Sun, Clock, Palette } from 'lucide-react';

// 1. Helper voor iconen (dezelfde als in AchievementsPage)
const getIcon = (iconName: string) => {
    const icons: any = {
        'Brain': Brain, 'Award': Award, 'Crown': Crown, 'Grid': LayoutGrid, 'LayoutGrid': LayoutGrid,
        'Star': Star, 'BookOpen': BookOpen, 'Eye': Eye, 'Target': Target, 'Globe': Globe,
        'Map': Map, 'Flame': Flame, 'Library': Library, 'Trophy': Trophy, 'Scroll': Scroll,
        'Coffee': Coffee, 'Search': Search, 'MoonStar': MoonStar, 'UserCheck': UserCheck,
        'Compass': Compass, 'PenTool': PenTool, 'Heart': Heart, 'CloudRain': CloudRain,
        'Moon': Moon, 'Sun': Sun, 'Clock': Clock, 'Palette': Palette
    };
    return icons[iconName] || Award;
};

// 2. De Component accepteert nu een lijst met 'badges' objecten
interface BadgeGridProps {
    badges: any[];       // De lijst met alle badges (uit DB)
    earnedIds: Set<string>; // De set met ID's die de user heeft
}

export default function BadgeGrid({ badges, earnedIds }: BadgeGridProps) {
    
    // Sorteer: Behaald eerst
    const sortedBadges = [...badges].sort((a, b) => {
        const hasA = earnedIds.has(a.id) ? 1 : 0;
        const hasB = earnedIds.has(b.id) ? 1 : 0;
        return hasB - hasA; // 1 (behaald) komt voor 0 (niet behaald)
    });

    // Filter: Verberg geheime badges die nog niet behaald zijn
    const visibleBadges = sortedBadges.filter(b => !b.is_secret || earnedIds.has(b.id));

    return (
        <div className="mb-8">
            <h3 className="text-white font-serif text-xl mb-4 flex items-center gap-2">
                <span className="text-museum-gold">✦</span> Mijn Ere-Galerij
            </h3>
            
            <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                {visibleBadges.map((badge) => {
                    const isEarned = earnedIds.has(badge.id);
                    const BadgeIcon = getIcon(badge.icon_name);
                    
                    return (
                        <div key={badge.id} className={`relative p-4 rounded-xl border flex flex-col items-center text-center transition-all group ${
                            isEarned 
                            ? 'bg-gradient-to-br from-white/10 to-black border-museum-gold/50 shadow-[0_0_15px_rgba(234,179,8,0.1)]' 
                            : 'bg-white/5 border-white/5 opacity-40 grayscale'
                        }`}>
                            <div className={`text-4xl mb-2 transition-transform ${isEarned ? 'group-hover:scale-110' : ''}`}>
                                {isEarned ? <BadgeIcon size={32} /> : <Lock size={24} />}
                            </div>
                            
                            <div className={`font-bold text-xs md:text-sm ${isEarned ? 'text-white' : 'text-gray-500'}`}>
                                {badge.name}
                            </div>
                            
                            {/* Beschrijving (alleen zichtbaar bij hover of als earned) */}
                            {isEarned && (
                                <div className="text-[10px] text-gray-400 mt-1 leading-tight line-clamp-2">
                                    {badge.description}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
