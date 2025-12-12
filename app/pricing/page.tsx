import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Check, Star, Crown } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';

export const revalidate = 0;

export default async function PricingPage() {
  const supabase = createClient(cookies());
  
  // Haal teksten op
  const { data: content } = await supabase.from('site_content').select('*').like('key', 'pricing_%');
  const txt: any = {};
  content?.forEach((item: any) => txt[item.key] = item.content);

  // Helper om lijstjes (met enters) te splitten
  const getFeatures = (key: string) => (txt[key] || '').split('\n').filter(Boolean);

  return (
    <div className="min-h-screen bg-midnight-950 text-white">
      <PageHeader 
        title={txt.pricing_title || "Lidmaatschap"} 
        subtitle={txt.pricing_subtitle || "Kies de vorm die bij u past."}
        center={true}
      />

      <div className="max-w-5xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            
            {/* GRATIS KAART */}
            <div className="bg-midnight-900 border border-white/10 rounded-2xl p-8 hover:border-white/30 transition-all">
                <h3 className="text-2xl font-serif font-bold text-white mb-2">{txt.pricing_free_title || 'Gratis'}</h3>
                <div className="text-4xl font-black text-gray-400 mb-6">€0</div>
                <p className="text-gray-400 mb-8 text-sm">Maak kennis met kunst.</p>
                
                <ul className="space-y-4 mb-8">
                    {getFeatures('pricing_free_features').map((feat: string, i: number) => (
                        <li key={i} className="flex items-center gap-3 text-sm text-gray-300">
                            <div className="bg-white/10 p-1 rounded-full"><Check size={12}/></div> {feat}
                        </li>
                    ))}
                </ul>

                <Link href="/login" className="block w-full py-4 text-center rounded-xl font-bold border border-white/20 hover:bg-white/5 transition-colors">
                    Account Aanmaken
                </Link>
            </div>

            {/* PREMIUM KAART (Goud) */}
            <div className="bg-gradient-to-b from-museum-gold/10 to-midnight-900 border border-museum-gold/50 rounded-2xl p-8 relative shadow-[0_0_40px_rgba(234,179,8,0.1)] transform md:-translate-y-4">
                <div className="absolute top-0 right-0 bg-museum-gold text-black text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl flex items-center gap-1">
                    <Star size={12} fill="black"/> Meest Gekozen
                </div>

                <h3 className="text-2xl font-serif font-bold text-museum-gold mb-2 flex items-center gap-2">
                    <Crown size={24}/> {txt.pricing_premium_title || 'Premium'}
                </h3>
                <div className="text-4xl font-black text-white mb-6">
                    {txt.pricing_premium_price || '€4,95'} <span className="text-sm font-normal text-gray-400">/ maand</span>
                </div>
                <p className="text-gray-300 mb-8 text-sm">De complete museumervaring thuis.</p>
                
                <ul className="space-y-4 mb-8">
                    {getFeatures('pricing_premium_features').map((feat: string, i: number) => (
                        <li key={i} className="flex items-center gap-3 text-sm text-white font-medium">
                            <div className="bg-museum-gold text-black p-1 rounded-full"><Check size={12}/></div> {feat}
                        </li>
                    ))}
                </ul>

                <Link href="/login?plan=premium" className="block w-full py-4 text-center rounded-xl font-bold bg-museum-gold text-black hover:bg-white transition-colors shadow-lg">
                    Word Premium Lid
                </Link>
            </div>

        </div>
      </div>
    </div>
  );
}
