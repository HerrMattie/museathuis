'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { Save, Loader2, Type } from 'lucide-react';

export default function CrmPagesPage() {
    const [texts, setTexts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        const fetchContent = async () => {
            const { data } = await supabase.from('site_content').select('*').order('key');
            setTexts(data || []);
            setLoading(false);
        };
        fetchContent();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        const { error } = await supabase.from('site_content').upsert(texts);
        if (error) alert("Fout: " + error.message);
        else alert("Teksten opgeslagen!");
        setSaving(false);
    };

    const updateText = (key: string, val: string) => {
        setTexts(prev => prev.map(t => t.key === key ? { ...t, content: val } : t));
    };

    if (loading) return <div className="p-8">Laden...</div>;

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 mb-2">Pagina Teksten</h1>
                    <p className="text-slate-500">Beheer de vaste teksten van de website.</p>
                </div>
                <button onClick={handleSave} disabled={saving} className="bg-museum-gold text-black px-6 py-2 rounded-lg font-bold flex items-center gap-2">
                    {saving ? <Loader2 className="animate-spin"/> : <Save size={18}/>} Opslaan
                </button>
            </header>

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm divide-y">
                {texts.map((item) => (
                    <div key={item.key} className="p-6">
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-2 flex items-center gap-2">
                            <Type size={14}/> {item.description} <span className="text-slate-300 font-mono lowercase">({item.key})</span>
                        </label>
                        <input 
                            type="text" 
                            className="w-full border p-3 rounded-lg font-bold text-slate-800" 
                            value={item.content} 
                            onChange={e => updateText(item.key, e.target.value)}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
