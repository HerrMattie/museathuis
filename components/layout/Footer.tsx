'use client'; 

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-midnight-900 border-t border-white/10 py-8 mt-auto">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          
          {/* Links: Logo & Copyright */}
          <div className="text-center md:text-left">
            <Link href="/" className="font-serif text-lg font-bold text-museum-gold hover:text-white transition-colors tracking-widest">
              MUSEATHUIS
            </Link>
            <p className="text-[10px] text-gray-600 mt-1">
              © {new Date().getFullYear()} MuseaThuis. Alle rechten voorbehouden.
            </p>
          </div>

          {/* Rechts: Compacte Navigatie */}
          <nav className="flex flex-wrap justify-center md:justify-end gap-x-6 gap-y-2 text-xs font-medium text-gray-400 uppercase tracking-wide">
              <Link href="/tour" className="hover:text-museum-gold transition-colors">Tours</Link>
              <Link href="/game" className="hover:text-museum-gold transition-colors">Games</Link>
              <Link href="/focus" className="hover:text-museum-gold transition-colors">Focus</Link>
              <Link href="/salon" className="hover:text-museum-gold transition-colors">Salons</Link>
              <Link href="/academie" className="hover:text-museum-gold transition-colors">Academie</Link>
              <span className="text-white/10 hidden md:inline">|</span>
              <Link href="/pricing" className="hover:text-museum-gold transition-colors">Lidmaatschap</Link>
              <Link href="/profile" className="hover:text-museum-gold transition-colors">Profiel</Link>
              <Link href="/contact" className="hover:text-museum-gold transition-colors">Contact</Link>
          </nav>

        </div>
      </div>
    </footer>
  );
}
