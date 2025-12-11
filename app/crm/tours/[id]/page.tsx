'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, Plus, Trash2, GripVertical, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';

export default function TourEditorPage({ params }: { params: { id: string } }) {
    const [tour, setTour] = useState<any>(null);
    const [stops, setStops] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const fetchData = async () => {
            if (params.id === 'new') {
                setTour({ title: '', intro: '', hero_image_url: '', is_premium: false, status: 'draft' });
                setLoading(false);
            } else {
                // Tour data
                const { data: tourData } = await supabase.from('tours').select('*').eq('id', params.id).single();
                setTour(tourData);
                
                // Stops data
                const { data: stopData } = await supabase.from('tour_items').select('*, artwork:artworks(title, image_url)').eq('tour_id', params.id).order('position', { ascending: true });
                setStops(stopData || []);
                
                setLoading(false);
            }
        };
        fetchData();
    }, [params.id]);

    const handleSave = async () => {
        setSaving(true);
        
        // 1. Sla Tour op
        let tourId = params.id;
        const tourPayload = { ...tour };
        delete tourPayload.id; // ID niet updaten

        if (params.id === 'new') {
            const { data, error } = await supabase.from('tours').insert(tourPayload).select().single();
            if (error) { alert("Error: " + error.message); setSaving(false); return; }
            tourId = data.id;
        } else {
            const { error } = await supabase.from('tours').update(tourPayload).eq('id', tourId);
            if (error) { alert("Error: " + error.message); setSaving(false); return; }
        }

        // 2. Sla Stops op (Alleen volgorde en tekst updates, nieuwe stops toevoegen doen we via aparte modals of direct)
        // Voor nu simpel: We gaan ervan uit dat stops apart worden toegevoegd via de 'Add Stop' knop logica (hieronder vereenvoudigd)
        
        alert("Tour opgeslagen!");
        if (params.id === 'new') router.replace(`/crm/tours/${tourId}`);
        setSaving(false);
    };

    // Placeholder functie voor Stop toevoegen (in een echte app zou dit een Artwork Picker openen)
    const handleAddStop = async () => {
        const artworkId = prompt("Voer Artwork ID in (Tijdelijk, tot we picker hebben):");
        if (!artworkId) return;

        const { error } = await supabase.from('tour_items').insert({
            tour_id: params.id,
            artwork_id: artworkId,
            position: stops.length + 1,
            text_short: "Beschrijving van deze stop..."
        });

        if (!error) {
            // Refresh stops
            const { data } = await supabase.from('tour_items').select('*, artwork:artworks(title, image_url)').eq('tour_id', params.id).order('position', { ascending: true });
            setStops(data || []);
        } else {
            alert("Fout: " + error.message);
        }
    };

    const handleDeleteStop = async (id: string) => {
        if(!confirm("Stop verwijderen?")) return;
        await supabase.from('tour_items').delete().eq('id', id);
        setStops(prev => prev.filter(s => s.id !== id));
    };

    if (loading) return <div className="p-8">Laden...</div>;

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <header className="flex justify-between items-center mb-8">
                <Link href="/crm/tours" className="flex items-center gap-2 text-slate-500 hover:text-slate-800">
                    <ArrowLeft size={20}/> Terug
                </Link>
                <button onClick={handleSave} disabled={saving} className="bg-museum-gold text-black px-6 py-2 rounded-lg font-bold flex items-center gap-2">
                    {saving ? <Loader2 className="animate-spin"/> : <Save size={18}/>} Opslaan
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* SETTINGS */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Cover Afbeelding</label>
                        <div className="aspect-video bg-slate-100 rounded-lg overflow-hidden mb-3 relative">
                            {tour.hero_image_url ? <img src={tour.hero_image_url} className="w-full h-full object-cover"/> : <div className="flex items-center justify-center h-full"><ImageIcon className="text-slate-300"/></div>}
                        </div>
                        <input className="w-full border p-2 rounded text-xs" placeholder="Image URL" value={tour.hero_image_url || ''} onChange={e => setTour({...tour, hero_image_url: e.target.value})} />
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={tour.is_premium} onChange={e => setTour({...tour, is_premium: e.target.checked})} className="w-5 h-5 accent-museum-gold"/>
                            <span className="font-medium">Premium Only</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={tour.status === 'published'} onChange={e => setTour({...tour, status: e.target.checked ? 'published' : 'draft'})} className="w-5 h-5 accent-green-600"/>
                            <span className="font-medium">Gepubliceerd</span>
                        </label>
                    </div>
                </div>

                {/* CONTENT & STOPS */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                        <div>
                            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Titel</label>
                            <input className="w-full border p-3 rounded-lg font-bold text-lg" value={tour.title} onChange={e => setTour({...tour, title: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Introductie</label>
                            <textarea className="w-full border p-3 rounded-lg h-24" value={tour.intro} onChange={e => setTour({...tour, intro: e.target.value})} />
                        </div>
                    </div>

                    {/* STOPS LIST */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">Tour Stops ({stops.length})</h3>
                            {params.id !== 'new' && (
                                <button onClick={handleAddStop} className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-3 py-1 rounded text-sm font-bold flex items-center gap-2">
                                    <Plus size={16}/> Stop Toevoegen
                                </button>
                            )}
                        </div>

                        <div className="space-y-3">
                            {stops.map((stop, index) => (
                                <div key={stop.id} className="bg-white border rounded-lg p-4 flex gap-4 items-start group">
                                    <div className="mt-2 text-slate-300 cursor-move"><GripVertical size={20}/></div>
                                    <div className="w-8 h-8 bg-black rounded-full text-white flex items-center justify-center font-bold shrink-0">{index + 1}</div>
                                    <div className="flex-1">
                                        <h4 className="font-bold">{stop.artwork?.title || "Onbekend Werk"}</h4>
                                        <textarea 
                                            className="w-full border mt-2 p-2 rounded text-sm text-slate-600 h-16" 
                                            value={stop.text_short || ''} 
                                            // Note: In een echte app zou je hier een onBlur update doen naar de DB
                                            onChange={e => {
                                                const newStops = [...stops];
                                                newStops[index].text_short = e.target.value;
                                                setStops(newStops);
                                            }}
                                        />
                                    </div>
                                    <img src={stop.artwork?.image_url} className="w-16 h-16 object-cover rounded bg-slate-100"/>
                                    <button onClick={() => handleDeleteStop(stop.id)} className="text-slate-300 hover:text-red-500"><Trash2 size={18}/></button>
                                </div>
                            ))}
                            {stops.length === 0 && (
                                <div className="text-center p-8 bg-slate-50 border border-dashed rounded-xl text-slate-400">
                                    Nog geen stops toegevoegd.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
