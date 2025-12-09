'use client';
import { createClient } from '@/lib/supabaseClient';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Loader2 } from 'lucide-react';

export default function CreateTour() {
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [theme, setTheme] = useState('');
  
  // Form states zodat we ze kunnen vullen met AI
  const [formData, setFormData] = useState({
    title: '',
    intro: '',
    hero_image_url: '',
    items: [] as any[] // Om de selectie van Gemini op te slaan
  });

  const router = useRouter();
  const supabase = createClient();

  // De functie die Gemini aanroept
  async function generateWithGemini() {
    if (!theme) return alert('Vul eerst een thema in!');
    setAiLoading(true);

    try {
      const res = await fetch('/api/ai/generate-tour', {
        method: 'POST',
        body: JSON.stringify({ theme }),
      });
      const data = await res.json();

      if (data.error) throw new Error(data.error);

      // Vul het formulier in met het antwoord van Gemini
      setFormData(prev => ({
        ...prev,
        title: data.plan.title,
        intro: data.plan.intro,
        items: data.plan.items // Bewaren we even in state
      }));

      alert(`Gemini heeft ${data.plan.items.length} werken gevonden voor "${data.plan.title}"!`);
    } catch (e: any) {
      alert('Fout: ' + e.message);
    }
    setAiLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    
    // 1. Maak de Tour
    const { data: tour, error } = await supabase.from('tours').insert({
      title: formData.title,
      intro: formData.intro,
      hero_image_url: formData.hero_image_url,
      is_premium: false, // Default
      status: 'published',
    }).select().single();

    if (error) {
      alert('Error: ' + error.message);
      setLoading(false);
      return;
    }

    // 2. Koppel de items die Gemini heeft gekozen (als die er zijn)
    if (formData.items && formData.items.length > 0) {
      const itemsToInsert = formData.items.map((item: any, index: number) => ({
        tour_id: tour.id,
        artwork_id: item.artwork_id,
        text_short: item.text_short,
        position: index + 1
      }));
      await supabase.from('tour_items').insert(itemsToInsert);
    }

    router.push('/crm/tours');
    setLoading(false);
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="font-serif text-3xl text-white font-bold mb-8">Nieuwe Tour (met Gemini 🧠)</h1>
      
      {/* AI SECTIE */}
      <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 p-6 rounded-xl border border-white/10 mb-8">
        <label className="block text-blue-200 text-sm font-bold mb-2 uppercase tracking-wide">Vraag het aan Gemini</label>
        <div className="flex gap-4">
          <input 
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            placeholder="Bijv: 'Vrouwen in de kunst' of 'Melancholie'"
            className="flex-1 bg-black/30 border border-white/10 p-3 rounded text-white placeholder:text-gray-500"
          />
          <button 
            onClick={generateWithGemini}
            disabled={aiLoading}
            className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded font-bold hover:scale-105 transition-transform disabled:opacity-50"
          >
            {aiLoading ? <Loader2 className="animate-spin" /> : <Sparkles fill="black" size={18} />}
            Genereer
          </button>
        </div>
      </div>

      {/* STANDAARD FORMULIER (Wordt ingevuld door AI) */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-gray-400 mb-2">Titel</label>
          <input 
            value={formData.title}
            onChange={e => setFormData({...formData, title: e.target.value})}
            required 
            className="w-full bg-midnight-900 border border-white/10 p-3 rounded text-white" 
          />
        </div>
        <div>
          <label className="block text-gray-400 mb-2">Introductie</label>
          <textarea 
            value={formData.intro}
            onChange={e => setFormData({...formData, intro: e.target.value})}
            required rows={3} 
            className="w-full bg-midnight-900 border border-white/10 p-3 rounded text-white" 
          />
        </div>
        <div>
          <label className="block text-gray-400 mb-2">Hero Afbeelding URL</label>
          <input 
            value={formData.hero_image_url}
            onChange={e => setFormData({...formData, hero_image_url: e.target.value})}
            required type="url" 
            placeholder="https://..."
            className="w-full bg-midnight-900 border border-white/10 p-3 rounded text-white" 
          />
        </div>

        {/* Preview van items */}
        {formData.items.length > 0 && (
          <div className="p-4 bg-white/5 rounded border border-white/5">
            <p className="text-sm text-green-400 mb-2">✓ {formData.items.length} kunstwerken geselecteerd door AI</p>
            <ul className="list-disc list-inside text-xs text-gray-400">
              {formData.items.map((it: any, i) => (
                <li key={i}>{it.text_short.substring(0, 50)}...</li>
              ))}
            </ul>
          </div>
        )}

        <button disabled={loading} className="w-full bg-museum-lime text-black font-bold py-3 rounded hover:bg-white transition-colors">
          {loading ? 'Opslaan...' : 'Tour Publiceren'}
        </button>
      </form>
    </div>
  );
}
