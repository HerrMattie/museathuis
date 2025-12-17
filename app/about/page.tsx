'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { trackActivity } from '@/lib/tracking';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function AboutPage() {
    const supabase = createClient();

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                // Badge Trigger: Supporter
                trackActivity(supabase, user.id, 'visit_about');
            }
        };
        init();
    }, []);

    return (
        <div className="min-h-screen bg-midnight-950 text-white pt-24 px-6">
            <div className="max-w-3xl mx-auto">
                <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8">
                    <ArrowLeft size={16}/> Terug
                </Link>
                
                <h1 className="text-4xl font-serif font-bold mb-6 text-museum-gold">Over MuseaThuis</h1>
                
                <div className="prose prose-invert prose-lg">
                    <p>
                        Welkom bij MuseaThuis. Onze missie is om kunst toegankelijk te maken voor iedereen, 
                        waar je ook bent. Elke dag selecteren wij de mooiste werken, verhalen en uitdagingen.
                    </p>
                    <p>
                        Bedankt dat je er bent!
                    </p>
                </div>
            </div>
        </div>
    );
}
