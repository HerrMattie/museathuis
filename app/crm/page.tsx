'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabaseClient';
import Link from 'next/link';
import { 
    Users, Crown, Activity, Image as ImageIcon, Gamepad2, Headphones, 
    ArrowRight, Clock, TrendingUp, Newspaper, Coffee, Eye, 
    LayoutDashboard, PieChart 
} from 'lucide-react';
import ExportButton from '@/components/crm/ExportButton';
import AnalyticsDashboard from '@/components/crm/AnalyticsDashboard';

export default function CrmDashboardPage() {
    // --- STATE VOOR TABBLADEN ---
    const [activeView, setActiveView] = useState<'operational' | 'analytics'>('operational');

    // --- STATE VOOR OPERATIONEEL DASHBOARD ---
    const [stats, setStats] = useState({
        totalUsers: 0,
        premiumUsers: 0,
        activeToday: 0,
        totalArtworks: 0,
        totalGames: 0,
        totalTours: 0,
        totalFocus: 0, 
        totalSalons: 0 
    });
    
    const [topPages, setTopPages] = useState<any[]>([]);
    const [avgDuration, setAvgDuration] = useState(0);
    const [recentActivity, setRecentActivity] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    const supabase = createClient();

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        const today = new Date().toISOString().split('T')[0];

        // 1. DATA OPHALEN
        const [
            users, premium, artworks, games, tours, focus, salons, activity, analyticsData
        ] = await Promise.all([
            supabase.from('user_profiles').select('*', { count: 'exact', head: true }),
            supabase.from('user_profiles').select('*', { count: 'exact', head: true }).eq('is_premium', true),
            supabase.from('artworks').select('*', { count: 'exact', head: true }),
            supabase.from('games').select('*', { count: 'exact', head: true }),
            supabase.from('tours').select('*', { count: 'exact', head: true }),
            supabase.from('focus_items').select('*', { count: 'exact', head: true }),
            supabase.from('salons').select('*', { count: 'exact', head: true }),
            
            // Recente acties voor de feed (limiet 10)
            supabase.from('user_activity_logs')
                .select('action_type, created_at, meta_data, user_profiles(full_name)')
                .order('created_at', { ascending: false })
                .limit(10),

            // Ruwe data voor snelle client-side berekeningen (laatste 1000)
            supabase.from('user_activity_logs')
                .select('action_type, meta_data')
                .order('created_at', { ascending: false })
                .limit(1000)
        ]);

        // 2. Unieke bezoekers vandaag
        const { count: todayCount } = await supabase
            .from('user_activity_logs')
            .select('user_id', { count: 'exact', head: true })
            .gte('created_at', `${today}T00:00:00`);

        // 3. ANALYSE BEREKENEN (In de browser)
        const logs = analyticsData.data || [];
        
        // A. Populaire Pagina's & Duur
        const pageCounts: Record<string, number> = {};
        let totalDuration = 0;
        let durationCount = 0;

        logs.forEach(log => {
            let meta: any = {};
            try { meta = typeof log.meta_data === 'string' ? JSON.parse(log.meta_data) : log.meta_data; } catch {}

            // Tel pagina bezoeken
            if (log.action_type === 'page_view' && meta.path) {
                // Pak eerste deel van URL (bijv. 'tour', 'game') of 'Home'
                const cleanPath = meta.path.split('/')[1] || 'Home'; 
                // Maak eerste letter hoofdletter
                const formattedName = cleanPath.charAt(0).toUpperCase() + cleanPath.slice(1);
                pageCounts[formattedName] = (pageCounts[formattedName] || 0) + 1;
            }

            // Bereken gemiddelde tijd
            if (log.action_type === 'time_spent' && meta.duration) {
                totalDuration += meta.duration;
                durationCount++;
            }
        });

        // Sorteer pagina's op populariteit
        const sortedPages = Object.entries(pageCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5) // Top 5
            .map(([name, count]) => ({ name, count }));

        setTopPages(sortedPages);
        setAvgDuration(durationCount > 0 ? Math.round(totalDuration / durationCount) : 0);

        setStats({
            totalUsers: users.count || 0,
            premiumUsers: premium.count || 0,
            activeToday: todayCount || 0,
            totalArtworks: artworks.count || 0,
            totalGames: games.count || 0,
            totalTours: tours.count || 0,
            totalFocus: focus.count || 0,
            totalSalons: salons.count || 0 
        });

        setRecentActivity(activity.data || []);
        setLoading(false);
    };

    const formatAction = (type: string, meta: any) => {
         switch(type) {
            case 'login': return 'is ingelogd';
            case 'complete_game': return `behaalde ${meta?.score} punten in een Game`;
            case 'view_tour': return 'startte een Audiotour';
            case 'read_focus': return 'las een Focus artikel';
            case 'visit_salon': return 'bezocht de Galerij';
            case 'submit_contact': return 'verstuurde contactformulier';
            default: return 'was actief';
        }
    };

    if (loading) return (
        <div className="p-8 flex items-center gap-2 text-slate-500">
            <Activity className="animate-spin text-museum-gold"/> Dashboard laden...
        </div>
    );

    return (
        <div className="p-8 max-w-7xl mx-auto min-h-screen bg-slate-50">
            <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 mb-2">Management Dashboard</h1>
                    <p className="text-slate-500">Welkom terug, Directeur. Hier is het overzicht.</p>
                </div>
                <div className="flex gap-3">
                    <ExportButton />
                </div>
            </header>

            {/* --- TAB NAVIGATIE --- */}
            <div className="flex gap-4 mb-8 border-b border-slate-200">
                <button 
                    onClick={() => setActiveView('operational')}
                    className={`pb-4 px-4 flex items-center gap-2 font-bold transition-colors border-b-2 ${activeView === 'operational' ? 'border-museum-gold text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                    <LayoutDashboard size={18}/> Operationeel Overzicht
                </button>
                <button 
                    onClick={() => setActiveView('analytics')}
                    className={`pb-4 px-4 flex items-center gap-2 font-bold transition-colors border-b-2 ${activeView === 'analytics' ? 'border-museum-gold text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                    <PieChart size={18}/> Strategische Analyse
                </button>
            </div>

            {/* === VIEW 1: OPERATIONEEL DASHBOARD === */}
            {activeView === 'operational' && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    
                    {/* KPI RIJ */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Gebruikers</p>
                            <h3 className="text-3xl font-black text-slate-800">{stats.totalUsers}</h3>
                            <p className="text-xs text-green-600 font-bold mt-2"><Crown size={12} className="inline mr-1"/>{stats.premiumUsers} Premium</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Actief Vandaag</p>
                            <h3 className="text-3xl font-black text-slate-800">{stats.activeToday}</h3>
                            <p className="text-xs text-slate-400 mt-2">Unieke sessies</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Gem. Sessieduur</p>
                            <h3 className="text-3xl font-black text-slate-800">{avgDuration}s</h3>
                            <p className="text-xs text-slate-400 mt-2">Per pagina weergave</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Content Items</p>
                            <h3 className="text-3xl font-black text-slate-800">{stats.totalArtworks + stats.totalGames + stats.totalTours}</h3>
                            <p className="text-xs text-slate-400 mt-2">Totaal in database</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        
                        {/* ANALYSE: POPULAIRE PAGINA'S */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <Eye size={20} className="text-blue-500"/>
                                Populairste Onderdelen
                            </h3>
                            <div className="space-y-4">
                                {topPages.map((page, i) => (
                                    <div key={i} className="flex items-center gap-4">
                                        <span className="w-6 h-6 flex items-center justify-center bg-slate-100 rounded-full text-xs font-bold text-slate-500">{i + 1}</span>
                                        <div className="flex-1">
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="font-medium text-slate-700">{page.name}</span>
                                                <span className="text-slate-400">{page.count} views</span>
                                            </div>
                                            {/* Progress Bar */}
                                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-blue-500 rounded-full" 
                                                    style={{ width: `${(page.count / topPages[0].count) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {topPages.length === 0 && <p className="text-sm text-slate-400">Nog niet genoeg data voor analyse.</p>}
                            </div>
                        </div>

                        {/* LIVE FEED */}
                        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                <h3 className="font-bold text-slate-800">Live Activiteit</h3>
                                <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                </span>
                            </div>
                            <div className="divide-y divide-slate-50 max-h-[400px] overflow-y-auto">
                                {recentActivity.map((log: any, i) => (
                                    <div key={i} className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xs">
                                            {log.user_profiles?.full_name?.[0] || '?'}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm text-slate-700">
                                                <span className="font-bold">{log.user_profiles?.full_name || 'Iemand'}</span> {formatAction(log.action_type, log.metadata)}
                                            </p>
                                            <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
                                                <Clock size={10}/> {new Date(log.created_at).toLocaleTimeString('nl-NL')}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* FOOTER LINKS */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                        <Link href="/crm/import" className="bg-slate-900 text-white p-4 rounded-xl text-center font-bold hover:bg-slate-800 transition-colors">
                            + Nieuwe Content
                        </Link>
                        <Link href="/crm/schedule" className="bg-museum-gold text-black p-4 rounded-xl text-center font-bold hover:bg-yellow-500 transition-colors">
                            Weekplanning Beheren
                        </Link>
                        <button onClick={() => alert("Coming soon: Mailchimp koppeling")} className="bg-white border border-slate-200 text-slate-600 p-4 rounded-xl text-center font-bold hover:bg-slate-50 transition-colors">
                            Nieuwsbrief Versturen
                        </button>
                    </div>
                </div>
            )}

            {/* === VIEW 2: STRATEGISCHE ANALYSE (Nieuw) === */}
            {activeView === 'analytics' && (
                <AnalyticsDashboard />
            )}
        </div>
    );
}
