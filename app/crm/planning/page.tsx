'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { ChevronLeft, ChevronRight, Save, Loader2, Calendar as CalIcon } from 'lucide-react';

export default function PlanningPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [instructions, setInstructions] = useState<any>({});
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({ text: '', types: [] as string[] });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    const supabase = createClient();

    // Genereer de dagen van de maand
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay(); // 0 = zondag

    useEffect(() => {
        fetchInstructions();
    }, [currentDate]);

    const fetchInstructions = async () => {
        const start = new Date(year, month, 1).toISOString().split('T')[0];
        const end = new Date(year, month + 1, 0).toISOString().split('T')[0];

        const { data } = await supabase
            .from('planning_instructions')
            .select('*')
            .gte('date', start)
            .lte('date', end);
        
        const map: any = {};
        data?.forEach(item => map[item.date] = item);
        setInstructions(map);
        setLoading(false);
    };

    const handleDayClick = (day: number) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        setSelectedDate(dateStr);
        
        const existing = instructions[dateStr];
        setEditForm({
            text: existing?.instruction || '',
            types: existing?.content_types || ['tour', 'game', 'focus']
        });
    };

    const handleSave = async () => {
        if (!selectedDate) return;
        setSaving(true);

        const payload = {
            date: selectedDate,
            instruction: editForm.text,
            content_types: editForm.types
        };

        const { error } = await supabase.from('planning_instructions').upsert(payload);
        
        if (!error) {
            setInstructions({ ...instructions, [selectedDate]: payload });
            alert("Instructie opgeslagen voor AI.");
            setSelectedDate(null);
        }
        setSaving(false);
    };

    const toggleType = (type: string) => {
        setEditForm(prev => ({
            ...prev,
            types: prev.types.includes(type) 
                ? prev.types.filter(t => t !== type) 
                : [...prev.types, type]
        }));
    };

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2"><CalIcon/> AI Regisseur</h1>
                    <p className="text-slate-500">Geef instructies aan de AI voor specifieke data.</p>
                </div>
                <div className="flex gap-4 items-center bg-white p-2 rounded-lg border">
                    <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-2 hover:bg-slate-100 rounded"><ChevronLeft/></button>
                    <span className="font-bold w-32 text-center">{currentDate.toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' })}</span>
                    <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-2 hover:bg-slate-100 rounded"><ChevronRight/></button>
                </div>
            </header>

            <div className="grid grid-cols-7 gap-4">
                {['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za'].map(d => (
                    <div key={d} className="font-bold text-slate-400 text-center uppercase text-xs py-2">{d}</div>
                ))}
                
                {/* Lege vakjes voor de eerste dag */}
                {[...Array(firstDay)].map((_, i) => <div key={`empty-${i}`} />)}

                {/* Dagen */}
                {[...Array(daysInMonth)].map((_, i) => {
                    const day = i + 1;
                    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const hasInstruction = instructions[dateStr];

                    return (
                        <div 
                            key={day} 
                            onClick={() => handleDayClick(day)}
                            className={`min-h-[100px] border rounded-xl p-3 cursor-pointer transition-all hover:border-museum-gold relative ${selectedDate === dateStr ? 'ring-2 ring-museum-gold bg-yellow-50' : 'bg-white'}`}
                        >
                            <span className={`text-sm font-bold ${hasInstruction ? 'text-museum-gold' : 'text-slate-700'}`}>{day}</span>
                            {hasInstruction && (
                                <div className="mt-2 text-[10px] text-slate-600 bg-yellow-100/50 p-1 rounded border border-yellow-100">
                                    {hasInstruction.instruction}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* EDIT MODAL/PANEL */}
            {selectedDate && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-2xl w-full max-w-lg shadow-2xl">
                        <h3 className="text-xl font-bold mb-4">Instructie voor {selectedDate}</h3>
                        
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Opdracht aan AI</label>
                        <textarea 
                            className="w-full border p-3 rounded-lg h-32 mb-4" 
                            placeholder="Bijv: Het is Kerst. Focus op sneeuwlandschappen en religieuze kunst."
                            value={editForm.text}
                            onChange={e => setEditForm({...editForm, text: e.target.value})}
                        />

                        <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Toepassen op:</label>
                        <div className="flex gap-2 mb-6">
                            {['tour', 'game', 'focus'].map(type => (
                                <button 
                                    key={type}
                                    onClick={() => toggleType(type)}
                                    className={`px-3 py-1 rounded-full text-xs font-bold border ${editForm.types.includes(type) ? 'bg-black text-white border-black' : 'bg-white text-slate-500'}`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>

                        <div className="flex justify-end gap-2">
                            <button onClick={() => setSelectedDate(null)} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg">Annuleren</button>
                            <button onClick={handleSave} disabled={saving} className="bg-museum-gold text-black px-6 py-2 rounded-lg font-bold flex items-center gap-2">
                                {saving ? <Loader2 className="animate-spin"/> : <Save size={16}/>} Opslaan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
