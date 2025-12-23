'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { getLevel } from '@/lib/levelSystem';

export default function GamificationDebugger() {
  const [logs, setLogs] = useState<string[]>([]);
  const [status, setStatus] = useState('Verbinden...');
  const [currentXP, setCurrentXP] = useState(0);
  const supabase = createClient();

  const addLog = (msg: string) => setLogs(prev => [`${new Date().toLocaleTimeString()} - ${msg}`, ...prev].slice(0, 10));

  useEffect(() => {
    let userId = '';
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setStatus('Geen gebruiker'); return; }
      userId = user.id;

      // Haal start XP op
      const { data } = await supabase.from('user_profiles').select('xp').eq('user_id', user.id).single();
      setCurrentXP(data?.xp || 0);
      addLog(`Start XP: ${data?.xp}`);

      const channel = supabase.channel('debug-room')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'user_profiles' }, (payload) => {
            addLog(`⚡️ EVENT ONTVANGEN: ${payload.eventType}`);
            
            if (payload.eventType === 'UPDATE') {
                const oldXp = payload.old?.xp;
                const newXp = payload.new?.xp;
                addLog(`📈 XP Update: ${oldXp} -> ${newXp}`);
                
                if (newXp) setCurrentXP(newXp);
                
                // Test de level check
                const lvlOld = getLevel(oldXp || 0).level;
                const lvlNew = getLevel(newXp || 0).level;
                if (lvlNew > lvlOld) addLog(`✅ LEVEL UP GEDETECTEERD: ${lvlNew}`);
                else addLog(`❌ Geen level verschil (${lvlOld} -> ${lvlNew})`);
            }
        })
        .subscribe((state) => {
            setStatus(state);
            addLog(`Status gewijzigd: ${state}`);
        });

      return () => { supabase.removeChannel(channel); };
    };
    init();
  }, []);

  const forceUpdate = async () => {
      addLog('Handmatige test gestart...');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      // Voeg 500 XP toe
      await supabase.rpc('increment_xp', { amount: 500, user_id_param: user.id });
  };

  return (
    <div className="fixed bottom-4 right-4 z-[200] w-80 bg-black/90 text-white p-4 rounded-xl border border-museum-gold text-xs font-mono shadow-2xl">
      <div className="flex justify-between items-center mb-2 border-b border-white/20 pb-2">
        <span className={`font-bold ${status === 'SUBSCRIBED' ? 'text-green-400' : 'text-red-400'}`}>
            ● {status}
        </span>
        <span>Huidig XP: {currentXP}</span>
      </div>
      <div className="h-32 overflow-y-auto space-y-1 mb-2 text-gray-300">
        {logs.map((l, i) => <div key={i}>{l}</div>)}
      </div>
      <button onClick={forceUpdate} className="w-full bg-museum-gold text-black font-bold py-2 rounded hover:bg-white transition-colors">
        TEST XP UPDATE (+500)
      </button>
    </div>
  );
}
