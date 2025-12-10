'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { Save, Trash2, Loader2, Sparkles } from 'lucide-react';

export default function EditSalonForm({ initialItem, isNew }: any) {
    const [item, setItem] = useState(initialItem);
    const [loading, setLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const supabase = createClient();
    const router = useRouter();

    const handleAiGenerate = async () => {
        const topic = prompt("Waar gaat deze Salon collectie over?");
        if(!topic) return;
        
        setIsGenerating(true);
        try {
            const res = await fetch('/api/ai/generate-salon', {
                method: 'POST', 
                body: JSON.stringify({ topic })
            });
            const data = await res.json();
            if(data.error) throw new Error(data.error);
            
            setItem({ ...item, title: data.title, short_description: data.short_description, content_markdown: data.content_markdown });
        } catch(e:any) {
            alert("AI Fout: " + e.message);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSave = async (e: any) => {
        e.preventDefault();
        setLoading(true);
        const payload = { title: item.title, short_description: item.short_description, content_markdown: item.content_markdown, status: item.status };
        
        if (isNew) {
            await supabase.from('salons').insert(payload);
        } else {
            await supabase.from('salons').update(payload).eq('id', item.id);
        }
        setLoading(false);
        router.push('/crm/salons');
        router.refresh();
    };

    return (
        <form onSubmit={handleSave} className="space-y-6 max-w-3xl pb-24">
            <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
                <div className="flex justify-between items-center border-b pb-4 mb-4">
                    <h3 className="font-bold text-slate-800">Inhoud</h3>
                    <button type="button" onClick={handleAiGenerate} disabled={isGenerating} className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-purple-200 transition-colors">
                        {isGenerating ? <Loader2 className="animate-spin" size={18}/> : <Sparkles size={18}/>}
                        {isGenerating ? "Schrijven..." : "Vul met AI"}
                    </button>
                </div>

                <div><label className="block text-sm font-bold text-slate-700 mb-1">Titel</label><input className="w-full border p-2 rounded" value={item.title} onChange={e => setItem({...item, title: e.target.value})} /></div>
                <div><label className="block text-sm font-bold text-slate-700 mb-1">Korte Beschrijving</label><textarea className="w-full border p-2 rounded" rows={3} value={item.short_description} onChange={e => setItem({...item, short_description: e.target.value})} /></div>
                <div><label className="block text-sm font-bold text-slate-700 mb-1">Artikel (Markdown)</label><textarea className="w-full border p-2 rounded font-mono text-sm" rows={15} value={item.content_markdown} onChange={e => setItem({...item, content_markdown: e.target.value})} /></div>
                <div><label className="block text-sm font-bold text-slate-700 mb-1">Status</label><select className="w-full border p-2 rounded" value={item.status} onChange={e => setItem({...item, status: e.target.value})}><option value="draft">Draft</option><option value="published">Published</option></select></div>
            </div>
            
            <div className="fixed bottom-0 right-0 w-[calc(100%-16rem)] bg-white border-t p-4 flex justify-end z-10">
                <button disabled={loading} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2">{loading && <Loader2 className="animate-spin" size={18}/>} Opslaan</button>
            </div>
        </form>
    );
}
