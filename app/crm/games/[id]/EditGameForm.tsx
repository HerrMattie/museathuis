'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { Save, Trash2, Plus, Sparkles, Loader2 } from 'lucide-react';

export default function EditGameForm({ initialGame }: { initialGame: any }) {
    const [game, setGame] = useState(initialGame);
    const [items, setItems] = useState<any[]>(initialGame.game_items || []);
    const [isGenerating, setIsGenerating] = useState(false);
    const [loading, setLoading] = useState(false);
    const supabase = createClient();
    const router = useRouter();

    const handleAiGenerate = async () => {
        const topic = prompt("Onderwerp?");
        if(!topic) return;
        setIsGenerating(true);
        try {
            const res = await fetch('/api/ai/generate-game', { method: 'POST', body: JSON.stringify({ topic }) });
            const data = await res.json();
            if(data.error) throw new Error(data.error);
            
            setGame({ ...game, title: data.title, short_description: data.short_description });
            const newItems = data.questions.map((q:any, i:number) => ({
                game_id: game.id, question: q.question, correct_answer: q.correct_answer, wrong_answers: q.wrong_answers, order_index: i
            }));
            setItems(newItems);
        } catch(e:any) {
            alert("Error: " + e.message);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSave = async (e: any) => {
        e.preventDefault();
        setLoading(true);
        // Save logic... (ingekort voor overzicht, maar voeg hier je update logic toe)
        await supabase.from('games').update({ title: game.title, short_description: game.short_description, status: game.status }).eq('id', game.id);
        // Items logic: delete & re-insert
        await supabase.from('game_items').delete().eq('game_id', game.id);
        const insertItems = items.map((it, i) => ({ game_id: game.id, question: it.question, correct_answer: it.correct_answer, wrong_answers: it.wrong_answers, order_index: i }));
        if(insertItems.length) await supabase.from('game_items').insert(insertItems);
        
        setLoading(false);
        router.refresh();
    };

    return (
        <form onSubmit={handleSave} className="space-y-6 pb-20">
            <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                    <h3 className="font-bold">Instellingen</h3>
                    {/* HIER IS DE KNOP */}
                    <button type="button" onClick={handleAiGenerate} disabled={isGenerating} className="bg-purple-600 text-white px-3 py-1 rounded flex items-center gap-2 text-sm font-bold">
                        {isGenerating ? <Loader2 className="animate-spin" size={16}/> : <Sparkles size={16}/>} Vul met AI
                    </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <input className="border p-2 rounded" value={game.title} onChange={e => setGame({...game, title: e.target.value})} placeholder="Titel"/>
                    <select className="border p-2 rounded" value={game.status} onChange={e => setGame({...game, status: e.target.value})}><option value="draft">Draft</option><option value="published">Published</option></select>
                </div>
                <input className="w-full border p-2 rounded" value={game.short_description} onChange={e => setGame({...game, short_description: e.target.value})} placeholder="Korte beschrijving"/>
            </div>

            <div className="space-y-4">
                <h3 className="font-bold">Vragen ({items.length})</h3>
                {items.map((item, idx) => (
                    <div key={idx} className="bg-white p-4 rounded border">
                        <input className="w-full border p-2 rounded mb-2 font-bold" value={item.question} onChange={e => {
                            const n = [...items]; n[idx].question = e.target.value; setItems(n);
                        }} />
                        <div className="grid grid-cols-2 gap-2">
                            <input className="border border-green-200 p-2 rounded bg-green-50" value={item.correct_answer} onChange={e => {
                                const n = [...items]; n[idx].correct_answer = e.target.value; setItems(n);
                            }} />
                            <div className="space-y-1">
                                {item.wrong_answers.map((w:string, wi:number) => (
                                    <input key={wi} className="w-full border border-red-200 p-2 rounded bg-red-50 text-sm" value={w} onChange={e => {
                                        const n = [...items]; n[idx].wrong_answers[wi] = e.target.value; setItems(n);
                                    }} />
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="fixed bottom-0 right-0 w-full bg-white border-t p-4 flex justify-end z-10">
                 <button className="bg-blue-600 text-white px-6 py-2 rounded font-bold flex items-center gap-2" disabled={loading}>
                    {loading && <Loader2 className="animate-spin"/>} Opslaan
                 </button>
            </div>
        </form>
    );
}
