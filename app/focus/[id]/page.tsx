import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, Clock, Headphones, BookOpen } from 'lucide-react';
import ReactMarkdown from 'react-markdown'; // Zorg dat je deze in package.json zet!
import AudioPlayer from '@/components/AudioPlayer'; // <--- Importeer deze

export const revalidate = 0;

export default async function FocusDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();

  // Haal focus item op + artwork info
  const { data: item } = await supabase
    .from('focus_items')
    .select('*, artwork:artworks(*)')
    .eq('id', params.id)
    .single();

  if (!item) return <div className="text-white p-10">Item niet gevonden.</div>;

  // Check Premium
  let isLocked = false;
  if (item.is_premium) {
      const { data: profile } = await supabase.from('user_profiles').select('is_premium').eq('user_id', user?.id).single();
      if (!profile?.is_premium) isLocked = true;
  }

  return (
    <div className="min-h-screen bg-midnight-950 text-gray-200 font-sans pb-20">
        
        {/* HERO IMAGE */}
        <div className="relative w-full h-[60vh] lg:h-[70vh]">
           {item.artwork?.image_url && (
             <Image 
               src={item.artwork.image_url} 
               alt={item.title} 
               fill 
               className="object-contain bg-black/50"
               priority
             />
           )}
           <div className="absolute inset-0 bg-gradient-to-t from-midnight-950 via-transparent to-transparent" />
           
           <div className="absolute top-6 left-6">
             <Link href="/focus" className="inline-flex items-center gap-2 text-white/80 hover:text-white bg-black/40 backdrop-blur-md px-4 py-2 rounded-full transition-colors text-sm font-medium border border-white/10">
               <ChevronLeft size={16} /> Terug
             </Link>
           </div>

           <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 max-w-4xl">
             <div className="flex gap-3 mb-4">
                <span className="inline-flex items-center gap-2 bg-museum-gold/20 text-museum-gold border border-museum-gold/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                    <Clock size={14} /> 10 Min Lezen
                </span>
                {item.audio_script_main && (
                    <span className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 border border-blue-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                        <Headphones size={14} /> Audio Beschikbaar
                    </span>
                )}
             </div>
             <h1 className="font-serif text-4xl md:text-6xl text-white font-bold mb-4 leading-tight drop-shadow-2xl">
               {item.title}
             </h1>
             <p className="text-xl text-gray-200 max-w-2xl leading-relaxed drop-shadow-lg">
               {item.short_description || item.intro}
             </p>
           </div>
        </div>

        {/* CONTENT */}
        <div className="container mx-auto px-6 md:px-12 mt-12">
          {isLocked ? (
              <div className="bg-midnight-900 border border-museum-gold/30 p-10 rounded-2xl text-center max-w-2xl mx-auto">
                  <h3 className="font-serif text-2xl text-museum-gold mb-4">Exclusief voor Leden</h3>
                  <p className="text-gray-400 mb-6">Word lid om toegang te krijgen tot deze Deep Dive en de volledige collectie.</p>
                  <Link href="/pricing" className="bg-museum-gold text-black px-8 py-3 rounded-full font-bold">Bekijk Lidmaatschap</Link>
              </div>
          ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                  
                  {/* MAIN ARTICLE (Markdown Rendered) */}
                  <div className="lg:col-span-8 prose prose-invert prose-lg max-w-none">
                      {item.content_markdown ? (
                          <ReactMarkdown 
                            components={{
                                h1: ({node, ...props}) => <h1 className="font-serif text-3xl text-museum-gold mt-8 mb-4" {...props} />,
                                h2: ({node, ...props}) => <h2 className="font-serif text-2xl text-white mt-10 mb-4 border-b border-white/10 pb-2" {...props} />,
                                p: ({node, ...props}) => <p className="text-gray-300 leading-relaxed mb-6" {...props} />,
                                strong: ({node, ...props}) => <strong className="text-white font-bold" {...props} />,
                                ul: ({node, ...props}) => <ul className="list-disc pl-5 space-y-2 mb-6 text-gray-300" {...props} />,
                            }}
                          >
                              {item.content_markdown}
                          </ReactMarkdown>
                      ) : (
                          <div className="text-gray-500 italic">
                              Nog geen uitgebreid artikel beschikbaar. (Heeft de AI dit al gegenereerd?)
                          </div>
                      )}
                  </div>

                  {/* SIDEBAR (Facts & Audio) */}
                  <div className="lg:col-span-4 space-y-8">
                      {item.audio_script_main && (
                          <div className="bg-white/5 border border-white/10 p-6 rounded-xl">
                              <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Headphones size={20}/> Luistergids</h3>
                              <p className="text-sm text-gray-400 mb-4">Laat u meenemen door het verhaal terwijl u kijkt.</p>
                              
                              {/* HIER IS DE NIEUWE SPELER */}
                              <AudioPlayer text={item.audio_script_main} />
                              
                          </div>
                      )}

                      <div className="bg-midnight-900 border border-white/10 p-6 rounded-xl">
                          <h3 className="font-bold text-white mb-4 flex items-center gap-2"><BookOpen size={20}/> Details</h3>
                          <ul className="space-y-3 text-sm text-gray-400">
                              <li><span className="block text-xs text-gray-500 uppercase">Kunstenaar</span> {item.artwork?.artist || 'Onbekend'}</li>
                              <li><span className="block text-xs text-gray-500 uppercase">Techniek</span> {item.artwork?.description_technical || '-'}</li>
                              <li><span className="block text-xs text-gray-500 uppercase">Periode</span> {item.artwork?.description_historical || '-'}</li>
                          </ul>
                      </div>
                  </div>
              </div>
          )}
        </div>
    </div>
  );
}
