'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { Save, Trash2, Loader2 } from 'lucide-react';

export default function EditSalonForm({ initialItem, isNew }: any) {
    const [item, setItem] = useState(initialItem);
    const [loading, setLoading] = useState(false);
    const supabase = createClient();
    const router = useRouter();

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
        // FIX: Redirect nu naar /crm/salons (meervoud)
        router.push('/crm/salons');
        router.refresh();
    };

    return (
        <form onSubmit={handleSave} className="space-y-6 max-w-2xl">
            <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
                <div><label className="block text-sm font-bold text-slate-700">Titel</label><input className="w-full border p-2 rounded" value={item.title} onChange={e => setItem({...item, title: e.target.value})} /></div>
                <div><label className="block text-sm font-bold text-slate-700">Beschrijving</label><textarea className="w-full border p-2 rounded" rows={3} value={item.short_description} onChange={e => setItem({...item, short_description: e.target.value})} /></div>
                <div><label className="block text-sm font-bold text-slate-700">Content (Markdown)</label><textarea className="w-full border p-2 rounded font-mono text-sm" rows={10} value={item.content_markdown} onChange={e => setItem({...item, content_markdown: e.target.value})} /></div>
                <div><label className="block text-sm font-bold text-slate-700">Status</label><select className="w-full border p-2 rounded" value={item.status} onChange={e => setItem({...item, status: e.target.value})}><option value="draft">Draft</option><option value="published">Published</option></select></div>
            </div>
            <button disabled={loading} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2">{loading && <Loader2 className="animate-spin" size={18}/>} Opslaan</button>
        </form>
    );
}
