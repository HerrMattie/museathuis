'use client';

import Link from 'next/link';
import { ChevronLeft, ChevronRight, Calendar, Lock } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

interface DateNavigatorProps {
    basePath: string; // bijv. '/tour'
    currentDate: string; // 'YYYY-MM-DD'
    maxBack: number; // Aantal dagen/weken dat je terug mag
    mode: 'day' | 'week';
}

export default function DateNavigator({ basePath, currentDate, maxBack, mode }: DateNavigatorProps) {
    const today = new Date();
    const current = new Date(currentDate);
    
    // Bereken vorige/volgende
    const prevDate = new Date(current);
    const nextDate = new Date(current);
    
    if (mode === 'day') {
        prevDate.setDate(current.getDate() - 1);
        nextDate.setDate(current.getDate() + 1);
    } else {
        prevDate.setDate(current.getDate() - 7); // Week sprong
        nextDate.setDate(current.getDate() + 7);
    }

    // Check limieten
    const diffTime = Math.abs(today.getTime() - prevDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Mag je terug? (Vandaag - historie limiet)
    // Voor weken vermenigvuldigen we maxBack met 7
    const limit = mode === 'week' ? maxBack * 7 : maxBack;
    const isLockedBack = diffDays > limit && prevDate < today;
    
    // Mag je vooruit? (Niet verder dan vandaag/deze week)
    const isFuture = nextDate > today;

    const formatDate = (date: Date) => {
        if (mode === 'week') {
            // Toon weeknummer of startdatum
            return `Week van ${date.getDate()} ${date.toLocaleString('nl-NL', { month: 'short' })}`;
        }
        return date.toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' });
    };

    return (
        <div className="flex justify-center items-center gap-6 mb-8 bg-white/5 p-2 rounded-full border border-white/10 w-fit mx-auto backdrop-blur-md">
            
            {/* VORIGE KNOP */}
            {isLockedBack ? (
                <button disabled className="p-2 text-gray-600 cursor-not-allowed flex items-center gap-1" title="Bereik een hoger level om verder terug te kijken">
                    <Lock size={16}/> <ChevronLeft size={20}/>
                </button>
            ) : (
                <Link href={`${basePath}?date=${prevDate.toISOString().split('T')[0]}`} className="p-2 text-white hover:text-museum-gold hover:bg-white/10 rounded-full transition-colors">
                    <ChevronLeft size={20}/>
                </Link>
            )}

            {/* DATUM DISPLAY */}
            <div className="flex items-center gap-2 px-4 min-w-[200px] justify-center font-bold text-white uppercase tracking-widest text-sm">
                <Calendar size={14} className="text-museum-gold"/>
                {formatDate(current)}
            </div>

            {/* VOLGENDE KNOP */}
            {isFuture ? (
                <button disabled className="p-2 text-gray-600 cursor-not-allowed">
                    <ChevronRight size={20}/>
                </button>
            ) : (
                <Link href={`${basePath}?date=${nextDate.toISOString().split('T')[0]}`} className="p-2 text-white hover:text-museum-gold hover:bg-white/10 rounded-full transition-colors">
                    <ChevronRight size={20}/>
                </Link>
            )}
        </div>
    );
}
