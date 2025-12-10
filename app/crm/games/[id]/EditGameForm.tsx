'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { Trash2, Save, Loader2, Plus, CheckCircle, XCircle, Sparkles } from 'lucide-react'; // <--- Sparkles toegevoegd

export default function EditGameForm({ initialGame }: { initialGame: any }) {
    const [game, setGame] = useState(initialGame);
    const [items, setItems] = useState<any[]>(initialGame.game_items || []);
    const [isSaving, setIsSaving] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false); // <--- Nieuwe state voor AI loader
    const [message, setMessage] = useState('');
    const supabase = createClient();
    const router = useRouter();

    const handleGameChange = (e: any) => {
        setGame({ ...game, [e.target.name]: e.target.value });
    };

    const handleItemChange = (index: number, field: string, value: any) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

    const handleWrongAnswerChange = (itemIndex: number, wrongAnswerIndex: number, value: string) => {
        const newItems = [...items];
        const newWrong = [...newItems[itemIndex].wrong_answers];
        newWrong[wrongAnswerIndex] = value;
        newItems[itemIndex].wrong_answers = newWrong;
        setItems(newItems);
    };

    const addQuestion = () => {
        setItems([...items, {
            game_id: game.id,
            question: 'Nieuwe vraag...',
            correct_answer: '',
            wrong_answers: ['', ''],
            order_index: items.length
        }]);
    };

    const removeQuestion = (index: number) => {
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems);
    };

    // --- NIEUWE FUNCTIE: AI GENERATIE ---
    const handleAiGenerate = async () => {
        const topic = prompt("Over welk onderwerp, kunstenaar of stijl moet de quiz gaan?");
        if (!topic) return;

        setIsGenerating(true);
        setMessage("🤖 AI is aan het denken... dit duurt ongeveer 5-10 seconden.");

        try {
            const res = await fetch('/api/ai/generate-game', {
                method: 'POST',
                body: JSON.stringify({ topic }),
            });

            const data = await res.json();

            if (data.error) throw new Error(data.error);

            // Update het formulier met de AI data
            setGame({ ...game, title: data.title, short_description: data.short_description });
            
            // Zet de vragen om naar het juiste formaat
            const newItems = data.questions.map((q: any, idx: number) => ({
                game_id: game.id,
                question: q.question,
                correct_answer: q.correct_answer,
                wrong_answers: q.wrong_answers,
                order_index: idx
            }));
            
            setItems(newItems);
            setMessage("✨ Succesvol gegenereerd! Controleer de vragen en klik op Opslaan.");

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

        // 1. Update Game Details
        const { error: gameError } = await supabase
            .from('games')
            .update({
                title: game.title,
                short_description: game.short_description,
                status: game.status,
                is_premium: game.is_premium === 'true' || game.is_premium === true
            })
            .eq('id', game.id);

        if (gameError) {
            setMessage('Fout bij opslaan game: ' + gameError.message);
            setIsSaving(false);
            return;
        }

        // 2. Sync Vragen
        // Eerst alles verwijderen (simpele reset) en dan opnieuw toevoegen
        // Dit voorkomt dat oude vragen blijven hangen als de AI er minder genereert
        await supabase.from('game_items').delete().eq('game_id', game.id);

        const itemsToInsert = items.map((item, i) => ({
            game_id: game.id,
            question: item.question,
            correct_answer: item.correct_answer,
            wrong_answers: item.wrong_answers,
            order_index: i
        }));

        if (itemsToInsert.length > 0) {
            await supabase.from('game_items').insert(itemsToInsert);
        }

        setIsSaving(false);
        setMessage('Succesvol opgeslagen!');
        router.refresh();
    };

    return (
        <form onSubmit={handleSave} className="space-y-8 pb-20">
            
            {/* GAME SETTINGS */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4 relative overflow-hidden">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Titel</label>
                        <input type="text" name="title" value={game.title} onChange={handleGameChange} className="w-full border p-2 rounded" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Status</label>
                        <select name="status" value={game.status} onChange={handleGameChange} className="w-full border p-2 rounded bg-white">
                            <option value="draft">Draft (Onzichtbaar)</option>
                            <option value="published">Gepubliceerd</option>
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-slate-700 mb-1">Korte Beschrijving</label>
                        <input type="text" name="short_description" value={game.short_description} onChange={handleGameChange} className="w-full border p-2 rounded" />
                    </div>
                </div>
            </div>

            {/* VRAGEN EDITOR */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 text-xl">Vragen ({items.length})</h3>
                    <button type="button" onClick={addQuestion} className="text-sm bg-slate-200 hover:bg-slate-300 px-3 py-1 rounded font-bold flex items-center gap-1">
                        <Plus size={16}/> Vraag Toevoegen
                    </button>
                </div>

                {items.map((item, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative animate-fade-in-up">
                        <span className="absolute top-4 right-4 text-xs font-bold text-slate-300">#{idx + 1}</span>
                        
                        <div className="mb-4">
                            <label className="block text-xs uppercase font-bold text-slate-500 mb-1">De Vraag</label>
                            <input 
                                type="text" 
                                value={item.question} 
                                onChange={(e) => handleItemChange(idx, 'question', e.target.value)}
                                className="w-full border p-2 rounded font-medium text-lg"
                                placeholder="Bijv: Wie schilderde de Nachtwacht?"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* GOED ANTWOORD */}
                            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                                <label className="flex items-center gap-2 text-xs uppercase font-bold text-green-700 mb-1">
                                    <CheckCircle size={14}/> Juiste Antwoord
                                </label>
                                <input 
                                    type="text" 
                                    value={item.correct_answer} 
                                    onChange={(e) => handleItemChange(idx, 'correct_answer', e.target.value)}
                                    className="w-full border border-green-200 p-2 rounded focus:ring-green-500"
                                    placeholder="Het juiste antwoord"
                                />
                            </div>

                            {/* FOUTE ANTWOORDEN */}
                            <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                                <label className="flex items-center gap-2 text-xs uppercase font-bold text-red-700 mb-1">
                                    <XCircle size={14}/> Foute Antwoorden
                                </label>
                                <div className="space-y-2">
                                    {item.wrong_answers.map((ans: string, wIdx: number) => (
                                        <input 
                                            key={wIdx}
                                            type="text" 
                                            value={ans} 
                                            onChange={(e) => handleWrongAnswerChange(idx, wIdx, e.target.value)}
                                            className="w-full border border-red-200 p-2 rounded text-sm"
                                            placeholder={`Fout antwoord ${wIdx + 1}`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        <button 
                            type="button" 
                            onClick={() => removeQuestion(idx)}
                            className="mt-4 text-red-400 text-xs hover:text-red-600 flex items-center gap-1"
                        >
                            <Trash2 size={14} /> Verwijder deze vraag
                        </button>
                    </div>
                ))}
            </div>

            {/* SAVE BAR */}
            <div className="fixed bottom-0 right-0 w-[calc(100%-16rem)] bg-white border-t p-4 flex justify-between items-center z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                <div className="text-sm font-bold text-green-600">{message}</div>
                <button
                    type="submit"
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                >
                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    Wijzigingen Opslaan
                </button>
            </div>
        </form>
    );
}
