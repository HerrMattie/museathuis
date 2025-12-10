import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import { GraduationCap, Lock, Clock } from 'lucide-react';

export const revalidate = 0;

export default async function AcademiePage() {
  const supabase = createClient(cookies());
  
  // 1. HAAL HEADER TEKST UIT CMS
  const { data: pageContent } = await supabase.from('page_content').select('*').eq('slug', 'academie').single();

  const title = pageContent?.title || "De Academie";
  const subtitle = pageContent?.subtitle || "Verdieping & Studie";
  const intro = pageContent?.intro_text || "Volg cursussen en masterclasses van experts.";

  // 2. MOCK DATA (Zolang er geen 'courses' tabel is)
  const courses = [
      { id: 1, title: "De Gouden Eeuw in Vogelvlucht", modules: 4, duration: "2 uur", status: 'coming_soon' },
      { id: 2, title: "Kleurentheorie voor Beginners", modules: 6, duration: "3.5 uur", status: 'coming_soon' },
      { id: 3, title: "Meesters van het Licht", modules: 3, duration: "1.5 uur", status: 'locked' },
  ];

  return (
    <div className="min-h-screen bg-midnight-950 text-white pt-20 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER (Indigo/Paars Sfeer) */}
        <div className="relative py-16 mb-12 border-b border-white/10">
             <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/20 to-transparent pointer-events-none rounded-3xl"></div>
             <div className="relative z-10">
                <p className="text-museum-gold text-sm font-bold uppercase tracking-[0.2em] mb-3">{subtitle}</p>
                <h1 className="text-5xl md:text-7xl font-serif font-black mb-6 text-white">{title}</h1>
                <p className="text-xl text-gray-300 max-w-2xl leading-relaxed font-light">{intro}</p>
             </div>
        </div>

        {/* CONTENT */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
                <div key={course.id} className="group bg-midnight-900 border border-white/10 rounded-2xl p-8 hover:border-museum-gold/40 transition-all opacity-75 hover:opacity-100 cursor-not-allowed relative overflow-hidden">
                    
                    {/* Achtergrond Patroon */}
                    <div className="absolute -right-4 -bottom-4 text-white/5 group-hover:text-white/10 transition-colors">
                        <GraduationCap size={120} />
                    </div>

                    <div className="w-12 h-12 bg-indigo-900/50 rounded-lg flex items-center justify-center text-indigo-300 mb-6 group-hover:scale-110 transition-transform border border-indigo-500/20">
                        <GraduationCap size={24}/>
                    </div>
                    
                    <h3 className="font-serif font-bold text-2xl mb-2 text-gray-300 group-hover:text-white">{course.title}</h3>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                        <span>{course.modules} Modules</span>
                        <span className="flex items-center gap-1"><Clock size={14}/> {course.duration}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-museum-gold bg-museum-gold/10 py-2 px-3 rounded w-fit border border-museum-gold/20">
                        <Lock size={12}/> Binnenkort beschikbaar
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}
