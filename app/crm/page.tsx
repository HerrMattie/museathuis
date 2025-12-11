'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabaseClient';
import Link from 'next/link';
import { Users, Crown, Activity, Image as ImageIcon, Gamepad2, Headphones, ArrowRight, Clock, TrendingUp } from 'lucide-react';

export default function CrmDashboardPage() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        premiumUsers: 0,
        activeToday: 0,
        totalArtworks: 0,
        totalGames: 0,
        totalTours: 0
    });
    const [recentActivity, setRecentActivity] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    const supabase = createClient();

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        const today = new Date().toISOString().split('T')[0];

        // 1. Parallel Data Ophalen (Snelheid!)
        const [
            users, 
            premium, 
            artworks, 
            games, 
            tours, 
            activity
        ] = await Promise.all([
            supabase.from('user_profiles').select('*', { count: 'exact', head: true }),
            supabase.from('user_profiles').select('*', { count: 'exact', head: true }).eq('is_premium', true),
            supabase.from('artworks').select('*', { count: 'exact', head: true }),
            supabase.from('games').select('*', { count: 'exact', head: true }),
            supabase.from('tours').select('*', { count: 'exact', head: true }),
            // Recente acties ophalen met user details
            supabase.from('user_activity_logs')
                .select('action_type, created_at, metadata, user_profiles(full_name)')
                .order('created_at', { ascending: false })
                .limit(10)
        ]);

        // 2. Unieke bezoekers vandaag berekenen
        const { count: todayCount } = await supabase
            .from('user_activity_logs')
            .select('user_id', { count: 'exact', head: true }) // Eigenlijk wil je distinct count, maar dit is een goede benadering voor nu
            .gte('created_at', `${today}T00:00:00`);

        setStats({
            totalUsers: users.count || 0,
            premiumUsers: premium.count || 0,
            activeToday: todayCount || 0,
            totalArtworks: artworks.count || 0,
            totalGames: games.count || 0,
            totalTours: tours.count || 0
        });

        setRecentActivity(activity.data || []);
        setLoading(false);
    };

    // Helper voor mooie labels in de feed
    const formatAction = (type: string, meta: any) => {
        switch(type) {
            case 'login': return 'is ingelogd';
            case 'complete_game': return `behaalde ${meta?.score} punten in een Game`;
            case 'view_tour': return 'startte een Audiotour';
            case 'read_focus': return 'las een Focus artikel';
            default: return 'was actief';
        }
    };

    if (loading) return (
        <div className="p-8 flex items-center gap-2 text-slate-500">
            <Activity className="animate-spin text-museum-gold"/> Dashboard laden...
        </div>
    );

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800 mb-2">Dashboard</h1>
                <p className="text-slate-500">Welkom terug, Directeur. Hier is het overzicht van vandaag.</p>
            </header>

            {/* --- STATS GRID --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                
                {/* Users Card */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Gebruikers</p>
                        <h3 className="text-3xl font-black text-slate-800">{stats.totalUsers}</h3>
                        <p className="text-xs text-green-600 font-bold flex items-center gap-1 mt-2">
                            <Crown size={12}/> {stats.premiumUsers} Premium leden
                        </p>
                    </div>
                    <div className="p-4 bg-blue-50 text-blue-600 rounded-full">
                        <Users size={24}/>
                    </div>
                </div>

                {/* Activity Card */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Acties Vandaag</p>
                        <h3 className="text-3xl font-black text-slate-800">{stats.activeToday}</h3>
                        <p className="text-xs text-slate-400 font-bold flex items-center gap-1 mt-2">
                            <TrendingUp size={12}/> Interacties
                        </p>
                    </div>
                    <div className="p-4 bg-green-50 text-green-600 rounded-full">
                        <Activity size={24}/>
                    </div>
                </div>

                {/* Content Card */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Collectie Grootte</p>
                        <h3 className="text-3xl font-black text-slate-800">{stats.totalArtworks}</h3>
                        <p className="text-xs text-slate-400 font-bold flex items-center gap-1 mt-2">
                            Kunstwerken in database
                        </p>
                    </div>
                    <div className="p-4 bg-purple-50 text-purple-600 rounded-full">
                        <ImageIcon size={24}/>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* --- LIVE FEED (Links, Breed) --- */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="font-bold text-slate-800">Recente Activiteit</h3>
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                    </div>
                    <div className="divide-y divide-slate-50">
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
                        {recentActivity.length === 0 && (
                            <div className="p-8 text-center text-slate-400 text-sm">Nog geen activiteit vandaag.</div>
                        )}
                    </div>
                </div>

                {/* --- SNELKOPPELINGEN (Rechts, Smal) --- */}
                <div className="space-y-6">
                    
                    {/* Content Overzicht */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                        <h3 className="font-bold text-slate-800 mb-4">Content Status</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Headphones size={16}/></div>
                                    <span className="text-sm font-medium text-slate-600">Audiotours</span>
                                </div>
                                <span className="font-bold text-slate-800">{stats.totalTours}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><Gamepad2 size={16}/></div>
                                    <span className="text-sm font-medium text-slate-600">Games</span>
                                </div>
                                <span className="font-bold text-slate-800">{stats.totalGames}</span>
                            </div>
                        </div>
                        <div className="mt-6 pt-4 border-t border-slate-100">
                            <Link href="/crm/import" className="block w-full py-2 bg-slate-900 text-white text-center rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors">
                                + Nieuwe Content Importeren
                            </Link>
                        </div>
                    </div>

                    {/* Weekplanning Link */}
                    <Link href="/crm/week" className="block bg-museum-gold rounded-xl p-6 shadow-lg shadow-yellow-900/10 hover:shadow-xl transition-all group">
                        <h3 className="font-bold text-black mb-1 group-hover:underline">Weekplanning</h3>
                        <p className="text-sm text-yellow-900/80 mb-4">Beheer het dagprogramma.</p>
                        <div className="flex justify-end">
                            <div className="w-8 h-8 bg-black/10 rounded-full flex items-center justify-center text-black">
                                <ArrowRight size={16}/>
                            </div>
                        </div>
                    </Link>

                </div>
            </div>
        </div>
    );
}
