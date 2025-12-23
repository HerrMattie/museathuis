'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, User } from 'lucide-react';
import Link from 'next/link';
import LockedInput from '@/components/profile/LockedInput'; // Zorg dat dit pad klopt
import { getLevel } from '@/lib/levelSystem';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [level, setLevel] = useState(1);
  
  // Formulier velden
  const [formData, setFormData] = useState({
    full_name: '',
    province: '',
    bio: '',        // Unlock op Lvl 5
    website: '',    // Unlock op Lvl 10
    top_artists: '' // Unlock op Lvl 15
  });

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const getData = async () => {
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
            top_artists: profile.top_artists || ''
        });
        
        // Bereken level voor de locks
        const { level: userLevel } = getLevel(profile.xp || 0);
        setLevel(userLevel);
      }
      setLoading(false);
    };
    getData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
        const { error } = await supabase
            .from('user_profiles')
            .update(formData)
            .eq('user_id', user.id);

        if (error) throw error;
        alert('Profiel bijgewerkt!');
        router.push('/profile');
        router.refresh();
    } catch (error: any) {
        alert('Fout bij opslaan: ' + error.message);
    } finally {
        setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-midnight-950 flex items-center justify-center text-white">Laden...</div>;

  return (
    <div className="min-h-screen bg-midnight-950 text-white pt-24 pb-12 px-6">
      <div className="max-w-xl mx-auto">
        
        <Link href="/profile" className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
            <ArrowLeft size={20}/> Terug naar profiel
        </Link>

        <h1 className="text-3xl font-serif font-bold mb-2">Instellingen</h1>
        <p className="text-gray-400 mb-8">Beheer je zichtbaarheid en gegevens.</p>

        <div className="bg-midnight-900 border border-white/10 p-8 rounded-2xl shadow-xl">
            
            {/* BASIS (ALTIJD BESCHIKBAAR) */}
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
                    <option value="Flevoland">Flevoland</option>
                    <option value="Gelderland">Gelderland</option>
                    <option value="Overijssel">Overijssel</option>
                    <option value="Drenthe">Drenthe</option>
                    <option value="Groningen">Groningen</option>
                    <option value="Friesland">Friesland</option>
                    <option value="Noord-Brabant">Noord-Brabant</option>
                    <option value="Limburg">Limburg</option>
                    <option value="Zeeland">Zeeland</option>
                </select>
            </div>

            <hr className="border-white/10 my-8"/>

            {/* UNLOCKABLES (IDENTITY HACK) */}
            
            <LockedInput level={level} requiredLevel={5} label="Biografie">
                <textarea 
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-museum-gold focus:outline-none min-h-[100px]"
                    placeholder="Vertel iets over jezelf..."
                />
            </LockedInput>

            <LockedInput level={level} requiredLevel={10} label="Website / Social">
                <input 
                    type="text" 
                    value={formData.website}
                    onChange={(e) => setFormData({...formData, website: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-museum-gold focus:outline-none"
                    placeholder="https://..."
                />
            </LockedInput>

            <LockedInput level={level} requiredLevel={15} label="Top 3 Kunstenaars">
                <input 
                    type="text" 
                    value={formData.top_artists}
                    onChange={(e) => setFormData({...formData, top_artists: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-museum-gold focus:outline-none"
                    placeholder="Bijv. Rembrandt, Van Gogh, Mondriaan"
                />
            </LockedInput>

            <button 
                onClick={handleSave} 
                disabled={saving}
                className="w-full bg-museum-gold text-black font-bold py-4 rounded-xl mt-4 hover:bg-white transition-colors flex justify-center items-center gap-2"
            >
                {saving ? <Loader2 className="animate-spin"/> : <><Save size={18}/> Opslaan</>}
            </button>

        </div>
      </div>
    </div>
  );
}
