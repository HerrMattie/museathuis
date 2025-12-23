'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, User, Camera, Info } from 'lucide-react';
import Link from 'next/link';
import LockedInput from '@/components/profile/LockedInput';
import { getLevel } from '@/lib/levelSystem';
import { checkProfileBadges } from '@/lib/gamification/checkBadges';
import AvatarSelector from '@/components/profile/AvatarSelector';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [level, setLevel] = useState(1);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);

  // 1. UPDATE: Alle relevante velden uit je database toegevoegd
  const [formData, setFormData] = useState({
    full_name: '',
    province: '',
    bio: '',          
    website: '',      
    top_artists: '', 
    header_url: '',
    avatar_url: '',
    // Nieuwe velden uit je CSV:
    age_group: '',
    gender: '',
    education_level: '',
    work_field: '',
    museum_visits_per_year: 0,
    preferred_period: '',
    museum_visit_frequency: ''
  });

  const supabase = createClient();
  const router = useRouter();

  const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      setUser(user);

      const { data: profile } = await supabase.from('user_profiles').select('*').eq('user_id', user.id).single();
      
      if (profile) {
        setFormData({
            full_name: profile.full_name || '',
            province: profile.province || '',
            bio: profile.bio || '',
            website: profile.website || '',
            top_artists: profile.top_artists || '',
            header_url: profile.header_url || '',
            avatar_url: profile.avatar_url || '',
            // Mapping van de nieuwe velden
            age_group: profile.age_group || '',
            gender: profile.gender || '',
            education_level: profile.education_level || '',
            work_field: profile.work_field || '',
            museum_visits_per_year: profile.museum_visits_per_year || 0,
            preferred_period: profile.preferred_period || '',
            museum_visit_frequency: profile.museum_visit_frequency || ''
        });
        
        const { level: userLevel } = getLevel(profile.xp || 0);
        setLevel(userLevel);
      }
      setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
        const { error } = await supabase
            .from('user_profiles')
            .update(formData)
            .eq('user_id', user.id);

        if (error) throw error;

        await checkProfileBadges(supabase, user.id, 'settings');

        alert('Profiel succesvol bijgewerkt!');
        router.push('/profile');
        router.refresh();
    } catch (error: any) {
        alert('Fout bij opslaan: ' + error.message);
    } finally {
        setSaving(false);
    }
  };

  const handleAvatarClose = () => {
      setShowAvatarSelector(false);
      fetchData(); 
      if(user) checkProfileBadges(supabase, user.id, 'avatar');
  };

  if (loading) return <div className="min-h-screen bg-midnight-950 flex items-center justify-center text-white">Instellingen laden...</div>;

  return (
    <div className="min-h-screen bg-midnight-950 text-white pt-24 pb-12 px-6">
      
      {showAvatarSelector && (
          <AvatarSelector 
              currentAvatarUrl={formData.avatar_url}
              userLevel={level}
              onClose={handleAvatarClose}
          />
      )}

      <div className="max-w-2xl mx-auto">
        
        <Link href="/profile" className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
            <ArrowLeft size={20}/> Terug naar profiel
        </Link>

        <h1 className="text-3xl font-serif font-bold mb-2">Profiel Instellingen</h1>
        <p className="text-gray-400 mb-8">Beheer je gegevens en voorkeuren.</p>

        <div className="bg-midnight-900 border border-white/10 p-8 rounded-2xl shadow-xl">
            
            {/* --- SECTIE 1: AVATAR --- */}
            <div className="flex flex-col items-center mb-8 pb-8 border-b border-white/10">
                <div 
                    onClick={() => setShowAvatarSelector(true)}
                    className="relative group cursor-pointer w-24 h-24 rounded-full border-4 border-museum-gold overflow-hidden bg-black shadow-lg shadow-museum-gold/20 transition-transform hover:scale-105"
                >
                    {formData.avatar_url ? (
                        <img src={formData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-white/10 text-museum-gold">
                            <User size={40} />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="text-white" size={24}/>
                    </div>
                </div>
                <button 
                    onClick={() => setShowAvatarSelector(true)}
                    className="mt-3 text-xs font-bold uppercase tracking-widest text-museum-gold hover:text-white transition-colors"
                >
                    Wijzig Avatar
                </button>
            </div>

            {/* --- SECTIE 2: PERSOONLIJKE GEGEVENS --- */}
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <User size={18} className="text-museum-gold"/> Persoonlijk
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                    <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Volledige Naam</label>
                    <input 
                        type="text" 
                        value={formData.full_name}
                        onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-museum-gold focus:outline-none"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Provincie</label>
                    <select 
                        value={formData.province}
                        onChange={(e) => setFormData({...formData, province: e.target.value})}
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-museum-gold focus:outline-none appearance-none"
                    >
                        <option value="">Maak een keuze...</option>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 border-b border-white/10 pb-8">
                <div>
                     <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Leeftijdsgroep</label>
                     <select 
                        value={formData.age_group}
                        onChange={(e) => setFormData({...formData, age_group: e.target.value})}
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-museum-gold focus:outline-none"
                     >
                        <option value="">Selecteer...</option>
                        <option value="18-24">18-24</option>
                        <option value="25-39">25-39</option>
                        <option value="40-54">40-54</option>
                        <option value="55-64">55-64</option>
                        <option value="65+">65+</option>
                     </select>
                </div>
                <div>
                     <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Opleidingsniveau</label>
                     <select 
                        value={formData.education_level}
                        onChange={(e) => setFormData({...formData, education_level: e.target.value})}
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-museum-gold focus:outline-none"
                     >
                        <option value="">Selecteer...</option>
                        <option value="VMBO">VMBO</option>
                        <option value="HAVO/VWO">HAVO/VWO</option>
                        <option value="MBO">MBO</option>
                        <option value="HBO">HBO</option>
                        <option value="WO">WO</option>
                     </select>
                </div>
                <div>
                     <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Werkveld</label>
                     <select 
                        value={formData.work_field}
                        onChange={(e) => setFormData({...formData, work_field: e.target.value})}
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-museum-gold focus:outline-none"
                     >
                        <option value="">Selecteer...</option>
                        <option value="Onderwijs">Onderwijs</option>
                        <option value="Zorg">Zorg</option>
                        <option value="Techniek">Techniek</option>
                        <option value="Zakelijk">Zakelijk</option>
                        <option value="Creatief">Creatief</option>
                        <option value="Overheid">Overheid</option>
                        <option value="Anders">Anders</option>
                     </select>
                </div>
                <div>
                     <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Gender</label>
                     <select 
                        value={formData.gender}
                        onChange={(e) => setFormData({...formData, gender: e.target.value})}
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-museum-gold focus:outline-none"
                     >
                        <option value="">Selecteer...</option>
                        <option value="M">Man</option>
                        <option value="V">Vrouw</option>
                        <option value="X">Anders/Zeg ik liever niet</option>
                     </select>
                </div>
            </div>

            {/* --- SECTIE 3: MUSEUM PROFIEL --- */}
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Info size={18} className="text-museum-gold"/> Museum Voorkeuren
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 border-b border-white/10 pb-8">
                <div>
                    <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Bezoeken per jaar</label>
                    <input 
                        type="number" 
                        value={formData.museum_visits_per_year}
                        onChange={(e) => setFormData({...formData, museum_visits_per_year: parseInt(e.target.value)})}
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-museum-gold focus:outline-none"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Bezoekfrequentie</label>
                    <select 
                        value={formData.museum_visit_frequency}
                        onChange={(e) => setFormData({...formData, museum_visit_frequency: e.target.value})}
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-museum-gold focus:outline-none"
                     >
                        <option value="">Selecteer...</option>
                        <option value="Wekelijks">Wekelijks</option>
                        <option value="Maandelijks">Maandelijks</option>
                        <option value="Per Kwartaal">Per Kwartaal</option>
                        <option value="Jaarlijks">Jaarlijks</option>
                     </select>
                </div>
                <div className="md:col-span-2">
                     <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Favoriete Periode</label>
                     <select 
                        value={formData.preferred_period}
                        onChange={(e) => setFormData({...formData, preferred_period: e.target.value})}
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-museum-gold focus:outline-none"
                     >
                        <option value="">Maak een keuze...</option>
                        <option value="Oudheid">Oudheid (Grieken/Romeinen)</option>
                        <option value="Middeleeuwen">Middeleeuwen</option>
                        <option value="Renaissance">Renaissance</option>
                        <option value="Gouden Eeuw">Gouden Eeuw</option>
                        <option value="Impressionisme">Impressionisme (19e eeuw)</option>
                        <option value="Modern">Modern (20e eeuw)</option>
                        <option value="Hedendaags">Hedendaags (Nu)</option>
                     </select>
                </div>
            </div>

            {/* --- SECTIE 4: UNLOCKABLES --- */}
            
            <LockedInput level={level} requiredLevel={5} label="Biografie">
                <textarea 
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-museum-gold focus:outline-none min-h-[100px]"
                    placeholder="Vertel iets over jezelf..."
                />
            </LockedInput>

            <LockedInput level={level} requiredLevel={10} label="Website / Social">
                <input type="text" value={formData.website} onChange={(e) => setFormData({...formData, website: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-museum-gold focus:outline-none" />
            </LockedInput>

            <LockedInput level={level} requiredLevel={14} label="Top 3 Kunstenaars">
                <input type="text" value={formData.top_artists} onChange={(e) => setFormData({...formData, top_artists: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-museum-gold focus:outline-none" />
            </LockedInput>

            <LockedInput level={level} requiredLevel={25} label="Header Afbeelding (URL)">
                <input type="text" value={formData.header_url} onChange={(e) => setFormData({...formData, header_url: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-museum-gold focus:outline-none" />
            </LockedInput>

            <button 
                onClick={handleSave} 
                disabled={saving}
                className="w-full bg-museum-gold text-black font-bold py-4 rounded-xl mt-6 hover:bg-white transition-colors flex justify-center items-center gap-2"
            >
                {saving ? <Loader2 className="animate-spin"/> : <><Save size={18}/> Profiel Opslaan</>}
            </button>

        </div>
      </div>
    </div>
  );
}
