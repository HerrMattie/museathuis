'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { Award, Plus, Save, Trash2, Loader2, Calendar, X } from 'lucide-react';
import BadgeIcon from '@/components/badges/BadgeIcon';

// Lijst van iconen die we ondersteunen
const ICON_OPTIONS = ['Award', 'Brain', 'Crown', 'Grid', 'Star', 'BookOpen', 'Eye', 'Target', 'Globe', 'Map', 'Flame', 'Library', 'Trophy', 'Scroll', 'Coffee', 'Moon', 'Sun', 'Clock', 'Palette', 'CloudRain', 'Heart'];

export default function BadgeManagerPage() {
    const [badges, setBadges] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    
    // Formulier state voor nieuwe badge
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        icon_name: 'Award',
        xp_reward: 100,
        is_secret: false,
        valid_from: '',
        valid_until: ''
    });

    const supabase = createClient();

    // 1. Data ophalen
    useEffect(() => {
        fetchBadges();
    }, []);

    const fetchBadges = async () => {
        const { data } = await supabase.from('badges').select('*').order('created_at', { ascending: false });
        if (data) setBadges(data);
        setLoading(false);
    };

    // 2. Nieuwe Badge Opslaan
    const handleCreate = async () => {
        setSaving(true);

        // Data opschonen (lege strings naar null voor datums)
        const payload = {
            ...formData,
            valid_from: formData.valid_from ? new Date(formData.valid_from).toISOString() : null,
            valid_until: formData.valid_until ? new Date(formData.valid_until).toISOString() : null,
        };

        const { error } = await supabase.from('badges').insert([payload]);
        
        if (!error) {
            await fetchBadges();
            setIsModalOpen(false);
            // Reset formulier
            setFormData({
                name: '',
                description: '',
                icon_name: 'Award',
                xp_reward: 100,
                is_secret: false,
                valid_from: '',
                valid_until: ''
            });
        } else {
            alert('Fout bij opslaan: ' + error.message);
        }
        setSaving(false);
    };

    // 3. Verwijderen
    const handleDelete = async (id: string) => {
        if (!confirm("Weet je zeker dat je deze badge wilt verwijderen?")) return;
        await supabase.from('badges').delete().eq('id', id);
        setBadges(prev => prev.filter(b => b.id !== id));
    };

    if (loading) return <div className="p-12 text-center"><Loader2 className="animate-spin inline mr-2"/>Badges laden...</div>;

    return (
        <div className="space-y-6 text-slate-900">
            {/* HEADER */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold font-serif text-slate-900 flex items-center gap-2">
                        <Award className="text-museum-gold" /> Badge Manager
                    </h1>
                    <p className="text-slate-500">Beheer achievements en tijdelijke events.</p>
                </div>
                
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-museum-gold text-black px-6 py-3 rounded-xl font-bold hover:bg-yellow-500 transition-colors shadow-sm"
                >
                    <Plus size={20} /> Nieuwe Badge
                </button>
            </div>

            {/* BADGE GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {badges.map((badge) => (
                    <div key={badge.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between h-full relative group">
                        
                        <div className="flex items-start gap-4 mb-4">
                            <div className={`w-12 h-12 shrink-0 rounded-full flex items-center justify-center text-xl font-bold ${badge.is_secret ? 'bg-black text-white' : 'bg-museum-gold/20 text-yellow-800'}`}>
                                {/* Hier tonen we de eerste letter of ? als placeholder voor het icoon */}
                                {badge.is_secret ? '?' : (badge.icon_name?.[0] || 'A')}
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-slate-900">{badge.name}</h3>
                                <p className="text-sm text-slate-500 line-clamp-2">{badge.description}</p>
                            </div>
                        </div>

                        <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-center">
                            <div className="flex gap-2">
                                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded font-bold uppercase">
                                    {badge.xp_reward} XP
                                </span>
                                {badge.valid_from && (
                                    <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded font-bold uppercase flex items-center gap-1">
                                        <Calendar size={10}/> Event
                                    </span>
                                )}
                            </div>
                            
                            <button 
                                onClick={() => handleDelete(badge.id)} 
                                className="text-slate-300 hover:text-red-500 transition-colors"
                                title="Verwijderen"
                            >
                                <Trash2 size={18}/>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* MODAL (POPUP) */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
                        
                        <div className="flex justify-between items-center mb-6 border-b pb-4">
                            <h2 className="text-2xl font-bold font-serif text-slate-900">Nieuwe Badge Aanmaken</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-black transition-colors">
                                <X size={28} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* BASIS INFO */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Naam</label>
                                    <input 
                                        type="text" 
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-museum-gold outline-none"
                                        placeholder="Bijv. Kerst Expert"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-500 mb-2">XP Beloning</label>
                                    <input 
                                        type="number" 
                                        value={formData.xp_reward}
                                        onChange={(e) => setFormData({...formData, xp_reward: parseInt(e.target.value)})}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-museum-gold outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Beschrijving</label>
                                <textarea 
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-museum-gold outline-none min-h-[80px]"
                                    placeholder="Wat moet de gebruiker doen om dit te winnen?"
                                />
                            </div>

                            {/* DETAILS & ICOON */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Kies een Icoon</label>
                                    <select 
                                        className="w-full p-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-museum-gold outline-none" 
                                        value={formData.icon_name} 
                                        onChange={e => setFormData({...formData, icon_name: e.target.value})}
                                    >
                                        {ICON_OPTIONS.map(icon => <option key={icon} value={icon}>{icon}</option>)}
                                    </select>
                                </div>
                                <div className="flex items-center gap-3 pt-6">
                                    <input 
                                        type="checkbox" 
                                        id="secret"
                                        className="w-5 h-5 accent-museum-gold" 
                                        checked={formData.is_secret} 
                                        onChange={e => setFormData({...formData, is_secret: e.target.checked})} 
                                    />
                                    <label htmlFor="secret" className="text-sm font-bold text-slate-700 cursor-pointer">Geheim (Hidden Achievement)</label>
                                </div>
                            </div>

                            {/* DATUMS (OPTIONEEL) */}
                            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
                                <h4 className="text-sm font-bold text-blue-800 mb-3 flex items-center gap-2"><Calendar size={16}/> Geldigheid (Optioneel)</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-blue-600 mb-1">Geldig Vanaf</label>
                                        <input 
                                            type="date" 
                                            className="w-full border border-blue-200 p-2 rounded bg-white text-sm" 
                                            value={formData.valid_from} 
                                            onChange={e => setFormData({...formData, valid_from: e.target.value})} 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-blue-600 mb-1">Geldig Tot</label>
                                        <input 
                                            type="date" 
                                            className="w-full border border-blue-200 p-2 rounded bg-white text-sm" 
                                            value={formData.valid_until} 
                                            onChange={e => setFormData({...formData, valid_until: e.target.value})} 
                                        />
                                    </div>
                                </div>
                                <p className="text-[10px] text-blue-500 mt-2">Gebruik dit voor evenementen zoals Kerstmis of tijdelijke tentoonstellingen.</p>
                            </div>

                            {/* FOOTER BUTTONS */}
                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <button 
                                    onClick={() => setIsModalOpen(false)} 
                                    className="px-6 py-3 text-slate-500 hover:bg-slate-100 rounded-lg font-bold transition-colors"
                                >
                                    Annuleren
                                </button>
                                <button 
                                    onClick={handleCreate} 
                                    disabled={saving}
                                    className="bg-midnight-950 text-white px-8 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-black transition-colors disabled:opacity-50"
                                >
                                    {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                                    Badge Opslaan
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}
