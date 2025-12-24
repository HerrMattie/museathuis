import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { 
    Award, Lock, HelpCircle, Brain, Crown, LayoutGrid, Star, 
    BookOpen, Eye, Target, Globe, Map, Flame, Library, Trophy,
    Scroll, Coffee, Search, MoonStar, UserCheck, Compass, PenTool,
    Heart, CloudRain, Moon, Sun, Clock, Palette, ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

export const revalidate = 0;

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

export default async function AchievementsPage() {
    const supabase = createClient(cookies());
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return redirect('/login');
    
    // 1. Haal alle badges op
    const { data: allBadges } = await supabase.from('badges').select('*');

    // 2. Haal user badges op
    const { data: userBadges } = await supabase
        .from('user_badges')
        .select('badge_id')
        .eq('user_id', user.id);

    const unlockedSet = new Set(userBadges?.map(b => b.badge_id));

    // 3. FILTEREN: Verberg onbehaalde geheime badges
    const visibleBadges = allBadges?.filter(badge => {
        if (!badge.is_secret) return true; // Openbare tonen we altijd
        return unlockedSet.has(badge.id);  // Geheime tonen we alleen als je hem hebt
    }) || [];

    // 4. SORTEREN
    const sortedBadges = [...visibleBadges].sort((a, b) => {
        const hasA = unlockedSet.has(a.id);
        const hasB = unlockedSet.has(b.id);

        const getRank = (unlocked: boolean) => (unlocked ? 0 : 1);
        const rankA = getRank(hasA);
        const rankB = getRank(hasB);

        if (rankA !== rankB) return rankA - rankB;
        return (a.xp_reward || 0) - (b.xp_reward || 0);
    });

    return (
        <div className="min-h-screen bg-midnight-950 text-white pt-24 pb-12 px-6">
            <div className="max-w-5xl mx-auto">
                
                <Link href="/profile" className="text-gray-400 hover:text-white flex items-center gap-2 mb-8 text-sm font-bold uppercase tracking-widest transition-colors">
                    <ArrowLeft size={16}/> Terug naar Profiel
                </Link>

                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h1 className="text-4xl font-serif font-bold text-white mb-2">Ere-Galerij</h1>
                        <p className="text-gray-400">Verzamel medailles en ontdek geheime achievements.</p>
                    </div>
                    
                    {/* 👇 AANGEPAST: Teller toont nu unlockedSet.size t.o.v. visibleBadges.length */}
                    <div className="bg-museum-gold text-black px-4 py-2 rounded-lg font-bold text-xl shadow-lg shadow-museum-gold/20">
                        {unlockedSet.size} / {visibleBadges.length}
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {sortedBadges.map((badge) => {
                        const isUnlocked = unlockedSet.has(badge.id);
                        const BadgeIcon = getIcon(badge.icon_name);

                        return (
                            <div 
                                key={badge.id} 
                                className={`relative p-6 rounded-2xl border transition-all flex flex-col items-center text-center ${
                                    isUnlocked 
                                    ? 'bg-midnight-900 border-museum-gold/30 shadow-[0_0_30px_-10px_rgba(234,179,8,0.2)]' 
                                    : 'bg-white/5 border-white/5 opacity-70'
                                }`}
                            >
                                <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-inner ${
                                    isUnlocked 
                                    ? 'bg-museum-gold text-black shadow-museum-gold/50' 
                                    : 'bg-black/30 text-gray-600'
                                }`}>
                                    {isUnlocked ? <BadgeIcon size={40} /> : <Lock size={32} />}
                                </div>

                                <div className="flex-1 flex flex-col justify-center w-full">
                                    <h3 className={`font-bold mb-2 ${isUnlocked ? 'text-white' : 'text-gray-500'}`}>
                                        {badge.name}
                                    </h3>
                                    
                                    <p className="text-xs text-gray-500 mb-4 h-8 line-clamp-2 leading-relaxed px-2">
                                        {badge.description}
                                    </p>
                                    
                                    <div className="mt-auto">
                                        <span className={`text-[10px] font-bold uppercase tracking-widest py-1 px-3 rounded ${
                                            isUnlocked ? 'bg-museum-gold/20 text-museum-gold' : 'bg-black/30 text-gray-500'
                                        }`}>
                                            {badge.xp_reward} XP
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
