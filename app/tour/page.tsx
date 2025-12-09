import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import Link from 'next/link';
import Image from 'next/image';
import { Play, Lock, Headphones, Clock, Info, ChevronRight } from 'lucide-react';

export const revalidate = 3600;

export default async function TourOverviewPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // 1. Check Premium
  const { data: { user } } = await supabase.auth.getUser();
  let isUserPremium = false;
  if (user) {
    const { data: profile } = await supabase.from('user_profiles').select('is_premium').eq('user_id', user.id).single();
    if (profile?.is_premium) isUserPremium = true;
  }

  // 2. Haal Tours op (Alles wat gepubliceerd is)
  const { data: tours } = await supabase
    .from('tours')
    .select('*')
    .eq('status', 'published')
    .order('is_premium', { ascending: true }) // Gratis eerst
    .limit(10);

  return (
    <main className="min-h-screen bg-midnight-950 pb-20 pt-10 animate-fade-in-up">
      
      {/* INTRO SECTIE */}
      <section className="container mx-auto px-6 mb-16">
        <div className="max-w-4xl">
          <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm text-museum-text-secondary hover:text-white transition-colors">
             <ChevronRight className="rotate-180" size={16} /> Terug naar Dashboard
          </Link>
          <p className="text-museum-gold text-xs font-bold uppercase tracking-[0.2em] mb-4">
            Curatie & Verdieping
          </p>
          <h1 className="font-serif text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Ontdek de collectie.
          </h1>
          <p className="text-xl text-museum-text-secondary leading-relaxed mb-8 max-w-2xl">
            Kies uit onze dagelijkse selectie of duik in het archief. Elke tour is een audio-visuele reis van circa 15 minuten.
          </p>
          
          {/* USP Badges */}
          <div className="flex flex-wrap gap-4 text-sm text-white font-medium">
            <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
              <Headphones size={16} className="text-museum-lime" /> Audio Gids
            </div>
            <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
              <Clock size={16} className="text-museum-lime" /> ~15 Minuten
            </div>
            <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
              <Info size={16} className="text-museum-lime" /> Thematisch
            </div>
          </div>
        </div>
      </section>

      {/* TOUR GRID */}
      <section className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tours && tours.map((tour) => {
            const is
