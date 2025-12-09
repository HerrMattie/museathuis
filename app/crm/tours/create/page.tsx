'use client';
import { createClient } from '@/lib/supabaseClient';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateTour() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    const { error } = await supabase.from('tours').insert({
      title: formData.get('title'),
      intro: formData.get('intro'),
      hero_image_url: formData.get('hero_image_url'),
      is_premium: formData.get('is_premium') === 'on',
      status: 'published', // Direct live voor nu
    });

    if (!error) router.push('/crm/tours');
    else alert('Fout: ' + error.message);
    
    setLoading(false);
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="font-serif text-3xl text-white font-bold mb-8">Nieuwe Tour</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-gray-400 mb-2">Titel van de Tour</label>
          <input name="title" required className="w-full bg-midnight-900 border border-white/10 p-3 rounded text-white" />
        </div>
        <div>
          <label className="block text-gray-400 mb-2">Korte Introductie</label>
          <textarea name="intro" required rows={3} className="w-full bg-midnight-900 border border-white/10 p-3 rounded text-white" />
        </div>
        <div>
          <label className="block text-gray-400 mb-2">Hero Afbeelding URL</label>
          <input name="hero_image_url" required type="url" className="w-full bg-midnight-900 border border-white/10 p-3 rounded text-white" />
        </div>
        <div className="flex items-center gap-3">
          <input type="checkbox" name="is_premium" id="prem" className="w-5 h-5 rounded accent-museum-gold" />
          <label htmlFor="prem" className="text-white">Dit is een Premium tour</label>
        </div>
        <button disabled={loading} className="w-full bg-museum-lime text-black font-bold py-3 rounded hover:bg-white transition-colors">
          {loading ? 'Aanmaken...' : 'Tour Publiceren'}
        </button>
      </form>
    </div>
  );
}
