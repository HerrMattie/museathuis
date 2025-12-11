import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Award, Lock } from 'lucide-react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const revalidate = 0;

export default async function AchievementsPage() {
    const supabase = createClient(cookies());
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return redirect('/login');
    
    // 1. Haal ALLE mogelijke badges op (de 'kaart')
    const { data: allBadges } = await supabase
        .from('badge_definitions')
        .select('*')
        .order('xp_reward', { ascending: true }); // Makkelijke eerst

    // 2. Haal de badges op die de user HEEFT
    const { data: userBadges } = await supabase
        .from('user_badges')
        .select('badge_id, created_at')
        .eq('user_id', user.id);

    // Maak een set voor snelle lookup
    const unlockedSet = new Set(userBadges?.map(b => b.badge_id));

    return (
        <div className="min-h-screen bg-midnight-950 text-white p-6 pt-24 md:p-12 md:pt-32">
            <div className="max-w-5xl mx-auto">
                
                <Link href="/profile" className="text-gray-400 hover:text-white flex items-center gap-2 mb-8 text-sm font-bold uppercase tracking-widest">
                    <ArrowLeft size={16}/> Terug naar Profiel
                </Link>

                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h1 className="text-4xl font-serif font-bold text-white mb-2">Mijn Prestaties</h1>
                        <p className="text-gray-400">Verzamel medailles door kunst te ontdekken en te spelen.</p>
                    </div>
                    <div className="bg-museum-gold text-black px-4 py-2 rounded-lg font-bold text-xl">
                        {unlockedSet.size} / {allBadges?.length || 0}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {allBadges?.map((badge) => {
                        const isUnlocked = unlockedSet.has(badge.slug); // We gaan er even vanuit dat 'slug' de ID is in badge_definitions

                        return (
                            <div 
                                key={badge.id} 
                                className={`relative p-6 rounded-2xl border transition-all ${
                                    isUnlocked 
                                    ? 'bg-midnight-900 border-museum-gold/30 shadow-[0_0_30px_-10px_rgba(234,179,8,0.2)]' 
                                    : 'bg-white/5 border-white/5 opacity-60'
                                }`}
                            >
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto ${
                                    isUnlocked ? 'bg-museum-gold text-black' : 'bg-white/10 text-gray-500'
                                }`}>
                                    {isUnlocked ? <Award size={32} /> : <Lock size={32} />}
                                </div>

                                <div className="text-center">
                                    <h3 className={`font-bold mb-1 ${isUnlocked ? 'text-white' : 'text-gray-500'}`}>
                                        {badge.name}
                                    </h3>
                                    <p className="text-xs text-gray-500 mb-3 h-8 line-clamp-2">
                                        {badge.description}
                                    </p>
                                    <span className={`text-xs font-bold uppercase tracking-widest py-1 px-2 rounded ${
                                        isUnlocked ? 'bg-museum-gold/20 text-museum-gold' : 'bg-black/30 text-gray-600'
                                    }`}>
                                        {badge.xp_reward} XP
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
