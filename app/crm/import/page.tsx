'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Download, Loader2, CheckCircle, AlertCircle, ArrowRight, PauseCircle, PlayCircle } from 'lucide-react';

export default function ImportPage() {
  const [loading, setLoading] = useState(false);
  const [autoLoop, setAutoLoop] = useState(false);
  const [stats, setStats] = useState({ totalAdded: 0, lastMsg: '' });
  
  // Ref om de loop te kunnen stoppen in de useEffect
  const loopRef = useRef(false);

  // De functie die 1 batch ophaalt
  const fetchBatch = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/import/wikidata', { method: 'POST', cache: 'no-store' });
      const data = await res.json();

if (data.success) {
        // OUDE FOUTE MANIER:
        // const added = parseInt(data.message.match(/\d+/)?.[0] || '0');

        // NIEUWE GOEDE MANIER:
        // We gebruiken direct de teller die de API ons geeft (die is altijd juist)
        const added = data.count || 0; 
        
        setStats(prev => ({
          totalAdded: prev.totalAdded + added,
          lastMsg: data.message
        }));
      } else {
  
        setStats(prev => ({
          totalAdded: prev.totalAdded + added,
          lastMsg: data.message
        }));
      } else {
        setStats(prev => ({ ...prev, lastMsg: `Foutje: ${data.error}` }));
        // Bij een fout (bv timeout) even wachten, maar niet stoppen als we in loop zitten
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // De Loop Manager
  useEffect(() => {
    loopRef.current = autoLoop;

    const runLoop = async () => {
      if (!loopRef.current) return;
      
      await fetchBatch();
      
      // Als we nog steeds moeten loopen, wacht 3 seconden en ga door
      if (loopRef.current) {
        setTimeout(runLoop, 3000); 
      }
    };

    if (autoLoop) {
      runLoop();
    }
  }, [autoLoop]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-serif text-slate-900">Art Curator Turbo</h1>
        <p className="text-slate-500">
           Automatische import van topstukken (10+ Wikipedia vermeldingen).
        </p>
      </div>

      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm max-w-2xl">
        
        {/* STATS TELLER */}
        <div className="flex items-center justify-between mb-8 bg-slate-50 p-6 rounded-xl border border-slate-100">
           <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Totaal Geïmporteerd</p>
              <p className="text-4xl font-bold text-museum-gold">{stats.totalAdded}</p>
           </div>
           <div className="text-right">
              <Link href="/crm/review" className="text-sm font-bold underline hover:text-blue-600">
                  Bekijk Review Queue &rarr;
              </Link>
           </div>
        </div>

        {/* FEEDBACK LOG */}
        <div className="mb-6 h-12 flex items-center justify-center text-sm text-slate-500 italic">
           {loading ? <span className="flex items-center gap-2"><Loader2 className="animate-spin" size={16}/> Bezig met ophalen...</span> : stats.lastMsg}
        </div>

        {/* KNOPPEN */}
        <div className="flex gap-4">
            {/* Handmatige knop */}
            <button 
              onClick={() => { setAutoLoop(false); fetchBatch(); }}
              disabled={loading || autoLoop}
              className="flex-1 py-4 border-2 border-slate-200 hover:border-museum-gold text-slate-700 font-bold rounded-lg transition-all flex justify-center items-center gap-2 disabled:opacity-50"
            >
              <Download size={20} /> Eén Batch (50)
            </button>

            {/* TURBO KNOP */}
            <button 
              onClick={() => setAutoLoop(!autoLoop)}
              className={`flex-1 py-4 font-bold rounded-lg transition-all flex justify-center items-center gap-2 text-black shadow-md ${
                  autoLoop ? 'bg-red-100 text-red-600 border border-red-200 animate-pulse' : 'bg-museum-gold hover:bg-yellow-500'
              }`}
            >
              {autoLoop ? (
                <> <PauseCircle size={24} /> STOP TURBO </>
              ) : (
                <> <PlayCircle size={24} /> START AUTO-IMPORT </>
              )}
            </button>
        </div>
        
        <p className="text-xs text-center text-slate-400 mt-4">
            De Auto-Import blijft draaien zolang dit tabblad open staat.
        </p>
      </div>
    </div>
  );
}
