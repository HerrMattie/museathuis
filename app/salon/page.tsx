'use client';

import { createBrowserClient } from '@supabase/ssr';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Filter, Lock, Play, Eye, Brain } from 'lucide-react';
import { motion } from 'framer-motion';

// Inline client
function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

type ContentItem = {
  id: string;
  type: 'tour' | 'game' | 'focus';
  title: string;
  subtitle: string;
  image_url: string | null;
  is_premium: boolean;
  created_at: string;
};

export default function SalonPage() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'tour' | 'game' | 'focus'>('all');
  const [search, setSearch] = useState('');
  
  const supabase = createClient();

  useEffect(() => {
    async function loadContent() {
      // We halen alles op en normaliseren het naar één lijst
      // 1. Tours
      const { data: tours } = await supabase.from('tours').select('id, title, intro, hero_image_url, is_premium, created_at').eq('status', 'published');
      // 2. Games
      const { data: games } = await supabase.from('games').select('id, title, short_description, is_premium, created_at').eq('status', 'published');
      // 3. Focus
      const { data: focus } = await supabase.from('focus_items').select('id, title, intro, is_premium, created_at, artwork:artworks(image_url)').eq('status', 'published');

      const combined: ContentItem[] = [];

      tours?.forEach(t => combined.push({
        id: t.id, type: 'tour', title: t.title, subtitle: t.intro || '', image_url: t.hero_image_url, is_premium: t.is_premium, created_at: t.created_at
      }));
      games?.forEach(g => combined.push({
        id: g.id, type: 'game', title: g.title, subtitle: g.short_description || '', image_url: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1ef4d?q=80&w=800', is_premium: g.is_premium, created_at: g.created_at
      }));
      focus?.forEach(f => combined.push({
        id: f.id, type: 'focus', title: f.title, subtitle: f.intro || '', image_url: f.artwork?.image_url, is_premium: f.is_premium, created_at: f.created_at
      }));

      // Sorteer op datum (nieuwste eerst)
      combined.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setItems(combined);
      setFilteredItems(combined);
      setLoading(false);
    }
    loadContent();
  }, []);

  // Filter Logica
  useEffect(() => {
    let result = items;
    
    // Type Filter
    if (filter !== 'all') {
      result = result.filter(i => i.type === filter);
    }

    // Search Filter
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(i => 
        i.title.toLowerCase().includes(q) || 
        i.subtitle.toLowerCase().includes(q)
      );
    }

    setFilteredItems(result);
  }, [filter, search, items]);

  return (
    <main className="min-h-screen bg-midnight-950 pb-20 pt-12 animate-fade-in-up">
      <div className="container mx-auto px-6">
        
        {/* HEADER */}
        <header className="mb-12 flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/10 pb-8">
          <div>
            <h1 className="font-serif text-5xl md:text-6xl text-white font-bold mb-4">De Salon</h1>
            <p className="text-xl text-museum-text-secondary max-w-xl">
              Het complete archief. Dwaal door onze collectie van tours, verdiepende artikelen en games.
            </p>
          </div>

          {/* CONTROLS */}
          <div className="flex flex-col gap-4 w-full md:w-auto">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Zoek op titel of onderwerp..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full md:w-80 bg-midnight-900 border border-white/10 rounded-full py-3 pl-10 pr-4 text-white focus:border-museum-gold focus:outline-none transition-colors"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
              {['all', 'tour', 'focus', 'game'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f as any)}
                  className={`px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider border transition-all whitespace-nowrap ${
                    filter === f 
                    ? 'bg-museum-gold text-black border-museum-gold' 
                    : 'bg-transparent text-gray-400 border-white/10 hover:border-white/30'
                  }`}
                >
                  {f === 'all' ? 'Alles' : f}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* CONTENT GRID */}
        {loading ? (
          <div className="text-center py-20 text-gray-500">De collectie wordt geladen...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-[minmax(300px,auto)]">
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity:
