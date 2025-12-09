'use client';
import { createClient } from '@/lib/supabaseClient';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateArtwork() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    const { error } = await supabase.from('artworks').insert({
      title: formData.get('title'),
      artist: formData.get('artist'),
      image_url: formData.get('image_url'),
      description_primary: formData.get('description'),
    });

    if (!error) router.push('/crm/artworks');
    setLoading(false);
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="font-serif text-3xl text-white font-bold mb-8">Nieuw Kunstwerk</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-gray-400 mb-2">Titel</label>
          <input name="title" required className="w-full bg-midnight-900 border border-white/10 p-3 rounded text-white" />
        </div>
        <div>
          <label className="block text-gray-400 mb-2">Kunstenaar</label>
          <input name="artist" required className="w-full bg-midnight-900 border border-white/10 p-3 rounded text-white" />
        </div>
        <div>
          <label className="block text-gray-400 mb-2">Afbeelding URL (Unsplash/Direct link)</label>
          <input name="image_url" required type="url" className="w-full bg-midnight-900 border border-white/10 p-3 rounded text-white" />
        </div>
        <div>
          <label className="block text-gray-400 mb-2">Beschrijving</label>
          <textarea name="description" rows={4} className="w-full bg-midnight-900 border border-white/10 p-3 rounded text-white" />
        </div>
        <button disabled={loading} className="w-full bg-museum-lime text-black font-bold py-3 rounded hover:bg-white transition-colors">
          {loading ? 'Opslaan...' : 'Toevoegen'}
        </button>
      </form>
    </div>
  );
}
