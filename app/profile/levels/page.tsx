import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Lock, CheckCircle2 } from 'lucide-react';
import { getLevel } from '@/lib/levelSystem';
import { LEVELS } from '@/lib/gamificationConfig';

export default async function LevelsPage() {
  const supabase = createClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('user_profiles').select('xp').eq('user_id', user.id).single();
  const xp = profile?.xp || 0;
  
  // Gebruik de centrale rekenmachine
  const { level: currentLevel, nextLevelXp, progress, title: currentTitle, nextReward } = getLevel(xp);

  // --- NIEUWE FILTER LOGICA ---
  // We tonen: 
  // 1. Het level waar je NU bent (zodat je 'Jij' ziet)
  // 2. De komende 5 levels (om naartoe te werken)
  // We sorteren voor de zekerheid op level oplopend.
  const visibleLevels = LEVELS
    .sort((a, b) => a.level - b.level)
    .filter(l => l.level >= currentLevel && l.level <= currentLevel + 5);

  return (
    <div className="min-h-screen bg-midnight-950 text-white pt-24 pb-12 px-6">
      <div className="max-w-3xl mx-auto">
        
        <Link href="/profile" className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
            <ArrowLeft size={20}/> Terug naar profiel
        </Link>

        <div className="text-center mb-12">
            <h1 className="text-4xl font-serif font-bold mb-3">Jouw Reis door de Kunst</h1>
            <p className="text-gray-400 max-w-lg mx-auto">Verzamel XP door kunst te ontdekken, games te spelen en artikelen te lezen. Klim op van Toerist tot Mecenas.</p>
        </div>

        {/* HUIDIGE STATUS */}
        <div className="bg-gradient-to-r from-museum-gold to-yellow-600 p-0.5 rounded-2xl mb-16 shadow-2xl shadow-museum-gold/10 transform hover:scale-[1.01] transition-transform">
            <div className="bg-midnight-900 rounded-[15px] p-8 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-32 bg-museum-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                
                <p className="text-museum-gold font-bold uppercase tracking-widest text-xs mb-2 relative z-10">Huidige Status</p>
                <div className="text-5xl md:text-6xl font-black text-white mb-2 relative z-10">{currentTitle}</div>
                <div className="text-xl text-gray-400 mb-6 font-serif italic relative z-10">Level {currentLevel}</div>

                <div className="max-w-md mx-auto relative z-10">
                    <div className="flex justify-between text-xs text-gray-400 mb-2 font-bold uppercase tracking-wider">
                        <span>{xp} XP</span>
                        <span>{nextLevelXp} XP</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-4 bg-black/40 rounded-full overflow-hidden border border-white/5">
                        <div 
                            className="h-full bg-museum-gold shadow-[0_0_15px_rgba(212,175,55,0.6)] transition-all duration-1000 ease-out" 
                            style={{width: `${progress}%`}}
                        ></div> 
                    </div>
                    
                    {/* Next Reward */}
                    {nextReward && (
                        <p className="text-sm text-gray-300 mt-4">
                            Volgende beloning: <span className="text-museum-gold font-bold">{nextReward}</span>
                        </p>
                    )}
                </div>
            </div>
        </div>

        {/* TIJDLIJN (Nu gefilterd!) */}
        <div className="relative space-y-4">
            <div className="absolute left-[27px] top-0 bottom-8 w-0.5 bg-gradient-to-b from-museum-gold via-white/10 to-transparent -z-10 hidden md:block"></div>

            {visibleLevels.map((lvl) => {
                const isUnlocked = currentLevel >= lvl.level;
                const isCurrent = currentLevel === lvl.level;
                
                // We zoeken het 'volgende' level uit de globale lijst om de 'Volgende' badge correct te plaatsen
                const isNext = !isUnlocked && LEVELS.find(l => l.level > currentLevel)?.level === lvl.level;
                
                const Icon = lvl.icon;

                return (
                    <div 
                        key={lvl.level} 
                        className={`relative flex flex-col md:flex-row md:items-center gap-6 p-6 rounded-xl border transition-all duration-300 group
                        ${isCurrent ? 'bg-white/10 border-museum-gold/50 shadow-lg shadow-museum-gold/5 scale-[1.02]' : ''}
                        ${isUnlocked && !isCurrent ? 'bg-white/5 border-white/10 opacity-70 hover:opacity-100' : ''}
                        ${!isUnlocked && !isCurrent ? 'bg-transparent border-white/5 opacity-40 grayscale' : ''}
                        `}
                    >
                        <div className={`
                            w-14 h-14 rounded-full flex items-center justify-center shrink-0 border-4 z-10 transition-colors
                            ${isCurrent ? 'bg-museum-gold text-black border-midnight-950 ring-4 ring-museum-gold/20' : ''}
                            ${isUnlocked && !isCurrent ? 'bg-midnight-900 text-museum-gold border-museum-gold' : ''}
                            ${!isUnlocked ? 'bg-midnight-950 text-gray-600 border-gray-700' : ''}
                        `}>
                            {isUnlocked ? <Icon size={24} /> : <Lock size={20}/>}
                        </div>

                        <div className="flex-1">
                            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-1">
                                <h3 className={`font-bold text-xl flex items-center gap-2 ${isUnlocked ? 'text-white' : 'text-gray-400'}`}>
                                    {lvl.title} 
                                    {isCurrent && <span className="px-2 py-0.5 bg-museum-gold text-black text-[10px] uppercase font-black rounded-full tracking-wider">Jij</span>}
                                    {isUnlocked && !isCurrent && <CheckCircle2 size={16} className="text-green-500"/>}
                                    {isNext && <span className="px-2 py-0.5 bg-blue-600 text-white text-[10px] uppercase font-black rounded-full tracking-wider">Volgende</span>}
                                </h3>
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest bg-black/20 px-2 py-1 rounded">
                                    Lvl {lvl.level} • {lvl.min_xp} XP
                                </span>
                            </div>
                            
                            <p className="text-gray-300 italic text-sm mb-2">"{lvl.description}"</p>
                            
                            <div className={`text-sm flex items-center gap-2 ${isUnlocked ? 'text-museum-gold' : 'text-gray-500'}`}>
                                <span className="font-bold">Beloning:</span> {lvl.reward}
                            </div>
                        </div>
                    </div>
                );
            })}
            
            {/* Melding als er nog meer levels zijn */}
            {visibleLevels[visibleLevels.length - 1].level < 50 && (
                <div className="text-center text-gray-500 text-sm italic mt-8">
                    ... en nog veel meer te ontdekken!
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
