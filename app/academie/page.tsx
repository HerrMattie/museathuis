import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import { GraduationCap } from 'lucide-react';

export const revalidate = 0;

export default async function AcademiePage() {
  const supabase = createClient(cookies());
  const { data: pageContent } = await supabase.from('page_content').select('*').eq('slug', 'academie').single();

  const title = pageContent?.title || "De Academie";
  const subtitle = pageContent?.subtitle || "Verdieping & Studie";

  return (
    <div className="min-h-screen bg-midnight-950 text-white pt-20 pb-12 px-6 flex flex-col">
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col justify-center">
        
        <div className="relative bg-midnight-900 border border-white/10 rounded-3xl p-12 md:p-24 overflow-hidden text-center shadow-2xl">
             
             {/* Achtergrond sfeer */}
             <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/30 to-black pointer-events-none"></div>
             <div className="absolute -right-20 -top-20 text-indigo-500/5 rotate-12">
                 <GraduationCap size={400} />
             </div>

             <div className="relative z-10 max-w-2xl mx-auto">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-500/20 text-indigo-300 rounded-2xl mb-8 border border-indigo-500/30">
                    <GraduationCap size={40} />
                </div>

                <p className="text-museum-gold text-sm font-bold uppercase tracking-[0.2em] mb-4">{subtitle}</p>
                <h1 className="text-5xl md:text-7xl font-serif font-black mb-6 text-white leading-tight">{title}</h1>
                <p className="text-xl text-gray-300 mb-12 leading-relaxed">
                    Wij werken aan iets bijzonders. Binnenkort opent hier de Academie: 
                    een plek voor masterclasses, cursussen en diepgaande kunstgeschiedenis.
                </p>

                {/* Email Capture (Visueel) */}
                <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                    <input 
                        type="email" 
                        placeholder="Uw e-mailadres" 
                        className="flex-1 bg-white/5 border border-white/20 rounded-xl px-6 py-4 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    <button className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-4 rounded-xl transition-colors shadow-lg shadow-indigo-900/50">
                        Houd mij op de hoogte
                    </button>
                </div>
                <p className="text-xs text-gray-500 mt-4">Geen spam, alleen kunst.</p>
             </div>
        </div>

      </div>
    </div>
  );
}
