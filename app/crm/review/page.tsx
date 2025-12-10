'use client';

import { useState } from 'react';
import { Download, Check, X, Loader2, Image as ImageIcon, RefreshCw } from 'lucide-react';
import { createClient } from '@/lib/supabaseClient';

export default function ReviewPage() {
    const [candidates, setCandidates] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [offset, setOffset] = useState(0); // Onthoud waar we gebleven zijn
    const [processing, setProcessing] = useState<string | null>(null);
    const supabase = createClient();

    const fetchCandidates = async () => {
        setLoading(true);
        try {
            // We sturen de huidige offset mee, zodat we niet steeds bij 0 beginnen
            const res = await fetch(`/api/crm/import-batch?offset=${offset}`);
            const data = await res.json();
            
            if (data.results) {
                // Voeg nieuwe kandidaten toe aan de lijst (of vervang, wat je wilt)
                setCandidates(prev => [...prev, ...data.results]);
                setOffset(data.nextOffset); // Update offset voor volgende keer
            }
        } catch (e) {
            alert("Fout bij ophalen");
        }
        setLoading(false);
    };

    const handleImport = async (item: any) => {
        setProcessing(item.wikidata_id);
        
        // Importeer naar Artworks tabel
        const { error } = await supabase.from('artworks').insert({
            title: item.title,
            artist: item.artist,
            image_url: item.image_url,
            year_created: item.year ? parseInt(item.year) : null,
            wikidata_id: item.wikidata_id, // BELANGRIJK: Opslaan voor ontdubbeling
            status: 'draft', // Eerst draft
            description: `Import uit Toplijst (Populariteit: ${item.sitelinks})`
        });

        if (!error) {
            // Verwijder uit de lijst
            setCandidates(prev => prev.filter(c => c.wikidata_id !== item.wikidata_id));
        } else {
            alert("Error: " + error.message);
        }
        setProcessing(null);
    };

    const handleReject = (id: string) => {
        // Gewoon uit de lijst gooien (volgende keer komt hij misschien terug, 
        // of je moet een 'ignored_items' tabel maken als je dat wilt voorkomen)
        setCandidates(prev => prev.filter(c => c.wikidata_id !== id));
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <header className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 mb-2">Collectie Uitbreiden</h1>
                    <p className="text-slate-500">
                        De 'Batch Robot' zoekt de populairste meesterwerken die we nog niet hebben.<br/>
                        Jij hoeft alleen maar goed te keuren.
                    </p>
                </div>
                <button 
                    onClick={fetchCandidates} 
                    disabled={loading}
                    className="bg-museum-gold text-black px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-yellow-500 transition-colors shadow-lg"
                >
                    {loading ? <Loader2 className="animate-spin"/> : <RefreshCw/>} 
                    {candidates.length > 0 ? "Meer Laden" : "Start Zoektocht"}
                </button>
            </header>

            {/* GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {candidates.map((item) => (
                    <div key={item.wikidata_id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all group">
                        
                       {/* IMAGE */}
                        <div className="h-56 relative bg-slate-100">
                            <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                            
                            {/* --- NIEUW: TYPE BADGE --- */}
                            <div className="absolute top-2 left-2 bg-blue-600/90 text-white text-[10px] font-bold px-2 py-1 rounded backdrop-blur-sm z-10">
                                {item.type}
                            </div>
                        
                            {/* Kwaliteit Badge (AANGEPAST: Verplaatst naar top-9 om overlap te voorkomen) */}
                            <div className="absolute top-9 left-2 bg-green-500/90 text-white text-[10px] font-bold px-2 py-1 rounded backdrop-blur-sm">
                                {item.width}x{item.height}
                            </div>
                        
                            {/* Populariteit Badge */}
                            <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded backdrop-blur-sm">
                                ★ {item.sitelinks}
                            </div>
                            
                            <a href={item.image_url} target="_blank" className="absolute bottom-2 right-2 bg-white/20 hover:bg-white/40 text-white p-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                <ImageIcon size={16}/>
                            </a>
                        </div>

                        {/* INFO */}
                        <div className="p-4">
                            <h3 className="font-bold text-slate-800 mb-1 line-clamp-1" title={item.title}>{item.title}</h3>
                            <p className="text-sm text-slate-500 mb-4 line-clamp-1">{item.artist}, {item.year}</p>
                            
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => handleReject(item.wikidata_id)}
                                    className="flex-1 border border-red-100 text-red-400 hover:bg-red-50 py-2 rounded-lg font-bold transition-colors flex justify-center"
                                >
                                    <X size={18}/>
                                </button>
                                <button 
                                    onClick={() => handleImport(item)}
                                    disabled={!!processing}
                                    className="flex-[3] bg-slate-900 text-white hover:bg-slate-700 py-2 rounded-lg font-bold transition-colors flex justify-center gap-2 items-center"
                                >
                                    {processing === item.wikidata_id ? <Loader2 className="animate-spin" size={18}/> : <Check size={18}/>}
                                    Toevoegen
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {!loading && candidates.length === 0 && (
                <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                    <p className="text-slate-400">Nog geen kandidaten geladen. Klik op "Start Zoektocht".</p>
                </div>
            )}
        </div>
    );
}
