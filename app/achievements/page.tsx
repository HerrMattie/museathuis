import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { ArrowLeft, Lock, Star, Trophy, HelpCircle } from 'lucide-react';
import { getLevel } from '@/lib/levelSystem';

export const revalidate = 0;

export default async function AchievementsPage() {
  const supabase = createClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();

  // 1. Haal Data op (Parallel voor snelheid)
  const [badgesRes, userBadgesRes, logsRes, favRes] = await Promise.all([
    // Alle definities (wat kun je winnen?)
    supabase.from('badge_definitions').select('*').order('category', { ascending: false }),
    
    // Wat heeft de user al?
    supabase.from('user_badges').select('badge_id').eq('user_id', user?.id),
    
    // Stats voor Level XP
    supabase.from('user_activity_logs').select('*', { count: 'exact', head: true }).eq('user_id', user?.id),
    supabase.from('favorites').select('*', { count: 'exact', head: true }).eq('user_id', user?.id)
  ]);

  const allBadges = badgesRes.data || [];
  const earnedSlugs = userBadgesRes.data?.map((b: any) => b.badge_id) || [];
  
  // 2. Bereken Level Info
  const actionCount = logsRes.count || 0;
  const favCount = favRes.count || 0;
  const xp = (actionCount * 15) + (favCount * 50); // XP Formule
  const { level, title, nextLevelXp, currentLevelXp, progress } = getLevel(xp);

  return (
    <div className="min-h-screen bg-midnight-950 text-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <header className="mb-12">
            <Link href="/profile" className="text-gray-400 hover:text-white flex items-center gap-2 mb-6 text-sm font-bold uppercase tracking-widest transition-colors">
                <ArrowLeft size={16}/> Terug naar Profiel
            </Link>

            <div className="flex flex-col md:flex-row justify-between items-end gap-8 border-b border-white/10 pb-8">
                <div>
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-museum-gold mb-3 flex items-center gap-3">
                        <Trophy size={40} className="text-museum-gold"/> Achievements
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Jouw jacht op de trofeeën. <span className="text-white font-bold">{earnedSlugs.length}</span> van de <span className="text-white font-bold">{allBadges.length}</span> voltooid.
                    </p>
                </div>

                {/* LEVEL WIDGET */}
                <div className="bg-white/5 border border-white/10 p-6 rounded-2xl w-full md:w-96 backdrop-blur-sm">
                    <div className="flex justify-between items-center mb-3">
                        <span className="font-bold text-2xl text-white">Level {level}</span>
                        <span className="text-xs text-museum-gold font-bold uppercase tracking-widest bg-museum-gold/10 px-2 py-1 rounded border border-museum-gold/20">{title}</span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="relative w-full bg-black/50 h-3 rounded-full overflow-hidden mb-2">
                        <div className="bg-gradient-to-r from-museum-gold to-yellow-600 h-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(234,179,8,0.5)]" style={{ width: `${progress}%` }}></div>
                    </div>
                    
                    <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                        <span>{xp} XP</span>
                        <span>{nextLevelXp} XP (Volgende)</span>
                    </div>
                </div>
            </div>
        </header>

        {/* BADGE GRID */}
        {allBadges.length === 0 ? (
            <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10 text-gray-500">
                Nog geen badges aangemaakt in het systeem.
            </div>
        ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {allBadges.map((badge) => {
                    const isEarned = earnedSlugs.includes(badge.slug);
                    const isSecret = badge.is_secret && !isEarned;

                    return (
                        <div key={badge.id} className={`relative group p-6 rounded-2xl border flex flex-col items-center text-center transition-all duration-300 ${
                            isEarned 
                            ? 'bg-gradient-to-b from-white/10 to-black border-museum-gold/50 shadow-[0_0_20px_rgba(234,179,8,0.1)] hover:scale-[1.02]' 
                            : 'bg-white/5 border-white/5 grayscale opacity-60'
                        }`}>
                            
                            {/* ICON */}
                            <div className="text-6xl mb-4 relative transition-transform duration-300 group-hover:scale-110">
                                {isSecret ? (
                                    <span className="opacity-20 flex items-center justify-center h-[60px]"><HelpCircle size={48}/></span>
                                ) : (
                                    <span>{badge.icon}</span>
                                )}
                                
                                {/* Slotje overlay als niet behaald */}
                                {!isEarned && !isSecret && (
                                    <div className="absolute inset-0 flex items-center justify-center text-white/30">
                                        <Lock size={24}/>
                                    </div>
                                )}
                            </div>

                            {/* LABEL */}
                            <h3 className={`font-bold text-sm mb-2 line-clamp-1 ${isEarned ? 'text-white' : 'text-gray-500'}`}>
                                {isSecret ? 'Verborgen Achievement' : badge.label}
                            </h3>

                            {/* BESCHRIJVING */}
                            <p className="text-xs text-gray-500 leading-relaxed min-h-[3rem]">
                                {isSecret ? 'Speel verder om deze badge te ontdekken.' : badge.description}
                            </p>

                            {/* CATEGORIE LABEL */}
                            {!isSecret && (
                                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-gray-600 bg-black/80 px-1.5 py-0.5 rounded">
                                        {badge.category}
                                    </span>
                                </div>
                            )}

                            {/* STATUS PILL */}
                            <div className={`mt-4 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full ${
                                isEarned ? 'bg-green-500/20 text-green-400 border border-green-500/20' : 'bg-black/40 text-gray-600 border border-white/5'
                            }`}>
                                {isEarned ? 'Voltooid' : 'Vergrendeld'}
                            </div>
                        </div>
                    );
                })}
            </div>
        )}
      </div>
    </div>
  );
}
