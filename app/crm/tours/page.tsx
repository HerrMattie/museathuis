import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Plus, Edit, Zap, Calendar, Play, Star } from 'lucide-react';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';

export const revalidate = 0; // Altijd verse data in CRM

export default async function CrmToursPage() {
  const supabase = createClient(cookies());
  
  // Haal tours op
  const { data: tours } = await supabase
    .from('tours')
    .select('*')
    .order('scheduled_date', { ascending: false });

  // Filter tours om de 'daily' tours te tonen die automatisch gegenereerd worden
  const dailyTours = tours?.filter(t => t.type === 'daily');
  // Filter de overige tours (handmatig gemaakte, speciale thema tours etc.)
  const specialTours = tours?.filter(t => t.type !== 'daily');

  return (
    <div>
      <header className="flex justify-between items-center mb-8">
        <div>
            <h2 className="text-3xl font-bold text-slate-800">Tour Beheer</h2>
            <p className="text-slate-500">Genereer, plan en bewerk je Audio Tours.</p>
        </div>
        <div className="flex gap-3">
             {/* TOUR GENERATIE/SCHEDULING: Deze actie genereert de 'Daily Tour' voor vandaag */}
             <form action="/api/cron/generate-daily" method="GET" target="_blank">
                <button className="bg-orange-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-orange-600 transition-colors">
                   <Zap size={18} /> Genereer Vandaag's Tours
                </button>
             </form>
             <Link href="/crm/tours/create" className="bg-museum-gold text-black px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-yellow-600 transition-colors">
                 <Plus size={18} /> Nieuwe Handmatige Tour
             </Link>
        </div>
      </header>

      {/* 1. DAGELIJKSE TOURS (Geplande / Automatische) */}
      <TourSection 
          title="Automatisch Geplande (Dagelijkse) Tours" 
          description="Dit zijn de tours die de AI dagelijks automatisch genereert op basis van de ingeplande onderwerpen."
          tours={dailyTours}
          icon={<Calendar size={20} />}
      />

      {/* 2. SPECIALE TOURS (Handmatig Gemaakt) */}
      <TourSection 
          title="Speciale & Handmatige Tours" 
          description="Tours die handmatig zijn gecreëerd voor speciale tentoonstellingen of evenementen."
          tours={specialTours}
          icon={<Star size={20} />}
      />

    </div>
  );
}


function TourSection({ title, description, tours, icon }: any) {
    return (
        <div className="mb-10">
            <div className="flex items-center gap-2 text-xl font-bold text-slate-800 mb-2">
                {icon} <h3>{title}</h3>
            </div>
            <p className="text-sm text-slate-500 mb-4">{description}</p>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                        <tr>
                            <th className="p-4">Titel & Samenvatting</th>
                            <th className="p-4">Type</th>
                            <th className="p-4">Gepland voor</th>
                            <th className="p-4">Stops</th>
                            <th className="p-4 text-right">Acties</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {tours && tours.length > 0 ? (
                            tours.map((tour: any) => (
                                <tr key={tour.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-4">
                                        <p className="font-bold text-slate-800">{tour.title}</p>
                                        <p className="text-sm text-slate-500">{tour.summary.substring(0, 50)}...</p>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${tour.type === 'daily' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>
                                            {tour.type}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        {tour.scheduled_date ? 
                                          format(new Date(tour.scheduled_date), 'EEEE d MMMM yyyy', { locale: nl }) : 
                                          'Niet gepland'
                                        }
                                    </td>
                                    <td className="p-4 font-medium text-slate-700">
                                        {tour.artwork_ids ? tour.artwork_ids.length : 0}
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link href={`/tour/${tour.id}`} target="_blank" className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded" title="Speel Tour (Front-end)">
                                                <Play size={18} />
                                            </Link>
                                            <Link href={`/crm/tours/${tour.id}`} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded" title="Bewerk Tour">
                                                <Edit size={18} />
                                            </Link>
                                            {/* Verwijder knop hier */}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="p-12 text-center text-slate-400">
                                    Geen tours van dit type gevonden.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
