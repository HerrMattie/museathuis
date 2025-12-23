'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { Check, X, Crown, Loader2, CalendarClock, CreditCard, Sparkles, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

// --- HIER PAS JE DE TEKSTEN AAN ---
const FEATURES = {
    free: {
        included: [
            "Dagelijkse audiotour en games",
            "Favorieten opslaan",
            "Één focusartikel per dag"
        ],
        not_included: [
            "Geen toegang tot premium artikelen",
            "Geen toegang tot galerijen",
            "Geen inzicht in beste content"
        ]
    },
    subscription: {
        included: [
            "Onbeperkt toegang tot de beste kunst",
            "Alle Audiotours, Games en Focus",
            "Volledige toegang tot Galerij",
            "Steun de ontwikkeling!"
        ]
    },
    onetime: {
        included: [
            "30 Dagen volledige toegang",
            "Stopt automatisch",
            "Geen automatische incasso"
        ],
        not_included: [
            "Duurder dan abonnement",
            "Handmatig verlengen"
        ]
    }
};

export default function PricingPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const handleUpgrade = async (type: 'subscription' | 'one_time') => {
    if (!user) {
        router.push('/login');
        return;
    }

    setLoading(type);
    try {
        let updateData: any = { is_premium: true };
        let successMessage = "";

        const now = new Date();

        if (type === 'subscription') {
            const nextMonth = new Date(now);
            nextMonth.setMonth(now.getMonth() + 1);
            
            updateData.premium_until = nextMonth.toISOString();
            updateData.role = 'Mecenas';
            successMessage = "Welkom als Mecenas! Uw abonnement is gestart.";
        } 
        else if (type === 'one_time') {
            const oneMonthLater = new Date(now);
            oneMonthLater.setMonth(now.getMonth() + 1);

            updateData.premium_until = oneMonthLater.toISOString();
            successMessage = "1 Maand Pas geactiveerd!";
        }

        const { error } = await supabase
            .from('user_profiles')
            .update(updateData)
            .eq('user_id', user.id);

        if (error) throw error;

        alert(successMessage + " 🎉");
        router.push('/profile');
        router.refresh();

    } catch (err: any) {
        alert("Er ging iets mis: " + err.message);
    } finally {
        setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-midnight-950 pt-24 pb-20 px-6 font-sans text-white">
      
      {/* HEADER */}
      <div className="max-w-4xl mx-auto text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6 text-white">
          Kies uw <span className="text-museum-gold">Toegang.</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Start gratis, kies voor flexibiliteit met een maandpas, of ga voor het voordelige abonnement.
        </p>
      </div>

      {/* --- DE KAARTEN --- */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 items-start">
        
        {/* === OPTIE 1: GRATIS === */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 flex flex-col h-full order-2 md:order-1">
            <div className="mb-4 text-gray-400 font-bold uppercase tracking-wider text-xs">
                Instap
            </div>
            <h3 className="text-2xl font-bold mb-2">Gratis Account</h3>
            <div className="text-4xl font-bold mb-6">€0 <span className="text-sm font-normal text-gray-500">/altijd</span></div>
            <p className="text-gray-400 mb-8 text-sm min-h-[40px]">
                Voor de beginnende kunstverzamelaar.
            </p>
            
            <div className="flex-1 space-y-6 mb-8">
                <div>
                    <p className="text-[10px] font-bold text-green-500 uppercase tracking-widest mb-3 border-b border-white/5 pb-1">Inbegrepen</p>
                    <ul className="space-y-3">
                        {FEATURES.free.included.map((item, i) => (
                            <li key={i} className="flex gap-3 text-sm text-gray-300">
                                <Check size={18} className="text-green-500 shrink-0"/> {item}
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-3 border-b border-white/5 pb-1">Niet Inbegrepen</p>
                    <ul className="space-y-3 opacity-60">
                        {FEATURES.free.not_included.map((item, i) => (
                            <li key={i} className="flex gap-3 text-sm text-gray-400">
                                <X size={18} className="text-red-900 shrink-0"/> {item}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <button onClick={() => router.push('/login')} className="w-full py-3 rounded-xl border border-white/20 hover:bg-white/10 font-bold transition-all text-sm mt-auto">
                Maak Gratis Account
            </button>
        </div>

        {/* === OPTIE 2: ABONNEMENT (MECENAS) === */}
        <div className="bg-midnight-900 border-2 border-museum-gold rounded-2xl p-8 flex flex-col h-full relative transform md:scale-105 shadow-2xl shadow-museum-gold/20 order-1 md:order-2 z-10">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-museum-gold text-black px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg flex items-center gap-1">
                <Sparkles size={12}/> Meest Gekozen
            </div>
            <div className="mb-4 text-museum-gold flex items-center gap-2">
                <Crown size={20}/>
                <span className="font-bold uppercase tracking-wider text-xs">Mecenas</span>
            </div>
            <h3 className="text-2xl font-bold mb-2 text-white">Abonnement</h3>
            <div className="text-5xl font-black mb-2 text-museum-gold">€6,95</div>
            <div className="text-sm text-gray-400 mb-6">per maand (automatisch)</div>
            
            <p className="text-gray-300 mb-8 text-sm leading-relaxed border-b border-white/10 pb-4 min-h-[40px]">
                Volledige toegang tot alles. Voor de echte kunstliefhebber.
            </p>
            
            <div className="flex-1 space-y-6 mb-8">
                <div>
                    <p className="text-[10px] font-bold text-museum-gold uppercase tracking-widest mb-3 border-b border-white/10 pb-1">Alles Inclusief</p>
                    <ul className="space-y-3">
                        {FEATURES.subscription.included.map((item, i) => (
                            <li key={i} className="flex gap-3 text-sm text-white font-medium">
                                <Check size={18} className="text-museum-gold shrink-0"/> <strong>{item}</strong>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <button 
                onClick={() => handleUpgrade('subscription')} 
                disabled={loading === 'subscription'}
                className="w-full py-4 rounded-xl bg-museum-gold text-black font-black uppercase tracking-widest hover:bg-white transition-all flex justify-center items-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-1 mt-auto"
            >
                {loading === 'subscription' ? <Loader2 className="animate-spin"/> : 'Word Mecenas'}
            </button>
            <p className="text-xs text-center text-gray-500 mt-3">Maandelijks opzegbaar.</p>
        </div>

        {/* === OPTIE 3: 1 MAAND PAS === */}
        <div className="bg-gradient-to-b from-blue-900/10 to-midnight-900 border border-blue-500/30 rounded-2xl p-8 flex flex-col h-full order-3">
            <div className="mb-4 text-blue-400 font-bold uppercase tracking-wider text-xs flex items-center gap-2">
                <CalendarClock size={16}/> Flexibel
            </div>
            <h3 className="text-2xl font-bold mb-2">1 Maand Pas</h3>
            <div className="text-4xl font-bold mb-6 text-white">€10,00</div>
            <div className="text-sm text-gray-400 mb-6">eenmalig / 30 dagen</div>

            <p className="text-gray-400 mb-8 text-sm min-h-[40px]">
                Probeer Premium één maand uit zonder vast te zitten.
            </p>
            
            <div className="flex-1 space-y-6 mb-8">
                <div>
                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-3 border-b border-white/5 pb-1">De Voordelen</p>
                    <ul className="space-y-3">
                        {FEATURES.onetime.included.map((item, i) => (
                            <li key={i} className="flex gap-3 text-sm text-gray-300">
                                <Check size={18} className="text-blue-400 shrink-0"/> {item}
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-3 border-b border-white/5 pb-1">De Nadelen</p>
                    <ul className="space-y-3 opacity-80">
                        {FEATURES.onetime.not_included.map((item, i) => (
                            <li key={i} className="flex gap-3 text-sm text-gray-400">
                                <AlertCircle size={18} className="text-gray-600 shrink-0"/> {item}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <button 
                onClick={() => handleUpgrade('one_time')} 
                disabled={loading === 'one_time'}
                className="w-full py-3 rounded-xl bg-transparent border-2 border-blue-500/50 text-blue-100 font-bold hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-all flex justify-center items-center gap-2 mt-auto"
            >
                {loading === 'one_time' ? <Loader2 className="animate-spin"/> : 'Koop Maandpas'}
            </button>
        </div>

      </div>

      {/* FOOTER NOTE */}
      <div className="text-center text-gray-500 text-sm max-w-2xl mx-auto space-y-2">
        <p>
            <CreditCard size={14} className="inline mr-2"/>
            Veilige betaling via iDEAL of Creditcard.
        </p>
        <p>
            Heeft u al een abonnement? U kunt altijd upgraden of uw maandpas verlengen.
        </p>
      </div>

    </div>
  );
}
