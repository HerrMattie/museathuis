'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { Trash2, Calendar, Save, Loader2, ArrowLeftRight } from 'lucide-react';

interface Stop {
    id: string;
    title: string;
    artist: string;
}

interface TourData {
    id: string;
    title: string;
    summary: string;
    scheduled_date: string | null;
    type: string;
    stops: Stop[];
    artwork_ids: string[];
}

export default function EditTourForm({ initialTourData }: { initialTourData: TourData }) {
    const [tour, setTour] = useState(initialTourData);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [message, setMessage] = useState('');
    const supabase = createClient();
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setTour({ ...tour, [e.target.name]: e.target.value });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage('');

        const updateData = {
            title: tour.title,
            summary: tour.summary,
            scheduled_date: tour.scheduled_date,
            type: tour.type,
            artwork_ids: tour.artwork_ids // Zorgt ervoor dat de volgorde in de DB update
        };

        const { error } = await supabase
            .from('tours')
            .update(updateData)
            .eq('id', tour.id);

        setIsSaving(false);

        if (error) {
            setMessage(`Fout bij opslaan: ${error.message}`);
        } else {
            setMessage('Tour succesvol opgeslagen!');
            router.refresh(); // Herlaad de pagina om nieuwe data te tonen
        }
        setTimeout(() => setMessage(''), 3000);
    };

    const handleDelete = async () => {
        if (!confirm(`Weet u zeker dat u de tour "${tour.title}" wilt verwijderen?`)) {
            return;
        }

        setIsDeleting(true);
        const { error } = await supabase
            .from('tours')
            .delete()
            .eq('id', tour.id);

        setIsDeleting(false);

        if (error) {
            setMessage(`Fout bij verwijderen: ${error.message}`);
        } else {
            router.push('/crm/tours');
        }
    };

    const handleReorder = (direction: 'up' | 'down', index: number) => {
        const newStops = [...tour.stops];
        const newIds = [...tour.artwork_ids];
        
        if (direction === 'up' && index > 0) {
            [newStops[index - 1], newStops[index]] = [newStops[index], newStops[index - 1]];
            [newIds[index - 1], newIds[index]] = [newIds[index], newIds[index - 1]];
        } else if (direction === 'down' && index < newStops.length - 1) {
            [newStops[index + 1], newStops[index]] = [newStops[index], newStops[index + 1]];
            [newIds[index + 1], newIds[index]] = [newIds[index], newIds[index + 1]];
        }
        
        setTour({ ...tour, stops: newStops, artwork_ids: newIds });
        setMessage('Volgorde is aangepast. Klik op Opslaan om dit permanent te maken.');
    };

    return (
        <form onSubmit={handleSave} className="bg-white p-8 rounded-xl shadow-lg border border-slate-200 space-y-6">
            
            {/* Formulier Velden */}
            <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Titel</label>
                <input 
                    type="text" 
                    name="title" 
                    value={tour.title} 
                    onChange={handleChange} 
                    required 
                    className="w-full border border-slate-300 p-3 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
            </div>
            
            <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Samenvatting</label>
                <textarea 
                    name="summary" 
                    value={tour.summary} 
                    onChange={handleChange} 
                    required 
                    rows={4}
                    className="w-full border border-slate-300 p-3 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Type</label>
                    <select
                        name="type"
                        value={tour.type}
                        onChange={handleChange}
                        className="w-full border border-slate-300 p-3 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                        <option value="daily">Dagelijkse Tour (Auto-genereer)</option>
                        <option value="special">Speciale Tour (Handmatig)</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center gap-2"><Calendar size={16} /> Gepland op</label>
                    <input 
                        type="date" 
                        name="scheduled_date" 
                        value={tour.scheduled_date ? tour.scheduled_date.substring(0, 10) : ''} 
                        onChange={handleChange} 
                        className="w-full border border-slate-300 p-3 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white"
                    />
                </div>
            </div>

            {/* Stops Beheer */}
            <div className="pt-4 border-t border-slate-200">
                <h3 className="text-lg font-bold text-slate-800 mb-3">Tour Stops ({tour.stops.length} kunstwerken)</h3>
                <div className="space-y-2">
                    {tour.stops.map((stop, index) => (
                        <div key={stop.id} className="flex items-center bg-slate-50 p-3 rounded-lg border border-slate-200">
                            <span className="w-8 font-bold text-slate-600">{index + 1}.</span>
                            <div className="flex-1">
                                <span className="font-medium text-slate-800">{stop.title}</span>
                                <span className="text-sm text-slate-500 ml-2">({stop.artist})</span>
                            </div>
                            <div className="flex gap-1">
                                <button 
                                    type="button" 
                                    onClick={() => handleReorder('up', index)} 
                                    disabled={index === 0}
                                    className="p-1 text-slate-400 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    ↑
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => handleReorder('down', index)} 
                                    disabled={index === tour.stops.length - 1}
                                    className="p-1 text-slate-400 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    ↓
                                </button>
                            </div>
                        </div>
                    ))}
                    {tour.stops.length === 0 && (
                         <div className="text-center p-4 text-slate-500">
                            Deze tour bevat nog geen kunstwerken. U kunt kunstwerken toevoegen op de create/edit pagina (toekomstige functie).
                         </div>
                    )}
                </div>
            </div>

            {/* Acties & Status */}
            <div className="pt-6 border-t border-slate-200 flex justify-between items-center">
                
                {/* Status Boodschap */}
                {message && (
                    <div className={`text-sm font-medium ${message.includes('Fout') ? 'text-red-600' : 'text-green-600'}`}>
                        {message}
                    </div>
                )}
                
                <div className="flex gap-4">
                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={isSaving || isDeleting}
                        className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-600 transition-colors disabled:bg-gray-400"
                    >
                        {isDeleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                        Verwijderen
                    </button>

                    <button
                        type="submit"
                        disabled={isSaving || isDeleting}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                    >
                        {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        Opslaan
                    </button>
                </div>
            </div>
        </form>
    );
}
