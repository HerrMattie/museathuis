'use client';

import { useState } from 'react';
import { Download, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export default function ImportPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const runCurator = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      // We roepen onze nieuwe geoptimaliseerde route aan
      const res = await fetch('/api/import/wikidata');
      const data = await res.json();
      
      if (res.ok) {
        setResult({ type: 'success', msg: data.message });
      } else {
        setResult({ type: 'error', msg: data.error || 'Server timeout' });
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
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-yellow-100 p-4 rounded-full text-yellow-700">
             <Download size={32} />
          </div>
          <div>
            <h3 className="font-bold text-lg">Start Zoektocht</h3>
            <p className="text-sm text-slate-500">
              De curator haalt een batch van 10 beroemde werken op, controleert op dubbelingen en voegt ze toe.
            </p>
          </div>
        </div>

        {/* FEEDBACK MELDINGEN */}
        {result && (
          <div className={`p-4 rounded-lg flex items-center gap-2 mb-6 ${
            result.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {result.type === 'success' ? <CheckCircle size={20}/> : <AlertCircle size={20}/>}
            <span>{result.msg}</span>
          </div>
        )}

        <button 
          onClick={runCurator}
          disabled={loading}
          className="w-full py-4 bg-museum-gold hover:bg-yellow-500 text-black font-bold rounded-lg transition-all flex justify-center items-center gap-2"
        >
          {loading ? (
            <> <Loader2 className="animate-spin" /> Curator is aan het werk... </>
          ) : (
            <> <Download size={20} /> Haal 10 Nieuwe Werken Op </>
          )}
        </button>
        
        <p className="text-xs text-center text-slate-400 mt-4">
            Tip: Je kunt meerdere keren klikken om meer batches binnen te halen.
        </p>
      </div>
    </div>
  );
}
