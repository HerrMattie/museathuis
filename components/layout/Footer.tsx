import Link from 'next/link';
import { Instagram, Facebook, Twitter, Mail } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-midnight-950 border-t border-white/10 pt-16 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          
          {/* KOLOM 1: MERK */}
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="text-xl font-serif font-bold tracking-widest text-white hover:text-museum-gold transition-colors block mb-4">
              MUSEA<span className="text-museum-gold">THUIS</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed">
              Jouw dagelijkse dosis kunst en cultuur. Ontdek meesterwerken vanuit je luie stoel.
            </p>
          </div>

          {/* KOLOM 2: NAVIGATIE */}
          <div>
            <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-6">Ontdekken</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><Link href="/tour" className="hover:text-museum-gold transition-colors">Audiotours</Link></li>
              <li><Link href="/game" className="hover:text-museum-gold transition-colors">Games</Link></li>
              <li><Link href="/focus" className="hover:text-museum-gold transition-colors">Focus</Link></li>
              <li><Link href="/salon" className="hover:text-museum-gold transition-colors">Galerij</Link></li>
            </ul>
          </div>

          {/* KOLOM 3: SERVICE */}
          <div>
            <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-6">Service</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><Link href="/pricing" className="hover:text-museum-gold transition-colors">Lidmaatschap</Link></li>
              <li><Link href="/profile" className="hover:text-museum-gold transition-colors">Mijn Profiel</Link></li>
              <li><Link href="/contact" className="hover:text-museum-gold transition-colors">Contact & Support</Link></li>
              <li><Link href="/terms" className="hover:text-museum-gold transition-colors">Algemene Voorwaarden</Link></li>
            </ul>
          </div>
</div>

        {/* COPYRIGHT BAR */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-600">
          <p>&copy; {currentYear} MuseaThuis. Alle rechten voorbehouden.</p>
          <div className="flex gap-6">
             <Link href="/privacy" className="hover:text-slate-400">Privacybeleid</Link>
             <Link href="/cookies" className="hover:text-slate-400">Cookieverklaring</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
