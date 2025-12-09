'use client';
import { createClient } from '@/lib/supabaseClient';
import { useState, useEffect } from 'react';
import { Check, Star, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PricingPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  // Simuleer een betaling (In het echt: Stripe Checkout)
  async function handleUpgrade() {
    if (!user) return router.push('/login');
    setLoading(true);

    // Roep onze Mock API aan
    const res = await fetch('/api/payment/mock-upgrade', { method: 'POST' });
    
    if (res.ok) {
      alert('Betaling geslaagd! Welkom bij Premium.');
      router.push('/profile');
      router.refresh();
    } else {
      alert('Er ging iets mis.');
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-midnight-950 py-20 px-6">
      <div className="container mx-auto max-w-5xl text-center">
        <h1 className="font-serif text-5xl text-white font-bold mb-6">Kies uw kunstbeleving</h1>
        <p className="text-xl text-gray-400 mb-16 max-w-2xl mx-auto">
          Steun de kunst en krijg onbeperkt toegang tot verdiepende tours, de academie en exclusieve collecties.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          
          {/* GRATIS */}
          <div className="bg-midnight-900 border border-white/10 rounded-3xl p-8 flex flex-col items-start text-left">
            <span className="bg-white/10 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
              Basis
            </span>
            <h2 className="text-3xl font-serif text-white font-bold mb-2">Kunstliefhebber</h2>
            <div className="text-4xl font-bold text-white mb-6">Gratis <span className="text-lg text-gray-500 font-normal">/ altijd</span></div>
            
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-center gap-3 text-gray-300"><Check size={18} className="text-gray-500" /> Dagelijkse Tour (Gratis selectie)</li>
              <li className="flex items-center gap-3 text-gray-300"><Check size={18} className="text-gray-500" /> Dagelijkse Game & Focus</li>
              <li className="flex items-center gap-3 text-gray-300"><Check size={18} className="text-gray-500" /> Beperkte toegang Salon</li>
            </ul>

            <button className="w-full py-4 rounded-xl border border-white/20 text-white font-bold hover:bg-white/5 transition-colors">
              Huidig Plan
            </button>
          </div>

          {/* PREMIUM */}
          <div className="relative bg-gradient-to-b from-midnight-800 to-midnight-900 border border-museum-gold/30 rounded-3xl p-8 flex flex-col items-start text-left shadow-2xl transform md:-translate-y-4">
            <div className="absolute top-0 right-0 bg-museum-gold text-black text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl">
              MEEST GEKOZEN
            </div>
            <span className="bg-museum-gold/20 text-museum-gold px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6 flex items-center gap-2">
              <Star size={12} fill="currentColor" /> Premium
            </span>
            <h2 className="text-3xl font-serif text-white font-bold mb-2">Mecenas</h2>
            <div className="text-4xl font-bold text-white mb-6">€4,99 <span className="text-lg text-gray-500 font-normal">/ maand</span></div>
            
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-center gap-3 text-white"><Check size={18} className="text-museum-gold" /> <strong>Onbeperkt</strong> toegang tot alle Tours</li>
              <li className="flex items-center gap-3 text-white"><Check size={18} className="text-museum-gold" /> Volledige Salon & Academie</li>
              <li className="flex items-center gap-3 text-white"><Check size={18} className="text-museum-gold" /> Geen advertenties</li>
              <li className="flex items-center gap-3 text-white"><Check size={18} className="text-museum-gold" /> Steun digitalisering van musea</li>
            </ul>

            <button 
              onClick={handleUpgrade}
              disabled={loading}
              className="w-full py-4 rounded-xl bg-museum-gold text-black font-bold hover:bg-white transition-colors shadow-lg shadow-museum-gold/20 disabled:opacity-50"
            >
              {loading ? 'Verwerken...' : 'Word Mecenas'}
            </button>
            <p className="text-xs text-center w-full mt-4 text-gray-500">Opzeggen kan maandelijks.</p>
          </div>

        </div>
      </div>
    </div>
  );
}
