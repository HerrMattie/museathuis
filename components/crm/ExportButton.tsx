'use client';

import { useState } from 'react';
import { FileSpreadsheet, Loader2, Download } from 'lucide-react'; // JSON icoon weggehaald
import { createClient } from '@/lib/supabaseClient';

export default function ExportButton() {
    const [loading, setLoading] = useState(false);
    const supabase = createClient();

    const handleExport = async () => {
        setLoading(true);
        try {
            // 1. Data ophalen
            const { data: logs, error } = await supabase
                .from('user_activity_logs')
                .select('user_id, action_type, created_at, meta_data, user_profiles(full_name, age_group, province)')
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (!logs || logs.length === 0) {
                alert("Nog geen data om te exporteren.");
                setLoading(false);
                return;
            }

            // 2. Data leesbaar maken voor Excel
            const processedData = logs.map((log: any) => {
                let details = '';
                let duration = 0;
                let score = 0;
                
                // Meta data veilig uitlezen
                let meta: any = {};
                try {
                    meta = typeof log.meta_data === 'string' ? JSON.parse(log.meta_data) : log.meta_data;
                } catch (e) { console.error("Meta parse error", e); }

                if (log.action_type === 'time_spent') duration = meta?.duration || 0;
                if (log.action_type === 'complete_game') score = meta?.score || 0;
                
                if (meta?.path) details = `Pagina: ${meta.path}`;
                if (meta?.tour_title) details = `Tour: ${meta.tour_title}`;
                if (meta?.title) details = `Artikel: ${meta.title}`;

                // Veilige check voor profiel data
                const profile = Array.isArray(log.user_profiles) ? log.user_profiles[0] : log.user_profiles;
                const userName = profile?.full_name || 'Anoniem';
                const age = profile?.age_group || 'Onbekend';
                const prov = profile?.province || 'Onbekend';

                return {
                    Datum: new Date(log.created_at).toLocaleString('nl-NL'), // Meteen in NL formaat
                    Gebruiker: userName,
                    Leeftijd: age,
                    Provincie: prov,
                    Actie: log.action_type,
                    Details: details,
                    Seconden_Bekeken: duration > 0 ? duration : '',
                    Score: score > 0 ? score : ''
                };
            });

            // 3. CSV Maken (Excel formaat)
            // We gebruiken puntkomma (;) als scheidingsteken, dat werkt beter in Nederlandse Excel
            const headers = Object.keys(processedData[0]).join(';');
            const rows = processedData.map((row: any) => 
                Object.values(row).map(value => `"${String(value).replace(/"/g, '""')}"`).join(';')
            ).join('\n');
            
            // De BOM (\uFEFF) zorgt dat Excel speciale tekens (zoals é of €) goed leest
            const csvContent = `\uFEFF${headers}\n${rows}`;
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            
            // Bestand downloaden
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `MuseaThuis_Export_${new Date().toISOString().split('T')[0]}.csv`;
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
            Download voor Excel
        </button>
    );
}
