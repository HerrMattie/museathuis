'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react'; // useEffect toegevoegd
import { Menu, X, User } from 'lucide-react';

const navItems = [
  { label: 'Vandaag', href: '/' },
  { label: 'Tour', href: '/tour' },
  { label: 'Game', href: '/game' },
  { label: 'Focus', href: '/focus' },
  { label: 'Salon', href: '/salon' },
  { label: 'Academie', href: '/academy' },
  { label: 'Best Of', href: '/favorites' },
];

export default function Header() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Zorg dat scrollen blokkeert als menu open is (voorkomt bewegen van achtergrond)
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  return (
    <>
      {/* VASTE HEADER BALK */}
      <header className="fixed top-0 left-0 right-0 z-[60] bg-midnight-950/90 backdrop-blur-md border-b border-white/10 h-20">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          
          {/* LOGO */}
          <Link href="/" className="flex items-center gap-2 group z-[70]" onClick={() => setIsOpen(false)}>
            <div className="w-10 h-10 bg-museum-gold rounded-lg flex items-center justify-center text-black font-serif font-bold text-xl group-hover:rotate-3 transition-transform">
              M
            </div>
            <span className="font-serif font-bold text-2xl tracking-tight text-white">
              Musea<span className="text-museum-gold">Thuis</span>
            </span>
          </Link>

          {/* DESKTOP NAVIGATIE */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-bold uppercase tracking-widest transition-colors ${
                  pathname === item.href ? 'text-museum-gold' : 'text-gray-400 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* RECHTS: PROFIEL & KNOPPEN */}
          <div className="flex items-center gap-4 z-[70]">
              <Link href="/profile" className="hidden md:flex w-10 h-10 rounded-full border border-white/20 items-center justify-center hover:bg-white hover:text-black transition-colors">
                  <User size={20} />
              </Link>

              {/* Hamburger Knop */}
              <button 
                  onClick={() => setIsOpen(!isOpen)} 
                  className="md:hidden p-2 text-white hover:text-museum-gold transition-colors relative"
                  aria-label="Menu openen"
              >
                  {isOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
          </div>
        </div>
      </header>

      {/* MOBIEL MENU OVERLAY (Volledig Scherm) */}
      <div 
        className={`fixed inset-0 z-[50] bg-midnight-950 flex flex-col justify-center px-8 transition-all duration-300 ease-in-out md:hidden ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        }`}
      >
          {/* Achtergrond decoratie */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-museum-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

          <nav className="flex flex-col gap-6 relative z-10">
            {navItems.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`text-3xl font-serif font-bold transition-all duration-300 hover:text-museum-gold ${
                   // Staggered animatie effect als menu opent
                   isOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                }`}
                style={{ 
                    transitionDelay: `${index * 50}ms`,
                    color: pathname === item.href ? '#EAB308' : 'white'
                }}
              >
                {item.label}
              </Link>
            ))}
            
            <hr className="border-white/10 my-4" />
            
            <Link 
              href="/profile" 
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-4 text-xl font-bold uppercase tracking-widest text-gray-400 hover:text-white"
            >
               <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                  <User size={24}/> 
               </div>
               Mijn Profiel
            </Link>
          </nav>
      </div>
    </>
  );
}
