import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { ArrowLeft, Lock, Star } from 'lucide-react';
import { getLevel } from '@/lib/levelSystem';

export const revalidate = 0;

export default async function AchievementsPage() {
  const supabase = createClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();

  // 1. Haal ALLE mogelijke badges op (uit de nieuwe tabel!)
  const { data: allBadges } = await supabase
    .from('badge_definitions')
    .select('*')
    .order('category', { ascending: true });

  // 2. Haal behaalde badges op
  const { data: userBadges } = await supabase
    .from('user_badges')
    .select('badge_id')
    .eq('user_id', user?.id);

  const earnedSlugs = userBadges?.map((b: any) => b.badge_id) || [];

  // 3. Haal Stats op voor Level Progressie
  const { count: actionCount } = await supabase.from('user_activity_logs').select('*', { count: 'exact', head: true }).eq('user_id', user?.id);
  const { count: favCount } = await supabase.from('favorites').select('*', { count: 'exact', head: true }).eq('user_id', user?.id);
  
  // Bereken XP
  const xp = ((actionCount || 0) * 15) + ((favCount || 0) * 50);
  const { level, title, nextLevelXp, currentLevelXp, progress } = getLevel(xp);

  return (
    <div className="min-h-screen bg-midnight-950 text-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER & LEVEL CARD */}
        <header className="mb-12">
            <Link href="/profile" className="text-gray-400 hover:text-white flex items-center gap-2 mb-6 text-sm font-bold uppercase tracking-widest">
                <ArrowLeft size={16}/> Terug naar Profiel
            </Link>

            <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/10 pb-8">
                <div>
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-museum-gold mb-2">Achievements</h1>
                    <p className="text-gray-400">Jouw jacht op de trofeeën. {earnedSlugs.length} / {allBadges?.length || 0} voltooid.</p>
                </div>

                {/* LEVEL WIDGET (Compacte versie) */}
                <div className="bg-white/5 border border-white/10 p-4 rounded-xl w-full md:w-80">
                    <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-xl text-white">Level {level}</span>
                        <span className="text-xs text-museum-gold font-bold uppercase tracking-widest">{title}</span>
                    </div>
                    <div className="w-full bg-black/50 h-2 rounded-full overflow-hidden mb-1">
                        <div className="bg-gradient-to-r from-museum-gold to-yellow-600 h-full transition-all" style={{ width: `${progress}%` }}></div>
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-500">
                        <span>{xp} XP</span>
                        <span>{nextLevelXp} XP (Volgende)</span>
                    </div>
                </div>
            </div>
        </header>

        {/* BADGE GRID (Dynamisch uit DB) */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {allBadges?.map((badge) => {
                const isEarned = earnedSlugs.includes(badge.slug);
                const isSecret = badge.is_secret && !isEarned;

                return (
                    <div key={badge.id} className={`relative group p-6 rounded-2xl border flex flex-col items-center text-center transition-all duration-300 ${
                        isEarned 
                        ? 'bg-gradient-to-b from-white/10 to-black border-museum-gold/50 shadow-[0_0_20px_rgba(234,179,8,0.1)] hover:scale-105' 
                        : 'bg-white/5 border-white/5 grayscale opacity-60'
                    }`}>
                        
                        <div className="text-5xl mb-4 relative">
                            {isSecret ? <span className="opacity-20 text-6xl">?</span> : badge.icon}
                            {!isEarned && !isSecret && (
                                <div className="absolute inset-0 flex items-center justify-center text-white/30"><Lock size={24}/></div>
                            )}
                        </div>

                        <h3 className={`font-bold text-sm mb-2 ${isEarned ? 'text-white' : 'text-gray-500'}`}>
                            {isSecret ? 'Geheim' : badge.label}
                        </h3>

                        <p className="text-xs text-gray-500 leading-relaxed">
                            {isSecret ? 'Speel verder om te ontdekken.' : badge.description}
                        </p>

                        <div className={`mt-4 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded ${
                            isEarned ? 'bg-green-500/20 text-green-400' : 'bg-black/40 text-gray-600'
                        }`}>
                            {isEarned ? 'Voltooid' : 'Vergrendeld'}
                        </div>
                    </div>
                );
            })}
        </div>
      </div>
    </div>
  );
}
