'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { Save, Loader2 } from 'lucide-react';

export default function PagesEditor() {
    const [contents, setContents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const supabase = createClient();

    // 1. Data ophalen
    useEffect(() => {
        fetchContent();
    }, []);

    const fetchContent = async () => {
        const { data } = await supabase.from('site_content').select('*').order('key');
        if (data) setContents(data);
        setLoading(false);
    };

    // 2. Wijziging lokaal bijwerken in state
    const handleChange = (id: string, newVal: string) => {
        setContents(prev => prev.map(item => item.id === id ? { ...item, content: newVal } : item));
    };

    // 3. Opslaan naar DB
    const handleSave = async (id: string, key: string, value: string) => {
        setSaving(true);
        await supabase.from('site_content').update({ content: value }).eq('id', id);
        setSaving(false);
    };

    if (loading) return <div className="p-12 text-center text-slate-400">Teksten laden...</div>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold font-serif text-slate-900">Pagina Teksten</h1>
                <p className="text-slate-500">Pas de teksten op de website direct aan.</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {contents.map((item) => (
                    <div key={item.id} className="p-6 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-xs font-bold uppercase text-museum-gold bg-midnight-950 px-2 py-1 rounded">
                                {item.label}
                            </label>
                            <span className="text-xs text-slate-400 font-mono">{item.key}</span>
                        </div>
                        
                        <div className="flex gap-4">
                            <textarea 
                                value={item.content || ''}
                                onChange={(e) => handleChange(item.id, e.target.value)}
                                className="flex-1 p-3 bg-white border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-museum-gold outline-none min-h-[80px]"
                            />
                            <button 
                                onClick={() => handleSave(item.id, item.key, item.content)}
                                disabled={saving}
                                className="self-end p-3 bg-midnight-950 text-white rounded-lg hover:bg-black transition-colors"
                                title="Opslaan"
                            >
                                {saving ? <Loader2 className="animate-spin" size={20}/> : <Save size={20}/>}
                            </button>
                        </div>
                    </div>
                ))}

                {contents.length === 0 && (
                    <div className="p-8 text-center text-slate-500">
                        Nog geen content items gevonden in de database.
                    </div>
                )}
            </div>
        </div>
    );
}
