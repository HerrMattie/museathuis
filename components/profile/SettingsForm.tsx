'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { Save, Loader2, User, Paintbrush, CreditCard, Laptop, Heart, Globe } from 'lucide-react';

// --- OPTIES & LIJSTEN ---
const PERIODS = ["Oude Meesters", "Renaissance", "Barok", "Impressionisme", "Moderne Kunst", "Hedendaags", "Fotografie", "Design"];
const THEMES = ["Geschiedenis", "Natuur", "Wetenschap", "Technologie", "Mode", "Architectuur", "Politiek", "Religie"];
const INTERESTS_LIST = ["Schilderkunst", "Beeldhouwkunst", "Installaties", "Digitale Kunst", "Performance", "Grafisch Design"];
const MUSEUM_TYPES = ["Rijksmuseum", "Modern", "Wetenschap", "Openlucht", "Kastelen", "Kerkelijk", "Maritiem"];
const DEVICES = ["Mobiel", "Tablet", "Desktop", "Laptop", "Smart TV"];
const LANGUAGES = ["nl", "en", "de", "fr"];

export default function SettingsForm({ user, initialData }: { user: any, initialData: any }) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('persoonlijk');

  // --- HULPFUNCTIE: Veilig arrays laden ---
  const parseArray = (data: any) => {
      if (!data) return []; 
      if (Array.isArray(data)) return data;
      if (typeof data === 'string') {
          try {
             const parsed = JSON.parse(data);
             return Array.isArray(parsed) ? parsed : [];
          } catch { return []; }
      }
      return [];
  };

  // --- STATE MANAGMENT ---
  
  // 1. Persoonlijk
  const [fullName, setFullName] = useState(initialData?.full_name || initialData?.display_name || '');
  const [gender, setGender] = useState(initialData?.gender || '');
  const [ageGroup, setAgeGroup] = useState(initialData?.age_group || '');
  const [province, setProvince] = useState(initialData?.province || '');
  const [country, setCountry] = useState(initialData?.country || 'Nederland');
  const [education, setEducation] = useState(initialData?.education_level || '');
  const [workField, setWorkField] = useState(initialData?.work_field || '');
  const [language, setLanguage] = useState(initialData?.language || 'nl');
  const [selectedAvatar, setSelectedAvatar] = useState(initialData?.avatar_url || '/avatars/rembrandt.png');

  // 2. Cultuur & Bezoek
  const [frequency, setFrequency] = useState(initialData?.museum_visit_frequency || '');
  const [visitsPerYear, setVisitsPerYear] = useState(initialData?.museum_visits_per_year || '');
  const [company, setCompany] = useState(initialData?.visit_company || '');
  const [artLevel, setArtLevel] = useState(initialData?.art_interest_level || '');
  const [museumTypes, setMuseumTypes] = useState<string[]>(parseArray(initialData?.museum_types));
  
  // Museumkaart Logica
  const [hasMuseumCard, setHasMuseumCard] = useState<boolean>(
      initialData?.has_museum_card === true || 
      (Array.isArray(initialData?.memberships) && initialData.memberships.includes('Museumkaart'))
  );

  // 3. Interesses
  const [favPeriods, setFavPeriods] = useState<string[]>(parseArray(initialData?.favorite_periods));
  const [topInterests, setTopInterests] = useState<string[]>(parseArray(initialData?.top_interests));
  const [preferredThemes, setPreferredThemes] = useState<string[]>(parseArray(initialData?.preferred_themes));
  const [favMuseums, setFavMuseums] = useState<string[]>(parseArray(initialData?.favorite_museums));

  // 4. Tech & Gebruik
  const [primaryDevice, setPrimaryDevice] = useState(initialData?.primary_device || 'Mobiel');
  const [usesCasting, setUsesCasting] = useState<boolean>(initialData?.uses_casting === true);
  
  // VERWIJDERD: minutesPerDay en dataConsent uit state


  // --- HANDLERS ---
  const toggleItem = (list: string[], setList: any, item: string) => {
      setList(list.includes(item) ? list.filter(i => i !== item) : [...list, item]);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
        const cardsArray = hasMuseumCard ? ['Museumkaart'] : [];

        const updates = {
            user_id: user.id,
            updated_at: new Date().toISOString(),
            has_completed_onboarding: true,

            // Persoonlijk
            full_name: fullName,
            display_name: fullName,
            gender: gender,
            age_group: ageGroup,
            province: province,
            country: country,
            education_level: education,
            work_field: workField,
            language: language,
            avatar_url: selectedAvatar,

            // Cultuur
            museum_visit_frequency: frequency,
            museum_visits_per_year: visitsPerYear,
            visit_company: company,
            art_interest_level: artLevel,
            museum_types: museumTypes,
            
            // Lidmaatschappen
            museum_cards: cardsArray,
            memberships: cardsArray,
            has_museum_card: hasMuseumCard,

            // Interesses
            favorite_periods: favPeriods,
            top_interests: topInterests,
            preferred_themes: preferredThemes,
            favorite_museums: favMuseums,

            // Tech
            primary_device: primaryDevice,
            uses_casting: usesCasting,
            
            // VERWIJDERD: minutes_per_day en data_consent uit de update payload
        };

        const { error } = await supabase
            .from('user_profiles')
            .upsert(updates, { onConflict: 'user_id' });

        if (error) throw error;
        alert("Alle profielgegevens zijn succesvol opgeslagen! 🎉");
        
    } catch (err: any) {
        console.error("Save Error:", err);
        alert(`Fout bij opslaan: ${err.message}`);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-20 text-white">
      
      {/* TABS HEADER */}
      <div className="flex overflow-x-auto bg-midnight-900/50 p-1 rounded-t-2xl border-x border-t border-white/10 no-scrollbar">
        {[
          { id: 'persoonlijk', label: 'Persoonlijk', icon: <User size={16}/> },
          { id: 'cultuur', label: 'Cultuur', icon: <Paintbrush size={16}/> },
          { id: 'interesses', label: 'Interesses', icon: <Heart size={16}/> },
          { id: 'tech', label: 'Tech & Data', icon: <Laptop size={16}/> }
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-4 text-xs font-bold uppercase tracking-widest transition-all border-b-2 whitespace-nowrap ${activeTab === tab.id ? 'border-museum-gold text-white bg-white/5' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-midnight-900 border-x border-b border-white/10 rounded-b-2xl p-6 md:p-8 shadow-2xl">
        
        {/* --- TAB 1: PERSOONLIJK --- */}
        {activeTab === 'persoonlijk' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
             <div className="md:col-span-2 border-b border-white/10 pb-4 mb-2">
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Naam</label>
                <div className="grid grid-cols-1 gap-4">
                    <input type="text" placeholder="Je naam" value={fullName} onChange={(e) => setFullName(e.target.value)} className="bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-museum-gold outline-none"/>
                </div>
             </div>

             <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Leeftijdsgroep</label>
                <select value={ageGroup} onChange={(e) => setAgeGroup(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none">
                    <option value="">Selecteer...</option>
                    {["18-24", "25-39", "40-59", "60-74", "75+"].map(o => <option key={o} value={o}>{o}</option>)}
                </select>
             </div>
             <div>
                 <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Geslacht</label>
                 <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none">
                    <option value="">Selecteer...</option>
                    <option value="M">Man</option>
                    <option value="V">Vrouw</option>
                    <option value="X">Anders / Zeg ik liever niet</option>
                </select>
             </div>
             
             <div>
                 <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Locatie</label>
                 <div className="grid grid-cols-2 gap-2">
                     <select value={country} onChange={(e) => setCountry(e.target.value)} className="bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none">
                        <option value="Nederland">Nederland</option>
                        <option value="België">België</option>
                        <option value="Anders">Anders</option>
                    </select>
                    <select value={province} onChange={(e) => setProvince(e.target.value)} className="bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none">
                        <option value="">Provincie...</option>
                        {["Overijssel", "Noord-Holland", "Zuid-Holland", "Utrecht", "Gelderland", "Noord-Brabant", "Limburg", "Friesland", "Groningen", "Drenthe", "Zeeland", "Flevoland"].map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                 </div>
             </div>
             <div>
                 <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Taal</label>
                 <select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none uppercase">
                    {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
             </div>

             <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/10">
                 <div>
                     <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Opleiding</label>
                     <select value={education} onChange={(e) => setEducation(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none">
                        <option value="">Selecteer...</option>
                        {["VMBO", "HAVO", "VWO", "MBO", "HBO", "WO", "PhD", "Anders"].map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                 </div>
                 <div>
                     <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Werkveld</label>
                     <select value={workField} onChange={(e) => setWorkField(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none">
                        <option value="">Selecteer...</option>
                        {["Cultuur", "Onderwijs", "Zorg", "IT", "Overheid", "Zakelijk", "Student", "Gepensioneerd"].map(w => <option key={w} value={w}>{w}</option>)}
                    </select>
                 </div>
             </div>
          </div>
        )}

        {/* --- TAB 2: CULTUUR --- */}
        {activeTab === 'cultuur' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
             
             {/* Museumkaart Toggle */}
             <div className="bg-white/5 rounded-xl p-6 flex items-center justify-between border border-white/10 cursor-pointer hover:bg-white/10 transition-colors" onClick={() => setHasMuseumCard(!hasMuseumCard)}>
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-museum-gold/20 rounded-lg text-museum-gold"><CreditCard/></div>
                    <div>
                        <h4 className="font-bold text-white">Museumkaart</h4>
                        <p className="text-xs text-gray-400">Ik ben in bezit van een geldige kaart / pas</p>
                    </div>
                </div>
                <div className={`w-14 h-8 rounded-full transition-colors relative ${hasMuseumCard ? 'bg-green-500' : 'bg-gray-700'}`}>
                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${hasMuseumCard ? 'left-7' : 'left-1'}`} />
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Bezoekfrequentie</label>
                    <select value={frequency} onChange={(e) => setFrequency(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none">
                        <option value="">Kies...</option>
                        <option value="Wekelijks">Wekelijks</option>
                        <option value="Maandelijks">Maandelijks</option>
                        <option value="Enkele keren per jaar">Enkele keren per jaar</option>
                        <option value="Zelden">Zelden</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Aantal bezoeken (schatting/jaar)</label>
                    <input type="number" value={visitsPerYear} onChange={(e) => setVisitsPerYear(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none" placeholder="Bijv. 12" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Gezelschap</label>
                    <select value={company} onChange={(e) => setCompany(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none">
                        <option value="">Kies...</option>
                        <option value="Gezin">Gezin / Kinderen</option>
                        <option value="Partner">Partner</option>
                        <option value="Vrienden">Vrienden</option>
                        <option value="Alleen">Alleen</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Kennisniveau</label>
                    <select value={artLevel} onChange={(e) => setArtLevel(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none">
                        <option value="">Kies...</option>
                        <option value="Beginner">Beginner</option>
                        <option value="Liefhebber">Liefhebber</option>
                        <option value="Kenner">Kenner</option>
                        <option value="Expert">Expert</option>
                    </select>
                </div>
             </div>

             <div>
                 <label className="block text-xs font-bold text-gray-400 uppercase mb-3">Welke typen bezoek je graag?</label>
                 <div className="flex flex-wrap gap-2">
                    {MUSEUM_TYPES.map(t => (
                        <button key={t} onClick={() => toggleItem(museumTypes, setMuseumTypes, t)}
                            className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all ${museumTypes.includes(t) ? 'bg-white text-black border-white' : 'bg-black/40 text-gray-400 border-white/10'}`}>
                            {t}
                        </button>
                    ))}
                 </div>
             </div>
          </div>
        )}

        {/* --- TAB 3: INTERESSES --- */}
        {activeTab === 'interesses' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                 
                 {/* Periodes */}
                 <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-3">Favoriete Periodes</label>
                    <div className="flex flex-wrap gap-2">
                        {PERIODS.map(p => (
                            <button key={p} onClick={() => toggleItem(favPeriods, setFavPeriods, p)}
                                className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${favPeriods.includes(p) ? 'bg-museum-gold text-black border-museum-gold' : 'bg-white/5 text-gray-500 border-white/10'}`}>
                                {p}
                            </button>
                        ))}
                    </div>
                 </div>

                 {/* Top Interests */}
                 <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-3">Kunstvormen</label>
                    <div className="flex flex-wrap gap-2">
                        {INTERESTS_LIST.map(i => (
                            <button key={i} onClick={() => toggleItem(topInterests, setTopInterests, i)}
                                className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${topInterests.includes(i) ? 'bg-blue-500 text-white border-blue-500' : 'bg-white/5 text-gray-500 border-white/10'}`}>
                                {i}
                            </button>
                        ))}
                    </div>
                 </div>

                 {/* Thema's */}
                 <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-3">Thema's</label>
                    <div className="flex flex-wrap gap-2">
                        {THEMES.map(t => (
                            <button key={t} onClick={() => toggleItem(preferredThemes, setPreferredThemes, t)}
                                className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${preferredThemes.includes(t) ? 'bg-green-600 text-white border-green-600' : 'bg-white/5 text-gray-500 border-white/10'}`}>
                                {t}
                            </button>
                        ))}
                    </div>
                 </div>
            </div>
        )}

        {/* --- TAB 4: TECH & GEBRUIK --- */}
        {activeTab === 'tech' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2"><Laptop size={12} className="inline mr-1"/> Primair Apparaat</label>
                        <select value={primaryDevice} onChange={(e) => setPrimaryDevice(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none">
                            {DEVICES.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                </div>

                {/* Toggles */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                        <div>
                            <h4 className="font-bold text-sm text-white flex items-center gap-2"><Globe size={16}/> Casting / Big Screen</h4>
                            <p className="text-xs text-gray-400">Ik gebruik Cast/Airplay naar TV voor kunst</p>
                        </div>
                        <div onClick={() => setUsesCasting(!usesCasting)} className={`w-12 h-6 rounded-full p-0.5 cursor-pointer transition-colors ${usesCasting ? 'bg-blue-500' : 'bg-gray-700'}`}>
                            <div className={`w-5 h-5 bg-white rounded-full transition-transform ${usesCasting ? 'translate-x-6' : 'translate-x-0'}`} />
                        </div>
                    </div>
                    {/* VERWIJDERD: Data consent block */}
                </div>

                <div className="text-xs text-gray-500 text-center pt-8">
                    User ID: {user.id} <br/>
                    Account Created: {new Date(initialData?.created_at).toLocaleDateString()}
                </div>
            </div>
        )}

        {/* OPSLAAN KNOP */}
        <div className="mt-12 flex justify-end border-t border-white/10 pt-6">
            <button onClick={handleSave} disabled={loading} className="bg-museum-gold text-black px-10 py-4 rounded-full font-black uppercase tracking-widest flex items-center gap-2 hover:bg-yellow-500 transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)] disabled:opacity-50">
                {loading ? <Loader2 className="animate-spin" /> : <Save size={18}/>}
                OPSLAAN
            </button>
        </div>

      </div>
    </div>
  );
}
