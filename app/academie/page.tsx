import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import { BookOpen, Star } from 'lucide-react';

export default async function AcademiePage() {
  const supabase = createClient(cookies());
  const { data: tracks } = await supabase.from('learning_tracks').select('*');

  return (
    <main className="min-h-screen bg-midnight-950 px-6 py-12">
      <div className="container mx-auto">
        <h1 className="font-serif text-5xl text-white font-bold mb-2">Academie</h1>
        <p className="text-gray-400 mb-12">Verdiep je kennis met onze modulaire cursussen.</p>

        <div className="grid gap-4">
          {tracks?.map((track) => (
            <div key={track.id} className="flex items-center gap-6 p-6 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
              <div className="h-16 w-16 rounded-full bg-museum-gold/20 flex items-center justify-center text-museum-gold">
                <BookOpen size={24} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                   <h3 className="font-bold text-white text-lg">{track.title}</h3>
                   {track.is_premium && <Star size={14} className="text-museum-gold fill-current" />}
                </div>
                <p className="text-gray-400 text-sm">{track.description}</p>
              </div>
              <div className="hidden md:block text-right">
                <span className="text-xs uppercase tracking-wider text-gray-500 font-bold">{track.level}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
