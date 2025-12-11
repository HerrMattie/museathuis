'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabaseClient';
import Link from 'next/link';
import { Plus, Edit3, Trash2, Layers, Loader2, Eye } from 'lucide-react';

export default function SalonListPage() {
    const [salons, setSalons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        fetchSalons();
    }, []);

    const fetchSalons = async () => {
        const { data } = await supabase.from('salons').select('*').order('created_at', { ascending: false });
        setSalons(data || []);
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Weet je zeker dat je deze Salon wilt verwijderen?')) return;
        await supabase.from('salons').delete().eq('id', id);
        fetchSalons();
    };

    if (loading) return <div className="p-8"><Loader2 className="animate-spin text-museum-gold"/></div>;

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center gap-2">
                        <Layers className="text-museum-gold"/> Salon Beheer
                    </h1>
                    <p className="text-slate-500">Beheer je thema-collecties.</p>
                </div>
                <Link href="/crm/salons/new" className="bg-museum-gold text-black px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-yellow-500 transition-colors shadow-lg">
                    <Plus size={20}/> Nieuwe Salon
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {salons.map(salon => (
                    <div key={salon.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col">
                        <div className="h-48 bg-slate-100 relative">
                            {salon.image_url ? (
                                <img src={salon.image_url} className="w-full h-full object-cover"/>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50"><Layers size={48}/></div>
                            )}
                            
                            <div className={`absolute top-4 right-4 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest border ${salon.status === 'published' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                {salon.status}
                            </div>
                        </div>
                        
                        <div className="p-6 flex-1 flex flex-col">
                            <h3 className="font-bold text-lg mb-1 text-slate-800 line-clamp-1">{salon.title}</h3>
                            <p className="text-sm text-slate-500 mb-4 line-clamp-2 h-10">{salon.description || 'Geen beschrijving'}</p>
                            
                            <div className="flex justify-between items-center border-t border-slate-100 pt-4 mt-auto">
                                <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                                    {salon.is_premium ? '🔒 Premium' : '🔓 Gratis'}
                                </span>
                                <div className="flex gap-2">
                                    <Link href={`/crm/salons/${salon.id}`} className="p-2 hover:bg-blue-50 hover:text-blue-600 rounded-lg text-slate-400 transition-colors" title="Bewerken">
                                        <Edit3 size={18}/>
                                    </Link>
                                    <button onClick={() => handleDelete(salon.id)} className="p-2 hover:bg-red-50 hover:text-red-500 rounded-lg text-slate-400 transition-colors" title="Verwijderen">
                                        <Trash2 size={18}/>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            {salons.length === 0 && (
                <div className="text-center py-20 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                    <Layers size={48} className="mx-auto text-slate-300 mb-4"/>
                    <p className="text-slate-400">Nog geen salons. Maak er eentje aan!</p>
                </div>
            )}
        </div>
    );
}
