'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Download, Loader2, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';

export default function ImportPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ type: 'success' | 'error', msg: string, count?: number } | null>(null);

  const runCurator = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      // Roep de API aan die we eerder hebben gemaakt
      const res = await fetch('/api/import/wikidata');
      const data = await res.json();
      
      if (res.ok) {
        setResult({ 
          type: 'success', 
          msg: data.message || 'Import geslaagd!',
          count: data.scanned // Aantal items in de batch
        });
      } else {
        setResult({ type: 'error', msg: data.error || 'Server timeout of fout.' });
      }
    } catch (e) {
      setResult({ type: 'error', msg: 'Er ging iets mis met de verbinding.' });
    }
    
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-serif text-slate-900">Art Curator</h1>
        <p className="text-slate-500">De robot zoekt op Wikidata naar populaire meesterwerken.</p>
      </div>

      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm max-w-2xl">
        
        {/* HEADER BLOK */}
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-museum-gold/20 p-4 rounded-full text-yellow-800">
             <Download size={32} />
          </div>
          <div>
            <h3 className="font-bold text-lg">Start Zoektocht</h3>
            <p className="text-sm text-slate-500">
              De curator haalt een batch van 10 beroemde werken op. <br/>
              Ze worden opgeslagen als <strong>Concept</strong> in de Review Queue.
            </p>
          </div>
        </div>

        {/* FEEDBACK RESULTAAT */}
        {result && (
          <div className={`p-4 rounded-lg flex flex-col gap-2 mb-6 animate-in slide-in-from-top-2 ${
            result.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            <div className="flex items-center gap-2 font-bold">
                {result.type === 'success' ? <CheckCircle size={20}/> : <AlertCircle size={20}/>}
                <span>{result.msg}</span>
            </div>
            
            {result.type === 'success' && (
                <div className="ml-7">
                    <Link href="/crm/review" className="text-sm underline hover:text-green-900 flex items-center gap-1">
                        Ga naar Review Queue om ze goed te keuren <ArrowRight size={14}/>
                    </Link>
                </div>
            )}
          </div>
        )}

        {/* DE KNOP */}
        <button 
          onClick={runCurator}
          disabled={loading}
          className="w-full py-4 bg-museum-gold hover:bg-yellow-500 text-black font-bold rounded-lg transition-all flex justify-center items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <> <Loader2 className="animate-spin" /> Curator is aan het werk... </>
          ) : (
            <> <Download size={20} /> Haal 10 Nieuwe Werken Op </>
          )}
        </button>
        
        <p className="text-xs text-center text-slate-400 mt-4">
            Tip: Klik gerust meerdere keren voor meer batches.
        </p>
      </div>
    </div>
  );
}
