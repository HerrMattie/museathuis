import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import { BookOpen, Star, ChevronRight } from 'lucide-react';

export default async function AcademiePage() {
  const supabase = createClient(cookies());
  const { data: tracks } = await supabase.from('learning_tracks').select('*');

  return (
    <main className="container mx-auto px-6 py-12 animate-fade-in-up">
      <header className="mb-12">
        <h1 className="font-serif text-5xl text-white font-bold mb-4">Academie</h1>
        <p className="text-gray-400 text-lg max-w-xl">
          Verdiep uw kennis met onze modulaire cursussen.
        </p>
      </header>

      <div className="grid gap-4">
        {tracks?.map((track) => (
          <div key={track.id} className="group flex items-center gap-6 p-6 rounded-2xl bg-midnight-900 border border-white/5 hover:border-white/20 hover:bg-midnight-800 transition-all cursor-pointer">
            <div className="h-16 w-16 rounded-full bg-museum-gold/10 flex items-center justify-center text-museum-gold group-hover:bg-museum-gold group-hover:text-black transition-colors">
              <BookOpen size={24} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                 <h3 className="font-bold text-white text-xl">{track.title}</h3>
                 {track.is_premium && <Star size={16} className="text-museum-gold fill-current" />}
              </div>
              <p className="text-gray-400">{track.description}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="px-3 py-1 rounded-full bg-white/5 text-xs font-bold uppercase tracking-wider text-gray-500">
                {track.level}
              </span>
              <ChevronRight className="text-gray-600 group-hover:text-white" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
