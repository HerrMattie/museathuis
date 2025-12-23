'use client';

import { useState } from 'react';
import { Share2, Check } from 'lucide-react';
import { createClient } from '@/lib/supabaseClient';
import { checkShareBadge } from '@/lib/gamification/checkBadges';

interface ShareButtonProps {
    title: string;
    url: string; // De URL die je wilt delen
    className?: string;
}

export default function ShareButton({ title, url, className }: ShareButtonProps) {
    const [shared, setShared] = useState(false);
    const supabase = createClient();

    const handleShare = async () => {
        // 1. Probeer de native share API (mobiel) of kopieer naar klembord
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'MuseaThuis',
                    text: `Bekijk dit: ${title}`,
                    url: window.location.href // Huidige pagina
                });
            } catch (err) {
                console.log('Share geannuleerd');
                return; // Als geannuleerd, geen badge
            }
        } else {
            // Fallback: Klembord
            navigator.clipboard.writeText(window.location.href);
            setShared(true);
            setTimeout(() => setShared(false), 2000);
        }

        // 2. GAMIFICATION: Trigger "Influencer" Badge
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            checkShareBadge(supabase, user.id);
        }
    };

    return (
        <button 
            onClick={handleShare}
            className={className || "p-2 hover:text-white transition-colors flex items-center gap-2"}
            title="Delen"
        >
            {shared ? <Check size={20} className="text-green-400"/> : <Share2 size={20}/>}
            {shared && <span className="text-xs text-green-400 font-bold">Gekopieerd!</span>}
        </button>
    );
}
