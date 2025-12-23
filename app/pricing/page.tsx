'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { Check, X, Heart, Crown, Loader2, Gift } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PricingPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [donationAmount, setDonationAmount] = useState(20);
  const supabase = createClient();
  const router = useRouter();

  const MIN_DONATION_FOR_GIFT = 20;

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const handleUpgrade = async (type: 'subscription' | 'donation') => {
    if (!user) {
        router.push('/login');
        return;
    }

    setLoading(true);
    try {
        let updateData: any = { is_premium: true };
        let successMessage = "";

        if (type === 'subscription') {
            const nextMonth = new Date();
            nextMonth.setMonth(nextMonth.getMonth() + 1);
            updateData.premium_until = nextMonth.toISOString();
            updateData.role = 'Mecenas';
            successMessage = "Welkom als Mecenas! Uw abonnement is gestart.";
        } 
        else if (type === 'donation') {
            const threeMonths = new Date();
            threeMonths.setMonth(threeMonths.getMonth() + 3);
            updateData.premium_until = threeMonths.toISOString();
            successMessage = `Dankuwel voor uw donatie van €${donationAmount}! U heeft 3 maanden Premium ontvangen.`;
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
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-midnight-950 pt-24 pb-20 px-6 font-sans text-white">
      
      {/* HEADER */}
      <div className="max-w-4xl mx-auto text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6 text-white">
          Steun de Kunst. <span className="text-museum-gold">Verrijk uw Wereld.</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          MuseaThuis is gratis toegankelijk voor iedereen. Met een account of lidmaatschap haalt u nog meer uit uw dagelijkse dosis cultuur.
        </p>
      </div>

      {/* --- MODEL 1: DE DRIELUIK --- */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        
        {/* OPTIE 1: GRATIS (Met Account) */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 flex flex-col">
            <div className="mb-4 bg-white/10 w-fit px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-gray-300">
                Liefhebber
            </div>
            <h3 className="text-2xl font-bold mb-2">Gratis Account</h3>
            <div className="text-4xl font-bold mb-6">€0 <span className="text-sm font-normal text-gray-500">/altijd</span></div>
            <p className="text-gray-400 mb-8 text-sm">Voor wie wil bijhouden wat hij mooi vindt en mee wil doen.</p>
            
            <ul className="space-y-4 mb-8 flex-1">
                <li className="flex gap-3 text-sm text-gray-300"><Check size={18} className="text-green-500"/> Dagelijkse kunstwerken</li>
                <li className="flex gap-3 text-sm text-gray-300"><Check size={18} className="text-green-500"/> Favorieten opslaan</li>
                <li className="flex gap-3 text-sm text-gray-300"><Check size={18} className="text-green-500"/> Meedoen met Games (beperkt)</li>
                <li className="flex gap-3 text-sm text-gray-500"><X size={18}/> Geen Audiotours</li>
                <li className="flex gap-3 text-sm text-gray-500"><X size={18}/> Geen Verdiepende Artikelen</li>
            </ul>

            <button onClick={() => router.push('/login')} className="w-full py-3 rounded-xl border border-white/20 hover:bg-white/10 font-bold transition-all">
                Maak Account
            </button>
        </div>

        {/* OPTIE 2: ABONNEMENT (Monthly) */}
        <div className="bg-midnight-900 border border-museum-gold rounded-2xl p-8 flex flex-col relative transform scale-105 shadow-2xl shadow-museum-gold/10">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-museum-gold text-black px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                Meest Gekozen
            </div>
            <div className="mb-4 text-museum-gold flex items-center gap-2">
                <Crown size={20}/>
                <span className="font-bold uppercase tracking-wider text-xs">Mecenas</span>
            </div>
            <h3 className="text-2xl font-bold mb-2 text-white">Maandelijks</h3>
            <div className="text-4xl font-bold mb-6 text-museum-gold">€6,95 <span className="text-sm font-normal text-white">/maand</span></div>
            <p className="text-gray-400 mb-8 text-sm">Onbeperkt toegang tot alle verdieping, tours en functionaliteiten.</p>
            
            <ul className="space-y-4 mb-8 flex-1">
                <li className="flex gap-3 text-sm text-white"><Check size={18} className="text-museum-gold"/> <strong>Alles van gratis</strong></li>
                <li className="flex gap-3 text-sm text-white"><Check size={18} className="text-museum-gold"/> Onbeperkt Audiotours</li>
                <li className="flex gap-3 text-sm text-white"><Check size={18} className="text-museum-gold"/> Focus Artikelen & Archief</li>
                <li className="flex gap-3 text-sm text-white"><Check size={18} className="text-museum-gold"/> Geavanceerde Statistieken</li>
            </ul>

            <button 
                onClick={() => handleUpgrade('subscription')} 
                disabled={loading}
                className="w-full py-3 rounded-xl bg-museum-gold text-black font-black uppercase tracking-widest hover:bg-white transition-all flex justify-center items-center gap-2"
            >
                {loading ? <Loader2 className="animate-spin"/> : 'Word Mecenas'}
            </button>
        </div>

        {/* OPTIE 3: DONATIE (Eenmalig) */}
        <div className="bg-gradient-to-b from-blue-900/20 to-midnight-900 border border-blue-500/30 rounded-2xl p-8 flex flex-col">
            <div className="mb-4 bg-blue-500/20 w-fit px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-blue-300">
                Eenmalig
            </div>
            <h3 className="text-2xl font-bold mb-2">Donatie</h3>
            <div className="min-h-[60px] flex items-end mb-4">
                 <div className="relative w-full">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
                    <input 
                        type="number" 
                        value={donationAmount}
                        onChange={(e) => setDonationAmount(Number(e.target.value))}
                        className="w-full bg-black/40 border border-white/20 rounded-xl py-3 pl-8 pr-4 text-2xl font-bold text-white focus:border-blue-500 outline-none"
                    />
                 </div>
            </div>
            
            {/* Feedback over de 3 maanden cadeau */}
            <div className={`mb-8 text-sm p-3 rounded-lg border ${donationAmount >= MIN_DONATION_FOR_GIFT ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-white/5 border-white/5 text-gray-500'}`}>
                {donationAmount >= MIN_DONATION_FOR_GIFT ? (
                    <span className="flex items-center gap-2"><Gift size={16}/> Inclusief <strong>3 Maanden Premium</strong> cadeau!</span>
                ) : (
                    <span>Doneer min. €{MIN_DONATION_FOR_GIFT} voor 3 maanden Premium cadeau.</span>
                )}
            </div>
            
            <ul className="space-y-4 mb-8 flex-1">
                <li className="flex gap-3 text-sm text-gray-300"><Heart size={18} className="text-blue-400"/> Steun de ontwikkeling</li>
                <li className="flex gap-3 text-sm text-gray-300"><Check size={18} className="text-blue-400"/> Geen maandelijkse afschrijving</li>
                <li className="flex gap-3 text-sm text-gray-300"><Check size={18} className="text-blue-400"/> Stopt automatisch</li>
            </ul>

            <button 
                onClick={() => handleUpgrade('donation')} 
                disabled={loading}
                className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 transition-all flex justify-center items-center gap-2"
            >
                {loading ? <Loader2 className="animate-spin"/> : 'Doneer Nu'}
            </button>
        </div>

      </div>

      {/* FOOTER NOTE */}
      <div className="text-center text-gray-500 text-sm max-w-2xl mx-auto">
        <p className="mb-4">
            <strong>Zonder account?</strong> U kunt de website beperkt gebruiken. U ziet dagelijks één kunstwerk, maar uw voortgang en favorieten worden niet opgeslagen.
        </p>
        <p>
            Betalingen worden veilig verwerkt. Opzeggen kan op elk moment via uw profiel.
        </p>
      </div>

    </div>
  );
}
