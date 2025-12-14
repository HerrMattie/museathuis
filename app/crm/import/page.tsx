'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Download, Loader2, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';

export default function ImportPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  const runCurator = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      // We gebruiken POST om caching te voorkomen
      const res = await fetch('/api/import/wikidata', { 
          method: 'POST',
          cache: 'no-store' 
      });

      // Eerst de tekst ophalen om HTML-fouten (de '<' error) af te vangen
      const text = await res.text();
      
      try {
          const data = JSON.parse(text); // Probeer te parsen naar JSON
          
          if (res.ok && data.success) {
            setResult({ type: 'success', msg: data.message });
          } else {
            setResult({ type: 'error', msg: data.error || 'Server gaf een foutmelding.' });
          }
      } catch (jsonError) {
          // Dit vangt de "Unexpected token <" fout af
          console.error("Geen JSON ontvangen:", text);
          setResult({ type: 'error', msg: 'Wikidata reageerde te traag (Timeout). Probeer het nog eens, het lukt vaak de 2e keer.' });
      }

    } catch (e) {
      setResult({ type: 'error', msg: 'Verbindingsfout.' });
    }
    
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-serif text-slate-900">Art Curator</h1>
        <p className="text-slate-500">Importeer kunstwerken van Wikidata.</p>
      </div>

      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm max-w-2xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-museum-gold/20 p-4 rounded-full text-yellow-800">
             <Download size={32} />
          </div>
          <div>
            <h3 className="font-bold text-lg">Start Zoektocht</h3>
            <p className="text-sm text-slate-500">
              Haal een batch van <strong>20 werken</strong> op. <br/>
              Kleine batches voorkomen timeouts en fouten.
            </p>
          </div>
        </div>

        {result && (
          <div className={`p-4 rounded-lg flex flex-col gap-2 mb-6 ${
            result.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            <div className="flex items-center gap-2 font-bold">
                {result.type === 'success' ? <CheckCircle size={20}/> : <AlertCircle size={20}/>}
                <span>{result.msg}</span>
            </div>
            
            {result.type === 'success' && (
                <div className="ml-7">
                    <Link href="/crm/review" className="text-sm underline hover:text-green-900 flex items-center gap-1">
                        Ga naar Review Queue <ArrowRight size={14}/>
                    </Link>
                </div>
            )}
          </div>
        )}

        <button 
          onClick={runCurator}
          disabled={loading}
          className="w-full py-4 bg-museum-gold hover:bg-yellow-500 text-black font-bold rounded-lg transition-all flex justify-center items-center gap-2 shadow-sm disabled:opacity-50"
        >
          {loading ? (
            <> <Loader2 className="animate-spin" /> Curator is aan het werk... </>
          ) : (
            <> <Download size={20} /> Haal 20 Nieuwe Werken Op </>
          )}
        </button>
      </div>
    </div>
  );
}
