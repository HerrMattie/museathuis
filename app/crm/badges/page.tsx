// app/crm/badges/page.tsx (CRUD voor het beheren van Badges)
'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { Award, Plus, Loader2, Save } from 'lucide-react';

export default function CrmBadgesPage() {
    const [badges, setBadges] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [newBadge, setNewBadge] = useState({ slug: '', name: '', description: '', xp_reward: 0 });
    const supabase = createClient();

    useEffect(() => {
        fetchBadges();
    }, []);

    const fetchBadges = async () => {
        setLoading(true);
        const { data } = await supabase.from('badge_definitions').select('*').order('xp_reward', { ascending: false });
        if (data) setBadges(data);
        setLoading(false);
    };

    const handleCreate = async () => {
        if (!newBadge.slug || !newBadge.name) return;
        setLoading(true);
        await supabase.from('badge_definitions').insert(newBadge);
        setNewBadge({ slug: '', name: '', description: '', xp_reward: 0 });
        await fetchBadges();
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Weet u zeker dat u deze badge wilt verwijderen?')) return;
        setLoading(true);
        await supabase.from('badge_definitions').delete().eq('id', id);
        await fetchBadges();
    };

    if (loading) return <div className="p-8"><Loader2 className="animate-spin" /> Laden...</div>;

    return (
        <div className="p-8">
            <h2 className="text-3xl font-bold text-slate-800 mb-6 flex items-center gap-3"><Award /> Badge Manager</h2>

            {/* Formulier voor nieuwe Badge */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 mb-8 shadow-sm">
                <h3 className="text-xl font-bold mb-4">Nieuwe Badge Toevoegen</h3>
                <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="Slug (bijv. quiz_master)" value={newBadge.slug} onChange={e => setNewBadge({ ...newBadge, slug: e.target.value.toLowerCase().replace(/\s/g, '_') })} className="border p-2 rounded" />
                    <input type="text" placeholder="Naam (bijv. Quiz Master)" value={newBadge.name} onChange={e => setNewBadge({ ...newBadge, name: e.target.value })} className="border p-2 rounded" />
                    <input type="number" placeholder="XP Beloning" value={newBadge.xp_reward} onChange={e => setNewBadge({ ...newBadge, xp_reward: parseInt(e.target.value) || 0 })} className="border p-2 rounded" />
                    <input type="text" placeholder="Korte Beschrijving" value={newBadge.description} onChange={e => setNewBadge({ ...newBadge, description: e.target.value })} className="border p-2 rounded col-span-2" />
                </div>
                <button onClick={handleCreate} className="mt-4 bg-museum-gold text-black px-4 py-2 rounded font-bold flex items-center gap-2">
                    <Plus size={18} /> Badge Aanmaken
                </button>
            </div>

            {/* Lijst van bestaande Badges */}
            <h3 className="text-xl font-bold mb-4">Bestaande Badges</h3>
            <div className="space-y-3">
                {badges.map(badge => (
                    <div key={badge.id} className="bg-white p-4 rounded-lg flex justify-between items-center border shadow-sm">
                        <div>
                            <div className="font-bold">{badge.name} ({badge.slug})</div>
                            <div className="text-sm text-gray-500">{badge.description}</div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-museum-gold font-bold">{badge.xp_reward} XP</span>
                            <button onClick={() => handleDelete(badge.id)} className="text-red-500 hover:text-red-700">Verwijder</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
