'use client';

import { useState } from 'react';
import { Sparkles, Loader2, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabaseClient';
import Link from 'next/link';

export default function SalonActions() {
   const [loading, setLoading] = useState(false);
   const router = useRouter();
   const supabase = createClient();

   const handleQuickGen = async () => {
       const topic = prompt("Wat is het thema van deze Salon collectie?");
       if (!topic) return;
       
       setLoading(true);
       try {
           const res = await fetch('/api/ai/generate-salon', { 
               method: 'POST', 
               body: JSON.stringify({ topic }) 
           });
           
           if (!res.ok) throw new Error("AI request mislukt");
           const data = await res.json();
           if (data.error) throw new Error(data.error);

           const { error } = await supabase
               .from('salons')
               .insert({
                   title: data.title,
                   short_description: data.short_description,
                   content_markdown: data.content_markdown,
                   status: 'published'
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
           <button 
               onClick={handleQuickGen} 
               disabled={loading} 
               className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-purple-200 transition-colors"
           >
               {loading ? <Loader2 className="animate-spin" size={18}/> : <Sparkles size={18}/>}
               Snel Genereren
           </button>
           <Link 
               href="/crm/salons/new" 
               className="bg-museum-gold text-black px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-yellow-500 transition-colors"
           >
               <Plus size={18}/> Nieuwe Salon
           </Link>
       </div>
   );
}
