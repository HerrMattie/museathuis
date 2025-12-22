'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { Save, Loader2, User, MapPin, GraduationCap, Briefcase, Eye, Calendar, CreditCard, Paintbrush } from 'lucide-react';

// --- OPTIES VOOR DROPDOWNS ---
const AVATARS = [
    { id: 'rembrandt', src: '/avatars/rembrandt.png' },
    { id: 'vangogh', src: '/avatars/vangogh.png' },
    { id: 'vermeer', src: '/avatars/vermeer.png' },
    { id: 'frida', src: '/avatars/frida.png' },
    { id: 'dali', src: '/avatars/dali.png' },
    { id: 'picasso', src: '/avatars/picasso.png' },
];

const EDUCATION_LEVELS = ["VMBO", "HAVO/VWO", "MBO", "HBO", "WO", "PhD", "Anders"];
const WORK_FIELDS = ["Cultuur & Kunst", "Onderwijs", "Zorg", "IT & Tech", "Zakelijke Dienstverlening", "Overheid", "Student", "Gepensioneerd", "Anders"];
const FREQUENCIES = ["Wekelijks", "Maandelijks", "Enkele keren per jaar", "Zelden"];
const COMPANY_TYPES = ["Alleen", "Met Partner", "Met Gezin/Kinderen", "Met Vrienden", "Met Groep/Reis"];
const ART_LEVELS = ["Beginner (Ik wil leren)", "Liefhebber (Ik weet wat ik mooi vind)", "Kenner (Ik bezoek gericht)", "Expert (Professioneel/Studie)"];
const PERIODS = ["Oude Meesters", "Renaissance", "Barok", "Impressionisme", "Moderne Kunst", "Hedendaags", "Fotografie", "Design"];

