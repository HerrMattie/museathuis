'use client'; // Client component nodig voor alert/interactie

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabaseClient';
import Link from 'next/link';
import { Brush, ArrowRight, Layers, Tv, Cast } from 'lucide-react';
import LikeButton from '@/components/LikeButton';

export default function SalonPage() {
  const [items, setItems] = useState<any[]>([]);
  const [header, setHeader] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
      const fetchData = async () => {
          const { data: pageContent } = await supabase.from('page_content').select('*').eq('slug', 'salon').single();
          const { data: salonItems } = await supabase.from('salons').select('*').eq('status', 'published').order('created_at', { ascending: false });
          
          setHeader(pageContent);
          setItems(salonItems || []);
      };
      fetchData();
  }, []);

  const title = header?.title || "De Salon";
  const subtitle = header?.subtitle || "Curated Collections";
  const intro = header?.intro_text || "Thematische verzamelingen samengesteld door onze curatoren.";

  const handleCast = () => {
      alert("TV MODUS: Om deze collecties op uw TV te bekijken, gebruikt u de 'Cast' of 'Airplay' functie in uw browser menu.");
  };

  return (
    <div className="min-h-screen bg-midnight-950 text-white pt-20 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="relative py-16 mb-12 border-b border-white/10">
             <div className="absolute inset-0 bg-gradient-to-r from-orange-900/20 to-transparent pointer-events-none rounded-3xl"></div>
             <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-6">
                <div>
                    <p className="text-museum-gold text-sm font-bold uppercase tracking-[0.2em] mb-3">{subtitle}</p>
                    <h1 className="text-5xl md:text-7xl font-serif font-black mb-6 text-white">{title}</h1>
                    <p className="text-xl text-gray-300 max-w-2xl leading-relaxed font-light">{intro}</p>
                </div>
                
                {/* TV KNOP */}
                <button onClick={handleCast} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/10 px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                    <Cast size={16} /> Bekijk op TV
                </button>
             </div>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {items?.map((salon) => (
                <Link key={salon.id} href={`/salon/${salon.id}`} className="group bg-midnight-900 border border-white/10 rounded-2xl overflow-hidden hover:border-museum-gold/40 transition-all hover:-translate-y-2 hover:shadow-2xl">
                    <div className="h-72 relative bg-black overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10"></div>
                        <div className="w-full h-full flex items-center justify-center opacity-40 group-hover:opacity-60 transition-opacity">
                            <Brush size={80} className="text-orange-200"/>
                        </div>
                        <div className="absolute top-4 left-4 bg-orange-900/80 backdrop-blur-md px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest text-white border border-white/10 flex items-center gap-2">
                            <Layers size={12}/> Collectie
                        </div>
                    </div>
                    <div className="p-8">
                        <h3 className="font-serif font-bold text-3xl mb-3 text-white group-hover:text-museum-gold transition-colors">{salon.title}</h3>
                        <p className="text-gray-400 text-sm line-clamp-3 mb-6 leading-relaxed font-light">{salon.short_description}</p>
                        <span className="text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2 group-hover:gap-3 transition-all">
                            Bekijk Collectie <ArrowRight size={14} className="text-museum-gold"/>
                        </span>
                    </div>
                </Link>
            ))}
        </div>
      </div>
    </div>
  );
}
