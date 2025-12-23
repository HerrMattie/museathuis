'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
    PieChart, Pie, Cell, LineChart, Line, AreaChart, Area,
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { Loader2, TrendingUp, Users, CreditCard, Lightbulb, Clock, Smartphone, MapPin, GraduationCap } from 'lucide-react';

const COLORS = ['#D4AF37', '#1e293b', '#64748b', '#94a3b8', '#cbd5e1', '#e2e8f0'];
const RADAR_COLORS = ['#D4AF37', '#3b82f6'];

export default function AnalyticsDashboard() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const supabase = createClient();

    useEffect(() => {
        analyzeData();
    }, []);

    const analyzeData = async () => {
        // 1. DATA OPHALEN (Alles)
        const { data: users } = await supabase.from('user_profiles').select('*');
        // We halen meer logs op voor een betere tijd-analyse (limit 5000)
        const { data: logs } = await supabase.from('user_activity_logs')
            .select('action_type, created_at, meta_data, user_id')
            .order('created_at', { ascending: true })
            .limit(5000);

        if (!users || !logs) return;

        // --- ANALYSE 1: TIJDSTIP VAN ACTIVITEIT (Heatmap vervanger) ---
        // Wanneer gebruiken mensen de app? (Ochtend, Middag, Avond)
        const hours = Array(24).fill(0);
        logs.forEach(log => {
            const hour = new Date(log.created_at).getHours();
            hours[hour]++;
        });
        const timeData = hours.map((count, hour) => ({
            uur: `${hour}:00`,
            Activiteit: count
        }));

        // --- ANALYSE 2: PROVINCIE VERDELING (Geografisch) ---
        const provinceCounts: Record<string, number> = {};
        users.forEach(u => {
            const prov = u.province || 'Onbekend';
            provinceCounts[prov] = (provinceCounts[prov] || 0) + 1;
        });
        const geoData = Object.entries(provinceCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 7) // Top 7 Provincies
            .map(([name, value]) => ({ name, Gebruikers: value }));

        // --- ANALYSE 3: OPLEIDING & PREMIUM (Correlatie) ---
        // Kijken of opleidingsniveau invloed heeft op premium status
        const eduLevels = ["VMBO", "HAVO", "VWO", "MBO", "HBO", "WO", "PhD"];
        const eduData = eduLevels.map(level => {
            const group = users.filter(u => u.education_level === level);
            const premium = group.filter(u => u.is_premium).length;
            return {
                name: level,
                Totaal: group.length,
                Premium: premium,
                // Voorkom delen door nul
                Ratio: group.length > 0 ? Math.round((premium / group.length) * 100) : 0
            };
        });

        // --- ANALYSE 4: DEVICE GEBRUIK (Tech) ---
        const deviceCounts: Record<string, number> = {};
        users.forEach(u => {
            const dev = u.primary_device || 'Onbekend';
            deviceCounts[dev] = (deviceCounts[dev] || 0) + 1;
        });
        const deviceData = Object.entries(deviceCounts).map(([name, value]) => ({ name, value }));

        // --- ANALYSE 5: MUSEUMKAART EFFECT (Gedrag) ---
        // Zijn kaarthouders actiever?
        const cardHolders = users.filter(u => u.museum_cards && u.museum_cards.length > 0);
        const nonHolders = users.filter(u => !u.museum_cards || u.museum_cards.length === 0);
        
        // Gemiddelde logs per gebruiker berekenen
        const calcAvgActivity = (userGroup: any[]) => {
            if (userGroup.length === 0) return 0;
            const ids = userGroup.map(u => u.user_id);
            const groupLogs = logs.filter(l => ids.includes(l.user_id)).length;
            return Math.round(groupLogs / userGroup.length);
        };

        const behaviorData = [
            { name: 'Met Museumkaart', ActiviteitScore: calcAvgActivity(cardHolders) },
            { name: 'Zonder Kaart', ActiviteitScore: calcAvgActivity(nonHolders) }
        ];

        // --- ANALYSE 6: INTERESSE RADAR (Cultureel DNA) ---
        // Vergelijk populariteit van periodes
        const periodCounts: Record<string, number> = {};
        users.forEach(u => {
            if (Array.isArray(u.favorite_periods)) {
                u.favorite_periods.forEach((p: string) => periodCounts[p] = (periodCounts[p] || 0) + 1);
            }
        });
        // Pak top 6 voor de radar
        const radarData = Object.entries(periodCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 6)
            .map(([subject, A]) => ({ subject, A, fullMark: users.length }));

        
        // --- DATA OPSLAAN ---
        setData({
            timeData,
            geoData,
            eduData,
            deviceData,
            behaviorData,
            radarData,
            totalLogs: logs.length
        });
        setLoading(false);
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-64 text-slate-400">
            <Loader2 className="animate-spin mb-4" size={32}/>
            <p>De Data Machine draait...</p>
            <p className="text-xs">Miljoenen datapunten analyseren (grapje, maar bijna)</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            
            {/* RIJ 1: GEDRAG & TIJD (Wanneer & Hoe) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Tijdstip Grafiek */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                        <Clock size={18} className="text-blue-500"/> Piekuren Analyse
                    </h3>
                    <p className="text-xs text-slate-400 mb-6">Wanneer is de beste tijd voor nieuwsbrieven/notificaties?</p>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.timeData}>
                                <defs>
                                    <linearGradient id="colorTime" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="uur" interval={3} />
                                <YAxis />
                                <Tooltip />
                                <Area type="monotone" dataKey="Activiteit" stroke="#D4AF37" fillOpacity={1} fill="url(#colorTime)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Device Pie Chart */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                        <Smartphone size={18} className="text-slate-500"/> Apparaat Voorkeur
                    </h3>
                    <p className="text-xs text-slate-400 mb-6">Waarop wordt de content geconsumeerd?</p>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data.deviceData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {data.deviceData.map((entry:any, index:number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* RIJ 2: DEMOGRAFIE & LOCATIE (Wie & Waar) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Provincie Bar Chart */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                        <MapPin size={18} className="text-red-500"/> Top Locaties
                    </h3>
                    <p className="text-xs text-slate-400 mb-6">In welke provincies wonen je gebruikers?</p>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart layout="vertical" data={data.geoData}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                <XAxis type="number" />
                                <YAxis dataKey="name" type="category" width={100} />
                                <Tooltip />
                                <Bar dataKey="Gebruikers" fill="#1e293b" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Opleiding vs Premium */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                        <GraduationCap size={18} className="text-green-600"/> Opleiding & Premium Ratio
                    </h3>
                    <p className="text-xs text-slate-400 mb-6">Welk opleidingsniveau converteert het best?</p>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.eduData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip cursor={{fill: 'transparent'}} />
                                <Legend />
                                <Bar dataKey="Totaal" fill="#e2e8f0" stackId="a" />
                                <Bar dataKey="Premium" fill="#D4AF37" stackId="a" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* RIJ 3: DIEPTE INZICHTEN (Correlaties) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Museumkaart Impact */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                        <CreditCard size={18} className="text-purple-600"/> Museumkaart Effect
                    </h3>
                    <p className="text-xs text-slate-400 mb-6">Zijn kaarthouders actiever op het platform?</p>
                    <div className="h-[250px] w-full mt-8">
                         <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.behaviorData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="ActiviteitScore" fill="#8884d8" name="Gem. Acties p/p">
                                    {data.behaviorData.map((entry:any, index:number) => (
                                        <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#64748b'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 text-center text-sm text-slate-500 italic">
                        *Gemiddeld aantal acties per gebruiker in deze groep
                    </div>
                </div>

                {/* Culturele Vingerafdruk (Radar) */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                        <Lightbulb size={18} className="text-yellow-500"/> Culturele Vingerafdruk
                    </h3>
                    <p className="text-xs text-slate-400 mb-6">Hoe verhouden de interesses zich tot elkaar?</p>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data.radarData}>
                                <PolarGrid />
                                <PolarAngleAxis dataKey="subject" />
                                <PolarRadiusAxis />
                                <Radar
                                    name="Interesse"
                                    dataKey="A"
                                    stroke="#D4AF37"
                                    fill="#D4AF37"
                                    fillOpacity={0.6}
                                />
                                <Tooltip />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
