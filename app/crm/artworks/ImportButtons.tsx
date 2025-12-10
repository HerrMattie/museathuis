'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Download, Sparkles, Loader2, Plus } from 'lucide-react';

export default function ImportButtons() {
    const [loading, setLoading] = useState('');
    const router = useRouter();

    const handleImport = async () => {
        setLoading('import');
        try {
            const res = await fetch('/api/import/wikidata', { method: 'POST' });
            if(!res.ok) throw new Error("Import mislukt");
            router.refresh();
        } catch(e) { alert("Fout"); }
        setLoading('');
    };

    const handleEnrich = async () => {
        setLoading('enrich');
        // Hier roepen we de cronjob aan die de verrijking doet, of een loop over items
        // Voor nu simuleren we dit even door te refreshen, 
        // maar in het echt moet je hier een API call doen die artworks met is_enriched=false pakt
        alert("Tip: Klik op 'Genereer Vandaag' in het dashboard om ook verrijking te triggeren, of wacht op de nachtelijke ronde.");
        setLoading('');
    };

    return (
        <div className="flex gap-3">
            <button onClick={handleImport} disabled={!!loading} className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-slate-50">
                {loading === 'import' ? <Loader2 className="animate-spin" size={18}/> : <Download size={18}/>} 
                Importeer Wikidata
            </button>
            <button onClick={handleEnrich} disabled={!!loading} className="bg-purple-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-purple-700">
                {loading === 'enrich' ? <Loader2 className="animate-spin" size={18}/> : <Sparkles size={18}/>} 
                Verrijk Collectie
            </button>
        </div>
    );
}
