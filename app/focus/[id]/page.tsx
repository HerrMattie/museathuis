import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { ArrowLeft, Clock, Calendar } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import LikeButton from '@/components/LikeButton';
import AudioPlayer from '@/components/tour/AudioPlayer'; 

export const revalidate = 0;

export default async function FocusDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();

  const { data: item } = await supabase
    .from('focus_items')
    .select('*, artist_data:artworks!inner(artist)') // Even aannemen dat je artworks ophaalt
    .eq('id', params.id)
    .single();

  if (!item) return <div className="text-center p-20 text-white">Item niet gevonden.</div>;

  const audioText = item.audio_script_main || item.intro;
  
  const audioStops = [{
      title: item.title,
      description: audioText
  }];

  // Bepaal de SRC via API call (tekst naar spraak)
  const audioSourceUrl = `/api/audio/speak?text=${encodeURIComponent(audioText)}&voice=nl-NL-Wavenet-A`;


  return (
    <div className="min-h-screen bg-midnight-950 text-white pb-32">
      
      {/* HEADER - Blijft hetzelfde ... */}
      <div className="bg-museum-gold/10 border-b border-white/5 py-20 px-6 relative overflow-hidden">
          {/* ... */}
          <div className="max-w-4xl mx-auto relative z-10">
              {/* ... (Titel en meta info) ... */}
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

      {/* AUDIO SPELER FIX */}
      {audioText && (
          <AudioPlayer 
              stops={audioStops} 
              title={`Focus: ${item.title}`} 
              src={audioSourceUrl} // <--- Dit is de vereiste prop
          />
      )}

    </div>
  );
}
