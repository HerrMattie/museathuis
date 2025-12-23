'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
    PieChart, Pie, Cell, LineChart, Line 
} from 'recharts';
import { Loader2, TrendingUp, Users, CreditCard, Lightbulb } from 'lucide-react';

const COLORS = ['#D4AF37', '#1e293b', '#64748b', '#94a3b8', '#cbd5e1']; // Goud & Leisteen tinten

export default function AnalyticsDashboard() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const supabase = createClient();

    useEffect(() => {
        analyzeData();
    }, []);

    const analyzeData = async () => {
        // 1. Haal ALLE profielen op voor correlatie-analyse
        const { data: users } = await supabase.from('user_profiles').select('*');
        const { data: logs } = await supabase.from('user_activity_logs').select('action_type, created_at').order('created_at', { ascending: true });

        if (!users || !logs) return;

        // --- ANALYSE 1: Leeftijd vs. Premium (De "Koopkracht" Grafiek) ---
        const ageGroups = ["18-24", "25-39", "40-59", "60-74", "75+"];
        const ageData = ageGroups.map(group => {
            const groupUsers = users.filter(u => u.age_group === group);
            const premiumCount = groupUsers.filter(u => u.is_premium).length;
            return {
                name: group,
                Totaal: groupUsers.length,
                Premium: premiumCount,
                Conversie: groupUsers.length > 0 ? Math.round((premiumCount / groupUsers.length) * 100) : 0
            };
        });

        // --- ANALYSE 2: Cultureel DNA (Populairste Periodes) ---
        const periodCounts: Record<string, number> = {};
        users.forEach(u => {
            if (Array.isArray(u.favorite_periods)) {
                u.favorite_periods.forEach((p: string) => {
                    periodCounts[p] = (periodCounts[p] || 0) + 1;
                });
            }
        });
        const periodData = Object.entries(periodCounts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value) // Sorteer hoog naar laag
            .slice(0, 5); // Top 5

        // --- ANALYSE 3: Museumkaart Penetratie ---
        const cardHolders = users.filter(u => 
            (Array.isArray(u.museum_cards) && u.museum_cards.includes('Museumkaart')) || u.has_museum_card
        ).length;
        const cardData = [
            { name: 'Wel Kaart', value: cardHolders },
            { name: 'Geen Kaart', value: users.length - cardHolders }
        ];

        // --- ANALYSE 4: Groei (Activiteit laatste 7 dagen) ---
        // We groeperen logs per dag
        const activityTrend: Record<string, number> = {};
        logs.forEach(log => {
            const date = new Date(log.created_at).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' });
            activityTrend[date] = (activityTrend[date] || 0) + 1;
        });
        // Pak alleen de laatste 7 unieke dagen uit de logs
        const trendData = Object.entries(activityTrend).slice(-7).map(([date, count]) => ({ date, Acties: count }));


        // --- DE "INTELLIGENCE" CONCLUSIES ---
        // Hier berekenen we tekstuele inzichten
        const totalUsers = users.length;
        const bestConvertingAge = ageData.reduce((prev, current) => (prev.Conversie > current.Conversie) ? prev : current);
        
        setData({
            ageData,
            periodData,
            cardData,
            trendData,
            insights: {
                cardPercentage: Math.round((cardHolders / totalUsers) * 100),
                bestAge: bestConvertingAge.name,
                topPeriod: periodData[0]?.name || 'Onbekend'
            }
        });
        setLoading(false);
    };

    if (loading) return <div className="p-12 text-center text-slate-400"><Loader2 className="animate-spin inline mr-2"/>Analyseren van {data?.totalUsers || '...'} profielen...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            
            {/* --- TOP ROW: STRATEGISCHE INZICHTEN --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-xl text-white shadow-lg border border-slate-700">
                    <h4 className="text-museum-gold text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Users size={14}/> Beste Doelgroep
                    </h4>
                    <p className="text-2xl font-serif">De groep <span className="text-museum-gold">{data.insights.bestAge}</span></p>
                    <p className="text-sm text-slate-400 mt-1">Converteert het vaakst naar Premium.</p>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h4 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                        <CreditCard size={14}/> Museumkaart Bezit
                    </h4>
                    <div className="flex items-end gap-2">
                        <span className="text-4xl font-black text-slate-800">{data.insights.cardPercentage}%</span>
                        <span className="text-sm text-slate-500 mb-1">van alle leden</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
                        <div className="bg-blue-600 h-full rounded-full" style={{ width: `${data.insights.cardPercentage}%` }} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h4 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Lightbulb size={14}/> Dominante Smaak
                    </h4>
                    <p className="text-2xl font-bold text-slate-800">{data.insights.topPeriod}</p>
                    <p className="text-sm text-slate-500 mt-1">Is de meest gekozen favoriete periode.</p>
                </div>
            </div>

            {/* --- MID ROW: GRAFIEKEN --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* GRAFIEK 1: Demografie & Conversie */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-6">Ledengroei & Premium Verdeling per Leeftijd</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.ageData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="Totaal" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="Premium" fill="#D4AF37" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* GRAFIEK 2: Cultureel DNA */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-6">Top 5 Favoriete Kunstperiodes</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data.periodData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {data.periodData.map((entry:any, index:number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend layout="vertical" verticalAlign="middle" align="right" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* GRAFIEK 3: Activiteit Trend */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-2">
                    <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <TrendingUp size={20} className="text-green-500"/>
                        Activiteit Trend (Laatste 7 dagen)
                    </h3>
                    <div className="h-[250px] w-full">
                         <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data.trendData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="Acties" stroke="#D4AF37" strokeWidth={3} dot={{r: 4}} activeDot={{r: 8}} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
