import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import Header from "@/components/layout/Header"; // Of gewoon "@/components/Header" als je die structuur hebt
import Footer from "@/components/layout/Footer";

export const revalidate = 0; // Zorg dat we altijd verse data hebben

export default async function ContactPage() {
  const supabase = createClient(cookies());

  // 1. HAAL DE TEKSTEN OP UIT DE DB
  const { data: content } = await supabase
    .from('site_content')
    .select('*')
    .in('key', ['contact_title', 'contact_text']); // <--- Hier geef je aan welke keys je nodig hebt

  // 2. Zet ze om naar een handig object: { contact_title: "...", contact_text: "..." }
  const texts = content?.reduce((acc: any, item: any) => ({ ...acc, [item.key]: item.content }), {}) || {};

  return (
    <div className="min-h-screen bg-midnight-950 text-slate-200">
      {/* Header en Footer zitten vaak al in layout.tsx, dus check even of je ze hier nodig hebt.
          Als ze dubbel verschijnen, haal ze dan hier weg! */}
      
      <div className="max-w-4xl mx-auto px-6 py-24">
        
        {/* 3. GEBRUIK DE VARIABELEN */}
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">
            {texts.contact_title || "Neem Contact Op"} 
        </h1>
        
        <p className="text-xl text-slate-400 mb-12 leading-relaxed">
            {texts.contact_text || "Heb je vragen? Stuur ons een bericht."}
        </p>

        {/* Hieronder de rest van je formulier of contactgegevens... */}
        <div className="bg-white/5 p-8 rounded-2xl border border-white/10">
            <p className="text-museum-gold">info@museathuis.nl</p>
        </div>

      </div>
    </div>
  );
}
