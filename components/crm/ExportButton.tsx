'use client';

import { useState } from 'react';
import { FileSpreadsheet, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabaseClient';

export default function ExportButton() {
    const [loading, setLoading] = useState(false);
    const supabase = createClient();

    const handleExport = async () => {
        setLoading(true);
        try {
            // 1. DATA OPHALEN
            // Nu halen we OOK de interesses en museumkaart status op!
            const { data: logs, error } = await supabase
                .from('user_activity_logs')
                .select(`
                    user_id, 
                    action_type, 
                    created_at, 
                    meta_data, 
                    user_profiles(
                        full_name, 
                        age_group, 
                        province,
                        gender,
                        favorite_periods,
                        museum_cards,
                        art_interest_level
                    )
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (!logs || logs.length === 0) {
                alert("Nog geen data om te exporteren.");
                setLoading(false);
                return;
            }

            // 2. DATA VERWERKEN TOT "GOLDEN RECORD"
            const processedData = logs.map((log: any) => {
                // Meta data parsen
                let meta: any = {};
                try { meta = typeof log.meta_data === 'string' ? JSON.parse(log.meta_data) : log.meta_data; } catch {}
                
                // Details samenstellen
                let details = '';
                if (meta?.path) details = `Pagina: ${meta.path}`;
                if (meta?.tour_title) details = `Tour: ${meta.tour_title}`;
                if (meta?.title) details = `Artikel: ${meta.title}`;
                if (meta?.type === 'quiz') details = `Quiz Score: ${meta.score}`;

                // Profiel data veilig uitlezen
                // Let op: Supabase geeft soms een array terug bij joins
                const p = Array.isArray(log.user_profiles) ? log.user_profiles[0] : log.user_profiles;
                
                // Arrays (zoals interesses) omzetten naar leesbare tekst (bijv: "Barok, Modern")
                const periods = Array.isArray(p?.favorite_periods) ? p.favorite_periods.join(', ') : '';
                const cards = Array.isArray(p?.museum_cards) ? p.museum_cards.join(', ') : '';

                return {
                    Datum: new Date(log.created_at).toLocaleString('nl-NL'),
                    
                    // DE WIE (Demografie)
                    Naam: p?.full_name || 'Anoniem',
                    Leeftijd: p?.age_group || '?',
                    Provincie: p?.province || '?',
                    Geslacht: p?.gender || '?',
                    
                    // DE WAT (Actie)
                    Actie: log.action_type,
                    Details: details,
                    Duur_Sec: meta?.duration || '',
                    
                    // DE WAAROM (Cultureel DNA - GOUD WAARD 💰)
                    Interesse_Niveau: p?.art_interest_level || '',
                    Favoriete_Periodes: periods,
                    Kaarten_Lidmaatschap: cards
                };
            });

            // 3. CSV GENEREREN (Puntkomma gescheiden voor NL Excel)
            const headers = Object.keys(processedData[0]).join(';');
            const rows = processedData.map((row: any) => 
                Object.values(row).map(value => {
                    // Zorg dat tekst met puntkomma's of enters tussen aanhalingstekens staat
                    const stringValue = String(value || '').replace(/"/g, '""');
                    return `"${stringValue}"`;
                }).join(';')
            ).join('\n');
            
            const csvContent = `\uFEFF${headers}\n${rows}`;
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            
            // Download triggeren
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `MuseaThuis_Full_Analysis_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

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
            Download Volledige Analyse
        </button>
    );
}
