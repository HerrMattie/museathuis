'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, Image as ImageIcon, Search } from 'lucide-react';
import Link from 'next/link';

export default function FocusEditorPage({ params }: { params: { id: string } }) {
    const [item, setItem] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [showSearch, setShowSearch] = useState(false);

    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const fetchItem = async () => {
            if (params.id === 'new') {
                setItem({ title: '', intro: '', content_markdown: '', is_premium: false, status: 'draft', audio_url: '' });
                setLoading(false);
            } else {
                // Haal item op inclusief gelinkt artwork (als die relatie bestaat)
                // Voor nu slaan we de image_url direct op in focus_items of via een relatie
                const { data } = await supabase.from('focus_items').select('*').eq('id', params.id).single();
                setItem(data);
                setLoading(false);
            }
        };
        fetchItem();
    }, [params.id]);

    const handleSearchArtwork = async (e: any) => {
        e.preventDefault();
        const { data } = await supabase.from('artworks').select('id, title, image_url, artist').ilike('title', `%${searchQuery}%`).limit(5);
        setSearchResults(data || []);
    };

    const selectArtwork = (art: any) => {
        // We slaan de image_url op in het item (of artwork_id als je dat hebt)
        // Hier ga ik ervan uit dat focus_items een kolom 'image_url' heeft (of cover_image)
        setItem({ ...item, cover_image: art.image_url }); 
        setShowSearch(false);
    };

    const handleSave = async () => {
        setSaving(true);
        const payload = { ...item };
        delete payload.id; 
        delete payload.created_at;

        let error;
        if (params.id === 'new') {
            const res = await supabase.from('focus_items').insert(payload).select().single();
            error = res.error;
            if (res.data) router.replace(`/crm/focus/${res.data.id}`);
        } else {
            const res = await supabase.from('focus_items').update(payload).eq('id', params.id);
            error = res.error;
        }

        if (error) alert("Fout: " + error.message);
        else alert("Opgeslagen!");
        
        setSaving(false);
    };

    if (loading) return <div className="p-8">Laden...</div>;

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <header className="flex justify-between items-center mb-8">
                <Link href="/crm/focus" className="flex items-center gap-2 text-slate-500 hover:text-slate-800">
                    <ArrowLeft size={20}/> Terug
                </Link>
                <button onClick={handleSave} disabled={saving} className="bg-museum-gold text-black px-6 py-2 rounded-lg font-bold flex items-center gap-2">
                    {saving ? <Loader2 className="animate-spin"/> : <Save size={18}/>} Opslaan
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* LINKER KOLOM: SETTINGS & IMAGE */}
                <div className="space-y-6">
                    
                    {/* Afbeelding Kiezer */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Omslagafbeelding</label>
                        
                        <div className="aspect-[3/4] bg-slate-100 rounded-lg overflow-hidden mb-3 relative group">
                            {item.cover_image ? (
                                <img src={item.cover_image} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400">
                                    <ImageIcon size={48}/>
                                </div>
                            )}
                            <button onClick={() => setShowSearch(!showSearch)} className="absolute inset-0 bg-black/50 text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                Wijzig Foto
                            </button>
                        </div>

                        {/* Zoekbalk (Popup) */}
                        {showSearch && (
                            <div className="mb-2">
                                <div className="flex gap-2 mb-2">
                                    <input className="border p-2 rounded text-sm flex-1" placeholder="Zoek kunst..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                                    <button onClick={handleSearchArtwork} className="bg-slate-200 p-2 rounded"><Search size={16}/></button>
                                </div>
                                <div className="max-h-40 overflow-y-auto border rounded text-sm">
                                    {searchResults.map(art => (
                                        <div key={art.id} onClick={() => selectArtwork(art)} className="p-2 hover:bg-slate-100 cursor-pointer flex gap-2 items-center">
                                            <img src={art.image_url} className="w-6 h-6 rounded object-cover"/>
                                            <span className="truncate">{art.title}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={item.is_premium} onChange={e => setItem({...item, is_premium: e.target.checked})} className="w-5 h-5 accent-museum-gold"/>
                            <span className="font-medium">Premium Only</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={item.status === 'published'} onChange={e => setItem({...item, status: e.target.checked ? 'published' : 'draft'})} className="w-5 h-5 accent-green-600"/>
                            <span className="font-medium">Gepubliceerd</span>
                        </label>
                    </div>
                </div>

                {/* RECHTER KOLOM: TEKST EDITOR */}
                <div className="md:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Titel</label>
                        <input className="w-full border p-3 rounded-lg text-lg font-bold" value={item.title} onChange={e => setItem({...item, title: e.target.value})} placeholder="Titel van het artikel"/>
                    </div>
                    
                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Introductie (Kort)</label>
                        <textarea className="w-full border p-3 rounded-lg h-24" value={item.intro} onChange={e => setItem({...item, intro: e.target.value})} placeholder="Pakkende inleiding..."/>
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Inhoud (Markdown)</label>
                        <textarea className="w-full border p-3 rounded-lg h-96 font-mono text-sm leading-relaxed" value={item.content_markdown} onChange={e => setItem({...item, content_markdown: e.target.value})} placeholder="# Hoofdstuk 1&#10;&#10;Schrijf hier je artikel..."/>
                        <p className="text-[10px] text-slate-400 mt-1">Je kunt Markdown gebruiken voor opmaak (**vet**, *cursief*, kopjes).</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
