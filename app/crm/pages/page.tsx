'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { Save, Loader2, Type, LayoutTemplate } from 'lucide-react';

// De categorieën waarop we filteren (op basis van de 'key' prefix)
const TABS = [
    { id: 'home', label: 'Homepage' },
    { id: 'pricing', label: 'Prijzen' },
    { id: 'contact', label: 'Contact' },
    { id: 'footer', label: 'Footer & Algemeen' }
];

export default function CrmPagesPage() {
    const [texts, setTexts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('home');
    
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

    // Filter de lijst op basis van de tab
    const filteredTexts = texts.filter(t => t.key.startsWith(activeTab + '_'));

    if (loading) return <div className="p-8">Laden...</div>;

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center gap-2">
                        <LayoutTemplate className="text-museum-gold"/> Pagina Beheer
                    </h1>
                    <p className="text-slate-500">Pas de teksten op de website aan.</p>
                </div>
                <button onClick={handleSave} disabled={saving} className="bg-museum-gold text-black px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg">
                    {saving ? <Loader2 className="animate-spin"/> : <Save size={18}/>} Opslaan
                </button>
            </header>

            {/* TABS */}
            <div className="flex gap-2 mb-6 border-b border-slate-200 pb-1">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 rounded-t-lg font-bold text-sm transition-colors ${
                            activeTab === tab.id 
                            ? 'bg-slate-800 text-white' 
                            : 'bg-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* EDITOR LIJST */}
            <div className="bg-white border border-slate-200 rounded-b-xl rounded-tr-xl shadow-sm divide-y p-6 space-y-6">
                {filteredTexts.length === 0 ? (
                    <p className="text-slate-400 text-center py-8">Geen teksten gevonden voor deze pagina.</p>
                ) : (
                    filteredTexts.map((item) => (
                        <div key={item.key} className="pt-4 first:pt-0">
                            <label className="block text-xs font-bold uppercase text-slate-500 mb-2 flex items-center gap-2">
                                <Type size={14}/> {item.description}
                            </label>
                            
                            {/* Als de tekst enters bevat, toon een textarea, anders een input */}
                            {item.content.includes('\n') || item.content.length > 50 ? (
                                <textarea 
                                    className="w-full border p-3 rounded-lg font-medium text-slate-800 h-24 focus:ring-2 focus:ring-museum-gold focus:outline-none"
                                    value={item.content}
                                    onChange={e => updateText(item.key, e.target.value)}
                                />
                            ) : (
                                <input 
                                    type="text" 
                                    className="w-full border p-3 rounded-lg font-bold text-slate-800 focus:ring-2 focus:ring-museum-gold focus:outline-none" 
                                    value={item.content} 
                                    onChange={e => updateText(item.key, e.target.value)}
                                />
                            )}
                            <p className="text-[10px] text-slate-300 font-mono mt-1 text-right">{item.key}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
