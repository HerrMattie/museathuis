import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Star, Crown, Lock, Unlock, Trophy, Zap } from 'lucide-react';
import { getLevel } from '@/lib/levelSystem';

export default async function LevelsPage() {
  const supabase = createClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('user_profiles').select('xp').eq('user_id', user.id).single();
  const xp = profile?.xp || 0;
  const { level: currentLevel } = getLevel(xp);

  // DE GAMIFICATION ROADMAP
  // Hier bepaal je wat je krijgt per level
  const levels = [
    { level: 1, xp: 0, title: "Bezoeker", reward: "Toegang tot dagelijkse kunst", icon: UserIcon },
    { level: 2, xp: 100, title: "Liefhebber", reward: "Mogelijkheid tot favorieten opslaan", icon: HeartIcon },
    { level: 3, xp: 300, title: "Verzamelaar", reward: "Toegang tot de Ere-Galerij", icon: Trophy },
    { level: 4, xp: 600, title: "Verkenner", reward: "Nieuwe Avatar opties vrijgespeeld", icon: MapIcon },
    { level: 5, xp: 1000, title: "Kenner", reward: "Gouden rand om je avatar", icon: Star },
    { level: 10, xp: 2500, title: "Mecenas", reward: "Exclusieve 'Curator' badge", icon: Crown },
  ];

  return (
    <div className="min-h-screen bg-midnight-950 text-white pt-24 pb-12 px-6">
      <div className="max-w-3xl mx-auto">
        <Link href="/profile" className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
            <ArrowLeft size={20}/> Terug naar profiel
        </Link>

        <div className="text-center mb-12">
            <h1 className="text-4xl font-serif font-bold mb-2">Jouw Kunst Reis</h1>
            <p className="text-gray-400">Verdien XP door kunst te ontdekken en speel nieuwe statussen vrij.</p>
        </div>

        {/* Huidige Status */}
        <div className="bg-gradient-to-r from-museum-gold to-yellow-600 p-1 rounded-2xl mb-12">
            <div className="bg-midnight-900 rounded-xl p-8 text-center">
                <p className="text-museum-gold font-bold uppercase tracking-widest text-xs mb-2">Huidig Level</p>
                <div className="text-5xl font-black text-white mb-2">{currentLevel}</div>
                <p className="text-gray-400 text-sm mb-4">{xp} XP behaald</p>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden max-w-md mx-auto">
                    {/* Simpele progress bar logic voor demo */}
                    <div className="h-full bg-museum-gold" style={{width: '60%'}}></div> 
                </div>
            </div>
        </div>

        {/* Level Tijdlijn */}
        <div className="space-y-4">
            {levels.map((lvl) => {
                const isUnlocked = currentLevel >= lvl.level;
                const isNext = currentLevel + 1 === lvl.level;
                
                return (
                    <div key={lvl.level} className={`relative flex items-center gap-6 p-6 rounded-xl border transition-all ${isUnlocked ? 'bg-white/5 border-museum-gold/30' : 'bg-transparent border-white/5 opacity-60'}`}>
                        {/* Status Icoon */}
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${isUnlocked ? 'bg-museum-gold text-black' : 'bg-white/10 text-gray-500'}`}>
                            {isUnlocked ? <lvl.icon size={20} /> : <Lock size={20}/>}
                        </div>

                        <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                                <h3 className={`font-bold text-lg ${isUnlocked ? 'text-white' : 'text-gray-400'}`}>
                                    Level {lvl.level}: {lvl.title}
                                </h3>
                                {isNext && <span className="text-xs bg-blue-600 px-2 py-1 rounded text-white">Volgende doel</span>}
                            </div>
                            <p className="text-sm text-gray-400">{lvl.reward}</p>
                        </div>

                        <div className="text-right text-xs font-bold text-gray-500 uppercase tracking-widest">
                            {lvl.xp} XP
                        </div>
                    </div>
                );
            })}
        </div>

      </div>
    </div>
  );
}

// Hulpmiddelen voor iconen (om imports schoon te houden hierboven)
function UserIcon(props: any) { return <Zap {...props} /> }
function HeartIcon(props: any) { return <Star {...props} /> }
function MapIcon(props: any) { return <Unlock {...props} /> }
