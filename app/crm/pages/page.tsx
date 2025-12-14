'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { Save, Loader2, Search, Filter } from 'lucide-react';

// De categorieën waarop we gaan filteren (op basis van de 'key' prefix)
const CATEGORIES = [
  { id: 'all', label: 'Alles' },
  { id: 'home', label: 'Home' },
  { id: 'tour', label: 'Tours' },
  { id: 'game', label: 'Games' },
  { id: 'focus', label: 'Focus' },
  { id: 'salon', label: 'Salon' },
  { id: 'bestof', label: 'Best Of' },
  { id: 'academy', label: 'Academie' },
  { id: 'nav', label: 'Menu & Footer' },
];

export default function PagesEditor() {
    const [contents, setContents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null); // ID van item dat nu opslaat
    const [activeFilter, setActiveFilter] = useState('all');
    const [search, setSearch] = useState('');
    
    const supabase = createClient();

    useEffect(() => {
        fetchContent();
    }, []);

    const fetchContent = async () => {
        const { data } = await supabase.from('site_content').select('*').order('key');
        if (data) setContents(data);
        setLoading(false);
    };

    const handleChange = (id: string, newVal: string) => {
        setContents(prev => prev.map(item => item.id === id ? { ...item, content: newVal } : item));
    };

    const handleSave = async (id: string, value: string) => {
        setSaving(id);
        await supabase.from('site_content').update({ content: value }).eq('id', id);
        setSaving(null);
    };

    // Filter logica
    const filteredContents = contents.filter(item => {
        const matchesSearch = item.label.toLowerCase().includes(search.toLowerCase()) || item.content?.toLowerCase().includes(search.toLowerCase());
        
        if (activeFilter === 'all') return matchesSearch;
        
        // Simpele check: begint de key met 'tour_'? Dan hoort hij bij categorie tour.
        // Uitzondering: 'nav' filter pakt ook footer items.
        if (activeFilter === 'nav') {
            return matchesSearch && (item.key.startsWith('nav_') || item.key.startsWith('footer_'));
        }
        return matchesSearch && item.key.startsWith(activeFilter + '_');
    });

    if (loading) return <div className="p-12 text-center text-slate-400">Teksten laden...</div>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold font-serif text-slate-900">Pagina Teksten</h1>
                <p className="text-slate-500">Beheer alle vaste teksten van de applicatie.</p>
            </div>

            {/* FILTERS & ZOEKBALK */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                
                {/* Categorie Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto no-scrollbar">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveFilter(cat.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${
                                activeFilter === cat.id 
                                ? 'bg-midnight-950 text-white' 
                                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                            }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* Zoeken */}
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-3 text-slate-400" size={16} />
                    <input 
                        type="text" 
                        placeholder="Zoek tekst..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-museum-gold outline-none"
                    />
                </div>
            </div>

            {/* DE CONTENT LIJST */}
            <div className="grid grid-cols-1 gap-4">
                {filteredContents.map((item) => (
                    <div key={item.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-6 items-start">
                        
                        <div className="md:w-1/3 space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold uppercase bg-slate-100 text-slate-500 px-2 py-1 rounded font-mono">
                                    {item.key}
                                </span>
                            </div>
                            <h3 className="font-bold text-slate-800">{item.label}</h3>
                        </div>
                        
                        <div className="flex-1 w-full flex gap-3">
                            <textarea 
                                value={item.content || ''}
                                onChange={(e) => handleChange(item.id, e.target.value)}
                                className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-museum-gold outline-none min-h-[60px]"
                            />
                            <button 
                                onClick={() => handleSave(item.id, item.content)}
                                disabled={saving === item.id}
                                className={`self-start p-3 rounded-lg text-white transition-colors ${
                                    saving === item.id ? 'bg-museum-gold' : 'bg-midnight-950 hover:bg-black'
                                }`}
                                title="Opslaan"
                            >
                                {saving === item.id ? <Loader2 className="animate-spin" size={20}/> : <Save size={20}/>}
                            </button>
                        </div>
                    </div>
                ))}

                {filteredContents.length === 0 && (
                    <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                        Geen teksten gevonden voor dit filter.
                    </div>
                )}
            </div>
        </div>
    );
}
