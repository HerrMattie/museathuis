'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { Save, Loader2 } from 'lucide-react';

export default function SettingsForm({ user, initialData }: { user: any, initialData: any }) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  // States
  const [fullName, setFullName] = useState(initialData?.full_name || '');
  
  // MUSEUMKAART LOGICA
  // We kijken naar de kolom 'museum_cards' OF naar de tags als fallback
  const [hasMuseumCard, setHasMuseumCard] = useState<boolean>(
     initialData?.museum_cards === true || initialData?.tags?.includes('Museumkaart') || false
  );
  
  // Interesses
  const [interestsStr, setInterestsStr] = useState<string>(
      Array.isArray(initialData?.interests) ? initialData.interests.join(', ') : ''
  );

  const handleSave = async () => {
    setLoading(true);
    try {
        // 1. Array Schoonmaken
        const cleanInterests = interestsStr.split(',').map(i => i.trim()).filter(i => i !== "");

        // 2. Tags Update (Legacy support)
        let updatedTags = Array.isArray(initialData?.tags) ? [...initialData.tags] : [];
        if (hasMuseumCard) {
            if (!updatedTags.includes('Museumkaart')) updatedTags.push('Museumkaart');
        } else {
            updatedTags = updatedTags.filter((t: string) => t !== 'Museumkaart');
        }

        // 3. DATABASE UPDATE
        // Belangrijk: we updaten nu de kolom 'museum_cards' die we in Stap 1 hebben aangemaakt
        const { error } = await supabase
            .from('user_profiles')
            .update({
                full_name: fullName,
                interests: cleanInterests,
                museum_cards: hasMuseumCard, // <--- DIT WERKT NU DOOR DE SQL FIX
                tags: updatedTags,
                updated_at: new Date().toISOString()
            })
            .eq('user_id', user.id);

        if (error) throw error;
        alert("Instellingen succesvol opgeslagen!");

    } catch (err: any) {
        console.error("Save error:", err);
        alert(`Fout bij opslaan: ${err.message}`);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="bg-midnight-900 border border-white/10 rounded-2xl p-8 space-y-8">
        
        {/* NAAM */}
        <div>
            <label className="block text-sm font-bold uppercase tracking-widest text-gray-400 mb-3">Naam</label>
            <input 
                type="text" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-museum-gold focus:outline-none"
            />
        </div>

        {/* MUSEUMKAART TOGGLE */}
        <div className="bg-white/5 rounded-xl p-4 flex items-center justify-between border border-white/5 cursor-pointer" onClick={() => setHasMuseumCard(!hasMuseumCard)}>
            <div>
                <h3 className="font-bold text-white">Museumkaart Houder</h3>
                <p className="text-sm text-gray-400">Ik ben in bezit van een geldige kaart</p>
            </div>
            <div className={`w-14 h-8 rounded-full p-1 transition-colors ${hasMuseumCard ? 'bg-museum-gold' : 'bg-gray-600'}`}>
                <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${hasMuseumCard ? 'translate-x-6' : 'translate-x-0'}`} />
            </div>
        </div>

        {/* INTERESSES */}
        <div>
            <label className="block text-sm font-bold uppercase tracking-widest text-gray-400 mb-3">Favoriete Periodes</label>
            <input 
                type="text" 
                value={interestsStr}
                onChange={(e) => setInterestsStr(e.target.value)}
                placeholder="Bijv: Impressionisme, Rembrandt"
                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-museum-gold focus:outline-none"
            />
        </div>

        {/* OPSLAAN KNOP */}
        <button onClick={handleSave} disabled={loading} className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
            {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
            Opslaan
        </button>

    </div>
  );
}
