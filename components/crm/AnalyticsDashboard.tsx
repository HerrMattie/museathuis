'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
    PieChart, Pie, Cell, LineChart, Line, AreaChart, Area,
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { 
    Loader2, TrendingUp, Users, CreditCard, Lightbulb, Clock, 
    Smartphone, MapPin, GraduationCap, Timer, AlertTriangle, Trophy 
} from 'lucide-react';

const COLORS = ['#D4AF37', '#1e293b', '#64748b', '#94a3b8', '#cbd5e1', '#e2e8f0'];

export default function AnalyticsDashboard() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const supabase = createClient();

    useEffect(() => {
        analyzeData();
    }, []);

    const analyzeData = async () => {
        // 1. DATA OPHALEN
        const { data: users } = await supabase.from('user_profiles').select('*');
        const { data: logs } = await supabase.from('user_activity_logs')
            .select('action_type, created_at, meta_data, user_id')
            .order('created_at', { ascending: true })
            .limit(5000); // Ruime limiet voor statistische relevantie

        if (!users || !logs) return;

        // --- BASIS ANALYSES (Bestonden al) ---
        
        // 1. Tijdstip (Heatmap)
        const hours = Array(24).fill(0);
        logs.forEach(log => {
            const hour = new Date(log.created_at).getHours();
            hours[hour]++;
        });
        const timeData = hours.map((count, hour) => ({ uur: `${hour}:00`, Activiteit: count }));

        // 2. Provincie
        const provinceCounts: Record<string, number> = {};
        users.forEach(u => { const prov = u.province || 'Onbekend'; provinceCounts[prov] = (provinceCounts[prov] || 0) + 1; });
        const geoData = Object.entries(provinceCounts).sort(([,a], [,b]) => b - a).slice(0, 7).map(([name, value]) => ({ name, Gebruikers: value }));

        // 3. Opleiding vs Premium
        const eduLevels = ["VMBO", "HAVO", "VWO", "MBO", "HBO", "WO", "PhD"];
        const eduData = eduLevels.map(level => {
            const group = users.filter(u => u.education_level === level);
            const premium = group.filter(u => u.is_premium).length;
            return { name: level, Totaal: group.length, Premium: premium };
        });

        // 4. Device
        const deviceCounts: Record<string, number> = {};
        users.forEach(u => { const dev = u.primary_device || 'Onbekend'; deviceCounts[dev] = (deviceCounts[dev] || 0) + 1; });
        const deviceData = Object.entries(deviceCounts).map(([name, value]) => ({ name, value }));

        // 5. Museumkaart Effect
        const cardHolders = users.filter(u => (Array.isArray(u.museum_cards) && u.museum_cards.length > 0) || u.has_museum_card);
        const nonHolders = users.filter(u => (!u.museum_cards || u.museum_cards.length === 0) && !u.has_museum_card);
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

        // 6. Radar (Interesses)
        const periodCounts: Record<string, number> = {};
        users.forEach(u => { if (Array.isArray(u.favorite_periods)) u.favorite_periods.forEach((p: string) => periodCounts[p] = (periodCounts[p] || 0) + 1); });
        const radarData = Object.entries(periodCounts).sort(([,a], [,b]) => b - a).slice(0, 6).map(([subject, A]) => ({ subject, A, fullMark: users.length }));


        // --- NIEUWE DIEPTE INZICHTEN (Uit de logs analyse) ---

        // 7. CONTENT ENGAGEMENT (De Diepte Duikers)
        // We berekenen de gemiddelde tijd per content type (Tour vs Salon vs Focus vs Game)
        const contentTimes: Record<string, {total: number, count: number}> = {
            'Salon': {total: 0, count: 0},
            'Tour': {total: 0, count: 0},
            'Focus': {total: 0, count: 0},
            'Game': {total: 0, count: 0}
        };

        let errorCount = 0;
        let suspiciousGames = 0; // Grinders

        logs.forEach(log => {
            let meta: any = {};
            try { meta = typeof log.meta_data === 'string' ? JSON.parse(log.meta_data) : log.meta_data; } catch {}

            // A. Error Tracking
            if (log.action_type === '404_visit') {
                errorCount++;
            }

            // B. Grinder Detectie (Hoge score, extreem korte tijd)
            if (log.action_type === 'complete_game') {
                if (meta.score >= 100 && meta.duration < 10) {
                    suspiciousGames++;
                }
            }

            // C. Dwell Time Analyse
            if (log.action_type === 'time_spent' && meta.duration > 0) {
                // Categoriseer op basis van path
                if (meta.path?.includes('salon')) { contentTimes['Salon'].total += meta.duration; contentTimes['Salon'].count++; }
                else if (meta.path?.includes('tour')) { contentTimes['Tour'].total += meta.duration; contentTimes['Tour'].count++; }
                else if (meta.path?.includes('focus')) { contentTimes['Focus'].total += meta.duration; contentTimes['Focus'].count++; }
                else if (meta.path?.includes('game')) { contentTimes['Game'].total += meta.duration; contentTimes['Game'].count++; }
            }
        });

        const engagementData = Object.entries(contentTimes).map(([name, data]) => ({
            name,
            GemiddeldeTijd: data.count > 0 ? Math.round(data.total / data.count) : 0
        }));


        // --- DATA OPSLAAN ---
        setData({
            timeData, geoData, eduData, deviceData, behaviorData, radarData, engagementData,
            insights: {
                cardPercentage: Math.round((cardHolders.length / users.length) * 100),
                totalErrors: errorCount,
                grinderCount: suspiciousGames
            }
        });
        setLoading(false);
    };

    if (loading) return <div className="p-12 text-center text-slate-400"><Loader2 className="animate-spin inline mr-2"/>Analyseren van miljoenen datapunten...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            
            {/* RIJ 1: STRATEGISCHE KPI's */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* De Grinder Index */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><Trophy size={64} className="text-yellow-600"/></div>
                    <h4 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                        <TrendingUp size={14}/> XP Farmers (Grinders)
                    </h4>
                    <div className="flex items-end gap-2">
                        <span className="text-4xl font-black text-slate-800">{data.insights.grinderCount}</span>
                        <span className="text-sm text-slate-500 mb-1">sessies</span>
                    </div>
                    <p className="text-xs text-red-500 mt-2">Games uitgespeeld in &lt; 10 sec.</p>
                </div>

                {/* Engagement Quality */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h4 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Timer size={14}/> Diepte Duikers
                    </h4>
                    <div className="flex items-end gap-2">
                        <span className="text-4xl font-black text-slate-800">
                            {data.engagementData.find((d:any) => d.name === 'Salon')?.GemiddeldeTijd || 0}s
                        </span>
                        <span className="text-sm text-slate-500 mb-1">gem. in Salons</span>
                    </div>
                    <p className="text-xs text-green-600 mt-2">Hoogste betrokkenheid van alle content.</p>
                </div>

                {/* Technical Health */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h4 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                        <AlertTriangle size={14}/> Verdwaalde Bezoekers
                    </h4>
                    <div className="flex items-end gap-2">
                        <span className={`text-4xl font-black ${data.insights.totalErrors > 0 ? 'text-red-500' : 'text-slate-800'}`}>
                            {data.insights.totalErrors}
                        </span>
                        <span className="text-sm text-slate-500 mb-1">404 errors</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">Gebruikers die op een dode link klikten.</p>
                </div>
            </div>

            {/* RIJ 2: CONTENT & GEDRAG */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Engagement Chart (NIEUW) */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                        <Clock size={18} className="text-blue-500"/> Betrokkenheid per Type
                    </h3>
                    <p className="text-xs text-slate-400 mb-6">Hoeveel seconden besteedt men gemiddeld per sessie?</p>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.engagementData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" />
                                <YAxis label={{ value: 'Seconden', angle: -90, position: 'insideLeft' }}/>
                                <Tooltip cursor={{fill: 'transparent'}} />
                                <Bar dataKey="GemiddeldeTijd" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Seconden" >
                                    {data.engagementData.map((entry:any, index:number) => (
                                        <Cell key={`cell-${index}`} fill={entry.name === 'Salon' ? '#10b981' : '#3b82f6'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Apparaat Voorkeur */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                        <Smartphone size={18} className="text-slate-500"/> Apparaat Voorkeur
                    </h3>
                    <p className="text-xs text-slate-400 mb-6">Waarop wordt de content geconsumeerd?</p>
                    <div className="h-[300px] w-full">
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

            {/* RIJ 3: TIJD & LOCATIE */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                        <Clock size={18} className="text-museum-gold"/> Piekuren Analyse
                    </h3>
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

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                        <MapPin size={18} className="text-red-500"/> Top Locaties
                    </h3>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart layout="vertical" data={data.geoData}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                <XAxis type="number" />
                                <YAxis dataKey="name" type="category" width={90} style={{fontSize: '10px'}} />
                                <Tooltip />
                                <Bar dataKey="Gebruikers" fill="#1e293b" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* RIJ 4: DIEPTE INZICHTEN (Correlaties) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Museumkaart Impact */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                        <CreditCard size={18} className="text-purple-600"/> Museumkaart Effect
                    </h3>
                    <div className="h-[250px] w-full mt-8">
                         <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.behaviorData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="ActiviteitScore" fill="#8884d8" name="Acties p/p">
                                    {data.behaviorData.map((entry:any, index:number) => (
                                        <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#64748b'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Culturele Vingerafdruk (Radar) */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                        <Lightbulb size={18} className="text-yellow-500"/> Culturele Vingerafdruk
                    </h3>
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
