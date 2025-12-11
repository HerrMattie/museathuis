'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import GameContentEditor from '@/components/crm/games/GameContentEditor'; // <--- NIEUWE NAAM

export default function GameEditPage({ params }: { params: { id: string } }) {
    const [game, setGame] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const fetchGame = async () => {
            if (params.id === 'new') {
                setGame({
                    title: '',
                    short_description: '',
                    type: 'quiz', 
                    is_premium: false,
                    status: 'draft'
                });
                setLoading(false);
                return;
            }

            const { data } = await supabase.from('games').select('*').eq('id', params.id).single();
            if (data) setGame(data);
            setLoading(false);
        };
        fetchGame();
    }, [params.id]);

    const handleSave = async () => {
        setSaving(true);
        try {
            let result;
            if (params.id === 'new') {
                result = await supabase.from('games').insert(game).select().single();
            } else {
                result = await supabase.from('games').update(game).eq('id', params.id).select().single();
            }

            if (result.error) throw result.error;

            alert("Game opgeslagen!");
            if (params.id === 'new' && result.data) {
                router.replace(`/crm/games/${result.data.id}`);
            }
        } catch (e: any) {
            alert("Fout bij opslaan: " + e.message);
        }
        setSaving(false);
    };

    if (loading) return <div className="p-8">Laden...</div>;

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <header className="flex justify-between items-center mb-8">
                <Link href="/crm/games" className="flex items-center gap-2 text-slate-500 hover:text-slate-800">
                    <ArrowLeft size={20}/> Terug naar overzicht
                </Link>
                <button onClick={handleSave} disabled={saving} className="bg-museum-gold text-black px-6 py-2 rounded-lg font-bold flex items-center gap-2">
                    {saving ? <Loader2 className="animate-spin"/> : <Save size={18}/>} Opslaan
                </button>
            </header>

            {/* BASIS GEGEVENS */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 mb-8 shadow-sm">
                <h2 className="text-lg font-bold mb-4">Basis Instellingen</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Titel</label>
                        <input type="text" value={game.title} onChange={e => setGame({...game, title: e.target.value})} className="w-full border p-3 rounded-lg"/>
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Type</label>
                        <select 
                            value={game.type} 
                            onChange={e => setGame({...game, type: e.target.value})}
                            className="w-full border p-3 rounded-lg bg-white"
                            // Type kan niet meer gewijzigd worden na aanmaken om data corruptie te voorkomen
                            disabled={params.id !== 'new'} 
                        >
                            <option value="quiz">Quiz (Vraag & Antwoord)</option>
                            <option value="timeline">Tijdlijn (Hoger/Lager)</option>
                            <option value="pixel_hunt">Pixel Hunt (Wazig Plaatje)</option>
                            <option value="memory">Memory (Setjes)</option>
                            <option value="curator">Curator (Raad de maker)</option>
                            <option value="who_am_i">Wie ben ik? (3 Hints)</option>
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Korte Beschrijving</label>
                        <input type="text" value={game.short_description || ''} onChange={e => setGame({...game, short_description: e.target.value})} className="w-full border p-3 rounded-lg"/>
                    </div>
                    <div className="flex gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={game.is_premium} onChange={e => setGame({...game, is_premium: e.target.checked})} className="w-5 h-5 accent-museum-gold"/>
                            <span className="font-medium">Premium Only</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={game.status === 'published'} onChange={e => setGame({...game, status: e.target.checked ? 'published' : 'draft'})} className="w-5 h-5 accent-green-600"/>
                            <span className="font-medium">Gepubliceerd</span>
                        </label>
                    </div>
                </div>
            </div>

            {/* UNIVERSELE CONTENT EDITOR */}
            {params.id !== 'new' ? (
                <GameContentEditor gameId={game.id} gameType={game.type} />
            ) : (
                <div className="p-8 text-center bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
                    Sla de game eerst op om inhoud toe te voegen.
                </div>
            )}
        </div>
    );
}
