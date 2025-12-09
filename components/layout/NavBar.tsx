'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Menu } from 'lucide-react';
import { useState } from 'react';

export default function NavBar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Helper om te checken of een link actief is
  const isActive = (path: string) => pathname === path;

  const navLinks = [
    { href: '/', label: 'Vandaag' },
    { href: '/salon', label: 'Salon' },
    { href: '/academie', label: 'Academie' },
    { href: '/best-of', label: 'Best of' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-midnight-950/80 backdrop-blur-md">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* 1. LOGO */}
        <Link href="/" className="flex flex-col group">
          <span className="font-serif text-2xl font-bold tracking-widest text-white group-hover:text-museum-gold transition-colors">
            MUSEA<span className="text-museum-gold group-hover:text-white transition-colors">THUIS</span>
          </span>
          <span className="text-[0.6rem] uppercase tracking-[0.2em] text-museum-text-secondary">
            Digitale Kunstbeleving
          </span>
        </Link>

        {/* 2. DESKTOP NAVIGATIE */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                isActive(link.href)
                  ? 'bg-white/10 text-white shadow-sm ring-1 ring-white/5'
                  : 'text-museum-text-secondary hover:text-white hover:bg-white/5'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* 3. PROFIEL & ACTIES */}
        <div className="flex items-center gap-4">
          <Link 
            href="/profile" 
            className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-museum-gold border border-museum-gold/30 hover:bg-museum-gold/10 transition-colors"
          >
            <User size={18} />
            <span className="font-medium">Mijn Profiel</span>
          </Link>

          {/* Mobiele Menu Knop */}
          <button 
            className="md:hidden p-2 text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu size={24} />
          </button>
        </div>
      </div>

      {/* Mobiel Menu (Dropdown) */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-midnight-950 px-6 py-4">
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-lg font-serif ${
                  isActive(link.href) ? 'text-museum-gold' : 'text-gray-400'
                }`}
              >
                {link.label}
              </Link>
            ))}
             <Link
                href="/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-lg font-serif text-white pt-4 border-t border-white/10"
              >
                Mijn Profiel
              </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
