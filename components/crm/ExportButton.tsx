'use client';

import { useState } from 'react';
import { Download, FileJson, FileSpreadsheet, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabaseClient';

export default function ExportButton() {
    const [loading, setLoading] = useState(false);
    const supabase = createClient();

    const handleExport = async (format: 'json' | 'csv') => {
        setLoading(true);
        try {
            // 1. Fetch all relevant activity logs
            const { data: logs, error } = await supabase
                .from('user_activity_logs')
                .select('user_id, action_type, created_at, meta_data, user_profiles(full_name, age_group, province)')
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (!logs || logs.length === 0) {
                alert("Geen data om te exporteren.");
                setLoading(false);
                return;
            }

            // 2. Process Data for Analysis
            const processedData = logs.map((log: any) => {
                let details = '';
                let duration = 0;
                let score = 0;
                
                // Parse metadata safely
                let meta: any = {};
                try {
                    meta = typeof log.meta_data === 'string' ? JSON.parse(log.meta_data) : log.meta_data;
                } catch (e) { console.error("Meta parse error", e); }

                // Extract specific valuable metrics
                if (log.action_type === 'time_spent') duration = meta?.duration || 0;
                if (log.action_type === 'complete_game') score = meta?.score || 0;
                
                // Readable context
                if (meta?.path) details = `Path: ${meta.path}`;
                if (meta?.tour_title) details = `Tour: ${meta.tour_title}`;
                if (meta?.title) details = `Article: ${meta.title}`;

                // FIX: Handle user_profiles as an array or object safely
                const profile = Array.isArray(log.user_profiles) ? log.user_profiles[0] : log.user_profiles;
                const userName = profile?.full_name || 'Anonymous';
                const userDemo = `${profile?.age_group || 'Unknown'} - ${profile?.province || 'Unknown'}`;

                return {
                    Timestamp: new Date(log.created_at).toISOString(),
                    User: userName,
                    Demographics: userDemo,
                    Action: log.action_type,
                    Details: details,
                    Duration_Seconds: duration,
                    Game_Score: score,
                    Raw_Meta: JSON.stringify(meta)
                };
            });

            // 3. Generate File
            if (format === 'json') {
                const blob = new Blob([JSON.stringify(processedData, null, 2)], { type: 'application/json' });
                downloadFile(blob, `museathuis_analytics_${new Date().toISOString().split('T')[0]}.json`);
            } else {
                // Convert to CSV
                const headers = Object.keys(processedData[0]).join(',');
                const rows = processedData.map((row: any) => 
                    Object.values(row).map(value => `"${String(value).replace(/"/g, '""')}"`).join(',')
                ).join('\n');
                
                const csvContent = `${headers}\n${rows}`;
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                downloadFile(blob, `museathuis_analytics_${new Date().toISOString().split('T')[0]}.csv`);
            }

        } catch (error: any) {
            console.error('Export failed:', error);
            alert('Export mislukt: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const downloadFile = (blob: Blob, filename: string) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="flex gap-2">
            <button 
                onClick={() => handleExport('csv')} 
                disabled={loading}
                className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
                {loading ? <Loader2 size={16} className="animate-spin"/> : <FileSpreadsheet size={16}/>}
                CSV Export
            </button>
            <button 
                onClick={() => handleExport('json')} 
                disabled={loading}
                className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
                {loading ? <Loader2 size={16} className="animate-spin"/> : <FileJson size={16}/>}
                JSON Analysis
            </button>
        </div>
    );
}
