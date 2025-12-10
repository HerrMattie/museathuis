'use client';
import { useState } from 'react';
import { Sparkles, Loader2, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function GameActions() {
   const [loading, setLoading] = useState(false);
   const router = useRouter();

   const handleQuickGen = async () => {
       const topic = prompt("Onderwerp voor de Quiz?");
       if (!topic) return;
       setLoading(true);
       try {
           const res = await fetch('/api/ai/generate-game', { 
               method: 'POST', body: JSON.stringify({ topic }) 
           });
           const data = await res.json();
           // We moeten de game ook opslaan in de DB om hem te zien
           // ... (Hier zou je een save actie moeten doen, of de API laten saven)
           alert("Gegenereerd! (Check de console of database, implementatie vereist save)");
       } catch(e) { alert("Fout"); }
       setLoading(false);
       router.refresh();
   };

   return (
       <div className="flex gap-3">
           <button onClick={handleQuickGen} disabled={loading} className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg font-bold flex items-center gap-2">
               {loading ? <Loader2 className="animate-spin" size={18}/> : <Sparkles size={18}/>}
               Snel Genereren
           </button>
           <Link href="/crm/games/new" className="bg-museum-gold text-black px-4 py-2 rounded-lg font-bold flex items-center gap-2">
               <Plus size={18}/> Nieuwe Quiz
           </Link>
       </div>
   );
}
