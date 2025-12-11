'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { Check, X, Loader2, Edit2, Save } from 'lucide-react';

export default function ReviewPage() {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<any>({});
    
    const supabase = createClient();

    useEffect(() => {
        fetchQueue();
    }, []);

    const fetchQueue = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('artworks')
            .select('*')
            .eq('status', 'draft') // Only fetch drafts
            .order('created_at', { ascending: false });
        
        setItems(data || []);
        setLoading(false);
    };

    const handlePublish = async (id: string) => {
        const { error } = await supabase
            .from('artworks')
            .update({ status: 'published' })
            .eq('id', id);

        if (!error) {
            setItems(prev => prev.filter(i => i.id !== id)); // Remove from list
        } else {
            alert("Error: " + error.message);
        }
    };

    const handleDelete = async (id: string) => {
        if(!confirm("Zeker weten?")) return;
        const { error } = await supabase.from('artworks').delete().eq('id', id);
        if (!error) {
            setItems(prev => prev.filter(i => i.id !== id));
        }
    };

    const startEdit = (item: any) => {
        setEditingId(item.id);
        setEditForm({ ...item });
    };

    const saveEdit = async () => {
        const { error } = await supabase
            .from('artworks')
            .update({ 
                title: editForm.title, 
                artist: editForm.artist, 
                description: editForm.description 
            })
            .eq('id', editingId);

        if (!error) {
            setItems(prev => prev.map(i => i.id === editingId ? { ...i, ...editForm } : i));
            setEditingId(null);
        } else {
            alert("Save Error: " + error.message);
        }
    };

    if (loading) return <div className="p-8">Laden...</div>;

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800 mb-2">Review Queue</h1>
                <p className="text-slate-500">Controleer geïmporteerde kunstwerken voordat ze live gaan.</p>
            </header>

            {items.length === 0 ? (
                <div className="p-12 text-center bg-green-50 text-green-700 rounded-xl border border-green-200">
                    <Check className="mx-auto mb-2" size={32}/>
                    Alles is goedgekeurd! Ga naar Art Curator om meer te importeren.
                </div>
            ) : (
                <div className="space-y-4">
                    {items.map((item) => (
                        <div key={item.id} className="bg-white border border-slate-200 rounded-xl p-4 flex gap-6 shadow-sm">
                            {/* Image */}
                            <div className="w-32 h-32 bg-slate-100 rounded-lg overflow-hidden shrink-0">
                                <img src={item.image_url} className="w-full h-full object-cover" />
                            </div>

                            {/* Content */}
                            <div className="flex-1">
                                {editingId === item.id ? (
                                    <div className="space-y-2">
                                        <input className="w-full border p-2 rounded font-bold" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} />
                                        <input className="w-full border p-2 rounded text-sm" value={editForm.artist} onChange={e => setEditForm({...editForm, artist: e.target.value})} />
                                        <textarea className="w-full border p-2 rounded text-sm h-20" value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} />
                                        <div className="flex gap-2">
                                            <button onClick={saveEdit} className="bg-blue-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1"><Save size={14}/> Opslaan</button>
                                            <button onClick={() => setEditingId(null)} className="text-slate-500 text-sm">Annuleren</button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-bold text-lg">{item.title}</h3>
                                            <button onClick={() => startEdit(item)} className="text-slate-400 hover:text-blue-500"><Edit2 size={16}/></button>
                                        </div>
                                        <p className="text-sm text-slate-600 mb-2">{item.artist} ({item.year_created})</p>
                                        <p className="text-xs text-slate-400 line-clamp-2">{item.description}</p>
                                    </>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-2 justify-center border-l pl-4">
                                <button onClick={() => handlePublish(item.id)} className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-green-700 transition-colors flex items-center gap-2 w-full justify-center">
                                    <Check size={16}/> Publiceren
                                </button>
                                <button onClick={() => handleDelete(item.id)} className="border border-red-200 text-red-500 px-4 py-2 rounded-lg font-bold text-sm hover:bg-red-50 transition-colors flex items-center gap-2 w-full justify-center">
                                    <X size={16}/> Verwijderen
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
