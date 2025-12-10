'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { Trash2, Save, Loader2, Sparkles } from 'lucide-react';

export default function EditSalonForm({ initialItem, isNew }: { initialItem: any, isNew: boolean }) {
    const [item, setItem] = useState(initialItem);
    const [isSaving, setIsSaving] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [message, setMessage] = useState('');
    const supabase = createClient();
    const router = useRouter();

    const handleChange = (e: any) => {
        setItem({ ...item, [e.target.name]: e.target.value });
    };

    // --- AI GENERATIE VOOR SALONS ---
    const handleAiGenerate = async () => {
        const topic = prompt("Over welk museum, historisch figuur of kunstwerk moet de Salon discussie gaan?");
        if (!topic) return;

        setIsGenerating(true);
        setMessage("🤖 AI is een Salon discussie aan het voorbereiden...");

        try {
            // We hergebruiken de generate-focus API, maar passen de prompt aan
            // Voor een volledig aparte structuur zou je een nieuwe API maken
            const res = await fetch('/api/ai/generate-focus', { // Hergebruik of maak een nieuwe API
                method: 'POST',
                body: JSON.stringify({ topic }),
            });

            const data = await res.json();

            if (data.error) throw new Error(data.error);

            // Update formulier met de AI data
            setItem({ 
                ...item, 
                title: `Salon: ${data.title}`, 
                short_description: data.short_description,
                content_markdown: `# ${data.title}\n\n${data.content_markdown}`, // Maak de content visueel aantrekkelijker
            });
            
            setMessage("✨ Succesvol gegenereerd! Controleer de tekst en klik op Opslaan.");

        } catch (e: any) {
            alert("Fout bij genereren: " + e.message);
            setMessage("");
        } finally {
            setIsGenerating(false);
        }
    };
    // ------------------------------------

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage('');

        // Prepare object for save
        const saveObject = {
            title: item.title,
            short_description: item.short_description,
            content_markdown: item.content_markdown,
            // Aangenomen: salons hebben geen 'content_text' nodig
            status: item.status,
        };

        let error;
        let savedItem;

        if (isNew) {
            const { data, error: insertError } = await supabase.from('salons').insert(saveObject).select().single();
            error = insertError;
            savedItem = data;
        } else {
            const { data, error: updateError } = await supabase.from('salons').update(saveObject).eq('id', item.id).select().single();
            error = updateError;
            savedItem = data;
        }

        if (error) {
            setMessage('Fout bij opslaan: ' + error.message);
            setIsSaving(false);
            return;
        }

        setIsSaving(false);
        setMessage('Succesvol opgeslagen!');
        if (isNew && savedItem) {
            // Redirect naar de bewerkpagina van het nieuwe item
            router.push(`/crm/salons/${savedItem.id}`);
        } else {
            router.refresh();
        }
    };

    const handleDelete = async () => {
        if (!confirm('Weet u zeker dat u dit Salon Item wilt verwijderen?')) return;
        
        await supabase.from('salons').delete().eq('id', item.id);
        router.push('/crm/salons');
        router.refresh();
    };


    return (
        <form onSubmit={handleSave} className="space-y-8 pb-20">
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                <div className="flex justify-between items-center border-b pb-2 mb-4">
                    <h3 className="font-bold text-slate-800">Algemene Instellingen</h3>
                    
                    {/* DE AI KNOP */}
                    <button 
                        type="button"
                        onClick={handleAiGenerate}
                        disabled={isGenerating}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                    >
                        {isGenerating ? <Loader2 size={18} className="animate-spin"/> : <Sparkles size={18} />}
                        {isGenerating ? "Genereren..." : "Vul met AI"}
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-slate-700 mb-1">Titel</label>
                        <input type="text" name="title" value={item.title} onChange={handleChange} className="w-full border p-2 rounded" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Status</label>
                        <select name="status" value={item.status} onChange={handleChange} className="w-full border p-2 rounded bg-white">
                            <option value="draft">Draft (Onzichtbaar)</option>
                            <option value="published">Gepubliceerd</option>
                        </select>
                    </div>
                    <div className="md:col-span-3">
                        <label className="block text-sm font-bold text-slate-700 mb-1">Korte Beschrijving (Lead)</label>
                        <textarea name="short_description" value={item.short_description || ''} onChange={handleChange} rows={2} className="w-full border p-2 rounded"></textarea>
                    </div>
                </div>
            </div>

            {/* HOOFD CONTENT */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                <h3 className="font-bold text-slate-800 border-b pb-2 mb-4">Artikel / Discussie Content</h3>
                
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Markdown Content</label>
                    <textarea 
                        name="content_markdown" 
                        value={item.content_markdown || ''} 
                        onChange={handleChange} 
                        rows={15} 
                        className="w-full border p-2 rounded font-mono text-sm"
                        placeholder="Gebruik Markdown voor de opmaak (vet, koppen, etc.)."
                    />
                </div>
            </div>

            {/* ACTIE BAR */}
            <div className="fixed bottom-0 right-0 w-[calc(100%-16rem)] bg-white border-t p-4 flex justify-between items-center z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                <div className="flex items-center gap-4">
                    {!isNew && (
                        <button type="button" onClick={handleDelete} className="text-red-500 hover:text-red-700 flex items-center gap-1 font-bold">
                            <Trash2 size={18} /> Verwijder Salon
                        </button>
                    )}
                    <div className="text-sm font-bold text-green-600">{message}</div>
                </div>
                
                <button
                    type="submit"
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                >
                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    {isNew ? 'Salon Aanmaken' : 'Wijzigingen Opslaan'}
                </button>
            </div>
        </form>
    );
}
