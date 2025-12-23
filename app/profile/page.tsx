'use client';

import { createClient } from '@/lib/supabaseClient';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
    Settings, Award, LogOut, Flame, LayoutDashboard, 
    Palette, CalendarClock, User, Crown, ChevronRight, 
    Images, BarChart3, Share2, TrendingUp, Lock 
} from 'lucide-react';
import { getLevel } from '@/lib/levelSystem';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, PolarRadiusAxis } from 'recharts';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<any>({ favCount: 0, badgeCount: 0 });
  const [averages, setAverages] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      setUser(user);

      const { data: userProfile } = await supabase.from('user_profiles').select('*').eq('user_id', user.id).single();
      const { count: favCount } = await supabase.from('favorites').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
      const { count: badgeCount } = await supabase.from('user_badges').select('*', { count: 'exact', head: true }).eq('user_id', user.id);

      setProfile(userProfile);
      setStats({ favCount: favCount || 0, badgeCount: badgeCount || 0 });

      // Haal gemiddelden op (fallback waarden als er weinig users zijn)
      const { data: allProfiles } = await supabase.from('user_profiles').select('xp, current_streak').limit(50);
      
      if (allProfiles && allProfiles.length > 0) {
          const totalXP = allProfiles.reduce((sum, p) => sum + (p.xp || 0), 0);
          const totalStreak = allProfiles.reduce((sum, p) => sum + (p.current_streak || 0), 0);
          setAverages({
              xp: Math.round(totalXP / allProfiles.length),
              streak: Math.round(totalStreak / allProfiles.length)
          });
      }

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
  const favoriteStyle = (profile?.favorite_periods && profile.favorite_periods[0]) || "Nog onbekend";

  // --- AVATAR RAND LOGICA ---
  const getBorderClass = (lvl: number, premium: boolean) => {
      if (lvl >= 40) return "border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.6)] animate-pulse";
      if (lvl >= 30 || premium) return "border-gray-200 shadow-[0_0_10px_rgba(255,255,255,0.4)]";
      if (lvl >= 20) return "border-museum-gold shadow-[0_0_10px_rgba(212,175,55,0.4)]";
      if (lvl >= 15) return "border-slate-300";
      if (lvl >= 5) return "border-orange-700";
      return "border-white/10";
  };

  // --- GRAFIEK LOGICA (AANGEPAST VOOR SPREIDING) ---
  const avgXP = averages?.xp || 500;
  
  // We gebruiken nu vaste doelen zodat een beginner klein begint (0-100 schaal)
  // Max Level = 50. Max Badge = 20. Max Streak = 30 dagen. Max Collectie = 50 items.
  
  const radarData = [
    { subject: 'Ervaring', A: Math.min((xp / 10000) * 100, 100), fullMark: 100 }, // 10.000 XP is "vol"
    { subject: 'Collectie', A: Math.min((stats.favCount / 50) * 100, 100), fullMark: 100 }, // 50 items is "vol"
    { subject: 'Loyaliteit', A: Math.min((profile.current_streak / 30) * 100, 100), fullMark: 100 }, // 30 dagen is "vol"
    { subject: 'Kennis', A: Math.min((level / 50) * 100, 100), fullMark: 100 }, // Level 50 is "vol"
    { subject: 'Badges', A: Math.min((stats.badgeCount / 10) * 100, 100), fullMark: 100 }, // 10 badges is "vol"
  ];

  let persona = "De Ontdekker";
  let personaDesc = "Je bent net begonnen aan je reis.";
  if (xp > avgXP * 1.5) { persona = "De Kunstkenner"; personaDesc = "Je weet meer dan 80% van de gebruikers!"; }
  if (profile.current_streak > 10) { persona = "De Volhouder"; personaDesc = "Jouw discipline is ongekend."; }
  if (stats.favCount > 20) { persona = "De Verzamelaar"; personaDesc = "Je bouwt aan een eigen digitaal museum."; }

  return (
    <div className="min-h-screen bg-midnight-950 text-white pt-24 pb-12 px-6">
      <div className="max-w-4xl mx-auto">
        
        {/* HEADER KAART */}
        <div className="bg-gradient-to-r from-midnight-900 to-black border border-white/10 rounded-3xl p-8 mb-8 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 p-32 bg-museum-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl font-black border-4 shadow-lg shrink-0 overflow-hidden ${getBorderClass(level, isPremium)} bg-midnight-900`}>
                    {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                        <span>{profile?.full_name?.[0] || user.email?.[0].toUpperCase()}</span>
                    )}
                </div>

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

                    <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden relative">
                        <div className="absolute top-0 left-0 h-full bg-museum-gold transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-500 mt-2 font-bold uppercase tracking-widest">
                        <span>{xp} XP</span>
                        <span>{nextLevelXp} XP (Next)</span>
                    </div>
                </div>

                <div className="flex flex-col items-center bg-white/5 p-4 rounded-2xl border border-white/5 backdrop-blur-sm min-w-[100px]">
                    <Flame className={profile?.current_streak > 0 ? "text-orange-500 fill-orange-500" : "text-gray-600"} size={32} />
                    <span className="text-2xl font-bold mt-2">{profile?.current_streak || 0}</span>
                    <span className="text-[10px] text-gray-500 uppercase font-bold">Dagen</span>
                </div>
            </div>
        </div>

        {/* --- KUNST DNA (LEVEL 16 UNLOCK) --- */}
        {/* We laten hem nu even ZIEN voor test, maar normaal met: level >= 16 ? (...) : (...) */}
        {level >= 16 ? (
            <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-white/10 rounded-3xl p-8 mb-8 relative overflow-hidden">
                <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="flex-1 space-y-4 text-center md:text-left">
                        <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-purple-300">
                            <BarChart3 size={14}/> Jouw Kunst DNA
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-white mb-1">{persona}</h2>
                            <p className="text-purple-200">{personaDesc}</p>
                        </div>
                        
                        <div className="bg-black/20 rounded-xl p-4">
                             <div className="flex justify-between text-xs text-gray-400 mb-1">
                                <span>Ervaring vs Gemiddeld</span>
                                <span className={xp > avgXP ? "text-green-400" : "text-gray-400"}>{xp > avgXP ? "Boven" : "Onder"}</span>
                            </div>
                            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-purple-400" style={{ width: `${Math.min((xp / (avgXP * 1.5)) * 100, 100)}%` }} />
                            </div>
                        </div>

                        <button className="text-xs flex items-center gap-2 text-purple-300 hover:text-white transition-colors mx-auto md:mx-0">
                            <Share2 size={14}/> Deel profiel
                        </button>
                    </div>

                    <div className="w-full md:w-1/3 h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                                <PolarGrid stroke="#ffffff20" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#a5b4fc', fontSize: 10 }} />
                                
                                {/* DE FIX: Forceer de as van 0 tot 100, ook bij lage scores */}
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                
                                <Radar name="Jij" dataKey="A" stroke="#D4AF37" fill="#D4AF37" fillOpacity={0.6} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        ) : (
             <div className="bg-white/5 border border-white/5 rounded-3xl p-6 mb-8 text-center opacity-50 relative overflow-hidden">
                <div className="mx-auto w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-2 text-gray-400">
                    <Lock size={20}/>
                </div>
                <h3 className="font-bold text-gray-300">Kunst DNA</h3>
                <p className="text-xs text-gray-500">Beschikbaar vanaf Level 16</p>
            </div>
        )}

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
                    <Palette size={14}/> Favoriete Stijl
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
