'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { Loader2, Save } from 'lucide-react';

export default function AddBadgeForm() {
    const [form, setForm] = useState({ slug: '', label: '', description: '', icon: '🏆', category: 'event', is_secret: false });
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true);
        
        // Slugify de label als slug leeg is
        const slugToUse = form.slug || form.label.toLowerCase().replace(/ /g, '_').replace(/[^\w-]+/g, '');

        const { error } = await supabase.from('badge_definitions').insert({ ...form, slug: slugToUse });
        
        setLoading(false);
        if (!error) {
            setForm({ slug: '', label: '', description: '', icon: '🏆', category: 'event', is_secret: false });
            router.refresh();
        } else {
            alert("Error: " + error.message);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Naam Badge</label>
                <input required className="w-full border p-2 rounded text-sm" placeholder="Bijv: Nieuwjaarsduik 2026" 
                    value={form.label} onChange={e => setForm({...form, label: e.target.value})} />
            </div>
            <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Beschrijving</label>
                <textarea required className="w-full border p-2 rounded text-sm" rows={2} placeholder="Wat moet je doen?" 
                    value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-2">
                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Icoon (Emoji)</label>
                    <input className="w-full border p-2 rounded text-center text-xl" placeholder="🏆" 
                        value={form.icon} onChange={e => setForm({...form, icon: e.target.value})} />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Categorie</label>
                    <select className="w-full border p-2 rounded text-sm" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                        <option value="event">Event</option>
                        <option value="skill">Skill</option>
                        <option value="collection">Collection</option>
                        <option value="secret">Secret</option>
                    </select>
                </div>
            </div>
            
            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                <input type="checkbox" checked={form.is_secret} onChange={e => setForm({...form, is_secret: e.target.checked})} />
                <span>Geheim (Secret Badge)</span>
            </label>

            <button disabled={loading} className="w-full bg-museum-gold text-black font-bold py-2 rounded flex items-center justify-center gap-2 hover:bg-yellow-500">
                {loading ? <Loader2 className="animate-spin" size={16}/> : <Save size={16}/>} Opslaan
            </button>
        </form>
    );
}
