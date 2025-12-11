'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { Award, Plus, Loader2, Save, Trash2, AlertCircle } from 'lucide-react';

export default function CrmBadgesPage() {
    const [badges, setBadges] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    
    // Form state
    const [newBadge, setNewBadge] = useState({ 
        slug: '', 
        name: '', 
        description: '', 
        xp_reward: 50 
    });

    const supabase = createClient();

    useEffect(() => {
        fetchBadges();
    }, []);

    const fetchBadges = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('badge_definitions')
            .select('*')
            .order('xp_reward', { ascending: true });
            
        if (error) {
            console.error("Error fetching badges:", error);
        } else {
            setBadges(data || []);
        }
        setLoading(false);
    };

    const handleCreate = async () => {
        if (!newBadge.slug || !newBadge.name) {
            alert("Naam en Slug zijn verplicht.");
            return;
        }

        setSubmitting(true);
        
        const { error } = await supabase
            .from('badge_definitions')
            .insert([newBadge]);

        if (error) {
            alert("Fout bij aanmaken: " + error.message);
        } else {
            // Reset formulier
            setNewBadge({ slug: '', name: '', description: '', xp_reward: 50 });
            await fetchBadges();
        }
        setSubmitting(false);
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Weet je zeker dat je de badge "${name}" wilt verwijderen? Dit kan niet ongedaan worden gemaakt.`)) return;
        
        const { error } = await supabase
            .from('badge_definitions')
            .delete()
            .eq('id', id);

        if (error) {
            alert("Fout bij verwijderen: " + error.message);
        } else {
            await fetchBadges();
        }
    };

    // Helper: Auto-format slug als je de naam typt (optioneel)
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        // Als slug nog leeg is of lijkt op de oude naam, update hem dan mee
        const currentSlugGen = newBadge.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
        
        if (newBadge.slug === '' || newBadge.slug === currentSlugGen) {
            const newSlug = val.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
            setNewBadge(prev => ({ ...prev, name: val, slug: newSlug }));
        } else {
            setNewBadge(prev => ({ ...prev, name: val }));
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen text-slate-500 gap-2">
                <Loader2 className="animate-spin" /> Badges laden...
            </div>
        );
    }

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                    <Award className="text-museum-gold" /> Badge Manager
                </h1>
                <p className="text-slate-500">Beheer de gamification medailles en XP beloningen.</p>
            </header>

            {/* --- FORMULIER --- */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 mb-10 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Plus size={18} className="text-slate-400"/> Nieuwe Badge Toevoegen
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Badge Naam</label>
                        <input 
                            type="text" 
                            placeholder="Bijv. Quiz Master" 
                            value={newBadge.name} 
                            onChange={handleNameChange} 
                            className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-museum-gold outline-none transition-all" 
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Slug (Unieke ID)</label>
                        <input 
                            type="text" 
                            placeholder="bijv. quiz_master" 
                            value={newBadge.slug} 
                            onChange={e => setNewBadge({ ...newBadge, slug: e.target.value })} 
                            className="w-full border border-slate-300 rounded-lg p-3 font-mono text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-museum-gold outline-none transition-all" 
                        />
                        <p className="text-[10px] text-slate-400 mt-1">Gebruik deze slug in je code (badgeSystem.ts).</p>
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">XP Beloning</label>
                        <input 
                            type="number" 
                            value={newBadge.xp_reward} 
                            onChange={e => setNewBadge({ ...newBadge, xp_reward: parseInt(e.target.value) || 0 })} 
                            className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-museum-gold outline-none transition-all" 
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Beschrijving</label>
                        <input 
                            type="text" 
                            placeholder="Wat moet de gebruiker doen?" 
                            value={newBadge.description} 
                            onChange={e => setNewBadge({ ...newBadge, description: e.target.value })} 
                            className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-museum-gold outline-none transition-all" 
                        />
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <button 
                        onClick={handleCreate} 
                        disabled={submitting}
                        className="bg-slate-900 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-slate-700 transition-colors disabled:opacity-50"
                    >
                        {submitting ? <Loader2 className="animate-spin" size={18}/> : <Save size={18} />} 
                        Opslaan
                    </button>
                </div>
            </div>

            {/* --- LIJST --- */}
            <h3 className="text-xl font-bold text-slate-800 mb-4">Actieve Badges ({badges.length})</h3>
            
            {badges.length === 0 ? (
                <div className="text-center p-12 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-400">
                    <Award size={48} className="mx-auto mb-4 opacity-20"/>
                    <p>Nog geen badges aangemaakt.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {badges.map(badge => (
                        <div key={badge.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:border-museum-gold/50 transition-colors">
                            
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-museum-gold/10 group-hover:text-museum-gold transition-colors">
                                    <Award size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800">{badge.name}</h4>
                                    <p className="text-sm text-slate-500 font-mono text-xs mb-1">{badge.slug}</p>
                                    <p className="text-sm text-slate-600">{badge.description}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-6 pl-16 md:pl-0 border-t md:border-0 border-slate-100 pt-4 md:pt-0">
                                <div className="text-center">
                                    <span className="block text-xs font-bold uppercase text-slate-400">Beloning</span>
                                    <span className="font-bold text-museum-gold text-lg">{badge.xp_reward} XP</span>
                                </div>
                                
                                <button 
                                    onClick={() => handleDelete(badge.id, badge.name)} 
                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Verwijder badge"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>

                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
