'use client'; 

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-midnight-950 border-t border-white/10 pt-10 pb-6 mt-auto">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between gap-8 mb-8">
          
          {/* Brand */}
          <div className="md:w-1/3">
            <Link href="/" className="font-serif text-xl font-bold text-museum-gold block mb-2">
              MUSEATHUIS
            </Link>
            <p className="text-gray-500 text-xs leading-relaxed max-w-sm">
              Dagelijkse kunstgeschiedenis in uw woonkamer.
            </p>
          </div>

          {/* Navigatie Compact */}
          <div className="flex gap-16 text-xs text-gray-400">
              <div>
                <h4 className="font-bold text-white mb-3 uppercase tracking-wider">Ontdekken</h4>
                <ul className="space-y-2">
                  <li><Link href="/tour" className="hover:text-museum-gold transition-colors">Tours</Link></li>
                  <li><Link href="/game" className="hover:text-museum-gold transition-colors">Games</Link></li>
                  <li><Link href="/focus" className="hover:text-museum-gold transition-colors">Focus</Link></li>
                  <li><Link href="/salon" className="hover:text-museum-gold transition-colors">Salons</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-white mb-3 uppercase tracking-wider">Service</h4>
                <ul className="space-y-2">
                  <li><Link href="/pricing" className="hover:text-museum-gold transition-colors">Lidmaatschap</Link></li>
                  <li><Link href="/profile" className="hover:text-museum-gold transition-colors">Profiel</Link></li>
                  <li><Link href="/contact" className="hover:text-museum-gold transition-colors">Contact</Link></li>
                </ul>
              </div>
          </div>
        </div>

        <div className="border-t border-white/5 pt-6 text-center md:text-left text-[10px] text-gray-600">
            © {new Date().getFullYear()} MuseaThuis. Alle rechten voorbehouden.
        </div>
      </div>
    </footer>
  );
}
