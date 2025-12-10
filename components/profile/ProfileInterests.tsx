'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { Save, Tag, MapPin, Calendar, Users, CreditCard, User, Check, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

// OPTIES CONSTANTEN
const INTERESTS = ["Oude Meesters", "Moderne Kunst", "Fotografie", "Design", "Geschiedenis"];
const PROVINCES = ["Noord-Holland", "Zuid-Holland", "Utrecht", "Gelderland", "Noord-Brabant", "Overijssel", "Limburg", "Friesland", "Groningen", "Drenthe", "Zeeland", "Flevoland", "België"];
const AGES = ["18-24", "25-39", "40-59", "60-74", "75+"];
const MEMBERSHIPS = ["Museumkaart", "CJP", "Rembrandtkaart", "ICOM", "VriendenLoterij VIP"];
const COMPANY = ["Alleen", "Met Partner", "Met Gezin/Kinderen", "Met Vrienden"];

export default function OnboardingWizard({ profile, user }: { profile: any, user: any }) {
    // State voor alle velden
    const [interests, setInterests] = useState<string[]>(profile?.interests || []);
    const [memberships, setMemberships] = useState<string[]>(profile?.memberships || []);
    const [ageGroup, setAgeGroup] = useState<string>(profile?.age_group || '');
    const [visitCompany, setVisitCompany] = useState<string>(profile?.visit_company || '');
    const [province, setProvince] = useState<string>(profile?.province || '');
    
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);
    const supabase = createClient();
    const router = useRouter();

    // Helper voor multi-select (aan/uit klikken)
    const toggleList = (list: string[], setList: any, item: string) => {
        if (list.includes(item)) setList(list.filter(i => i !== item));
        else setList([...list, item]);
    };

    const handleSave = async () => {
        setLoading(true);
        const { error } = await supabase
            .from('user_profiles')
            .update({ 
                interests, memberships, age_group: ageGroup, 
                visit_company: visitCompany, province 
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
                    <User className="text-museum-gold" size={20} /> Mijn Cultuur Profiel
                </h3>
                {saved && <span className="text-green-400 text-sm font-bold flex items-center gap-1"><Check size={16}/> Opgeslagen</span>}
            </div>

            <div className="space-y-8">
                
                {/* 1. INTERESSES */}
                <div>
                    <label className="block text-sm font-bold text-gray-400 mb-3 flex items-center gap-2"><Tag size={16}/> Wat vindt u interessant?</label>
                    <div className="flex flex-wrap gap-2">
                        {INTERESTS.map(tag => (
                            <button key={tag} onClick={() => toggleList(interests, setInterests, tag)}
                                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${interests.includes(tag) ? 'bg-museum-gold text-black border-museum-gold' : 'bg-white/5 text-gray-400 border-white/10'}`}>
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 2. LEEFTIJD (AVG: Range) */}
                    <div>
                        <label className="block text-sm font-bold text-gray-400 mb-2">Leeftijdsgroep</label>
                        <select value={ageGroup} onChange={(e) => setAgeGroup(e.target.value)} className="w-full bg-black/30 border border-white/20 text-white rounded-lg p-3 outline-none focus:border-museum-gold">
                            <option value="">Selecteer...</option>
                            {AGES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    </div>

                    {/* 3. PROVINCIE */}
                    <div>
                        <label className="block text-sm font-bold text-gray-400 mb-2"><MapPin size={14} className="inline mr-1"/> Provincie</label>
                        <select value={province} onChange={(e) => setProvince(e.target.value)} className="w-full bg-black/30 border border-white/20 text-white rounded-lg p-3 outline-none focus:border-museum-gold">
                            <option value="">Selecteer...</option>
                            {PROVINCES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    </div>
                </div>

                {/* 4. LIDMAATSCHAPPEN (Goudmijn voor segmentatie) */}
                <div>
                    <label className="block text-sm font-bold text-gray-400 mb-3 flex items-center gap-2"><CreditCard size={16}/> Welke kaarten heeft u?</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {MEMBERSHIPS.map(card => (
                            <div key={card} onClick={() => toggleList(memberships, setMemberships, card)} 
                                className={`cursor-pointer p-3 rounded-lg border flex items-center gap-3 transition-all ${memberships.includes(card) ? 'bg-blue-900/30 border-blue-500' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${memberships.includes(card) ? 'border-blue-500 bg-blue-500' : 'border-gray-500'}`}>
                                    {memberships.includes(card) && <Check size={10} className="text-white"/>}
                                </div>
                                <span className={`text-sm ${memberships.includes(card) ? 'text-white font-bold' : 'text-gray-400'}`}>{card}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 5. GEZELSCHAP */}
                <div>
                    <label className="block text-sm font-bold text-gray-400 mb-3 flex items-center gap-2"><Users size={16}/> Met wie gaat u meestal?</label>
                    <div className="flex flex-wrap gap-2">
                         {COMPANY.map(opt => (
                            <button key={opt} onClick={() => setVisitCompany(opt)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${visitCompany === opt ? 'bg-white text-black border-white' : 'bg-white/5 text-gray-400 border-white/10'}`}>
                                {opt}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="pt-4 border-t border-white/5 flex justify-end">
                    <button onClick={handleSave} disabled={loading} className="bg-white text-black px-8 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-gray-200 transition-colors shadow-lg">
                        {loading ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>}
                        Profiel Opslaan
                    </button>
                </div>

            </div>
        </div>
    );
}
