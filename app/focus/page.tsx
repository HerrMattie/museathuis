import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Crosshair, ArrowRight, Lock, Calendar, Clock, FileText } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';

export const revalidate = 0;

export default async function FocusPage() {
  const supabase = createClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();

  // 1. Haal artikelen op
  const { data: articles } = await supabase
    .from('focus_items')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  const items = articles || [];

  // 2. Sorteer: Gratis eerst, dan Premium
  items.sort((a, b) => Number(a.is_premium) - Number(b.is_premium));

  return (
    <div className="min-h-screen bg-midnight-950 text-white">
      
      {/* UNIVERSELE HEADER */}
      <PageHeader 
        title="In Focus" 
        subtitle="Duik dieper in de details. Achtergrondverhalen, analyses en context bij de meesterwerken."
        // Optioneel: backgroundImage="/images/headers/focus-bg.jpg"
      />

      <div className="max-w-7xl mx-auto px-6 pb-20">
        
        {/* GRID WEERGAVE (Naast elkaar) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((item) => {
                const isLocked = item.is_premium && !user;

                return (
                    <Link key={item.id} href={isLocked ? '/pricing' : `/focus/${item.id}`} className="group bg-midnight-900 border border-white/10 rounded-2xl overflow-hidden hover:border-museum-gold/40 transition-all hover:-translate-y-2 hover:shadow-2xl flex flex-col h-full">
                        
                        {/* Image Card */}
                        <div className="h-56 relative overflow-hidden bg-black">
                            {item.cover_image ? (
                                <img src={item.cover_image} alt={item.title} className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${isLocked ? 'grayscale' : ''}`} />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-white/5"><FileText size={48} className="opacity-20"/></div>
                            )}
                            
                            <div className={`absolute top-4 left-4 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest text-white border border-white/10 shadow-lg ${isLocked ? 'bg-black/80' : 'bg-museum-gold text-black'}`}>
                                {isLocked ? <span className="flex items-center gap-1"><Lock size={10}/> Premium</span> : 'Artikel'}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-8 flex-1 flex flex-col">
                            <h3 className="font-serif font-bold text-2xl mb-3 text-white group-hover:text-museum-gold transition-colors">
                                {item.title}
                            </h3>
                            <p className="text-gray-400 text-sm leading-relaxed mb-6 line-clamp-3 flex-1">
                                {item.intro || "Lees het volledige achtergrondverhaal bij dit kunstwerk."}
                            </p>
                            
                            <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center text-sm text-gray-500">
                                <span className="flex items-center gap-2">
                                    <Calendar size={14}/> {new Date(item.created_at).toLocaleDateString('nl-NL')}
                                </span>
                                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest group-hover:text-white transition-colors">
                                    Lees Verder <ArrowRight size={14} className="text-museum-gold"/>
                                </div>
                            </div>
                        </div>
                    </Link>
                );
            })}
        </div>

        {items.length === 0 && (
            <div className="text-center py-20 bg-white/5 rounded-2xl border border-dashed border-white/10">
                <Crosshair size={48} className="mx-auto text-gray-600 mb-4"/>
                <p className="text-gray-400">Er zijn nog geen artikelen gepubliceerd.</p>
            </div>
        )}
      </div>
    </div>
  );
}
