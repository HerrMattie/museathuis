'use client';

import { useState } from 'react';
import { Sparkles, Loader2, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabaseClient';
import Link from 'next/link';

export default function TourActions() {
   const [loading, setLoading] = useState(false);
   const router = useRouter();
   const supabase = createClient();

   const handleQuickGen = async () => {
       const topic = prompt("Waar moet de audiotour over gaan?");
       if (!topic) return;
       
       setLoading(true);
       try {
           // 1. AI Aanroep
           const res = await fetch('/api/ai/generate-tour', { 
               method: 'POST', body: JSON.stringify({ topic }) 
           });
           
           if (!res.ok) throw new Error("AI request mislukt");
           const data = await res.json();
           if (data.error) throw new Error(data.error);

           // 2. Opslaan (De AI geeft nu een 'stops' array terug in de JSON)
           // We slaan de hele structuur op in 'stops_data' (JSONB kolom)
           const { error } = await supabase
               .from('tours')
               .insert({
                   title: data.title,
                   intro: data.intro_text || data.intro,
                   stops_data: { stops: data.stops }, // Opslaan als JSON
                   status: 'published',
                   type: 'manual',
                   is_premium: true
               });

           if (error) throw error;

           router.refresh();
           
       } catch(e: any) { 
           alert("Fout bij genereren: " + e.message); 
       } finally {
           setLoading(false);
       }
   };

   return (
       <div className="flex gap-3">
           <button onClick={handleQuickGen} disabled={loading} className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-purple-200 transition-colors">
               {loading ? <Loader2 className="animate-spin" size={18}/> : <Sparkles size={18}/>}
               Snel Genereren
           </button>
           <Link href="/crm/tours/new" className="bg-museum-gold text-black px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-yellow-500 transition-colors">
               <Plus size={18}/> Nieuwe Tour
           </Link>
       </div>
   );
}
