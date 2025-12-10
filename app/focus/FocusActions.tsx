'use client';

import { useState } from 'react';
import { Sparkles, Loader2, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabaseClient';
import Link from 'next/link';

export default function FocusActions() {
   const [loading, setLoading] = useState(false);
   const router = useRouter();
   const supabase = createClient();

   const handleQuickGen = async () => {
       const topic = prompt("Over welk kunstwerk/onderwerp gaat dit Focus item?");
       if (!topic) return;
       
       setLoading(true);
       try {
           const res = await fetch('/api/ai/generate-focus', { 
               method: 'POST', 
               body: JSON.stringify({ topic }) 
           });
           
           if (!res.ok) throw new Error("AI request mislukt");
           const data = await res.json();
           if (data.error) throw new Error(data.error);

           const { error } = await supabase
               .from('focus_items')
               .insert({
                   title: data.title,
                   intro: data.short_description, // Let op veldnaam
                   content_markdown: data.content_markdown,
                   audio_script_main: data.audio_script_main, // Als de AI dit meegeeft
                   status: 'published',
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
           <button 
               onClick={handleQuickGen} 
               disabled={loading} 
               className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-purple-200 transition-colors"
           >
               {loading ? <Loader2 className="animate-spin" size={18}/> : <Sparkles size={18}/>}
               Snel Genereren
           </button>
           <Link 
               href="/crm/focus/new" 
               className="bg-museum-gold text-black px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-yellow-500 transition-colors"
           >
               <Plus size={18}/> Nieuw Focus Item
           </Link>
       </div>
   );
}
