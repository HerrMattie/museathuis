'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, User, Camera } from 'lucide-react';
import Link from 'next/link';
import LockedInput from '@/components/profile/LockedInput';
import { getLevel } from '@/lib/levelSystem';
import { checkProfileBadges } from '@/lib/gamification/checkBadges';
// Importeer jouw bestaande selector
import AvatarSelector from '@/components/profile/AvatarSelector';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [level, setLevel] = useState(1);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false); // State voor de popup

  const [formData, setFormData] = useState({
    full_name: '',
    province: '',
    bio: '',         
    website: '',     
    top_artists: '', 
    header_url: '',
    avatar_url: '' 
  });

  const supabase = createClient();
  const router = useRouter();

  // Functie om data op te halen (kan hergebruikt worden na avatar wissel)
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
            avatar_url: profile.avatar_url || ''
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

  // Callback wanneer de selector sluit
  const handleAvatarClose = () => {
      setShowAvatarSelector(false);
      fetchData(); // Ververs de data zodat het nieuwe plaatje zichtbaar is
      // Check voor badge omdat avatar gewijzigd is
      if(user) checkProfileBadges(supabase, user.id, 'avatar');
  };

  if (loading) return <div className="min-h-screen bg-midnight-950 flex items-center justify-center text-white">Instellingen laden...</div>;

  return (
    <div className="min-h-screen bg-midnight-950 text-white pt-24 pb-12 px-6">
      
      {/* POPUP: AVATAR SELECTOR */}
      {showAvatarSelector && (
          <AvatarSelector 
              currentAvatarUrl={formData.avatar_url}
              userLevel={level}
              onClose={handleAvatarClose}
          />
      )}

      <div className="max-w-xl mx-auto">
        
        <Link href="/profile" className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
            <ArrowLeft size={20}/> Terug naar profiel
        </Link>

        <h1 className="text-3xl font-serif font-bold mb-2">Instellingen</h1>
        <p className="text-gray-400 mb-8">Pas je profiel en avatar aan.</p>

        <div className="bg-midnight-900 border border-white/10 p-8 rounded-2xl shadow-xl">
            
            {/* AVATAR WIJZIGEN KNOP */}
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
                    
                    {/* Overlay Icoontje */}
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

            {/* BASIS VELDEN */}
            <div className="mb-6">
                <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Naam</label>
                <input 
                    type="text" 
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-museum-gold focus:outline-none"
                    placeholder="Jouw naam"
                />
            </div>

            <div className="mb-6">
                <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Provincie</label>
                <select 
                    value={formData.province}
                    onChange={(e) => setFormData({...formData, province: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-museum-gold focus:outline-none"
                >
                    <option value="">Kies provincie...</option>
                    <option value="Noord-Holland">Noord-Holland</option>
                    <option value="Zuid-Holland">Zuid-Holland</option>
                    <option value="Utrecht">Utrecht</option>
                    <option value="Gelderland">Gelderland</option>
                    <option value="Overijssel">Overijssel</option>
                    <option value="Drenthe">Drenthe</option>
                    <option value="Groningen">Groningen</option>
                    <option value="Friesland">Friesland</option>
                    <option value="Limburg">Limburg</option>
                    <option value="Noord-Brabant">Noord-Brabant</option>
                    <option value="Zeeland">Zeeland</option>
                    <option value="Flevoland">Flevoland</option>
                </select>
            </div>

            <hr className="border-white/10 my-8"/>

            {/* UNLOCKED VELDEN */}
            
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
