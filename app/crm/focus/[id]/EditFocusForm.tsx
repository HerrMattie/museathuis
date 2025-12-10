'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { Save, Loader2 } from 'lucide-react';

export default function EditFocusForm({ initialItem, isNew }: any) {
    const [item, setItem] = useState(initialItem);
    const [loading, setLoading] = useState(false);
    const supabase = createClient();
    const router = useRouter();

    const handleSave = async (e: any) => {
        e.preventDefault();
        setLoading(true);
        
        const payload = { 
            title: item.title, 
            intro: item.intro, 
            content_markdown: item.content_markdown, 
            audio_script_main: item.audio_script_main,
            status: item.status,
            is_premium: item.is_premium
        };
        
        if (isNew) {
            await supabase.from('focus_items').insert(payload);
        } else {
            await supabase.from('focus_items').update(payload).eq('id', item.id);
        }
        setLoading(false);
        router.push('/crm/focus');
        router.refresh();
    };

    return (
        <form onSubmit={handleSave} className="space-y-6 max-w-4xl pb-24">
            <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Titel</label>
                        <input className="w-full border p-2 rounded" value={item.title} onChange={e => setItem({...item, title: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Status</label>
                        <select className="w-full border p-2 rounded" value={item.status} onChange={e => setItem({...item, status: e.target.value})}><option value="draft">Draft</option><option value="published">Published</option></select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Korte Intro (Kaartje)</label>
                    <textarea className="w-full border p-2 rounded" rows={3} value={item.intro} onChange={e => setItem({...item, intro: e.target.value})} />
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Artikel (Markdown - 10 min lezen)</label>
                    <textarea className="w-full border p-2 rounded font-mono text-sm" rows={15} value={item.content_markdown} onChange={e => setItem({...item, content_markdown: e.target.value})} />
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Audio Script (Voorleestekst)</label>
                    <textarea className="w-full border p-2 rounded font-mono text-sm bg-slate-50" rows={8} value={item.audio_script_main} onChange={e => setItem({...item, audio_script_main: e.target.value})} />
                </div>
            </div>
            
            <div className="fixed bottom-0 right-0 w-full bg-white border-t p-4 flex justify-end z-10 pr-12">
                <button disabled={loading} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2">{loading && <Loader2 className="animate-spin" size={18}/>} Opslaan</button>
            </div>
        </form>
    );
}
