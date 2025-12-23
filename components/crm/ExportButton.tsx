'use client';

import { useState } from 'react';
import { FileSpreadsheet, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabaseClient';
import * as XLSX from 'xlsx';

export default function ExportButton() {
    const [loading, setLoading] = useState(false);
    const supabase = createClient();

    const handleExport = async () => {
        setLoading(true);
        try {
            // 1. DATA VERZAMELEN (Alles ophalen wat relevant is voor analyse)
            const [usersResponse, logsResponse, contentResponse] = await Promise.all([
                // A. ALLE GEBRUIKERS (Het Ledenbestand)
                supabase
                    .from('user_profiles')
                    .select('*')
                    .order('created_at', { ascending: false }),

                // B. ALLE ACTIVITEIT (Het Gedrag)
                // We beperken dit tot de laatste 2000 events om de browser niet te laten crashen
                supabase
                    .from('user_activity_logs')
                    .select('*, user_profiles(full_name)')
                    .order('created_at', { ascending: false })
                    .limit(2000),
                
                // C. CONTENT (Wat hebben we in huis?)
                supabase
                    .from('tours')
                    .select('id, title, duration_minutes')
            ]);

            const users = usersResponse.data || [];
            const logs = logsResponse.data || [];
            const content = contentResponse.data || [];

            if (users.length === 0) {
                alert("Geen gebruikers gevonden.");
                setLoading(false);
                return;
            }

            // --- TABBLAD 1: HET LEDENBESTAND (CRM) ---
            // Dit is de lijst waar je marketeers blij mee maakt.
            const usersSheet = users.map((u: any) => {
                // Arrays netjes maken
                const periods = Array.isArray(u.favorite_periods) ? u.favorite_periods.join(', ') : '';
                const types = Array.isArray(u.museum_types) ? u.museum_types.join(', ') : '';
                const cards = Array.isArray(u.museum_cards) ? u.museum_cards.join(', ') : '';

                return {
                    "Klant ID": u.user_id,
                    "Naam": u.full_name || u.display_name || 'Anoniem',
                    "Email": u.email || 'Niet opgegeven', // Let op: alleen zichtbaar als in tabel
                    "Status": u.is_premium ? 'PREMIUM 👑' : 'Gratis',
                    "Lid Sinds": new Date(u.created_at).toLocaleDateString('nl-NL'),
                    "Laatst Actief": u.updated_at ? new Date(u.updated_at).toLocaleDateString('nl-NL') : '-',
                    
                    // Engagement Metrics (Gamification data is key voor retentie analyse)
                    "Huidige Streak": u.current_streak || 0,
                    "Totaal XP": u.xp || 0,
                    "Level": u.level || 1,
                    
                    // Het "Cultureel DNA" (Demografie & Interesses)
                    "Leeftijdsgroep": u.age_group,
                    "Provincie": u.province,
                    "Geslacht": u.gender,
                    "Opleiding": u.education_level,
                    "Werkveld": u.work_field,
                    "Museumkaart": cards.includes('Museumkaart') ? 'JA' : 'NEE',
                    "Bezoekfrequentie": u.museum_visit_frequency,
                    "Favoriete Periodes": periods,
                    "Favoriete Types": types,
                    "Kunstkennis": u.art_interest_level
                };
            });

            // --- TABBLAD 2: GEDRAGSLOGBOEK (Wat doen ze?) ---
            const activitySheet = logs.map((log: any) => {
                let meta: any = {};
                try { meta = typeof log.meta_data === 'string' ? JSON.parse(log.meta_data) : log.meta_data; } catch {}
                
                // Context bepalen
                let context = meta?.path || '';
                if (meta?.tour_title) context = `Tour: ${meta.tour_title}`;
                if (meta?.type === 'quiz') context = `Quiz Score: ${meta.score}`;

                return {
                    "Tijdstip": new Date(log.created_at).toLocaleString('nl-NL'),
                    "Gebruiker": log.user_profiles?.full_name || 'Onbekend',
                    "Type Actie": log.action_type,
                    "Context / Pagina": context,
                    "Duur (sec)": meta?.duration || '',
                    "Metadata": JSON.stringify(meta) // Voor als je techneuten dieper willen graven
                };
            });

            // --- TABBLAD 3: MANAGEMENT DASHBOARD (KPI's) ---
            const premiumCount = users.filter(u => u.is_premium).length;
            const activeLast7Days = users.filter(u => {
                const lastActive = new Date(u.updated_at).getTime();
                const sevenDaysAgo = new Date().getTime() - (7 * 24 * 60 * 60 * 1000);
                return lastActive > sevenDaysAgo;
            }).length;

            const summarySheet = [
                { "KPI": "Totaal Aantal Leden", "Waarde": users.length },
                { "KPI": "Aantal Premium Leden", "Waarde": premiumCount },
                { "KPI": "Conversie Percentage", "Waarde": `${((premiumCount / users.length) * 100).toFixed(1)}%` },
                { "KPI": "Actieve Leden (7 dagen)", "Waarde": activeLast7Days },
                { "KPI": "Potentiële Maandomzet", "Waarde": `€ ${(premiumCount * 6.95).toFixed(2)}` }, // O.b.v. €6,95 prijs
                { "KPI": "Totaal Gelogde Acties", "Waarde": logs.length },
                { "KPI": "Datum Rapport", "Waarde": new Date().toLocaleString('nl-NL') }
            ];

            // --- EXCEL GENEREREN ---
            const workbook = XLSX.utils.book_new();

            // 1. Dashboard (Voor de directeur)
            const sheet1 = XLSX.utils.json_to_sheet(summarySheet);
            XLSX.utils.book_append_sheet(workbook, sheet1, "KPI Dashboard");

            // 2. Ledenbestand (Voor de marketeer / sales)
            const sheet2 = XLSX.utils.json_to_sheet(usersSheet);
            sheet2['!cols'] = [{wch:30}, {wch:20}, {wch:25}, {wch:15}, {wch:12}, {wch:12}, {wch:10}, {wch:10}, {wch:8}, {wch:15}, {wch:15}, {wch:10}, {wch:10}, {wch:15}, {wch:10}]; // Kolombreedtes
            XLSX.utils.book_append_sheet(workbook, sheet2, "Alle Leden (CRM)");

            // 3. Activiteiten (Voor de data-analist)
            const sheet3 = XLSX.utils.json_to_sheet(activitySheet);
            XLSX.utils.book_append_sheet(workbook, sheet3, "Activiteiten Log");

            // DOWNLOADEN
            XLSX.writeFile(workbook, `MuseaThuis_Master_Export_${new Date().toISOString().split('T')[0]}.xlsx`);

        } catch (error: any) {
            console.error('Export failed:', error);
            alert('Export mislukt: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button 
            onClick={handleExport} 
            disabled={loading}
            className="flex items-center gap-2 bg-museum-gold text-black px-6 py-3 rounded-lg text-sm font-bold hover:bg-white hover:text-black border border-museum-gold transition-all shadow-lg disabled:opacity-50"
        >
            {loading ? <Loader2 size={18} className="animate-spin"/> : <FileSpreadsheet size={18}/>}
            Download Master Rapport (.xlsx)
        </button>
    );
}
