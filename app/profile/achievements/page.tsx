import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { 
    Award, Lock, HelpCircle, Brain, Crown, LayoutGrid, Star, 
    BookOpen, Eye, Target, Globe, Map, Flame, Library, Trophy, Scroll, Coffee, Target, Search, MoonStar, UserCheck, Compass, PenTool
} from 'lucide-react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const revalidate = 0;

// Helper om de string uit de database ("Brain") om te zetten naar een Icoon Component
const getIcon = (iconName: string) => {
    const icons: any = {
        'Brain': Brain,
        'Award': Award,
        'Crown': Crown,
        'Grid': LayoutGrid,
        'Star': Star,
        'BookOpen': BookOpen,
        'Eye': Eye,
        'Target': Target,
        'Globe': Globe,
        'Map': Map,
        'Flame': Flame,
        'Library': Library,
        'Trophy': Trophy,
        'Moon': Moon,
        'Sun': Sun,
        'Clock': Clock,
        'Palette': Palette,
        'CloudRain': CloudRain,
        'Heart': Heart,
        'LayoutGrid': LayoutGrid,
        'Flame': Flame
        'Scroll': Scroll,
        'Coffee': Coffee,
        'Target': Target,
        'Search': Search,
        'MoonStar': MoonStar,
        'UserCheck': UserCheck,
        'Compass': Compass,
        'PenTool': PenTool
    };
    return icons[iconName] || Award; // Fallback naar Award als icoon niet bestaat
};

export default async function AchievementsPage() {
    const supabase = createClient(cookies());
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return redirect('/login');
    
    // 1. Haal ALLE mogelijke badges op uit de tabel 'badges'
    const { data: allBadges } = await supabase
        .from('badges') // <--- AANGEPAST: Was 'badge_definitions'
        .select('*')
        .order('xp_reward', { ascending: true });

    // 2. Haal de badges op die de user HEEFT
    const { data: userBadges } = await supabase
        .from('user_badges')
        .select('badge_id')
        .eq('user_id', user.id);

    // Maak een set voor snelle lookup op ID
    const unlockedSet = new Set(userBadges?.map(b => b.badge_id));

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
                    <div className="bg-museum-gold text-black px-4 py-2 rounded-lg font-bold text-xl shadow-lg shadow-museum-gold/20">
                        {unlockedSet.size} / {allBadges?.length || 0}
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {allBadges?.map((badge) => {
                        const isUnlocked = unlockedSet.has(badge.id);
                        // Xbox Logic: Als hij geheim is (is_secret column, indien aanwezig) EN niet behaald
                        // Omdat ik in je screenshot geen 'is_secret' zag, zet ik dit standaard op false tenzij je de kolom toevoegt.
                        const isSecret = badge.is_secret || false; 
                        const isHidden = isSecret && !isUnlocked;

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
                                    {isUnlocked ? <BadgeIcon size={40} /> : (isHidden ? <HelpCircle size={32}/> : <Lock size={32} />)}
                                </div>

                                <div className="flex-1 flex flex-col justify-center w-full">
                                    <h3 className={`font-bold mb-2 ${isUnlocked ? 'text-white' : 'text-gray-500'}`}>
                                        {isHidden ? "Geheime Prestatie" : badge.name}
                                    </h3>
                                    
                                    <p className="text-xs text-gray-500 mb-4 h-8 line-clamp-2 leading-relaxed px-2">
                                        {isHidden ? "Blijf spelen om deze te ontgrendelen." : badge.description}
                                    </p>
                                    
                                    {/* XP Label */}
                                    <div className="mt-auto">
                                        {isHidden ? (
                                            <span className="text-[10px] font-bold uppercase tracking-widest py-1 px-3 rounded bg-black/30 text-gray-700">
                                                ??? XP
                                            </span>
                                        ) : (
                                            <span className={`text-[10px] font-bold uppercase tracking-widest py-1 px-3 rounded ${
                                                isUnlocked ? 'bg-museum-gold/20 text-museum-gold' : 'bg-black/30 text-gray-500'
                                            }`}>
                                                {badge.xp_reward} XP
                                            </span>
                                        )}
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