export default function SettingsForm({ user, initialData }: { user: any, initialData: any }) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  // --- 1. IDENTITEIT ---
  const [fullName, setFullName] = useState(initialData?.full_name || initialData?.display_name || '');
  const [selectedAvatar, setSelectedAvatar] = useState(initialData?.avatar_url || '/avatars/rembrandt.png');
  const [bio, setBio] = useState(initialData?.role || ''); // Gebruiken 'role' even als bio/titel of maak kolom 'bio'

  // --- 2. DEMOGRAFIE (Voor data analyse) ---
  const [province, setProvince] = useState(initialData?.province || '');
  const [ageGroup, setAgeGroup] = useState(initialData?.age_group || '');
  const [education, setEducation] = useState(initialData?.education_level || '');
  const [workField, setWorkField] = useState(initialData?.work_field || '');

  // --- 3. GEDRAG (Bezoekersprofiel) ---
  const [frequency, setFrequency] = useState(initialData?.museum_visit_frequency || '');
  const [company, setCompany] = useState(initialData?.visit_company || '');
  const [artLevel, setArtLevel] = useState(initialData?.art_interest_level || '');
  
  // --- 4. INTERESSES (Arrays) ---
  const [favPeriods, setFavPeriods] = useState<string[]>(
      Array.isArray(initialData?.favorite_periods) ? initialData.favorite_periods : []
  );
  
  // --- 5. LIDMAATSCHAPPEN ---
  const [hasMuseumCard, setHasMuseumCard] = useState<boolean>(initialData?.museum_cards === true);

  // Helper voor Multi-select tags
  const togglePeriod = (period: string) => {
      if (favPeriods.includes(period)) {
          setFavPeriods(favPeriods.filter(p => p !== period));
      } else {
          setFavPeriods([...favPeriods, period]);
      }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
        const { error } = await supabase
            .from('user_profiles')
            .update({
                // Identiteit
                full_name: fullName,
                display_name: fullName, // Syncen voor zekerheid
                avatar_url: selectedAvatar,
                
                // Demografie
                province: province,
                age_group: ageGroup,
                education_level: education,
                work_field: workField,
                
                // Gedrag
                museum_visit_frequency: frequency,
                visit_company: company,
                art_interest_level: artLevel,
                
                // Interesses (Schoon array opslaan!)
                favorite_periods: favPeriods,
                
                // Lidmaatschappen
                museum_cards: hasMuseumCard,
                has_museum_card: hasMuseumCard, // Syncen met oude kolom voor zekerheid
                
                // Tech
                updated_at: new Date().toISOString(),
                has_completed_onboarding: true
            })
            .eq('user_id', user.id);

        if (error) throw error;
        alert("Profiel succesvol en volledig bijgewerkt!");
        
    } catch (err: any) {
        console.error(err);
        alert(`Fout: ${err.message}`);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-20 max-w-5xl mx-auto">
        
        {/* SECTIE 1: PROFIEL & AVATAR */}
        <div className="bg-midnight-900 border border-white/10 rounded-2xl p-6 md:p-8">
            <h3 className="text-xl font-serif font-bold text-white mb-6 flex items-center gap-2">
                <User className="text-museum-gold"/> Jouw Kunstenaars Profiel
            </h3>
            
            <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* Avatar Grid */}
                <div className="flex-1">
                    <label className="block text-xs font-bold uppercase text-gray-400 mb-3">Kies je Avatar</label>
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                        {AVATARS.map((av) => (
                            <button key={av.id} onClick={() => setSelectedAvatar(av.src)}
                                className={`relative rounded-full aspect-square overflow-hidden border-2 transition-all ${selectedAvatar === av.src ? 'border-museum-gold scale-110 shadow-[0_0_15px_rgba(212,175,55,0.5)]' : 'border-white/10 hover:border-white/50'}`}>
                                <img src={av.src} alt={av.id} className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Naam Input */}
                <div className="w-full md:w-1/3 space-y-4">
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Weergavenaam</label>
                        <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} 
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-museum-gold outline-none"/>
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Leeftijdsgroep</label>
                        <select value={ageGroup} onChange={(e) => setAgeGroup(e.target.value)} 
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none">
                            <option value="">Selecteer...</option>
                            {["18-24", "25-39", "40-59", "60-74", "75+"].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    </div>
                </div>
            </div>
        </div>

        {/* SECTIE 2: ACHTERGROND (DEMOGRAFIE) */}
        <div className="bg-midnight-900 border border-white/10 rounded-2xl p-6 md:p-8">
            <h3 className="text-xl font-serif font-bold text-white mb-6 flex items-center gap-2">
                <GraduationCap className="text-museum-gold"/> Achtergrond
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Opleidingsniveau</label>
                    <select value={education} onChange={(e) => setEducation(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none">
                        <option value="">Selecteer...</option>
                        {EDUCATION_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Werkveld / Status</label>
                    <select value={workField} onChange={(e) => setWorkField(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none">
                        <option value="">Selecteer...</option>
                        {WORK_FIELDS.map(w => <option key={w} value={w}>{w}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Provincie</label>
                    <select value={province} onChange={(e) => setProvince(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none">
                        <option value="">Selecteer...</option>
                        {["Noord-Holland", "Zuid-Holland", "Utrecht", "Gelderland", "Noord-Brabant", "Overijssel", "Limburg", "Friesland", "Groningen", "Drenthe", "Zeeland", "Flevoland", "België"].map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                </div>
            </div>
        </div>

        {/* SECTIE 3: CULTUREEL DNA (GEDRAG & INTERESSES) */}
        <div className="bg-midnight-900 border border-white/10 rounded-2xl p-6 md:p-8">
            <h3 className="text-xl font-serif font-bold text-white mb-6 flex items-center gap-2">
                <Paintbrush className="text-museum-gold"/> Cultureel DNA
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                    <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Kennisniveau Kunst</label>
                    <select value={artLevel} onChange={(e) => setArtLevel(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none">
                        <option value="">Hoe schat je jezelf in?</option>
                        {ART_LEVELS.map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
                    </select>
                </div>
                <div>
                     <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Museumbezoek Frequentie</label>
                    <select value={frequency} onChange={(e) => setFrequency(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none">
                        <option value="">Hoe vaak ga je?</option>
                        {FREQUENCIES.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                </div>
            </div>

            <div className="mb-6">
                <label className="block text-xs font-bold uppercase text-gray-400 mb-3">Favoriete Periodes & Stijlen</label>
                <div className="flex flex-wrap gap-2">
                    {PERIODS.map(p => (
                        <button key={p} onClick={() => togglePeriod(p)}
                            className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${favPeriods.includes(p) ? 'bg-museum-gold text-black border-museum-gold' : 'bg-white/5 text-gray-400 border-white/10 hover:border-white/30'}`}>
                            {p}
                        </button>
                    ))}
                </div>
            </div>

             {/* MUSEUMKAART TOGGLE */}
            <div className="bg-white/5 rounded-xl p-4 flex items-center justify-between border border-white/5 cursor-pointer hover:bg-white/10 transition-colors" onClick={() => setHasMuseumCard(!hasMuseumCard)}>
                <div className="flex items-center gap-3">
                    <CreditCard className={hasMuseumCard ? "text-museum-gold" : "text-gray-500"} />
                    <div>
                        <h3 className="font-bold text-white text-sm">Ik heb een Museumkaart</h3>
                        <p className="text-xs text-gray-400">Of vergelijkbare pas (ICOM, Rembrandt, etc)</p>
                    </div>
                </div>
                <div className={`w-12 h-6 rounded-full p-0.5 transition-colors ${hasMuseumCard ? 'bg-museum-gold' : 'bg-gray-600'}`}>
                    <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${hasMuseumCard ? 'translate-x-6' : 'translate-x-0'}`} />
                </div>
            </div>
        </div>
        
        {/* OPSLAAN KNOP */}
        <div className="sticky bottom-6 z-10">
            <button onClick={handleSave} disabled={loading} className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 shadow-xl">
                {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                Profiel & Voorkeuren Opslaan
            </button>
        </div>

    </div>
  );
}
