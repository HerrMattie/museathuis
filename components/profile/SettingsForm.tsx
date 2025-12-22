'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { Save, Loader2, User, GraduationCap, Paintbrush, CreditCard, Laptop, Heart } from 'lucide-react';

const PERIODS = ["Oude Meesters", "Renaissance", "Barok", "Impressionisme", "Moderne Kunst", "Hedendaags", "Fotografie", "Design"];

export default function SettingsForm({ user, initialData }: { user: any, initialData: any }) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('persoonlijk');

  // States
  const [fullName, setFullName] = useState(initialData?.full_name || '');
  const [selectedAvatar, setSelectedAvatar] = useState(initialData?.avatar_url || '/avatars/rembrandt.png');
  const [ageGroup, setAgeGroup] = useState(initialData?.age_group || '');
  const [province, setProvince] = useState(initialData?.province || '');
  const [education, setEducation] = useState(initialData?.education_level || '');
  const [workField, setWorkField] = useState(initialData?.work_field || '');
  const [artLevel, setArtLevel] = useState(initialData?.art_interest_level || '');
  const [frequency, setFrequency] = useState(initialData?.museum_visit_frequency || '');
  const [company, setCompany] = useState(initialData?.visit_company || '');
  const [hasMuseumCard, setHasMuseumCard] = useState<boolean>(initialData?.has_museum_card === true || initialData?.museum_cards === true);
  
  // Data-cleaning voor arrays
  const [favPeriods, setFavPeriods] = useState<string[]>(() => {
      const data = initialData?.favorite_periods;
      if (Array.isArray(data)) return data.filter(i => i && i !== '""');
      return [];
  });

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
                favorite_periods: favPeriods, // Gaat nu als echte array
                has_museum_card: hasMuseumCard,
                museum_cards: hasMuseumCard,
                updated_at: new Date().toISOString(),
                has_completed_onboarding: true
            }, { onConflict: 'user_id' });

        if (error) throw error;
        alert("Instellingen succesvol opgeslagen! 🎉");
    } catch (err: any) {
        alert(`Fout bij opslaan: ${err.message}`);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-20">
      {/* Tab Navigatie (Zoals in je screenshot) */}
      <div className="flex overflow-x-auto bg-midnight-900/50 p-1 rounded-t-2xl border-x border-t border-white/10">
        {[
          { id: 'persoonlijk', label: 'Persoonlijk', icon: <User size={16}/> },
          { id: 'cultuur', label: 'Cultuur & Bezoek', icon: <Paintbrush size={16}/> },
          { id: 'interesses', label: 'Interesses', icon: <Heart size={16}/> },
          { id: 'tech', label: 'Tech & Gebruik', icon: <Laptop size={16}/> }
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-4 text-xs font-bold uppercase tracking-widest transition-all border-b-2 ${activeTab === tab.id ? 'border-museum-gold text-white bg-white/5' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-midnight-900 border-x border-b border-white/10 rounded-b-2xl p-8 shadow-2xl">
        {activeTab === 'persoonlijk' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
             <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Naam</label>
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-museum-gold outline-none"/>
             </div>
             <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Leeftijdsgroep</label>
                <select value={ageGroup} onChange={(e) => setAgeGroup(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none">
                    <option value="">Kies...</option>
                    {["18-24", "25-39", "40-59", "60-74", "75+"].map(o => <option key={o} value={o}>{o}</option>)}
                </select>
             </div>
          </div>
        )}

        {activeTab === 'cultuur' && (
          <div className="space-y-8 animate-in fade-in duration-300">
             <div className="bg-white/5 rounded-xl p-6 flex items-center justify-between border border-white/10">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-museum-gold/20 rounded-lg text-museum-gold"><CreditCard/></div>
                    <div>
                        <h4 className="font-bold text-white">Museumkaart</h4>
                        <p className="text-xs text-gray-400">Ik ben in bezit van een geldige kaart</p>
                    </div>
                </div>
                <button onClick={() => setHasMuseumCard(!hasMuseumCard)} className={`w-14 h-8 rounded-full transition-colors relative ${hasMuseumCard ? 'bg-green-500' : 'bg-gray-700'}`}>
                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${hasMuseumCard ? 'left-7' : 'left-1'}`} />
                </button>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Bezoekfrequentie</label>
                    <select value={frequency} onChange={(e) => setFrequency(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white outline-none">
                        <option value="Maandelijks">Maandelijks</option>
                        <option value="Wekelijks">Wekelijks</option>
                        <option value="Jaarlijks">Jaarlijks</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Ik ga meestal met...</label>
                    <select value={company} onChange={(e) => setCompany(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white outline-none">
                        <option value="Gezin / Kinderen">Gezin / Kinderen</option>
                        <option value="Partner">Partner</option>
                        <option value="Alleen">Alleen</option>
                    </select>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'interesses' && (
            <div className="animate-in fade-in duration-300">
                 <label className="block text-xs font-bold text-gray-400 uppercase mb-4">Favoriete Periodes & Stijlen</label>
                 <div className="flex flex-wrap gap-2">
                    {PERIODS.map(p => (
                        <button key={p} onClick={() => setFavPeriods(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])}
                            className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${favPeriods.includes(p) ? 'bg-museum-gold text-black border-museum-gold' : 'bg-white/5 text-gray-500 border-white/10'}`}>
                            {p}
                        </button>
                    ))}
                 </div>
            </div>
        )}

        {/* OPSLAAN KNOP (Onderaan, zoals in screenshot) */}
        <div className="mt-12 flex justify-end">
            <button onClick={handleSave} disabled={loading} className="bg-museum-gold text-black px-10 py-4 rounded-full font-black uppercase tracking-widest flex items-center gap-2 hover:bg-yellow-500 transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)]">
                {loading ? <Loader2 className="animate-spin" /> : <Save size={18}/>}
                Opslaan
            </button>
        </div>
      </div>
    </div>
  );
}
