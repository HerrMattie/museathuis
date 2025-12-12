'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { Download, Loader2, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function ExportButton() {
    const [loading, setLoading] = useState(false);
    const supabase = createClient();

    const handleExport = async () => {
        if(!confirm("Wil je de volledige database downloaden als Excel bestand?")) return;
        
        setLoading(true);
        const timestamp = new Date().toISOString().split('T')[0];

        try {
            // 1. HAAL GEBRUIKERS DATA OP (Rijk Profiel)
            const { data: users, error: userError } = await supabase
                .from('user_profiles')
                .select('*');

            if (userError) throw userError;

            // 2. HAAL CONTENT PRESTATIES OP (Simpele tellingen uit logs)
            // We halen alle logs op om ze lokaal te tellen (voor grote datasets doe je dit liever via RPC, maar dit werkt prima tot ~10k users)
            const { data: logs } = await supabase
                .from('user_activity_logs')
                .select('action_type, metadata, created_at');

            // 3. DATA FORMATTEREN VOOR EXCEL
            
            // --- SHEET 1: GEBRUIKERS ---
            // We vlakken de arrays (zoals interesses) af naar strings
            const usersSheet = users.map((u: any) => ({
                UserID: u.user_id,
                Naam: u.full_name || 'Anoniem',
                Email: u.email, // Let op: Alleen als je email in user_profiles opslaat, anders uit auth halen (lastiger)
                Level: Math.floor((u.xp || 0) / 100) + 1, // Geschat level
                XP: u.xp || 0,
                Premium: u.is_premium ? 'JA' : 'NEE',
                Regio: u.province || 'Onbekend',
                Leeftijdsgroep: u.age_group,
                Interesses: Array.isArray(u.interests) ? u.interests.join(', ') : '',
                MuseumKaarten: Array.isArray(u.museum_cards) ? u.museum_cards.join(', ') : '',
                LaatstGezien: u.updated_at ? new Date(u.updated_at).toLocaleDateString() : '',
                LidSinds: new Date(u.created_at).toLocaleDateString(),
            }));

            // --- SHEET 2: CONTENT ANALYSE ---
            // Tel hoe vaak content bekeken is
            const contentStats: any = {};
            logs?.forEach((log: any) => {
                if (log.action_type === 'view_tour' || log.action_type === 'play_game' || log.action_type === 'read_focus') {
                    // Probeer de titel of ID uit metadata te halen
                    const key = log.metadata?.title || log.metadata?.id || 'Onbekend Item';
                    const type = log.action_type;
                    
                    if (!contentStats[key]) contentStats[key] = { Type: type, Views: 0, LastView: '' };
                    contentStats[key].Views++;
                    contentStats[key].LastView = log.created_at;
                }
            });

            const contentSheet = Object.keys(contentStats).map(key => ({
                Titel: key,
                Type: contentStats[key].Type,
                AantalKeerBekeken: contentStats[key].Views,
                LaatsteInteractie: new Date(contentStats[key].LastView).toLocaleDateString()
            }));

            // 4. MAAK HET EXCEL BESTAND
            const wb = XLSX.utils.book_new();
            
            // Voeg sheets toe
            const ws1 = XLSX.utils.json_to_sheet(usersSheet);
            XLSX.utils.book_append_sheet(wb, ws1, "Gebruikersprofielen");

            const ws2 = XLSX.utils.json_to_sheet(contentSheet);
            XLSX.utils.book_append_sheet(wb, ws2, "Content Prestaties");

            // Download triggeren
            XLSX.writeFile(wb, `MuseaThuis_Export_${timestamp}.xlsx`);

        } catch (e: any) {
            alert("Export mislukt: " + e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button 
            onClick={handleExport} 
            disabled={loading}
            className="flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-800 transition-colors shadow-sm text-sm"
        >
            {loading ? <Loader2 className="animate-spin" size={16}/> : <FileSpreadsheet size={16}/>}
            Excel Database Genereren
        </button>
    );
}
