'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { Save, Loader2, AlertTriangle, Info } from 'lucide-react';

interface ScheduleItem {
    id: string;
    title: string;
}

interface HistoryItem {
    date: string;
    item_id: string;
    type: 'tour' | 'game' | 'focus' | 'salon';
}

interface Props {
    date: string;
    initialData: {
        tour_ids: string[];
        game_ids: string[];
        focus_ids: string[];
        salon_ids?: string[]; // Kan undefined zijn als de kolom nog niet bestaat
    };
    availableTours: ScheduleItem[];
    availableGames: ScheduleItem[];
    availableFocus: ScheduleItem[];
    availableSalons: ScheduleItem[];
    history: HistoryItem[]; 
}

export default function EditScheduleForm({ date, initialData, availableTours, availableGames, availableFocus, availableSalons, history }: Props) {
    const [selectedTours, setSelectedTours] = useState<string[]>(initialData.tour_ids || []);
    const [selectedGames, setSelectedGames] = useState<string[]>(initialData.game_ids || []);
    const [selectedFocus, setSelectedFocus] = useState<string[]>(initialData.focus_ids || []);
    const [selectedSalons, setSelectedSalons] = useState<string[]>(initialData.salon_ids || []);
    
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState('');
    
    const supabase = createClient();
    const router = useRouter();

    // Helper: Check of een item recent is gebruikt
    const checkDuplicate = (id: string, type: 'tour' | 'game' | 'focus' | 'salon') => {
        const found = history.find(h => h.item_id === id && h.type === type);
        if (found) {
            return `Let op: Dit item is recent ingepland op ${found.date}`;
        }
        return null;
    };

    const handleSave = async () => {
        setIsSaving(true);
        setMessage('');

        // Let op: zorg dat je tabel 'dayprogram_schedule' een kolom 'salon_ids' (array van text/uuid) heeft!
        const { error } = await supabase.from('dayprogram_schedule').upsert({
            day_date: date,
            tour_ids: selectedTours,
            game_ids: selectedGames,
            focus_ids: selectedFocus,
            salon_ids: selectedSalons,
        }, { onConflict: 'day_date' });

        if (error) {
            console.error("Save error:", error);
            setMessage(`Error: ${error.message}`);
        } else {
            setMessage('Planning succesvol opgeslagen!');
            router.push('/crm/schedule'); // Terug naar overzicht
            router.refresh();
        }
        setIsSaving(false);
    };

    // Generic Multi-Select Component met Waarschuwing
    const SelectionSection = ({ 
        title, 
        items, 
        selectedIds, 
        setSelected, 
        type 
    }: { 
        title: string, 
        items: ScheduleItem[], 
        selectedIds: string[], 
        setSelected: (ids: string[]) => void,
        type: 'tour' | 'game' | 'focus' | 'salon'
    }) => {
        return (
            <div className="mb-8 p-6 bg-slate-50 rounded-xl border border-slate-200">
                <h3 className="font-bold text-slate-800 mb-4 flex justify-between">
                    {title} 
                    <span className="text-xs font-normal text-slate-500 bg-white px-2 py-1 rounded border">Geselecteerd: {selectedIds.length}</span>
                </h3>
                
                {/* De Select Box */}
                <select 
                    multiple 
                    className="w-full border border-slate-300 rounded-lg p-2 h-48 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    value={selectedIds}
                    onChange={(e) => {
                        const options = Array.from(e.target.selectedOptions, option => option.value);
                        setSelected(options);
                    }}
                >
                    {items.map(item => (
                        <option key={item.id} value={item.id}>
                            {item.title}
                        </option>
                    ))}
                </select>
                <p className="text-xs text-slate-400 mt-2 mb-4">Houd CTRL (Windows) of CMD (Mac) ingedrukt om meerdere items te selecteren.</p>

                {/* De Waarschuwingen Sectie */}
                <div className="space-y-2">
                    {selectedIds.map(id => {
                        const warning = checkDuplicate(id, type);
                        const itemTitle = items.find(i => i.id === id)?.title;
                        if (!warning) return null;

                        return (
                            <div key={id} className="flex items-start gap-2 text-xs text-orange-700 bg-orange-100 p-2 rounded border border-orange-200">
                                <AlertTriangle size={14} className="mt-0.5 shrink-0"/>
                                <span>
                                    <strong>{itemTitle}:</strong> {warning}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <SelectionSection 
                    title="Audio Tours" 
                    items={availableTours} 
                    selectedIds={selectedTours} 
                    setSelected={setSelectedTours} 
                    type="tour"
                />

                <SelectionSection 
                    title="Games & Quizzen" 
                    items={availableGames} 
                    selectedIds={selectedGames} 
                    setSelected={setSelectedGames} 
                    type="game"
                />

                <SelectionSection 
                    title="Focus Items" 
                    items={availableFocus} 
                    selectedIds={selectedFocus} 
                    setSelected={setSelectedFocus} 
                    type="focus"
                />

                <SelectionSection 
                    title="Salons" 
                    items={availableSalons} 
                    selectedIds={selectedSalons} 
                    setSelected={setSelectedSalons} 
                    type="salon"
                />
            </div>

            <div className="bg-slate-100 p-4 border-t border-slate-200 flex justify-between items-center">
                <div className={`font-bold text-sm ${message.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
                    {message}
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold transition-all shadow-md disabled:opacity-50"
                >
                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    Planning Opslaan
                </button>
            </div>
        </div>
    );
}
