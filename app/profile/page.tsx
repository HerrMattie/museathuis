import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Settings, Heart, Award, LogOut, Flame, LayoutDashboard, Edit3 } from 'lucide-react';
import { getLevel } from '@/lib/levelSystem';

export const revalidate = 0;

export default async function ProfilePage() {
  const supabase = createClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // 1. Haal data op
  const { data: profile } = await supabase.from('user_profiles').select('*').eq('user_id', user.id).single();
  const { count: actionCount } = await supabase.from('user_activity_logs').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
  const { count: favCount } = await supabase.from('favorites').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
  const { count: badgeCount } = await supabase.from('user_badges').select('*', { count: 'exact', head: true }).eq('user_id', user.id);

  // 2. Bereken Level
  const xp = ((actionCount || 0) * 15) + ((favCount || 0) * 50);
  const { level, title: levelTitle, nextLevelXp } = getLevel(xp);
  const progress = (xp / nextLevelXp) * 100;

  // Check Admin
  const isAdmin = profile?.role === 'admin';

  return (
    <div className="min-h-screen bg-midnight-950 text-white pt-24 pb-12 px-6">
      <div className="max-w-4xl mx-auto">
        
        {/* HEADER KAART */}
        <div className="bg-gradient-to-r from-midnight-900 to-black border border-white/10 rounded-3xl p-8 mb-8 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 p-32 bg-museum-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                
                {/* Avatar */}
                <div className="w-24 h-24 rounded-full bg-museum-gold text-black flex items-center justify-center text-3xl font-black border-4 border-black shadow-lg shrink-0 overflow-hidden">
                    {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                        <span>{profile?.full_name?.[0] || user.email?.[0].toUpperCase()}</span>
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 text-center md:text-left w-full">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                        <h1 className="text-3xl font-serif font-bold text-white">
                            {profile?.full_name || "Kunstliefhebber"}
                        </h1>
                        
                        {/* ADMIN KNOP (Verplaatst naar hier) */}
                        {isAdmin && (
                            <Link href="/crm" className="inline-flex items-center gap-1 px-3 py-1 bg-rose-600/20 text-rose-500 border border-rose-600/50 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-colors mx-auto md:mx-0">
                                <LayoutDashboard size={12}/> Admin Dashboard
                            </Link>
                        )}
                    </div>

                    <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                        <span className="px-3 py-1 bg-museum-gold text-black text-xs font-bold uppercase tracking-widest rounded-full">
                            Level {level}
                        </span>
                        <span className="text-museum-gold/80 text-sm font-serif italic">
                            {levelTitle}
                        </span>
                    </div>

                    {/* XP Bar */}
                    <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden relative">
                        <div className="absolute top-0 left-0 h-full bg-museum-gold transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-500 mt-2 font-bold uppercase tracking-widest">
                        <span>{xp} XP</span>
                        <span>{nextLevelXp} XP (Volgende Level)</span>
                    </div>
                </div>

                {/* Streak */}
                <div className="flex flex-col items-center bg-white/5 p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
                    <Flame className={profile?.current_streak > 0 ? "text-orange-500 fill-orange-500" : "text-gray-600"} size={32} />
                    <span className="text-2xl font-bold mt-2">{profile?.current_streak || 0}</span>
                    <span className="text-[10px] text-gray-500 uppercase font-bold">Dagen Streak</span>
                </div>
            </div>
        </div>

        {/* DASHBOARD GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* 1. Collectie */}
            <Link href="/favorites" className="group bg-midnight-900 border border-white/10 p-6 rounded-2xl hover:border-museum-gold/50 transition-all hover:-translate-y-1">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-rose-900/20 text-rose-500 rounded-xl group-hover:bg-rose-500 group-hover:text-white transition-colors">
                        <Heart size={24} />
                    </div>
                    <span className="text-2xl font-bold text-white">{favCount}</span>
                </div>
                <h3 className="font-bold text-lg text-gray-200 group-hover:text-white">Mijn Collectie</h3>
                <p className="text-sm text-gray-500 mt-1">Bekijk uw bewaarde kunstwerken.</p>
            </Link>

            {/* 2. Ere-Galerij */}
            <Link href="/profile/achievements" className="group bg-midnight-900 border border-white/10 p-6 rounded-2xl hover:border-museum-gold/50 transition-all hover:-translate-y-1">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-yellow-900/20 text-yellow-500 rounded-xl group-hover:bg-yellow-500 group-hover:text-black transition-colors">
                        <Award size={24} />
                    </div>
                    <span className="text-2xl font-bold text-white">{badgeCount}</span>
                </div>
                <h3 className="font-bold text-lg text-gray-200 group-hover:text-white">Ere-Galerij</h3>
                <p className="text-sm text-gray-500 mt-1">Bekijk uw behaalde medailles.</p>
            </Link>

            {/* 3. Instellingen (NU ACTIEF) */}
            <Link href="/profile/settings" className="group bg-midnight-900 border border-white/10 p-6 rounded-2xl hover:border-museum-gold/50 transition-all hover:-translate-y-1">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-blue-900/20 text-blue-500 rounded-xl group-hover:bg-blue-500 group-hover:text-white transition-colors">
                        <Settings size={24} />
                    </div>
                </div>
                <h3 className="font-bold text-lg text-gray-200 group-hover:text-white">Instellingen</h3>
                <p className="text-sm text-gray-500 mt-1">Wijzig uw naam en foto.</p>
            </Link>
        </div>

        <div className="mt-8 flex justify-center">
             <form action="/auth/signout" method="post">
                <button className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-red-500 transition-colors px-6 py-3 rounded-xl hover:bg-red-500/10">
                    <LogOut size={16}/> Uitloggen
                </button>
             </form>
        </div>

      </div>
    </div>
  );
}
