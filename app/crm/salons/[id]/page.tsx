'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, Search, Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';

export default function SalonEditorPage({ params }: { params: { id: string } }) {
    const [salon, setSalon] = useState<any>(null);
    const [items, setItems] = useState<any[]>([]); // De kunstwerken in deze salon
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    // Zoekfunctie
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);

    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const fetchData = async () => {
            if (params.id === 'new') {
                setSalon({ title: '', description: '', image_url: '', is_premium: true, status: 'draft' });
                setLoading(false);
            } else {
                // Salon data
                const { data: sData } = await supabase.from('salons').select('*').eq('id', params.id).single();
                setSalon(sData);
                
                // Items data
                const { data: iData } = await supabase
                    .from('salon_items')
                    .select('*, artwork:artworks(title, image_url, artist)')
                    .eq('salon_id', params.id)
                    .order('position', { ascending: true });
                setItems(iData || []);
                setLoading(false);
            }
        };
        fetchData();
    }, [params.id]);

    const handleSave = async () => {
        setSaving(true);
        const payload = { ...salon };
        delete payload.id; 

        let salonId = params.id;

        if (params.id === 'new') {
            const { data, error } = await supabase.from('salons').insert(payload).select().single();
            if (error) { alert("Error: " + error.message); setSaving(false); return; }
            salonId = data.id;
        } else {
            await supabase.from('salons').update(payload).eq('id', params.id);
        }

        alert("Salon opgeslagen!");
        if (params.id === 'new') router.replace(`/crm/salons/${salonId}`);
        setSaving(false);
    };

    // ITEM TOEVOEGEN LOGICA
    const searchArtworks = async (e: any) => {
        e.preventDefault();
        const { data } = await supabase.from('artworks').select('*').ilike('title', `%${searchQuery}%`).limit(5);
        setSearchResults(data || []);
    };

    const addArtwork = async (art: any) => {
        if (params.id === 'new') { alert("Sla de Salon eerst op."); return; }

        const { error } = await supabase.from('salon_items').insert({
            salon_id: params.id,
            artwork_id: art.id,
            position: items.length + 1
        });

        if (!error) {
            // Refresh items
            const { data } = await supabase.from('salon_items').select('*, artwork:artworks(title, image_url, artist)').eq('salon_id', params.id).order('position');
            setItems(data || []);
            setSearchResults([]);
            setSearchQuery('');
        }
    };

    const removeItem = async (itemId: string) => {
        await supabase.from('salon_items').delete().eq('id', itemId);
        setItems(prev => prev.filter(i => i.id !== itemId));
    };

    if (loading) return <div className="p-8">Laden...</div>;

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <header className="flex justify-between items-center mb-8">
                <Link href="/crm/salons" className="flex items-center gap-2 text-slate-500 hover:text-slate-800">
                    <ArrowLeft size={20}/> Terug
                </Link>
                <button onClick={handleSave} disabled={saving} className="bg-museum-gold text-black px-6 py-2 rounded-lg font-bold flex items-center gap-2">
                    {saving ? <Loader2 className="animate-spin"/> : <Save size={18}/>} Opslaan
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* LINKS: SETTINGS */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Cover Afbeelding</label>
                        <div className="aspect-video bg-slate-100 rounded-lg overflow-hidden mb-3 relative">
                            {salon.image_url ? <img src={salon.image_url} className="w-full h-full object-cover"/> : <div className="flex items-center justify-center h-full"><ImageIcon className="text-slate-300"/></div>}
                        </div>
                        <input className="w-full border p-2 rounded text-xs" placeholder="Afbeelding URL" value={salon.image_url || ''} onChange={e => setSalon({...salon, image_url: e.target.value})} />
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={salon.is_premium} onChange={e => setSalon({...salon, is_premium: e.target.checked})} className="w-5 h-5 accent-museum-gold"/>
                            <span className="font-medium">Premium Only</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={salon.status === 'published'} onChange={e => setSalon({...salon, status: e.target.checked ? 'published' : 'draft'})} className="w-5 h-5 accent-green-600"/>
                            <span className="font-medium">Gepubliceerd</span>
                        </label>
                    </div>
                </div>

                {/* RECHTS: INHOUD */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                        <input className="w-full border p-3 rounded-lg font-bold text-xl" placeholder="Titel van de Salon" value={salon.title} onChange={e => setSalon({...salon, title: e.target.value})} />
                        <textarea className="w-full border p-3 rounded-lg h-24" placeholder="Beschrijving..." value={salon.description} onChange={e => setSalon({...salon, description: e.target.value})} />
                    </div>

                    {/* ITEMS TOEVOEGEN */}
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                        <h3 className="font-bold mb-4 flex items-center gap-2"><Plus size={18}/> Werken Toevoegen</h3>
                        
                        <div className="flex gap-2 mb-4 relative">
                            <input className="flex-1 border p-2 rounded" placeholder="Zoek kunstwerk..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                            <button onClick={searchArtworks} className="bg-slate-200 p-2 rounded"><Search/></button>
                            
                            {searchResults.length > 0 && (
                                <div className="absolute top-full left-0 w-full bg-white border shadow-xl rounded-lg mt-2 z-10 max-h-60 overflow-y-auto">
                                    {searchResults.map(art => (
                                        <div key={art.id} onClick={() => addArtwork(art)} className="p-2 hover:bg-slate-100 cursor-pointer flex gap-3 items-center border-b">
                                            <img src={art.image_url} className="w-10 h-10 object-cover rounded"/>
                                            <div>
                                                <span className="font-bold block text-sm">{art.title}</span>
                                                <span className="text-xs text-slate-500">{art.artist}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* LIJST MET ITEMS */}
                        <div className="space-y-2">
                            {items.map((item, idx) => (
                                <div key={item.id} className="bg-white border rounded-lg p-3 flex items-center gap-4 shadow-sm">
                                    <span className="font-mono text-slate-300 w-6">#{idx + 1}</span>
                                    <img src={item.artwork?.image_url} className="w-12 h-12 object-cover rounded bg-slate-100"/>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-sm">{item.artwork?.title}</h4>
                                        <p className="text-xs text-slate-500">{item.artwork?.artist}</p>
                                    </div>
                                    <button onClick={() => removeItem(item.id)} className="text-slate-300 hover:text-red-500"><Trash2 size={18}/></button>
                                </div>
                            ))}
                            {items.length === 0 && <p className="text-center text-slate-400 py-4">Nog geen werken in deze Salon.</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
