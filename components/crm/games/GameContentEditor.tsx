'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { Plus, Trash2, Search, Image as ImageIcon, Check, Calendar, HelpCircle } from 'lucide-react';

interface GameContentEditorProps {
    gameId: string;
    gameType: 'quiz' | 'timeline' | 'pixel_hunt' | 'memory' | 'curator' | 'who_am_i';
}

export default function GameContentEditor({ gameId, gameType }: GameContentEditorProps) {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    
    // Generieke state voor een nieuw item
    const [newItem, setNewItem] = useState({
        question: '',       // Gebruikt als Vraag OF Titel
        correct_answer: '', // Gebruikt als Antwoord OF Maker
        wrong_1: '',
        wrong_2: '',
        wrong_3: '',
        extra_data: {} as any, // Voor Jaartal, Hints, etc.
        artwork_id: null as string | null,
        image_url: '' 
    });

    const supabase = createClient();

    useEffect(() => {
        fetchItems();
    }, [gameId]);

    const fetchItems = async () => {
        const { data } = await supabase
            .from('game_items')
            .select('*, artwork:artworks(title, image_url, artist, year_created)')
            .eq('game_id', gameId)
            .order('created_at', { ascending: true });
        setItems(data || []);
        setLoading(false);
    };

    // Zoek kunstwerk in database
    const handleSearchArtwork = async (e: any) => {
        e.preventDefault();
        const { data } = await supabase
            .from('artworks')
            .select('*')
            .ilike('title', `%${searchQuery}%`)
            .limit(5);
        setSearchResults(data || []);
    };

    // Vul velden automatisch in op basis van gekozen kunstwerk & game type
    const selectArtwork = (art: any) => {
        let update = { 
            artwork_id: art.id, 
            image_url: art.image_url,
            question: newItem.question,
            correct_answer: newItem.correct_answer,
            extra_data: newItem.extra_data
        };

        // AUTO-FILL LOGICA PER TYPE
        if (gameType === 'timeline') {
            update.question = art.title; // Vraag is de titel
            update.extra_data = { year: art.year_created || '' };
        } 
        else if (gameType === 'curator' || gameType === 'who_am_i') {
            update.correct_answer = art.artist; // Antwoord is de maker
            if (gameType === 'curator') update.question = "Wie maakte dit werk?";
        }
        else if (gameType === 'pixel_hunt') {
            update.correct_answer = art.title; // Antwoord is de titel
        }
        else if (gameType === 'memory') {
            update.question = art.title; // Vraagkaartje is de titel
        }
        // Quiz laten we leeg, dat moet je zelf verzinnen

        setNewItem(prev => ({ ...prev, ...update }));
        setSearchResults([]); 
        setSearchQuery('');
    };

    const handleAddItem = async () => {
        if (!newItem.artwork_id && gameType !== 'quiz') {
            alert("Selecteer eerst een kunstwerk.");
            return;
        }

        // Payload voorbereiden
        const payload = {
            game_id: gameId,
            question: newItem.question,
            correct_answer: newItem.correct_answer,
            wrong_answers: [newItem.wrong_1, newItem.wrong_2, newItem.wrong_3].filter(Boolean),
            artwork_id: newItem.artwork_id,
            image_url: newItem.image_url,
            extra_data: newItem.extra_data
        };

        const { error } = await supabase.from('game_items').insert(payload);
        
        if (error) alert("Fout: " + error.message);
        else {
            // Reset
            setNewItem({ question: '', correct_answer: '', wrong_1: '', wrong_2: '', wrong_3: '', extra_data: {}, artwork_id: null, image_url: '' });
            fetchItems();
        }
    };

    const handleDelete = async (id: string) => {
        await supabase.from('game_items').delete().eq('id', id);
        fetchItems();
    };

    if (loading) return <div>Items laden...</div>;

    return (
        <div className="mt-8">
            <h3 className="text-xl font-bold mb-4 border-b pb-2 flex items-center gap-2">
                Inhoud Bewerken: <span className="text-museum-gold uppercase">{gameType}</span>
            </h3>

            {/* --- EDITOR FORMULIER --- */}
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-8">
                
                {/* 1. KUNSTWERK ZOEKEN (Altijd zichtbaar) */}
                <div className="flex gap-6 mb-4 border-b border-slate-200 pb-4">
                    <div className="w-1/4">
                        <div className="aspect-square bg-white border rounded-lg flex items-center justify-center overflow-hidden mb-2 relative">
                            {newItem.image_url ? <img src={newItem.image_url} className="w-full h-full object-cover" /> : <ImageIcon className="text-slate-300" size={32} />}
                        </div>
                    </div>
                    <div className="flex-1">
                        <label className="text-xs font-bold uppercase text-slate-500 mb-1">1. Koppel Kunstwerk</label>
                        <div className="relative flex gap-2">
                            <input className="flex-1 border p-2 rounded text-sm" placeholder="Zoek op titel..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}/>
                            <button onClick={handleSearchArtwork} className="bg-slate-200 p-2 rounded"><Search size={16}/></button>
                            
                            {searchResults.length > 0 && (
                                <div className="absolute top-full left-0 w-full bg-white border shadow-xl rounded-lg mt-1 z-10 max-h-48 overflow-y-auto">
                                    {searchResults.map(art => (
                                        <div key={art.id} onClick={() => selectArtwork(art)} className="p-2 hover:bg-slate-100 cursor-pointer flex gap-2 items-center text-sm border-b">
                                            <img src={art.image_url} className="w-8 h-8 object-cover rounded"/>
                                            <div><span className="block font-bold">{art.title}</span><span className="text-xs text-gray-500">{art.artist} ({art.year_created})</span></div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 2. DYNAMISCHE VELDEN PER TYPE */}
                <div className="space-y-4">
                    
                    {/* --- TYPE: TIMELINE --- */}
                    {gameType === 'timeline' && (
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="text-xs font-bold text-slate-500">Titel op kaartje</label>
                                <input className="w-full border p-2 rounded" value={newItem.question} onChange={e => setNewItem({...newItem, question: e.target.value})}/>
                            </div>
                            <div className="w-1/3">
                                <label className="text-xs font-bold text-slate-500 flex items-center gap-1"><Calendar size={12}/> Jaartal</label>
                                <input type="number" className="w-full border p-2 rounded font-mono" value={newItem.extra_data?.year || ''} onChange={e => setNewItem({...newItem, extra_data: { ...newItem.extra_data, year: e.target.value }})}/>
                            </div>
                        </div>
                    )}

                    {/* --- TYPE: WHO AM I --- */}
                    {gameType === 'who_am_i' && (
                        <>
                            <div>
                                <label className="text-xs font-bold text-slate-500">De Kunstenaar (Antwoord)</label>
                                <input className="w-full border p-2 rounded font-bold" value={newItem.correct_answer} onChange={e => setNewItem({...newItem, correct_answer: e.target.value})}/>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <input className="border p-2 rounded text-sm" placeholder="Hint 1 (Moeilijk)" value={newItem.extra_data?.hints?.[0] || ''} onChange={e => { const h = newItem.extra_data.hints || []; h[0] = e.target.value; setNewItem({...newItem, extra_data: { hints: h }}) }}/>
                                <input className="border p-2 rounded text-sm" placeholder="Hint 2 (Gemiddeld)" value={newItem.extra_data?.hints?.[1] || ''} onChange={e => { const h = newItem.extra_data.hints || []; h[1] = e.target.value; setNewItem({...newItem, extra_data: { hints: h }}) }}/>
                                <input className="border p-2 rounded text-sm" placeholder="Hint 3 (Makkelijk)" value={newItem.extra_data?.hints?.[2] || ''} onChange={e => { const h = newItem.extra_data.hints || []; h[2] = e.target.value; setNewItem({...newItem, extra_data: { hints: h }}) }}/>
                            </div>
                        </>
                    )}

                    {/* --- TYPE: QUIZ / PIXEL / CURATOR --- */}
                    {['quiz', 'pixel_hunt', 'curator'].includes(gameType) && (
                        <>
                            {gameType === 'quiz' && (
                                <input className="w-full border p-2 rounded font-bold" placeholder="De Vraag..." value={newItem.question} onChange={e => setNewItem({...newItem, question: e.target.value})}/>
                            )}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="relative">
                                    <input className="w-full border border-green-500 bg-green-50 p-2 rounded pl-8" placeholder="Goede Antwoord" value={newItem.correct_answer} onChange={e => setNewItem({...newItem, correct_answer: e.target.value})}/>
                                    <Check size={16} className="absolute left-2 top-3 text-green-600"/>
                                </div>
                                <input className="w-full border p-2 rounded" placeholder="Fout 1" value={newItem.wrong_1} onChange={e => setNewItem({...newItem, wrong_1: e.target.value})}/>
                                <input className="w-full border p-2 rounded" placeholder="Fout 2" value={newItem.wrong_2} onChange={e => setNewItem({...newItem, wrong_2: e.target.value})}/>
                                <input className="w-full border p-2 rounded" placeholder="Fout 3" value={newItem.wrong_3} onChange={e => setNewItem({...newItem, wrong_3: e.target.value})}/>
                            </div>
                        </>
                    )}

                    {/* --- TYPE: MEMORY --- */}
                    {gameType === 'memory' && (
                        <p className="text-sm text-slate-500 italic">Voor Memory hoef je alleen een kunstwerk te selecteren. De game engine maakt automatisch paren van het plaatje en de titel.</p>
                    )}

                </div>

                <div className="flex justify-end mt-4">
                    <button onClick={handleAddItem} className="bg-slate-900 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-slate-700 transition-colors">
                        <Plus size={16}/> Toevoegen
                    </button>
                </div>
            </div>

            {/* --- LIJST ITEMS --- */}
            <div className="space-y-2">
                {items.map((item, idx) => (
                    <div key={item.id} className="bg-white border rounded-lg p-3 flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-4">
                            <span className="font-mono text-slate-300 w-6">#{idx + 1}</span>
                            <img src={item.image_url} className="w-10 h-10 object-cover rounded bg-slate-100" />
                            <div>
                                <div className="font-bold text-sm text-slate-800">{item.question || item.artwork?.title || "Item"}</div>
                                <div className="text-xs text-green-600">
                                    {gameType === 'timeline' ? `Jaar: ${item.extra_data?.year}` : item.correct_answer}
                                </div>
                            </div>
                        </div>
                        <button onClick={() => handleDelete(item.id)} className="text-slate-400 hover:text-red-500 p-2"><Trash2 size={18}/></button>
                    </div>
                ))}
                {items.length === 0 && <div className="text-center text-slate-400 py-4">Nog geen items toegevoegd.</div>}
            </div>
        </div>
    );
}
