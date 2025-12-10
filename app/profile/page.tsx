import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { LogOut, LayoutDashboard, Heart, History, PlayCircle } from 'lucide-react';
import LevelCard from '@/components/profile/LevelCard';
import BadgeGrid from '@/components/profile/BadgeGrid';
import OnboardingWizard from '@/components/profile/OnboardingWizard';

export const revalidate = 0;

export default async function ProfilePage() {
  const supabase = createClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // 1. Haal Profiel & Stats
  const { data: profile } = await supabase.from('user_profiles').select('*').eq('user_id', user.id).single();
  const { count: actionCount } = await supabase.from('user_activity_logs').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
  const { count: favCount } = await supabase.from('favorites').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
  const { data: userBadges } = await supabase.from('user_badges').select('badge_id').eq('user_id', user.id);

  // 2. Haal RECENTE HISTORIE (Unieke content items uit logs)
  // We halen de laatste 20 logs op en filteren unieke items eruit in JS
  const { data: recentLogs } = await supabase
    .from('user_activity_logs')
    .select('entity_id, action_type, metadata, created_at')
    .in('action_type', ['page_view', 'complete_tour'])
    .not('entity_id', 'is', null) // Alleen logs met ID
    .order('created_at', { ascending: false })
    .limit(20);

  // Filter dubbelen (unieke ID's) en pak de eerste 3
  const uniqueHistory = Array.from(new Set(recentLogs?.map(l => l.entity_id)))
    .map(id => recentLogs?.find(l => l.entity_id === id))
    .slice(0, 3);

  const stats = {
      total_actions: actionCount || 0,
      fav_count: favCount || 0
  };

  const earnedBadgeIds = userBadges?.map((b: any) => b.badge_id) || [];

  return (
    <div className="min-h-screen bg-midnight-950 text-white font-sans p-6 md:p-12 flex flex-col items-center">
      <div className="max-w-4xl w-full">
        
        {/* 1. HEADER MET AVATAR & STREAK */}
        <LevelCard userProfile={profile} stats={stats} />

        {/* 2. RECENT BEKEKEN (NIEUW) */}
        {uniqueHistory.length > 0 && (
            <div className="mb-8">
                <h3 className="font-serif text-xl mb-4 flex items-center gap-2 text-gray-300">
                    <History size={18} className="text-museum-gold"/> Verder kijken
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {uniqueHistory.map((log: any) => {
                         // Fallback data uit metadata of generiek
                         const type = log.metadata?.type || 'Item';
                         const path = log.metadata?.path || '#';
                         return (
                            <Link key={log.entity_id} href={path} className="group bg-white/5 border border-white/5 p-4 rounded-xl flex items-center gap-4 hover:bg-white/10 transition-all">
                                <div className="w-10 h-10 rounded-full bg-museum-gold/20 text-museum-gold flex items-center justify-center group-hover:bg-museum-gold group-hover:text-black transition-colors">
                                    <PlayCircle size={20}/>
                                </div>
                                <div className="overflow-hidden">
                                    <div className="text-xs uppercase font-bold text-gray-500 tracking-wider mb-0.5">{type}</div>
                                    <div className="text-sm font-bold truncate text-gray-200 group-hover:text-white">Ga verder</div>
                                </div>
                            </Link>
                         );
                    })}
                </div>
            </div>
        )}

        {/* 3. ERE-GALERIJ (Met link naar alle achievements) */}
        <div className="flex justify-between items-end mb-4">
             <h3 className="font-serif text-xl flex items-center gap-2 text-white">
                <span className="text-museum-gold">✦</span> Ere-Galerij
             </h3>
             <Link href="/achievements" className="text-xs text-museum-gold hover:underline mb-1 font-bold tracking-wider">
                 BEKIJK ALLE BADGES &rarr;
             </Link>
        </div>
        <BadgeGrid earnedBadges={earnedBadgeIds} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            <div className="lg:col-span-2 space-y-8">
                {/* 4. DATA WIZARD */}
                <OnboardingWizard profile={profile} user={user} isOnboardingPage={false} />
            </div>

            <div className="space-y-6">
                {/* 5. COLLECTIE WIDGET */}
                <div className="bg-midnight-900 border border-white/10 rounded-xl p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-red-500/20 transition-colors"></div>
                    <h3 className="font-bold mb-4 flex items-center gap-2 relative z-10"><Heart className="text-red-500" size={18}/> Collectie</h3>
                    
                    <div className="text-center py-8 bg-black/20 rounded-lg relative z-10">
                        <div className="text-4xl font-serif font-bold text-white mb-1">{favCount}</div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider">Items bewaard</div>
                    </div>
                    
                    <Link href="/favorites" className="block mt-4 text-center text-sm font-bold bg-white/5 py-3 rounded-lg hover:bg-white/10 transition-colors text-white">
                        Bekijk mijn collectie
                    </Link>
                </div>

                {/* ADMIN & LOGOUT */}
                {profile?.is_admin && (
                    <Link href="/crm" className="flex items-center gap-3 p-4 rounded-xl bg-blue-900/20 border border-blue-500/30 text-blue-200 hover:bg-blue-900/40 transition-colors">
                        <div className="bg-blue-500 p-2 rounded-lg text-white"><LayoutDashboard size={18}/></div>
                        <div>
                            <div className="font-bold text-sm">CRM Dashboard</div>
                            <div className="text-xs opacity-70">Beheerders toegang</div>
                        </div>
                    </Link>
                )}

                <form action="/auth/signout" method="post">
                    <button className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border border-white/5 hover:bg-red-900/20 hover:text-red-400 hover:border-red-900/30 transition-colors text-gray-400 font-medium">
                        <LogOut size={18} /> Uitloggen
                    </button>
                </form>
            </div>
        </div>

      </div>
    </div>
  );
}
