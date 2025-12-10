import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { ArrowLeft, Clock, Calendar } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import LikeButton from '@/components/LikeButton';
import AudioPlayer from '@/components/tour/AudioPlayer'; // <--- Import

export const revalidate = 0;

export default async function FocusDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();

  const { data: item } = await supabase
    .from('focus_items')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!item) return <div className="text-center p-20 text-white">Item niet gevonden.</div>;

  // We maken een "nep" stop voor de audiospeler
  // We gebruiken bij voorkeur het audio_script, anders de intro
  const audioText = item.audio_script_main || item.intro;
  
  const audioStops = [{
      title: "Volledig Artikel",
      description: audioText
  }];

  return (
    <div className="min-h-screen bg-midnight-950 text-white pb-32">
      
      {/* HEADER */}
      <div className="bg-museum-gold/10 border-b border-white/5 py-20 px-6 relative overflow-hidden">
          {/* Achtergrond decoratie */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-museum-gold/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

          <div className="max-w-4xl mx-auto relative z-10">
              <Link href="/focus" className="text-museum-gold text-sm font-bold uppercase tracking-widest mb-6 flex items-center gap-2 hover:opacity-80">
                  <ArrowLeft size={16}/> Alle Artikelen
              </Link>
              
              <div className="flex justify-between items-start gap-6">
                  <h1 className="text-4xl md:text-6xl font-serif font-bold leading-tight mb-6">
                      {item.title}
                  </h1>
                  <div className="shrink-0 mt-2">
                      <LikeButton itemId={item.id} itemType="focus" userId={user?.id} />
                  </div>
              </div>
              
              <div className="flex items-center gap-6 text-sm text-gray-400 mb-8 border-t border-white/10 pt-6 inline-flex">
                  <span className="flex items-center gap-2"><Clock size={16}/> 10 min lezen</span>
                  <span className="flex items-center gap-2"><Calendar size={16}/> {new Date(item.created_at).toLocaleDateString('nl-NL')}</span>
              </div>

              <p className="text-xl text-gray-200 leading-relaxed max-w-2xl font-serif italic">
                  {item.intro}
              </p>
          </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-3xl mx-auto px-6 py-12">
          <article className="prose prose-invert prose-lg prose-p:text-gray-300 prose-headings:font-serif prose-headings:text-museum-gold prose-a:text-museum-gold prose-strong:text-white">
              <ReactMarkdown>{item.content_markdown}</ReactMarkdown>
          </article>
      </div>

      {/* AUDIO SPELER (Alleen als er tekst is) */}
      {audioText && (
          <AudioPlayer stops={audioStops} title={`Focus: ${item.title}`} />
      )}

    </div>
  );
}
