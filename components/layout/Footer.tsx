'use client'; 

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-midnight-900 border-t border-white/10 pt-12 pb-8 mt-auto">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between gap-12 mb-12">
          
          {/* Kolom 1: Brand (Links) */}
          <div className="md:w-1/3">
            <Link href="/" className="font-serif text-2xl font-bold text-museum-gold block mb-4">
              MUSEATHUIS
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              Elke dag een nieuwe kunstbeleving. Wij brengen de grootste meesters uit de geschiedenis naar uw woonkamer, aangedreven door AI.
            </p>
          </div>

          {/* Kolom 2 & 3: Navigatie (Rechts, naast elkaar) */}
          <div className="flex gap-16 md:gap-24">
              <div>
                <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Ontdekken</h4>
                <ul className="space-y-3 text-sm text-gray-400">
                  <li><Link href="/tour" className="hover:text-museum-gold transition-colors">Tours</Link></li>
                  <li><Link href="/game" className="hover:text-museum-gold transition-colors">Games</Link></li>
                  <li><Link href="/focus" className="hover:text-museum-gold transition-colors">Focus</Link></li>
                  <li><Link href="/salon" className="hover:text-museum-gold transition-colors">Salons</Link></li>
                  <li><Link href="/academie" className="hover:text-museum-gold transition-colors">Academie</Link></li>
                  <li><Link href="/best-of" className="hover:text-museum-gold transition-colors">Best of</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Service</h4>
                <ul className="space-y-3 text-sm text-gray-400">
                  <li><Link href="/pricing" className="hover:text-museum-gold transition-colors">Lidmaatschap</Link></li>
                  <li><Link href="/profile" className="hover:text-museum-gold transition-colors">Mijn Account</Link></li>
                  <li><Link href="/contact" className="hover:text-museum-gold transition-colors">Contact</Link></li>
                </ul>
              </div>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 text-center md:text-left text-xs text-gray-600">
            © {new Date().getFullYear()} MuseaThuis. Alle rechten voorbehouden.
        </div>
      </div>
    </footer>
  );
}
