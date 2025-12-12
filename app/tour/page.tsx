import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Headphones, ArrowRight, Lock, Clock } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';

export const revalidate = 0;

export default async function TourPage() {
  const supabase = createClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();

  // 1. Haal tours op
  const { data: tours } = await supabase
    .from('tours')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  const items = tours || [];

  // 2. Sorteer: Gratis (is_premium: false) eerst, daarna Premium
  items.sort((a, b) => Number(a.is_premium) - Number(b.is_premium));

  return (
    <div className="min-h-screen bg-midnight-950 text-white">
      
      {/* UNIVERSELE HEADER */}
      <PageHeader 
        title="Audiotours" 
        subtitle="Laat je meevoeren door de verhalen achter de meesterwerken. Luister thuis of onderweg."
        // Optioneel: backgroundImage="/images/headers/tour-bg.jpg"
      />

      <div className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((tour) => {
                const isLocked = tour.is_premium && !user;

                return (
                    <Link key={tour.id} href={isLocked ? '/pricing' : `/tour/${tour.id}`} className="group bg-midnight-900 border border-white/10 rounded-2xl overflow-hidden hover:border-museum-gold/40 transition-all hover:-translate-y-2 hover:shadow-2xl flex flex-col h-full">
                        
                        {/* Image Card */}
                        <div className="h-64 relative overflow-hidden bg-black">
                            {tour.hero_image_url ? (
                                <img src={tour.hero_image_url} alt={tour.title} className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${isLocked ? 'grayscale' : ''}`} />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-white/5"><Headphones size={48} className="opacity-20"/></div>
                            )}
                            
                            <div className={`absolute top-4 left-4 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest text-white border border-white/10 shadow-lg ${isLocked ? 'bg-black/80' : 'bg-museum-gold text-black'}`}>
                                {isLocked ? <span className="flex items-center gap-1"><Lock size={10}/> Premium</span> : 'Gratis'}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-8 flex-1 flex flex-col">
                            <h3 className="font-serif font-bold text-2xl mb-3 text-white group-hover:text-museum-gold transition-colors">
                                {tour.title}
                            </h3>
                            <p className="text-gray-400 text-sm leading-relaxed mb-6 line-clamp-3 flex-1">
                                {tour.intro}
                            </p>
                            
                            <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center text-sm text-gray-500">
                                <span className="flex items-center gap-2"><Clock size={14}/> 15 min</span>
                                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest group-hover:text-white transition-colors">
                                    Start Tour <ArrowRight size={14} className="text-museum-gold"/>
                                </div>
                            </div>
                        </div>
                    </Link>
                );
            })}
        </div>

        {items.length === 0 && (
            <div className="text-center py-20 bg-white/5 rounded-2xl border border-dashed border-white/10">
                <Headphones size={48} className="mx-auto text-gray-600 mb-4"/>
                <p className="text-gray-400">Er zijn momenteel geen tours beschikbaar.</p>
            </div>
        )}
      </div>
    </div>
  );
}
