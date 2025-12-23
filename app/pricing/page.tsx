'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { Check, X, Crown, Loader2, CalendarClock, CreditCard } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { trackActivity } from '@/lib/tracking'; // Zorg dat tracking.ts bestaat, anders deze regel weghalen

export default function PricingPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<string | null>(null); // 'subscription' of 'one_time'
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
        // Sla de keuze op in URL of localStorage zodat we na login terug kunnen (optioneel voor later)
        router.push('/login');
        return;
    }

    setLoading(type);
    try {
        let updateData: any = { is_premium: true };
        let successMessage = "";
        let logMetadata = {};

        // HUIDIGE DATUM
        const now = new Date();

        if (type === 'subscription') {
            // SCENARIO 1: ABONNEMENT (€6,95)
            // In een echt systeem start je hier de Stripe Subscription
            // Wij simuleren: Premium tot volgende maand (wordt telkens verlengd)
            const nextMonth = new Date(now);
            nextMonth.setMonth(now.getMonth() + 1);
            
            updateData.premium_until = nextMonth.toISOString();
            updateData.role = 'Mecenas'; // De "Abonnee" rol
            successMessage = "Welkom als Mecenas! Uw abonnement van €6,95 is gestart.";
            logMetadata = { plan: 'subscription', price: 6.95 };
        } 
        else if (type === 'one_time') {
            // SCENARIO 2: LOSSE MAAND (€10,00)
            // We tellen exact 1 maand op bij NU (of bij huidige einddatum als ze al premium zijn)
            // (Simpele versie: gewoon vanaf nu 1 maand)
            const oneMonthLater = new Date(now);
            oneMonthLater.setMonth(now.getMonth() + 1);

            updateData.premium_until = oneMonthLater.toISOString();
            // We veranderen de rol NIET naar Mecenas, of geven een specifieke rol
            // updateData.role = 'Flex'; // Optioneel
            successMessage = "1 Maand Pas geactiveerd! Geen automatische verlenging.";
            logMetadata = { plan: 'one_time', price: 10.00 };
        }

        // 1. Update Database
        const { error } = await supabase
            .from('user_profiles')
            .update(updateData)
            .eq('user_id', user.id);

        if (error) throw error;

        // 2. Log voor de Data Machine (Belangrijk voor je dashboard!)
        // Als je tracking.ts nog niet hebt geupdate met 'buy_premium', kun je dit weglaten
        // trackActivity(supabase, user.id, 'buy_premium', undefined, logMetadata);

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

      {/* --- DE DRIELUIK --- */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 items-center">
        
        {/* OPTIE 1: GRATIS */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 flex flex-col h-fit order-2 md:order-1">
            <div className="mb-4 text-gray-400 font-bold uppercase tracking-wider text-xs">
                Instap
            </div>
            <h3 className="text-2xl font-bold mb-2">Gratis Account</h3>
            <div className="text-4xl font-bold mb-6">€0 <span className="text-sm font-normal text-gray-500">/altijd</span></div>
            <p className="text-gray-400 mb-8 text-sm">Voor de verzamelaar.</p>
            
            <ul className="space-y-4 mb-8 flex-1">
                <li className="flex gap-3 text-sm text-gray-300"><Check size={18} className="text-green-500"/> Dagelijks 1 kunstwerk</li>
                <li className="flex gap-3 text-sm text-gray-300"><Check size={18} className="text-green-500"/> Favorieten opslaan</li>
                <li className="flex gap-3 text-sm text-gray-500"><X size={18}/> Geen Audiotours</li>
                <li className="flex gap-3 text-sm text-gray-500"><X size={18}/> Beperkte archief toegang</li>
            </ul>

            <button onClick={() => router.push('/login')} className="w-full py-3 rounded-xl border border-white/20 hover:bg-white/10 font-bold transition-all text-sm">
                Maak Gratis Account
            </button>
        </div>

        {/* OPTIE 2: ABONNEMENT (De "Slimme Keuze") */}
        <div className="bg-midnight-900 border-2 border-museum-gold rounded-2xl p-8 flex flex-col relative transform md:scale-110 shadow-2xl shadow-museum-gold/20 order-1 md:order-2 z-10">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-museum-gold text-black px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
                Meest Gekozen
            </div>
            <div className="mb-4 text-museum-gold flex items-center gap-2">
                <Crown size={20}/>
                <span className="font-bold uppercase tracking-wider text-xs">Mecenas</span>
            </div>
            <h3 className="text-2xl font-bold mb-2 text-white">Abonnement</h3>
            <div className="text-5xl font-black mb-2 text-museum-gold">€6,95</div>
            <div className="text-sm text-gray-400 mb-6">per maand (automatisch)</div>
            
            <p className="text-gray-300 mb-8 text-sm leading-relaxed border-b border-white/10 pb-4">
                Volledige toegang tot alles. Voor de echte kunstliefhebber die niets wil missen.
            </p>
            
            <ul className="space-y-4 mb-8 flex-1">
                <li className="flex gap-3 text-sm text-white"><Check size={18} className="text-museum-gold"/> <strong>Onbeperkt Audiotours</strong></li>
                <li className="flex gap-3 text-sm text-white"><Check size={18} className="text-museum-gold"/> <strong>Alle Games & Focus</strong></li>
                <li className="flex gap-3 text-sm text-white"><Check size={18} className="text-museum-gold"/> Volledig Archief</li>
                <li className="flex gap-3 text-sm text-gray-400"><Check size={18} className="text-museum-gold"/> Steun de makers structureel</li>
            </ul>

            <button 
                onClick={() => handleUpgrade('subscription')} 
                disabled={loading === 'subscription'}
                className="w-full py-4 rounded-xl bg-museum-gold text-black font-black uppercase tracking-widest hover:bg-white transition-all flex justify-center items-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-1"
            >
                {loading === 'subscription' ? <Loader2 className="animate-spin"/> : 'Word Mecenas'}
            </button>
            <p className="text-xs text-center text-gray-500 mt-3">Maandelijks opzegbaar.</p>
        </div>

        {/* OPTIE 3: 1 MAAND PAS (Nieuw) */}
        <div className="bg-gradient-to-b from-blue-900/10 to-midnight-900 border border-blue-500/30 rounded-2xl p-8 flex flex-col h-fit order-3">
            <div className="mb-4 text-blue-400 font-bold uppercase tracking-wider text-xs flex items-center gap-2">
                <CalendarClock size={16}/> Flexibel
            </div>
            <h3 className="text-2xl font-bold mb-2">1 Maand Pas</h3>
            <div className="text-4xl font-bold mb-6 text-white">€10,00</div>
            <div className="text-sm text-gray-400 mb-6">eenmalig / 30 dagen</div>

            <p className="text-gray-400 mb-8 text-sm">
                Probeer Premium één maand uit zonder ergens aan vast te zitten.
            </p>
            
            <ul className="space-y-4 mb-8 flex-1">
                <li className="flex gap-3 text-sm text-gray-300"><Check size={18} className="text-blue-400"/> <strong>30 dagen Premium toegang</strong></li>
                <li className="flex gap-3 text-sm text-gray-300"><Check size={18} className="text-blue-400"/> Geen automatische verlenging</li>
                <li className="flex gap-3 text-sm text-gray-300"><Check size={18} className="text-blue-400"/> Stopt automatisch</li>
                <li className="flex gap-3 text-sm text-gray-500"><X size={18}/> Duurder dan abonnement</li>
            </ul>

            <button 
                onClick={() => handleUpgrade('one_time')} 
                disabled={loading === 'one_time'}
                className="w-full py-3 rounded-xl bg-transparent border-2 border-blue-500/50 text-blue-100 font-bold hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-all flex justify-center items-center gap-2"
            >
                {loading === 'one_time' ? <Loader2 className="animate-spin"/> : 'Koop Maandpas'}
            </button>
        </div>

      </div>

      {/* FOOTER NOTE */}
      <div className="text-center text-gray-500 text-sm max-w-2xl mx-auto space-y-2">
        <p>
            <CreditCard size={14} className="inline mr-2"/>
            Betalingen worden veilig verwerkt.
        </p>
        <p>
            Heeft u al een abonnement? U kunt altijd upgraden of uw maandpas verlengen.
        </p>
      </div>

    </div>
  );
}
