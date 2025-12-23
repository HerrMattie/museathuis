'use client';

import { createClient } from '@/lib/supabaseClient';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
    Settings, Award, LogOut, Flame, LayoutDashboard, 
    Palette, CalendarClock, User, Crown, ChevronRight, 
    Images, BarChart3, TrendingUp, Lock 
} from 'lucide-react';
// We halen getLevel nu uit de config file die we eerder samenvoegden
import { getLevel } from '@/lib/gamificationConfig';
// IMPORT VAN DE NIEUWE COMPONENT
import ArtDNA from '@/components/profile/ArtDNA';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<any>({ favCount: 0, badgeCount: 0 });
  const [loading, setLoading] = useState(true);
  
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      setUser(user);

      // Haal profiel inclusief de 'art_dna' kolom op
      const { data: userProfile } = await supabase.from('user_profiles').select('*').eq('user_id', user.id).single();
      const { count: favCount } = await supabase.from('favorites').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
      const { count: badgeCount } = await supabase.from('user_badges').select('*', { count: 'exact', head: true }).eq('user_id', user.id);

      setProfile(userProfile);
      setStats({ favCount: favCount || 0, badgeCount: badgeCount || 0 });
      setLoading(false);
    };

    getData();
  }, []);

  if (loading) return <div className="min-h-screen bg-midnight-950 flex items-center justify-center text-museum-gold">Profiel laden...</div>;

  // --- BEREKENINGEN ---
  const xp = profile?.xp || 0;
  const { level, title: levelTitle, nextLevelXp } = getLevel(xp);
  const progress = Math.min((xp / nextLevelXp) * 100, 100);
  const isPremium = profile?.is_premium ?? false;
  const isAdmin = profile?.role === 'admin';

  const joinDate = new Date(profile?.created_at).toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' });
  // Als er nog geen favoriete stijl is berekend, tonen we een placeholder
  const favoriteStyle = (profile?.art_dna?.tijd > 60 ? "Modernisme" : "Klassiek") || "Nog onbekend";

  // --- AVATAR RAND LOGICA ---
  const getBorderClass = (lvl: number, premium: boolean) => {
      if (lvl >= 40) return "border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.6)] animate-pulse";
      if (lvl >= 30 || premium) return "border-gray-200 shadow-[0_0_10px_rgba(255,255,255,0.4)]";
      if (lvl >= 20) return "border-museum-gold shadow-[0_0_10px_rgba(212,175,55,0.4)]";
      if (lvl >= 15) return "border-slate-300";
      if (lvl >= 5) return "border-orange-700";
      return "border-white/10";
  };

  return (
    <div className="min-h-screen bg-midnight-950 text-white pt-24 pb-12 px-6">
      <div className="max-w-4xl mx-auto">
          
        {/* HEADER KAART */}
        <div className="bg-gradient-to-r from-midnight-900 to-black border border-white/10 rounded-3xl p-8 mb-8 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 p-32 bg-museum-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                {/* Avatar */}
                <div className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl font-black border-4 shadow-lg shrink-0 overflow-hidden ${getBorderClass(level, isPremium)} bg-midnight-900`}>
                    {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                        <span>{profile?.full_name?.[0] || user.email?.[0].toUpperCase()}</span>
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 text-center md:text-left w-full">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                        <div className="flex items-center justify-center md:justify-start gap-2">
                            <h1 className="text-3xl font-serif font-bold text-white">
                                {profile?.full_name || "Kunstliefhebber"}
                            </h1>
                            {isPremium && <Crown size={24} className="text-museum-gold fill-museum-gold" />}
                        </div>
                        {isAdmin && (
                            <Link href="/crm" className="inline-flex items-center gap-1 px-3 py-1 bg-rose-600/20 text-rose-500 border border-rose-600/50 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-colors">
                                <LayoutDashboard size={12}/> Admin
                            </Link>
                        )}
                    </div>

                    <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                        <span className="px-3 py-1 bg-museum-gold text-black text-xs font-bold uppercase tracking-widest rounded-full">Level {level}</span>
                        <span className="text-museum-gold/80 text-sm font-serif italic">{levelTitle}</span>
                    </div>

                    {/* XP Bar */}
                    <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden relative">
                        <div className="absolute top-0 left-0 h-full bg-museum-gold transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-500 mt-2 font-bold uppercase tracking-widest">
                        <span>{xp} XP</span>
                        <span>{nextLevelXp} XP (Next)</span>
                    </div>
                </div>

                {/* Streak */}
                <div className="flex flex-col items-center bg-white/5 p-4 rounded-2xl border border-white/5 backdrop-blur-sm min-w-[100px]">
                    <Flame className={profile?.current_streak > 0 ? "text-orange-500 fill-orange-500" : "text-gray-600"} size={32} />
                    <span className="text-2xl font-bold mt-2">{profile?.current_streak || 0}</span>
                    <span className="text-[10px] text-gray-500 uppercase font-bold">Dagen</span>
                </div>
            </div>
        </div>

        {/* --- KUNST DNA SECTIE (VERNIEUWD) --- */}
        {/* We tonen het DNA altijd, of met een slotje als het level te laag is */}
        <div className="mb-8">
            {level >= 16 ? (
                <>
                    <div className="flex items-center gap-2 mb-4 px-2">
                        <BarChart3 className="text-museum-gold" size={20}/>
                        <h2 className="text-xl font-bold text-white">Jouw Kunst DNA</h2>
                    </div>
                    {/* Hier laden we de mooie nieuwe component in! */}
                    <ArtDNA stats={profile?.art_dna} />
                </>
            ) : (
                <div className="bg-white/5 border border-white/5 rounded-3xl p-8 text-center opacity-50 relative overflow-hidden group">
                    <div className="mx-auto w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4 text-gray-400 group-hover:scale-110 transition-transform">
                        <Lock size={24}/>
                    </div>
                    <h3 className="font-bold text-xl text-gray-300 mb-1">Kunst DNA Analyse</h3>
                    <p className="text-sm text-gray-500">Wordt ontgrendeld op <strong>Level 16</strong></p>
                </div>
            )}
        </div>

        {/* STATUS BOXEN */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className={`p-4 rounded-xl border relative overflow-hidden flex flex-col justify-between ${isPremium ? 'bg-museum-gold/10 border-museum-gold/30' : 'bg-white/5 border-white/5'}`}>
                <div>
                    <div className="flex items-center gap-2 text-gray-500 text-xs uppercase font-bold mb-1">
                        {isPremium ? <Crown size={14} className="text-museum-gold"/> : <User size={14}/>} Status
                    </div>
                    <div className={`font-bold truncate ${isPremium ? 'text-museum-gold' : 'text-white'}`}>
                        {isPremium ? 'Mecenas' : 'Liefhebber'}
                    </div>
                </div>
                <div className="text-[10px] mt-2 pt-2 border-t border-white/5">
                    <Link href="/pricing" className="text-museum-gold hover:underline flex items-center gap-1">
                        {isPremium ? 'Beheer' : 'Word Mecenas'} <ChevronRight size={10}/>
                    </Link>
                </div>
            </div>

            <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                <div className="flex items-center gap-2 text-gray-500 text-xs uppercase font-bold mb-1">
                    <Palette size={14}/> Stijlvoorkeur
                </div>
                <div className="text-white font-bold truncate">{favoriteStyle}</div>
            </div>

            <Link href="/favorites" className="bg-white/5 p-4 rounded-xl border border-white/5 hover:bg-white/10 transition-colors group">
                <div className="flex items-center gap-2 text-gray-500 group-hover:text-rose-400 text-xs uppercase font-bold mb-1 transition-colors">
                    <Images size={14}/> Mijn Collectie
                </div>
                <div className="text-white font-bold">{stats.favCount} Werken</div>
            </Link>

            <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                <div className="flex items-center gap-2 text-gray-500 text-xs uppercase font-bold mb-1"><CalendarClock size={14}/> Lid Sinds</div>
                <div className="text-white font-bold truncate">{joinDate}</div>
            </div>
        </div>

        {/* DASHBOARD GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/profile/levels" className="group bg-midnight-900 border border-white/10 p-6 rounded-2xl hover:border-museum-gold/50 transition-all hover:-translate-y-1">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-purple-900/20 text-purple-500 rounded-xl group-hover:bg-purple-500 group-hover:text-white transition-colors">
                        <TrendingUp size={24} />
                    </div>
                    <span className="text-2xl font-bold text-white">Lvl {level}</span>
                </div>
                <h3 className="font-bold text-lg text-gray-200 group-hover:text-white">Mijn Reis</h3>
                <p className="text-sm text-gray-500 mt-1">Bekijk je voortgang en beloningen.</p>
            </Link>

            <Link href="/profile/achievements" className="group bg-midnight-900 border border-white/10 p-6 rounded-2xl hover:border-museum-gold/50 transition-all hover:-translate-y-1">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-yellow-900/20 text-yellow-500 rounded-xl group-hover:bg-yellow-500 group-hover:text-black transition-colors">
                        <Award size={24} />
                    </div>
                    <span className="text-2xl font-bold text-white">{stats.badgeCount}</span>
                </div>
                <h3 className="font-bold text-lg text-gray-200 group-hover:text-white">Ere-Galerij</h3>
                <p className="text-sm text-gray-500 mt-1">Bekijk uw behaalde medailles.</p>
            </Link>

            <Link href="/profile/settings" className="group bg-midnight-900 border border-white/10 p-6 rounded-2xl hover:border-museum-gold/50 transition-all hover:-translate-y-1">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-blue-900/20 text-blue-500 rounded-xl group-hover:bg-blue-500 group-hover:text-white transition-colors">
                        <Settings size={24} />
                    </div>
                </div>
                <h3 className="font-bold text-lg text-gray-200 group-hover:text-white">Instellingen</h3>
                <p className="text-sm text-gray-500 mt-1">Beheer je profiel en unlocks.</p>
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
