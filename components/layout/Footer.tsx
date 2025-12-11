'use client'; // <--- ADD THIS LINE AT THE VERY TOP


import Link from 'next/link';
import { Instagram, Twitter, Facebook, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-midnight-900 border-t border-white/10 pt-16 pb-8 mt-auto">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* Kolom 1: Brand */}
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="font-serif text-2xl font-bold text-museum-gold block mb-6">
              MUSEATHUIS
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              Elke dag een nieuwe kunstbeleving. Wij brengen de grootste meesters uit de geschiedenis naar uw woonkamer, aangedreven door AI.
            </p>
          </div>

          {/* Kolom 2: Ontdekken */}
          <div>
            <h4 className="font-bold text-white mb-6">Ontdekken</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><Link href="/tour" className="hover:text-museum-gold transition-colors">Tours</Link></li>
              <li><Link href="/game" className="hover:text-museum-gold transition-colors">Games</Link></li>
              <li><Link href="/focus" className="hover:text-museum-gold transition-colors">Focus</Link></li>
              <li><Link href="/salon" className="hover:text-museum-gold transition-colors">Salons</Link></li>
              <li><Link href="/academie" className="hover:text-museum-gold transition-colors">Academie</Link></li>
              <li><Link href="/best-of" className="hover:text-museum-gold transition-colors">Best of</Link></li>
            </ul>
          </div>

          {/* Kolom 3: Service */}
          <div>
            <h4 className="font-bold text-white mb-6">Service</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><Link href="/pricing" className="hover:text-museum-gold transition-colors">Lidmaatschap</Link></li>
              <li><Link href="/profile" className="hover:text-museum-gold transition-colors">Mijn Account</Link></li>
              <li><Link href="#" className="hover:text-museum-gold transition-colors">Veelgestelde Vragen</Link></li>
              <li><Link href="#" className="hover:text-museum-gold transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} MuseaThuis. Alle rechten voorbehouden.
          </p>

        </div>
      </div>
    </footer>
  );
}
