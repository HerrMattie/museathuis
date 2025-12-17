'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { Save, Loader2, MapPin, User, CreditCard } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SettingsForm({ user, initialData }: { user: any, initialData: any }) {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // State voor de velden uit jouw CSV
  const [formData, setFormData] = useState({
    full_name: initialData?.full_name || '',
    age_group: initialData?.age_group || '',
    province: initialData?.province || '',
    has_museum_card: initialData?.has_museum_card || false,
  });

  const handleSave = async () => {
    setLoading(true);
    setMessage('');

    const { error } = await supabase
      .from('user_profiles')
      .update({
        full_name: formData.full_name,
        age_group: formData.age_group,
        province: formData.province,
        has_museum_card: formData.has_museum_card,
        // Update ook de JSON kolom voor consistentie als 'has_museum_card' true is
        museum_cards: formData.has_museum_card ? JSON.stringify(["Museumkaart"]) : null,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    if (error) {
      setMessage('Fout bij opslaan: ' + error.message);
    } else {
      setMessage('Succesvol opgeslagen!');
      router.refresh(); // Ververs de data op de achtergrond
    }
    setLoading(false);
  };

  return (
    <div className="bg-midnight-900 border border-white/10 p-8 rounded-2xl max-w-2xl mx-auto shadow-2xl">
      <h2 className="text-2xl font-serif font-bold text-white mb-6">Profiel Bewerken</h2>

      <div className="space-y-6">
        
        {/* NAAM */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Volledige Naam</label>
          <div className="relative">
            <User className="absolute left-3 top-3 text-gray-500" size={18} />
            <input 
              type="text" 
              value={formData.full_name}
              onChange={(e) => setFormData({...formData, full_name: e.target.value})}
              className="w-full bg-black/40 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white focus:border-museum-gold outline-none transition-colors"
            />
          </div>
        </div>

        {/* LEEFTIJDSGROEP (Select) */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Leeftijdsgroep</label>
          <select 
            value={formData.age_group}
            onChange={(e) => setFormData({...formData, age_group: e.target.value})}
            className="w-full bg-black/40 border border-white/10 rounded-lg py-3 px-4 text-white focus:border-museum-gold outline-none appearance-none"
          >
            <option value="">Selecteer...</option>
            <option value="18-24">18-24</option>
            <option value="25-39">25-39</option>
            <option value="40-59">40-59</option>
            <option value="60+">60+</option>
          </select>
        </div>

        {/* PROVINCIE */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Provincie</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 text-gray-500" size={18} />
            <select 
                value={formData.province}
                onChange={(e) => setFormData({...formData, province: e.target.value})}
                className="w-full bg-black/40 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white focus:border-museum-gold outline-none appearance-none"
            >
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

        {/* MUSEUMKAART (Toggle) */}
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
                    onChange={(e) => setFormData({...formData, has_museum_card: e.target.checked})}
                    className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
        </div>

        {/* OPSLAAN KNOP */}
        <div className="pt-4 flex items-center justify-between">
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
