'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { Download, Check, X, Loader2, RefreshCw, Image as ImageIcon, ExternalLink } from 'lucide-react';

export default function ImportPage() {
    const [candidates, setCandidates] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [offset, setOffset] = useState(0); 
    const [processing, setProcessing] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    
    const supabase = createClient();

    const fetchCandidates = async () => {
        setLoading(true);
        setErrorMsg(null);
        try {
            const res = await fetch(`/api/crm/import-batch?offset=${offset}`);
            if (!res.ok) {
                const text = await res.text();
                throw new Error(`Server Error: ${res.status} - ${text}`);
            }
            const data = await res.json();
            
            if (data.error) throw new Error(data.error);

            if (data.results && data.results.length > 0) {
                setCandidates(prev => {
                    const existingIds = new Set(prev.map(p => p.wikidata_id));
                    const newUnique = data.results.filter((r: any) => !existingIds.has(r.wikidata_id));
                    return [...prev, ...newUnique];
                });
                setOffset(data.nextOffset);
            } else {
                alert("Geen nieuwe geschikte kandidaten gevonden in deze batch. Probeer nog eens voor de volgende batch.");
                setOffset(data.nextOffset);
            }
        } catch (e: any) {
            console.error(e);
            setErrorMsg("Fout bij ophalen: " + e.message);
        }
        setLoading(false);
    };

    const handleImport = async (item: any) => {
        setProcessing(item.wikidata_id);
        
        // 1. Insert in DB as DRAFT (Review Queue)
        const { error } = await supabase.from('artworks').insert({
            title: item.title,
            artist: item.artist,
            image_url: item.image_url,
            year_created: item.year ? parseInt(item.year) : null,
            wikidata_id: item.wikidata_id,
            status: 'draft', // <--- CHANGE: Goes to Review Queue
            description: `Geïmporteerd via Art Curator. Populariteitsscore: ${item.sitelinks}`
        });

        if (!error) {
            setCandidates(prev => prev.filter(c => c.wikidata_id !== item.wikidata_id));
        } else {
            alert("Database Error: " + error.message);
        }
        setProcessing(null);
    };

    const handleReject = (id: string) => {
        setCandidates(prev => prev.filter(c => c.wikidata_id !== id));
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center gap-2">
                        <Download className="text-museum-gold"/> Art Curator
                    </h1>
                    <p className="text-slate-500">
                        De robot zoekt op Wikidata naar populaire meesterwerken die nog niet in jouw collectie zitten.
                    </p>
                </div>
                <button 
                    onClick={fetchCandidates} 
                    disabled={loading}
                    className="bg-museum-gold text-black px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-yellow-500 transition-colors shadow-lg disabled:opacity-50"
                >
                    {loading ? <Loader2 className="animate-spin"/> : <RefreshCw/>} 
                    {candidates.length > 0 ? "Meer Laden" : "Start Zoektocht"}
                </button>
            </header>

            {errorMsg && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-8 border border-red-100 flex items-center gap-2">
                    <X size={20}/> {errorMsg}
                </div>
            )}

            {/* GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {candidates.map((item) => (
                    <div key={item.wikidata_id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col">
                        <div className="h-56 relative bg-slate-100">
                            <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                            <div className="absolute top-2 left-2 bg-blue-600/90 text-white text-[10px] font-bold px-2 py-1 rounded backdrop-blur-sm z-10">
                                {item.type}
                            </div>
                            <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded backdrop-blur-sm">
                                ★ {item.sitelinks}
                            </div>
                            <a href={item.image_url} target="_blank" rel="noopener noreferrer" className="absolute bottom-2 right-2 bg-white/20 hover:bg-white/40 text-white p-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                <ExternalLink size={16}/>
                            </a>
                        </div>
                        <div className="p-4 flex-1 flex flex-col">
                            <h3 className="font-bold text-slate-800 mb-1 line-clamp-1" title={item.title}>{item.title}</h3>
                            <p className="text-sm text-slate-500 mb-4 line-clamp-1">{item.artist}, {item.year}</p>
                            <div className="mt-auto flex gap-2">
                                <button onClick={() => handleReject(item.wikidata_id)} className="flex-1 border border-red-100 text-red-400 hover:bg-red-50 py-2 rounded-lg font-bold transition-colors flex justify-center"><X size={20}/></button>
                                <button onClick={() => handleImport(item)} disabled={!!processing} className="flex-[3] bg-slate-900 text-white hover:bg-slate-700 py-2 rounded-lg font-bold transition-colors flex justify-center gap-2 items-center">
                                    {processing === item.wikidata_id ? <Loader2 className="animate-spin" size={18}/> : <Check size={18}/>} Toevoegen
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {!loading && candidates.length === 0 && !errorMsg && (
                <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                    <ImageIcon size={48} className="mx-auto text-slate-300 mb-4"/>
                    <p className="text-slate-400">Nog geen kandidaten. Klik op "Start Zoektocht" om te beginnen.</p>
                </div>
            )}
        </div>
    );
}
