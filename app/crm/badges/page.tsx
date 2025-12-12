'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { Award, Plus, Save, Trash2, Loader2, Calendar } from 'lucide-react';

// Lijst van iconen die we ondersteunen in de frontend mapping
const ICON_OPTIONS = ['Award', 'Brain', 'Crown', 'Grid', 'Star', 'BookOpen', 'Eye', 'Target', 'Globe', 'Map', 'Flame', 'Library', 'Trophy', 'Scroll', 'Coffee', 'Moon', 'Sun', 'Clock', 'Palette', 'CloudRain', 'Heart'];

export default function BadgeManagerPage() {
    const [badges, setBadges] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<any>({});
    
    const supabase = createClient();

    useEffect(() => {
        fetchBadges();
    }, []);

    const fetchBadges = async () => {
        const { data } = await supabase.from('badges').select('*').order('xp_reward', { ascending: true });
        setBadges(data || []);
        setLoading(false);
    };

    const handleCreate = async () => {
        const newBadge = {
            name: 'Nieuwe Badge',
            description: 'Beschrijving...',
            icon_name: 'Award',
            xp_reward: 50,
            is_secret: false,
            category: 'general',
            condition_type: 'manual', // Standaard
            condition_target: 1
        };
        const { data, error } = await supabase.from('badges').insert(newBadge).select().single();
        if (error) alert("Error: " + error.message);
        else {
            setBadges([...badges, data]);
            startEdit(data); // Direct openen
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Badge verwijderen?")) return;
        await supabase.from('badges').delete().eq('id', id);
        setBadges(prev => prev.filter(b => b.id !== id));
    };

    const startEdit = (badge: any) => {
        setEditingId(badge.id);
        setEditForm({ ...badge });
    };

    const saveEdit = async () => {
        const { error } = await supabase.from('badges').update(editForm).eq('id', editingId);
        if (error) alert("Error: " + error.message);
        else {
            setBadges(prev => prev.map(b => b.id === editingId ? editForm : b));
            setEditingId(null);
        }
    };

    if (loading) return <div className="p-8"><Loader2 className="animate-spin"/></div>;

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center gap-2">
                        <Award className="text-museum-gold"/> Badge Manager
                    </h1>
                    <p className="text-slate-500">Beheer achievements en tijdelijke events.</p>
                </div>
                <button onClick={handleCreate} className="bg-museum-gold text-black px-6 py-2 rounded-xl font-bold flex items-center gap-2">
                    <Plus size={20}/> Nieuwe Badge
                </button>
            </header>

            <div className="grid grid-cols-1 gap-4">
                {badges.map(badge => (
                    <div key={badge.id} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                        {editingId === badge.id ? (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold uppercase text-slate-500">Naam</label>
                                        <input className="w-full border p-2 rounded" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold uppercase text-slate-500">XP Waarde</label>
                                        <input type="number" className="w-full border p-2 rounded" value={editForm.xp_reward} onChange={e => setEditForm({...editForm, xp_reward: e.target.value})} />
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="text-xs font-bold uppercase text-slate-500">Beschrijving</label>
                                    <textarea className="w-full border p-2 rounded h-20" value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} />
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-lg">
                                    <div>
                                        <label className="text-xs font-bold uppercase text-slate-500">Icoon</label>
                                        <select className="w-full border p-2 rounded bg-white" value={editForm.icon_name} onChange={e => setEditForm({...editForm, icon_name: e.target.value})}>
                                            {ICON_OPTIONS.map(icon => <option key={icon} value={icon}>{icon}</option>)}
                                        </select>
                                    </div>
                                    <div className="flex items-center gap-2 pt-6">
                                        <input type="checkbox" className="w-5 h-5" checked={editForm.is_secret} onChange={e => setEditForm({...editForm, is_secret: e.target.checked})} />
                                        <label className="text-sm font-bold">Geheim (Secret)</label>
                                    </div>
                                </div>

                                {/* DATUM INSTELLINGEN (Hier vroeg je om) */}
                                <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg">
                                    <h4 className="text-sm font-bold text-blue-800 mb-2 flex items-center gap-2"><Calendar size={14}/> Geldigheid (Optioneel)</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-blue-600">Geldig Vanaf</label>
                                            <input type="date" className="w-full border p-2 rounded" value={editForm.valid_from ? editForm.valid_from.split('T')[0] : ''} onChange={e => setEditForm({...editForm, valid_from: e.target.value ? new Date(e.target.value).toISOString() : null})} />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-blue-600">Geldig Tot</label>
                                            <input type="date" className="w-full border p-2 rounded" value={editForm.valid_until ? editForm.valid_until.split('T')[0] : ''} onChange={e => setEditForm({...editForm, valid_until: e.target.value ? new Date(e.target.value).toISOString() : null})} />
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-blue-500 mt-2">Gebruik dit voor evenementen zoals Kerst (25 dec) of Koningsdag.</p>
                                </div>

                                <div className="flex justify-end gap-2 pt-2">
                                    <button onClick={() => setEditingId(null)} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded">Annuleren</button>
                                    <button onClick={saveEdit} className="bg-blue-600 text-white px-6 py-2 rounded font-bold flex items-center gap-2"><Save size={16}/> Opslaan</button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${badge.is_secret ? 'bg-black text-white' : 'bg-museum-gold text-black'}`}>
                                        {badge.is_secret ? '?' : (badge.icon_name?.[0] || 'A')}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">{badge.name}</h3>
                                        <p className="text-sm text-slate-500">{badge.description}</p>
                                        <div className="flex gap-2 mt-1">
                                            <span className="text-[10px] bg-slate-100 px-2 py-1 rounded font-bold uppercase">{badge.xp_reward} XP</span>
                                            {badge.valid_from && <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-1 rounded font-bold uppercase flex items-center gap-1"><Calendar size={10}/> Tijdelijk Event</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => startEdit(badge)} className="p-2 hover:bg-slate-100 rounded text-slate-500"><Save size={18} className="rotate-0"/></button>
                                    <button onClick={() => handleDelete(badge.id)} className="p-2 hover:bg-red-50 rounded text-red-400"><Trash2 size={18}/></button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
