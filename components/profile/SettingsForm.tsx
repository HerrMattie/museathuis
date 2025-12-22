'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { Save, Loader2, User, GraduationCap, Paintbrush, CreditCard, Briefcase, MapPin } from 'lucide-react';

// --- OPTIES ---
const AVATARS = [
    { id: 'rembrandt', name: 'Rembrandt', src: '/avatars/rembrandt.png' },
    { id: 'vangogh', name: 'Van Gogh', src: '/avatars/vangogh.png' },
    { id: 'vermeer', name: 'Vermeer', src: '/avatars/vermeer.png' },
    { id: 'frida', name: 'Frida', src: '/avatars/frida.png' },
    { id: 'dali', name: 'Dali', src: '/avatars/dali.png' },
    { id: 'picasso', name: 'Picasso', src: '/avatars/picasso.png' },
];

const PERIODS = ["Oude Meesters", "Renaissance", "Barok", "Impressionisme", "Moderne Kunst", "Hedendaags", "Fotografie", "Design"];

// Helper om vervuilde CSV-data ("[""""]") op te schonen
const cleanArrayData = (input: any): string[] => {
    if (!input) return [];
    if (Array.isArray(input)) {
        return input.filter(i => i && i !== "" && i !== '""');
    }
    if (typeof input === 'string') {
        try {
            const parsed = JSON.parse(input);
            return Array.isArray(parsed) ? parsed.filter(i => i && i !== "" && i !== '""') : [];
        } catch {
            return input.split(',').map(s => s.trim()).filter(Boolean);
        }
    }
    return [];
};

export default function SettingsForm({ user, initialData }: { user: any, initialData: any }) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  // States gekoppeld aan jouw database kolommen
  const [fullName, setFullName] = useState(initialData?.full_name || '');
  const [selectedAvatar, setSelectedAvatar] = useState(initialData?.avatar_url || '/avatars/rembrandt.png');
  const [ageGroup, setAgeGroup] = useState(initialData?.age_group || '');
  const [province, setProvince] = useState(initialData?.province || '');
  const [education, setEducation] = useState(initialData?.education_level || '');
  const [workField, setWorkField] = useState(initialData?.work_field || '');
  const [artLevel, setArtLevel] = useState(initialData?.art_interest_level || '');
  const [frequency, setFrequency] = useState(initialData?.museum_visit_frequency || '');
  const [company, setCompany] = useState(initialData?.visit_company || '');
  
  const [favPeriods, setFavPeriods] = useState<string[]>(cleanArrayData(initialData?.favorite_periods));
  const [hasMuseumCard, setHasMuseumCard] = useState<boolean>(initialData?.museum_cards === true || initialData?.has_museum_card === true);

  const togglePeriod = (period: string) => {
      setFavPeriods(prev => prev.includes(period) ? prev.filter(p => p !== period) : [...prev, period]);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
        const { error } = await supabase
            .from('user_profiles')
            .upsert({
                user_id: user.id,
                full_name: fullName,
                display_name: fullName,
                avatar_url: selectedAvatar,
                age_group: ageGroup,
                province: province,
                education_level: education,
                work_field: workField,
                art_interest_level: artLevel,
                museum_visit_frequency: frequency,
                visit_company: company,
                favorite_periods: favPeriods,
                museum_cards: hasMuseumCard,
                has_museum_card: hasMuseumCard,
                updated_at: new Date().toISOString(),
                has_completed_onboarding: true
            }, { onConflict: 'user_id' });

        if (error) throw error;
        alert("Instellingen succesvol opgeslagen!");
    } catch (err: any) {
        console.error("Fout:", err);
        alert(`Fout bij opslaan: ${err.message}`);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-20 max-w-5xl mx-auto">
        <div className="bg-midnight-900 border border-white/10 rounded-2xl p-8">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><User className="text-museum-gold"/> Jouw Profiel</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Naam</label>
                    <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-museum-gold outline-none"/>
                </div>
                <div>
                    <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Leeftijdsgroep</label>
                    <select value={ageGroup} onChange={(e) => setAgeGroup(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none">
                        <option value="">Selecteer...</option>
                        {["18-24", "25-39", "40-59", "60-74", "75+"].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                </div>
            </div>
        </div>

        <div className="bg-midnight-900 border border-white/10 rounded-2xl p-8">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><GraduationCap className="text-museum-gold"/> Achtergrond</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <select value={education} onChange={(e) => setEducation(e.target.value)} className="bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none">
                    <option value="">Opleiding...</option>
                    {["MBO", "HBO", "WO", "PhD"].map(l => <option key={l} value={l}>{l}</option>)}
                </select>
                <select value={workField} onChange={(e) => setWorkField(e.target.value)} className="bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none">
                    <option value="">Werkveld...</option>
                    {["Cultuur", "IT", "Onderwijs", "Zorg", "Zakelijk"].map(w => <option key={w} value={w}>{w}</option>)}
                </select>
                <select value={province} onChange={(e) => setProvince(e.target.value)} className="bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none">
                    <option value="">Provincie...</option>
                    {["Overijssel", "Noord-Holland", "Zuid-Holland", "Utrecht", "Gelderland", "Noord-Brabant"].map(p => <option key={p} value={p}>{p}</option>)}
                </select>
            </div>
        </div>

        <div className="bg-midnight-900 border border-white/10 rounded-2xl p-8">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Paintbrush className="text-museum-gold"/> Cultureel DNA</h3>
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <select value={artLevel} onChange={(e) => setArtLevel(e.target.value)} className="bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none">
                        <option value="">Kunstkennis...</option>
                        {["Beginner", "Liefhebber", "Expert"].map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
                    </select>
                    <select value={frequency} onChange={(e) => setFrequency(e.target.value)} className="bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none">
                        <option value="">Bezoekfrequentie...</option>
                        {["Wekelijks", "Maandelijks", "Jaarlijks"].map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold uppercase text-gray-400 mb-3">Favoriete Periodes</label>
                    <div className="flex flex-wrap gap-2">
                        {PERIODS.map(p => (
                            <button key={p} type="button" onClick={() => togglePeriod(p)} className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${favPeriods.includes(p) ? 'bg-museum-gold text-black border-museum-gold' : 'bg-white/5 text-gray-400 border-white/10'}`}>
                                {p}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="bg-white/5 rounded-xl p-4 flex items-center justify-between border border-white/5 cursor-pointer" onClick={() => setHasMuseumCard(!hasMuseumCard)}>
                    <div className="flex items-center gap-3">
                        <CreditCard className={hasMuseumCard ? "text-museum-gold" : "text-gray-500"} />
                        <span className="text-white font-bold">Museumkaart Houder</span>
                    </div>
                    <div className={`w-12 h-6 rounded-full p-0.5 transition-colors ${hasMuseumCard ? 'bg-museum-gold' : 'bg-gray-600'}`}>
                        <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${hasMuseumCard ? 'translate-x-6' : 'translate-x-0'}`} />
                    </div>
                </div>
            </div>
        </div>

        <button onClick={handleSave} disabled={loading} className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 shadow-xl">
            {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
            Opslaan
        </button>
    </div>
  );
}
