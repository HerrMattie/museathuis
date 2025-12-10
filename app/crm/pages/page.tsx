'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { Save, Loader2, LayoutTemplate } from 'lucide-react';

export default function CrmPagesEditor() {
    const [pages, setPages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);
    const supabase = createClient();

    useEffect(() => {
        const fetchPages = async () => {
            const { data } = await supabase.from('page_content').select('*').order('slug');
            if (data) setPages(data);
            setLoading(false);
        };
        fetchPages();
    }, []);

    const handleChange = (slug: string, field: string, value: string) => {
        setPages(pages.map(p => p.slug === slug ? { ...p, [field]: value } : p));
    };

    const handleSave = async (slug: string) => {
        setSaving(slug);
        const page = pages.find(p => p.slug === slug);
        if (!page) return;

        const { error } = await supabase.from('page_content').update({
            title: page.title,
            subtitle: page.subtitle,
            intro_text: page.intro_text
        }).eq('slug', slug);
        
        setSaving(null);
        if (error) alert("Fout: " + error.message);
    };

    if (loading) return <div className="p-8">Laden...</div>;

    return (
        <div>
            <header className="mb-8">
                <h2 className="text-3xl font-bold text-slate-800">Pagina Teksten</h2>
                <p className="text-slate-500">Beheer de titels en introducties van de hoofdpagina's.</p>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {pages.map((page) => (
                    <div key={page.slug} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-slate-100 px-3 py-1 rounded-bl-lg text-[10px] font-bold uppercase text-slate-500">
                            /{page.slug}
                        </div>
                        
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                                <LayoutTemplate size={20}/>
                            </div>
                            <div>
                                <h3 className="font-bold text-lg capitalize">{page.slug} Pagina</h3>
                                <p className="text-xs text-slate-400">Frontend configuratie</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Kleine Subtitel (Boven H1)</label>
                                <input 
                                    className="w-full border border-slate-200 bg-slate-50 p-2 rounded text-sm text-museum-gold font-bold uppercase tracking-widest" 
                                    value={page.subtitle || ''} 
                                    onChange={(e) => handleChange(page.slug, 'subtitle', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Hoofdtitel (H1)</label>
                                <input 
                                    className="w-full border border-slate-200 p-2 rounded font-serif font-black text-2xl" 
                                    value={page.title} 
                                    onChange={(e) => handleChange(page.slug, 'title', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Introductie Tekst</label>
                                <textarea 
                                    className="w-full border border-slate-200 p-2 rounded text-sm min-h-[80px]" 
                                    value={page.intro_text || ''} 
                                    onChange={(e) => handleChange(page.slug, 'intro_text', e.target.value)}
                                />
                            </div>
                            
                            <div className="flex justify-end pt-2 border-t mt-4">
                                <button 
                                    onClick={() => handleSave(page.slug)}
                                    disabled={!!saving}
                                    className="bg-slate-900 text-white px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-700 transition-colors"
                                >
                                    {saving === page.slug ? <Loader2 className="animate-spin" size={16}/> : <Save size={16}/>}
                                    Opslaan
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
