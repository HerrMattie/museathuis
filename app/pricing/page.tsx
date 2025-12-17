'use client';

import { createClient } from '@/lib/supabaseClient';
import { trackActivity } from '@/lib/tracking';
import { Check, ArrowLeft, Star } from 'lucide-react';
import Link from 'next/link';

export default function PricingPage() {
  const supabase = createClient();

  const handleAction = async (type: 'free' | 'premium') => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (type === 'premium') {
          // Trigger 'Goudzoeker' & 'VIP'
          trackActivity(supabase, user.id, 'buy_premium');
          alert("Bedankt! (In de echte app ga je nu naar Stripe)");
      } else {
          // Trigger 'Krent'
          trackActivity(supabase, user.id, 'click_free');
          alert("Je hebt gekozen voor de gratis versie.");
      }
  };

  return (
    <div className="min-h-screen bg-midnight-950 text-white pt-24 px-6 pb-20">
      <div className="max-w-5xl mx-auto">
        <Link href="/profile" className="flex items-center gap-2 text-gray-400 hover:text-white mb-12 text-sm font-bold uppercase">
            <ArrowLeft size={16}/> Terug
        </Link>

        <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Kies uw Lidmaatschap</h1>
            <p className="text-xl text-gray-400">Haal meer uit uw dagelijkse dosis kunst.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            
            {/* GRATIS (De Krent) */}
            <div className="bg-midnight-900 border border-white/10 rounded-3xl p-8 flex flex-col">
                <div className="mb-4">
                    <h3 className="text-2xl font-bold text-white">Bezoeker</h3>
                    <p className="text-gray-400">Gratis</p>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                    <li className="flex items-center gap-3 text-gray-300"><Check size={18} className="text-gray-500"/> Dagelijks 1 kunstwerk</li>
                    <li className="flex items-center gap-3 text-gray-300"><Check size={18} className="text-gray-500"/> Beperkte toegang Focus</li>
                    <li className="flex items-center gap-3 text-gray-300"><Check size={18} className="text-gray-500"/> Games spelen</li>
                </ul>
                <button 
                    onClick={() => handleAction('free')}
                    className="w-full py-4 rounded-xl border border-white/20 hover:bg-white/5 font-bold transition-colors"
                >
                    Ik blijf gratis kijken
                </button>
            </div>

            {/* PREMIUM (De Goudzoeker) */}
            <div className="bg-midnight-900 border border-museum-gold rounded-3xl p-8 relative flex flex-col shadow-[0_0_40px_-10px_rgba(234,179,8,0.2)]">
                <div className="absolute top-0 right-0 bg-museum-gold text-black text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl uppercase tracking-wider">
                    Meest Gekozen
                </div>
                <div className="mb-4">
                    <h3 className="text-2xl font-bold text-museum-gold flex items-center gap-2">
                        Mecenas <Star size={20} fill="currentColor"/>
                    </h3>
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-white">€6,95</span>
                        <span className="text-gray-400">/ maand</span>
                    </div>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                    <li className="flex items-center gap-3 text-white"><Check size={18} className="text-museum-gold"/> Onbeperkt toegang tot Archief</li>
                    <li className="flex items-center gap-3 text-white"><Check size={18} className="text-museum-gold"/> Alle Focus Artikelen & Audio</li>
                    <li className="flex items-center gap-3 text-white"><Check size={18} className="text-museum-gold"/> Exclusieve Salon Collecties</li>
                    <li className="flex items-center gap-3 text-white"><Check size={18} className="text-museum-gold"/> Geen advertenties</li>
                </ul>
                <button 
                    onClick={() => handleAction('premium')}
                    className="w-full py-4 rounded-xl bg-museum-gold text-black hover:bg-yellow-500 font-bold transition-colors shadow-lg"
                >
                    Word Mecenas
                </button>
            </div>

        </div>
      </div>
    </div>
  );
}
