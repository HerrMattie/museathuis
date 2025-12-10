'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { Save, Tag, MapPin, Calendar, Check, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

const INTEREST_OPTIONS = [
  "Oude Meesters", "Moderne Kunst", "Fotografie", "Beeldhouwkunst", 
  "Architectuur", "Geschiedenis", "Design", "Mode"
];

const FREQUENCY_OPTIONS = [
  "Wekelijks", "Maandelijks", "Een paar keer per jaar", "Zelden"
];

const PROVINCE_OPTIONS = [
  "Drenthe", "Flevoland", "Friesland", "Gelderland", "Groningen", "Limburg",
  "Noord-Brabant", "Noord-Holland", "Overijssel", "Utrecht", "Zeeland", "Zuid-Holland", "België / Anders"
];

export default function ProfileInterests({ profile, user }: { profile: any, user: any }) {
    const [interests, setInterests] = useState<string[]>(profile?.interests || []);
    const [frequency, setFrequency] = useState<string>(profile?.museum_visits || '');
    const [province, setProvince] = useState<string>(profile?.province || '');
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);
    
    const supabase = createClient();
    const router = useRouter();

    const toggleInterest = (tag: string) => {
        if (interests.includes(tag)) {
            setInterests(interests.filter(i => i !== tag));
        } else {
            setInterests([...interests, tag]);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        const { error } = await supabase
            .from('user_profiles')
            .update({ 
                interests: interests,
                museum_visits: frequency,
                province: province
            })
            .eq('user_id', user.id);
            
        setLoading(false);
        if (!error) {
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
            router.refresh();
        }
    };

    return (
        <div className="bg-midnight-900 border border-white/10 rounded-xl p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <Tag className="text-museum-gold" size={20} /> Mijn Voorkeuren
                </h3>
                {saved && <span className="text-green-400 text-sm font-bold flex items-center gap-1"><Check size={16}/> Opgeslagen</span>}
            </div>

            <div className="space-y-6">
                
                {/* 1. INTERESSES (TAGS) */}
                <div>
                    <label className="block text-sm font-bold text-gray-400 mb-3">Welke kunstvormen spreken u aan?</label>
                    <div className="flex flex-wrap gap-2">
                        {INTEREST_OPTIONS.map(tag => (
                            <button
                                key={tag}
                                onClick={() => toggleInterest(tag)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                                    interests.includes(tag)
                                        ? 'bg-museum-gold text-black border-museum-gold'
                                        : 'bg-white/5 text-gray-400 border-white/10 hover:border-white/30'
                                }`}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 2. FREQUENTIE */}
                    <div>
                        <label className="block text-sm font-bold text-gray-400 mb-2 flex items-center gap-2">
                            <Calendar size={16}/> Hoe vaak bezoekt u een museum?
                        </label>
                        <select 
                            value={frequency} 
                            onChange={(e) => setFrequency(e.target.value)}
                            className="w-full bg-black/30 border border-white/20 text-white rounded-lg p-3 focus:border-museum-gold outline-none"
                        >
                            <option value="">Maak een keuze...</option>
                            {FREQUENCY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    </div>

                    {/* 3. LOCATIE */}
                    <div>
                        <label className="block text-sm font-bold text-gray-400 mb-2 flex items-center gap-2">
                            <MapPin size={16}/> Waar woont u?
                        </label>
                        <select 
                            value={province} 
                            onChange={(e) => setProvince(e.target.value)}
                            className="w-full bg-black/30 border border-white/20 text-white rounded-lg p-3 focus:border-museum-gold outline-none"
                        >
                            <option value="">Maak een keuze...</option>
                            {PROVINCE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    </div>
                </div>

                <div className="pt-4 border-t border-white/5 flex justify-end">
                    <button 
                        onClick={handleSave} 
                        disabled={loading}
                        className="bg-white text-black px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-gray-200 transition-colors"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>}
                        Voorkeuren Opslaan
                    </button>
                </div>

            </div>
        </div>
    );
}
