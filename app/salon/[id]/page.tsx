'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabaseClient';
import Link from 'next/link';
import { ArrowLeft, Tv, X, ChevronRight, ChevronLeft, Maximize2 } from 'lucide-react';
import LikeButton from '@/components/LikeButton';

export default function SalonDetailPage({ params }: { params: { id: string } }) {
  const [salon, setSalon] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]); // De kunstwerken in deze salon
  const [loading, setLoading] = useState(true);
  
  // TV MODE STATE
  const [tvMode, setTvMode] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
        // 1. Haal Salon Info op
        const { data: salonData } = await supabase.from('salons').select('*').eq('id', params.id).single();
        setSalon(salonData);

        // 2. Haal de gekoppelde Items op
        // We nemen aan dat er een koppeltabel 'salon_items' is, of dat items een 'salon_id' hebben.
        // Voor nu simuleren we even dat we artworks ophalen die bij deze salon horen.
        // IN PRODUCTIE: Pas deze query aan naar jouw koppel-structuur!
        // Bijv: const { data: art } = await supabase.from('salon_items').select('artworks(*)').eq('salon_id', params.id);
        
        // MOCKUP FETCH (Vervang dit door jouw echte relatie):
        const { data: art } = await supabase.from('artworks').select('*').limit(10); 
        setItems(art || []);
        
        setLoading(false);
    };
    fetchData();
  }, [params.id]);

  // Keyboard navigatie voor TV Modus
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
      if (!tvMode) return;
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === 'Escape') setTvMode(false);
  }, [tvMode, currentIndex]);

  useEffect(() => {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % items.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);

  if (loading) return <div className="text-white p-10">Laden...</div>;
  if (!salon) return <div className="text-white p-10">Salon niet gevonden</div>;

  // --- DE TV MODUS (FULLSCREEN OVERLAY) ---
  if (tvMode) {
      const currentItem = items[currentIndex];
      return (
          <div className="fixed inset-0 z-[100] bg-black text-white flex flex-col items-center justify-center">
              
              {/* Controls Overlay (Verdwijnt als je muis stilhoudt in een echte app, hier simpel) */}
              <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent z-50">
                  <div>
                      <h2 className="text-xl font-serif font-bold text-museum-gold">{salon.title}</h2>
                      <p className="text-sm text-gray-400">Gebruik 'Cast' in uw browser om dit op TV te tonen.</p>
                  </div>
                  <button onClick={() => setTvMode(false)} className="bg-white/10 hover:bg-white/20 p-3 rounded-full transition-colors">
                      <X size={24} />
                  </button>
              </div>

              {/* HET KUNSTWERK (Maximaal groot) */}
              <div className="relative w-full h-full flex items-center justify-center p-4 md:p-12">
                  {/* Pijl Links */}
                  <button onClick={prevSlide} className="absolute left-4 md:left-8 bg-black/30 hover:bg-black/60 p-4 rounded-full text-white transition-colors z-40 hidden md:block">
                      <ChevronLeft size={32}/>
                  </button>

                  <img 
                      src={currentItem?.image_url} 
                      alt={currentItem?.title} 
                      className="max-h-full max-w-full object-contain drop-shadow-2xl"
                  />

                  {/* Pijl Rechts */}
                  <button onClick={nextSlide} className="absolute right-4 md:right-8 bg-black/30 hover:bg-black/60 p-4 rounded-full text-white transition-colors z-40 hidden md:block">
                      <ChevronRight size={32}/>
                  </button>
              </div>

              {/* CAPTION (Onderaan) */}
              <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/90 via-black/60 to-transparent p-8 pb-12 text-center">
                  <h3 className="text-3xl md:text-4xl font-serif font-bold mb-2">{currentItem?.title}</h3>
                  <p className="text-xl text-museum-gold">{currentItem?.artist} {currentItem?.year_created ? `(${currentItem?.year_created})` : ''}</p>
                  <p className="text-sm text-gray-400 mt-2">{currentIndex + 1} / {items.length}</p>
              </div>
          </div>
      );
  }

  // --- DE STANDAARD PAGINA ---
  return (
    <div className="min-h-screen bg-midnight-950 text-white pb-20">
      
      {/* HEADER IMAGE */}
      <div className="relative h-[60vh] w-full">
          <div className="absolute inset-0 bg-gradient-to-t from-midnight-950 via-midnight-950/20 to-black/40 z-10"></div>
          {/* Gebruik eerste item als cover als salon geen eigen cover heeft */}
          <div className="absolute inset-0 bg-cover bg-center opacity-60" style={{ backgroundImage: `url(${items[0]?.image_url})` }}></div>
          
          <div className="absolute bottom-0 left-0 w-full z-20 p-6 md:p-12">
              <div className="max-w-5xl mx-auto">
                  <Link href="/salon" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-museum-gold mb-6 hover:underline">
                      <ArrowLeft size={16}/> Alle Collecties
                  </Link>
                  
                  <div className="flex flex-col md:flex-row justify-between items-end gap-8">
                      <div>
                          <h1 className="text-5xl md:text-7xl font-serif font-black mb-4 leading-tight">{salon.title}</h1>
                          <p className="text-xl text-gray-300 max-w-2xl leading-relaxed">{salon.short_description}</p>
                      </div>
                      
                      <div className="flex gap-4">
                          <button 
                              onClick={() => setTvMode(true)}
                              className="bg-museum-gold text-black px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-white transition-all shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:scale-105"
                          >
                              <Tv size={20}/> Start TV Modus
                          </button>
                          <div className="bg-white/10 p-3 rounded-xl border border-white/10">
                              <LikeButton itemId={salon.id} itemType="salon" userId={null} /> {/* User ID doorgeven in echte app */}
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </div>

      {/* CONTENT (Introductie Tekst) */}
      <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="prose prose-invert prose-lg prose-p:text-gray-300 prose-headings:font-serif prose-headings:text-museum-gold">
              {/* Hier zou je ReactMarkdown gebruiken als je markdown hebt */}
              <p>{salon.content_markdown || "Geen uitgebreide beschrijving beschikbaar."}</p>
          </div>
      </div>

      {/* ARTWORKS GRID */}
      <div className="max-w-7xl mx-auto px-6">
          <h3 className="text-2xl font-serif font-bold mb-8 border-b border-white/10 pb-4">In deze collectie ({items.length})</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {items.map((item, idx) => (
                  <div key={item.id} onClick={() => { setCurrentIndex(idx); setTvMode(true); }} className="group cursor-pointer">
                      <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-black border border-white/10 hover:border-museum-gold/50 transition-all">
                          <img 
                              src={item.image_url} 
                              alt={item.title} 
                              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" 
                          />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="bg-black/60 backdrop-blur-md p-3 rounded-full text-white border border-white/20">
                                  <Maximize2 size={24}/>
                              </div>
                          </div>
                      </div>
                      <div className="mt-4">
                          <h4 className="font-bold text-white group-hover:text-museum-gold transition-colors">{item.title}</h4>
                          <p className="text-sm text-gray-500">{item.artist}</p>
                      </div>
                  </div>
              ))}
          </div>
      </div>

    </div>
  );
}
