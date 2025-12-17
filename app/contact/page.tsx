'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { trackActivity } from '@/lib/tracking';
import { ArrowLeft, Send, Bug } from 'lucide-react';
import Link from 'next/link';

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Simuleer versturen (Hier zou je normaal een API call doen naar je mail service)
    setSent(true);

    // 2. TRIGGER BADGE: Glitch Hunter
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        trackActivity(supabase, user.id, 'submit_contact');
    }
  };

  return (
    <div className="min-h-screen bg-midnight-950 text-white pt-24 px-6">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 text-sm font-bold uppercase">
            <ArrowLeft size={16}/> Terug
        </Link>

        <h1 className="text-4xl font-serif font-bold mb-4">Contact & Support</h1>
        <p className="text-gray-400 mb-12">
            Heb je een vraag, of heb je een foutje gevonden in de app? Laat het ons weten.
        </p>

        {sent ? (
            <div className="bg-green-500/10 border border-green-500/20 p-8 rounded-2xl text-center">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send size={32} className="text-black"/>
                </div>
                <h3 className="text-xl font-bold text-green-400 mb-2">Bericht Verzonden!</h3>
                <p className="text-gray-300">Bedankt voor je feedback. We kijken er zo snel mogelijk naar.</p>
            </div>
        ) : (
            <form onSubmit={handleSubmit} className="space-y-6 bg-midnight-900 p-8 rounded-2xl border border-white/5">
                <div>
                    <label className="block text-sm font-bold uppercase tracking-wider mb-2 text-gray-400">Onderwerp</label>
                    <select className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-museum-gold focus:outline-none">
                        <option>Algemene Vraag</option>
                        <option>Foutmelding / Bug Report</option>
                        <option>Feedback</option>
                    </select>
                </div>
                
                <div>
                    <label className="block text-sm font-bold uppercase tracking-wider mb-2 text-gray-400">Bericht</label>
                    <textarea required rows={5} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-museum-gold focus:outline-none"></textarea>
                </div>

                <button type="submit" className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                    <Send size={18}/> Verstuur Bericht
                </button>
                
                <p className="text-xs text-center text-gray-500 mt-4 flex items-center justify-center gap-1">
                    <Bug size={12}/> Het melden van bugs wordt beloond!
                </p>
            </form>
        )}
      </div>
    </div>
  );
}
