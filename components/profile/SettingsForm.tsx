'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { Save, Loader2, MapPin, User, CreditCard, Palette, Smartphone, Users, Globe, BookOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { trackActivity } from '@/lib/tracking'; // Zorg dat je tracking functie geïmporteerd is

export default function SettingsForm({ user, initialData }: { user: any, initialData: any }) {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'personal' | 'museum' | 'interests' | 'tech'>('personal');

  // We initialiseren de state met ALLE velden uit je database dump
  const [formData, setFormData] = useState({
    // Persoonlijk
    full_name: initialData?.full_name || '',
    display_name: initialData?.display_name || '',
    age_group: initialData?.age_group || '',
    gender: initialData?.gender || '',
    province: initialData?.province || '',
    country: initialData?.country || 'Nederland',
    education_level: initialData?.education_level || '',
    work_field: initialData?.work_field || '',

    // Museum Gedrag
    has_museum_card: initialData?.has_museum_card || false,
    museum_visit_frequency: initialData?.museum_visit_frequency || '', // Bijv: 'Wekelijks', 'Maandelijks'
    visit_company: initialData?.visit_company || '', // Bijv: 'Alleen', 'Partner', 'Gezin'
    
    // Interesses
    art_interest_level: initialData?.art_interest_level || 'Gemiddeld',
    favorite_periods: Array.isArray(initialData?.favorite_periods) ? initialData.favorite_periods.join(', ') : (initialData?.favorite_periods || ''),
    
    // Tech
    primary_device: initialData?.primary_device || 'Mobiel',
    uses_casting: initialData?.uses_casting || false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleToggle = (name: string, value: boolean) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage('');

    // Array velden (zoals favorite_periods) weer omzetten van tekst naar array voor de database
    const periodsArray = formData.favorite_periods.includes(',') 
        ? formData.favorite_periods.split(',').map((s: string) => s.trim()) 
        : [formData.favorite_periods];

    const { error } = await supabase
      .from('user_profiles')
      .update({
        ...formData,
        favorite_periods: periodsArray, // Opslaan als array
        // Zorg dat de JSON kolom ook klopt met de boolean
        museum_cards: formData.has_museum_card ? JSON.stringify(["Museumkaart"]) : null,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    if (error) {
      setMessage('Fout bij opslaan: ' + error.message);
    } else {
      setMessage('Succesvol opgeslagen!');
      
      // Trigger Badge Check: "Instellingen Guru"
      trackActivity(supabase, user.id, 'update_settings', undefined, { tab: activeTab });
      
      router.refresh();
    }
    setLoading(false);
  };

  // Helper voor tab knoppen
  const TabButton = ({ id, label, icon: Icon }: any) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-4 py-3 text-sm font-bold uppercase tracking-wide transition-colors border-b-2 ${
        activeTab === id 
          ? 'border-museum-gold text-museum-gold bg-white/5' 
          : 'border-transparent text-gray-500 hover:text-white hover:bg-white/5'
      }`}
    >
      <Icon size={16} /> {label}
    </button>
  );

  return (
    <div className="bg-midnight-900 border border-white/10 rounded-2xl max-w-4xl mx-auto shadow-2xl overflow-hidden">
      
      {/* TABS */}
      <div className="flex flex-wrap border-b border-white/10 bg-black/20">
        <TabButton id="personal" label="Persoonlijk" icon={User} />
        <TabButton id="museum" label="Cultuur & Bezoek" icon={CreditCard} />
        <TabButton id="interests" label="Interesses" icon={Palette} />
        <TabButton id="tech" label="Tech & Gebruik" icon={Smartphone} />
      </div>

      <div className="p-8">
        
        {/* TAB 1: PERSOONLIJK */}
        {activeTab === 'personal' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Volledige Naam</label>
                        <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-lg py-3 px-4 text-white focus:border-museum-gold outline-none" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Roepnaam (Display Name)</label>
                        <input type="text" name="display_name" value={formData.display_name} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-lg py-3 px-4 text-white focus:border-museum-gold outline-none" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Geslacht</label>
                        <select name="gender" value={formData.gender} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-lg py-3 px-4 text-white focus:border-museum-gold outline-none">
                            <option value="">Selecteer...</option>
                            <option value="M">Man</option>
                            <option value="V">Vrouw</option>
                            <option value="X">Anders / Zeg ik liever niet</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Leeftijdsgroep</label>
                        <select name="age_group" value={formData.age_group} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-lg py-3 px-4 text-white focus:border-museum-gold outline-none">
                            <option value="">Selecteer...</option>
                            <option value="18-24">18-24</option>
                            <option value="25-39">25-39</option>
                            <option value="40-59">40-59</option>
                            <option value="60+">60+</option>
                        </select>
                    </div>
                    <div>
                         <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Land</label>
                         <div className="relative">
                            <Globe className="absolute left-3 top-3 text-gray-500" size={18} />
                            <input type="text" name="country" value={formData.country} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white focus:border-museum-gold outline-none" />
                         </div>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Provincie</label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-3 text-gray-500" size={18} />
                        <select name="province" value={formData.province} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white focus:border-museum-gold outline-none">
                            <option value="">Selecteer provincie...</option>
                            <option value="Drenthe">Drenthe</option>
                            <option value="Flevoland">Flevoland</option>
                            <option value="Friesland">Friesland</option>
                            <option value="Gelderland">Gelderland</option>
                            <option value="Groningen">Groningen</option>
                            <option value="Limburg">Limburg</option>
                            <option value="Noord-Brabant">Noord-Brabant</option>
                            <option value="Noord-Holland">Noord-Holland</option>
                            <option value="Overijssel">Overijssel</option>
                            <option value="Utrecht">Utrecht</option>
                            <option value="Zeeland">Zeeland</option>
                            <option value="Zuid-Holland">Zuid-Holland</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Opleidingsniveau</label>
                        <select name="education_level" value={formData.education_level} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-lg py-3 px-4 text-white focus:border-museum-gold outline-none">
                             <option value="">Selecteer...</option>
                             <option value="Middelbaar">Middelbaar Onderwijs</option>
                             <option value="MBO">MBO</option>
                             <option value="HBO">HBO</option>
                             <option value="WO">WO / Universiteit</option>
                             <option value="Anders">Anders</option>
                        </select>
                    </div>
                    <div>
                         <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Werkveld</label>
                         <input type="text" name="work_field" placeholder="Bijv. IT, Onderwijs, Zorg..." value={formData.work_field} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-lg py-3 px-4 text-white focus:border-museum-gold outline-none" />
                    </div>
                </div>
            </div>
        )}

        {/* TAB 2: MUSEUM GEDRAG */}
        {activeTab === 'museum' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex items-center justify-between bg-white/5 p-4 rounded-lg border border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-museum-gold rounded text-black"><CreditCard size={20}/></div>
                        <div>
                            <div className="text-white font-bold">Museumkaart</div>
                            <div className="text-xs text-gray-400">Ik ben in bezit van een geldige kaart</div>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={formData.has_museum_card} 
                            onChange={(e) => handleToggle('has_museum_card', e.target.checked)}
                            className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Bezoekfrequentie</label>
                        <select name="museum_visit_frequency" value={formData.museum_visit_frequency} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-lg py-3 px-4 text-white focus:border-museum-gold outline-none">
                             <option value="">Selecteer...</option>
                             <option value="Wekelijks">Wekelijks</option>
                             <option value="Maandelijks">Maandelijks</option>
                             <option value="Kwartaal">Eens per kwartaal</option>
                             <option value="Jaarlijks">Eens per jaar</option>
                             <option value="Zelden">Zelden</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Ik ga meestal met...</label>
                        <select name="visit_company" value={formData.visit_company} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-lg py-3 px-4 text-white focus:border-museum-gold outline-none">
                             <option value="">Selecteer...</option>
                             <option value="Alleen">Alleen</option>
                             <option value="Partner">Partner</option>
                             <option value="Gezin">Gezin / Kinderen</option>
                             <option value="Vrienden">Vrienden</option>
                             <option value="Groep">Georganiseerde groep</option>
                        </select>
                    </div>
                </div>
            </div>
        )}

        {/* TAB 3: INTERESSES */}
        {activeTab === 'interests' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Interesse in Kunst (Zelfinschatting)</label>
                     <input 
                        type="range" min="1" max="10" 
                        value={formData.art_interest_level === 'Hoog' ? 9 : (formData.art_interest_level === 'Laag' ? 2 : 5)} 
                        onChange={(e) => {
                            const val = parseInt(e.target.value);
                            let level = 'Gemiddeld';
                            if(val <= 3) level = 'Laag';
                            if(val >= 8) level = 'Hoog';
                            setFormData(prev => ({...prev, art_interest_level: level}));
                        }}
                        className="w-full accent-museum-gold h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                     />
                     <div className="flex justify-between text-xs text-gray-400 mt-2">
                        <span>Beginner</span>
                        <span className="text-museum-gold font-bold">{formData.art_interest_level}</span>
                        <span>Expert</span>
                     </div>
                </div>

                <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Favoriete Periodes (Komma gescheiden)</label>
                     <div className="relative">
                        <BookOpen className="absolute left-3 top-3 text-gray-500" size={18} />
                        <input type="text" name="favorite_periods" placeholder="Bijv. Barok, Modern, Renaissance..." value={formData.favorite_periods} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white focus:border-museum-gold outline-none" />
                     </div>
                     <p className="text-[10px] text-gray-500 mt-1">Wij gebruiken dit om betere aanbevelingen te doen.</p>
                </div>
            </div>
        )}

        {/* TAB 4: TECH */}
        {activeTab === 'tech' && (
             <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Primair Apparaat voor MuseaThuis</label>
                    <select name="primary_device" value={formData.primary_device} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-lg py-3 px-4 text-white focus:border-museum-gold outline-none">
                             <option value="Mobiel">Mobiel (Smartphone)</option>
                             <option value="Tablet">Tablet (iPad e.d.)</option>
                             <option value="Desktop">Desktop / Laptop</option>
                    </select>
                </div>

                <div className="flex items-center justify-between bg-white/5 p-4 rounded-lg border border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-600 rounded text-white"><Users size={20}/></div>
                        <div>
                            <div className="text-white font-bold">Casting / TV Gebruik</div>
                            <div className="text-xs text-gray-400">Ik stream kunst vaak naar de TV (Chromecast/Airplay)</div>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={formData.uses_casting} 
                            onChange={(e) => handleToggle('uses_casting', e.target.checked)}
                            className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                    </label>
                </div>
             </div>
        )}

        {/* OPSLAAN KNOP */}
        <div className="pt-8 mt-8 border-t border-white/10 flex items-center justify-between">
            <span className={`text-sm font-bold ${message.includes('Fout') ? 'text-red-500' : 'text-green-500'}`}>
                {message}
            </span>
            <button 
                onClick={handleSave} 
                disabled={loading}
                className="flex items-center gap-2 px-8 py-3 bg-museum-gold text-black font-bold rounded-full hover:bg-white transition-colors disabled:opacity-50"
            >
                {loading ? <Loader2 size={18} className="animate-spin"/> : <Save size={18}/>}
                Opslaan
            </button>
        </div>

      </div>
    </div>
  );
}
