import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';

export const revalidate = 0;

export default async function ContactPage() {
  const supabase = createClient(cookies());
  
  // Haal teksten op
  const { data: content } = await supabase.from('site_content').select('*').like('key', 'contact_%');
  const txt: any = {};
  content?.forEach((item: any) => txt[item.key] = item.content);

  return (
    <div className="min-h-screen bg-midnight-950 text-white">
      <PageHeader 
        title={txt.contact_title || "Contact"} 
        subtitle={txt.contact_intro || "We horen graag van u."}
      />

      <div className="max-w-4xl mx-auto px-6 pb-24 -mt-10 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            
            {/* GEGEVENS */}
            <div className="space-y-8">
                <div className="bg-midnight-900 border border-white/10 p-6 rounded-2xl flex items-start gap-4">
                    <div className="p-3 bg-museum-gold/10 text-museum-gold rounded-xl"><Mail size={24}/></div>
                    <div>
                        <h3 className="font-bold text-lg mb-1">E-mail</h3>
                        <a href={`mailto:${txt.contact_email}`} className="text-gray-400 hover:text-white transition-colors">{txt.contact_email || 'info@museathuis.nl'}</a>
                    </div>
                </div>

                {txt.contact_phone && (
                    <div className="bg-midnight-900 border border-white/10 p-6 rounded-2xl flex items-start gap-4">
                        <div className="p-3 bg-museum-gold/10 text-museum-gold rounded-xl"><Phone size={24}/></div>
                        <div>
                            <h3 className="font-bold text-lg mb-1">Telefoon</h3>
                            <p className="text-gray-400">{txt.contact_phone}</p>
                        </div>
                    </div>
                )}

                <div className="bg-midnight-900 border border-white/10 p-6 rounded-2xl flex items-start gap-4">
                    <div className="p-3 bg-museum-gold/10 text-museum-gold rounded-xl"><MapPin size={24}/></div>
                    <div>
                        <h3 className="font-bold text-lg mb-1">Kantoor</h3>
                        <p className="text-gray-400">{txt.contact_address || 'Amsterdam'}</p>
                    </div>
                </div>
            </div>

            {/* SIMPEL FORMULIER (Visueel) */}
            <div className="bg-white text-black p-8 rounded-2xl shadow-2xl">
                <h3 className="text-2xl font-serif font-bold mb-6">Stuur een bericht</h3>
                <form className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Naam</label>
                        <input type="text" className="w-full border border-gray-200 p-3 rounded-lg bg-gray-50" placeholder="Uw naam"/>
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">E-mail</label>
                        <input type="email" className="w-full border border-gray-200 p-3 rounded-lg bg-gray-50" placeholder="uw@email.nl"/>
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Bericht</label>
                        <textarea className="w-full border border-gray-200 p-3 rounded-lg bg-gray-50 h-32" placeholder="Waar kunnen we mee helpen?"/>
                    </div>
                    <button type="button" className="w-full bg-black text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors">
                        <Send size={18}/> Verstuur Bericht
                    </button>
                </form>
            </div>

        </div>
      </div>
    </div>
  );
}
