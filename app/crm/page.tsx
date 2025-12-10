import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { 
  Users, Star, Headphones, Gamepad2, Crosshair, 
  Calendar, ArrowUpRight, Shield, Activity, Brush, BookOpen 
} from 'lucide-react';

export const revalidate = 0;

export default async function CrmDashboard() {
  const supabase = createClient(cookies());
  const today = new Date().toISOString().split('T')[0];

  // We halen alle statistieken parallel op voor snelheid
  const [
    { count: userCount },
    { count: premiumCount },
    { count: tourCount },
    { count: gameCount },
    { count: focusCount },
    { count: salonCount },
    { count: academieCount },
    { data: schedule }
  ] = await Promise.all([
    supabase.from('user_profiles').select('*', { count: 'exact', head: true }),
    supabase.from('user_profiles').select('*', { count: 'exact', head: true }).eq('is_premium', true),
    supabase.from('tours').select('*', { count: 'exact', head: true }),
    supabase.from('games').select('*', { count: 'exact', head: true }),
    supabase.from('focus_items').select('*', { count: 'exact', head: true }),
    supabase.from('salons').select('*', { count: 'exact', head: true }),
    supabase.from('academie').select('*', { count: 'exact', head: true }),
    // Haal planning op voor de komende 7 dagen om de 'health' te checken
    supabase.from('dayprogram_schedule').select('day_date').gte('day_date', today).limit(7)
  ]);

  // Berekeningen
  const conversionRate = userCount ? Math.round(((premiumCount || 0) / userCount) * 100) : 0;
  const scheduledDays = schedule?.length || 0;
  const scheduleHealth = Math.min(Math.round((scheduledDays / 7) * 100), 100);

  return (
    <div>
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Dashboard</h2>
        <p className="text-slate-500">Real-time inzicht in MuseaThuis.</p>
      </header>

      {/* RIJ 1: BELANGRIJKSTE KPI'S (LEDEN & PLANNING) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
         
         {/* Totaal Leden */}
         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
             <div className="flex justify-between items-start mb-4">
                 <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><Users size={24}/></div>
                 <span className="text-xs font-bold text-green-600 flex items-center gap-1 bg-green-50 px-2 py-1 rounded">
                     <ArrowUpRight size={12}/> Live
                 </span>
             </div>
             <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Geregistreerde Leden</p>
             <h3 className="text-3xl font-bold text-slate-800 mt-1">{userCount || 0}</h3>
         </div>

         {/* Premium Leden (Conversie) */}
         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
             <div className="flex justify-between items-start mb-4">
                 <div className="p-3 bg-yellow-50 text-yellow-600 rounded-lg"><Star size={24}/></div>
                 <span className="text-xs font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded">
                     {conversionRate}% Conversie
                 </span>
             </div>
             <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Premium Abonnees</p>
             <h3 className="text-3xl font-bold text-slate-800 mt-1">{premiumCount || 0}</h3>
         </div>

         {/* Planning Gezondheid */}
         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
             <div className="flex justify-between items-start mb-4">
                 <div className={`p-3 rounded-lg ${scheduleHealth < 100 ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600'}`}>
                     <Calendar size={24}/>
                 </div>
                 <span className="text-xs font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded">
                     Komende 7 dagen
                 </span>
             </div>
             <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Planning Status</p>
             <div className="flex items-end gap-2 mt-1">
                 <h3 className="text-3xl font-bold text-slate-800">{scheduleHealth}%</h3>
                 <span className="text-sm text-slate-400 mb-1">gevuld</span>
             </div>
             {/* Progress Bar */}
             <div className="w-full bg-slate-100 h-1.5 mt-4 rounded-full overflow-hidden">
                 <div className={`h-full ${scheduleHealth < 50 ? 'bg-red-500' : scheduleHealth < 100 ? 'bg-orange-500' : 'bg-green-500'}`} style={{ width: `${scheduleHealth}%` }}></div>
             </div>
         </div>

         {/* Systeem Status */}
         <div className="bg-gradient-to-br from-midnight-900 to-midnight-950 p-6 rounded-xl shadow-sm border border-midnight-800 text-white">
             <div className="flex justify-between items-start mb-4">
                 <div className="p-3 bg-white/10 text-museum-gold rounded-lg"><Activity size={24}/></div>
                 <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)] animate-pulse"></div>
             </div>
             <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Systeem Status</p>
             <h3 className="text-lg font-bold text-white mt-1">Operationeel</h3>
             <p className="text-xs text-gray-500 mt-2">AI Engine: Online</p>
         </div>

      </div>

      {/* RIJ 2: CONTENT VOORRAAD */}
      <h3 className="text-lg font-bold text-slate-800 mb-4">Content Bibliotheek</h3>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <StatMini title="Audio Tours" count={tourCount || 0} icon={<Headphones size={20}/>} href="/crm/tours" color="bg-blue-500" />
          <StatMini title="Games / Quiz" count={gameCount || 0} icon={<Gamepad2 size={20}/>} href="/crm/games" color="bg-purple-500" />
          <StatMini title="Focus Items" count={focusCount || 0} icon={<Crosshair size={20}/>} href="/crm/focus" color="bg-pink-500" />
          <StatMini title="Salons" count={salonCount || 0} icon={<Brush size={20}/>} href="/crm/salons" color="bg-orange-500" />
          <StatMini title="Cursussen" count={academieCount || 0} icon={<BookOpen size={20}/>} href="/crm/academie" color="bg-emerald-500" />
      </div>

      {/* RIJ 3: SNEL ACTIES */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
         <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-slate-800">Snel Acties</h3>
         </div>
         <div className="flex gap-4">
            <form action="/api/cron/generate-daily" method="GET" target="_blank">
                <button className="bg-slate-800 text-white px-6 py-3 rounded-lg font-bold hover:bg-black transition-all shadow-lg shadow-slate-200/50 flex items-center gap-2">
                   ⚡ Forceer Dagelijkse Generatie
                </button>
            </form>
            <Link href="/crm/users" className="bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-lg font-bold hover:bg-slate-50 transition-colors flex items-center gap-2">
                <Users size={18}/> Beheer Leden
            </Link>
         </div>
         <p className="text-xs text-slate-400 mt-4">
            * De dagelijkse generatie draait normaal gesproken automatisch elke nacht om 04:00. Gebruik de knop hierboven alleen om te testen of gaten te vullen.
         </p>
      </div>

    </div>
  );
}

function StatMini({ title, count, icon, href, color }: any) {
    return (
        <Link href={href} className="bg-white p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg text-white ${color} group-hover:scale-110 transition-transform`}>
                    {icon}
                </div>
                <span className="text-xs text-slate-400 font-medium">Beheer &rarr;</span>
            </div>
            <h4 className="text-2xl font-bold text-slate-800">{count}</h4>
            <p className="text-xs text-slate-500 font-medium">{title}</p>
        </Link>
    )
}
