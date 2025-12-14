'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // NU MET ALLE ITEMS
  const navItems = [
    { name: 'Tour', href: '/tour' },
    { name: 'Game', href: '/game' },
    { name: 'Focus', href: '/focus' },
    { name: 'Salon', href: '/salon' },     // <--- Terug
    { name: 'Best Of', href: '/best-of' }, // <--- Terug
    { name: 'Academie', href: '/academie' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-midnight-950/90 backdrop-blur-md border-b border-white/10 h-20">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        
        {/* LOGO */}
        <Link href="/" className="text-2xl font-serif font-bold tracking-widest text-white hover:text-museum-gold transition-colors">
          MUSEA<span className="text-museum-gold">THUIS</span>
        </Link>

        {/* DESKTOP NAV */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          {navItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              className={`text-xs lg:text-sm font-bold tracking-widest uppercase transition-colors ${
                pathname.startsWith(item.href) ? 'text-museum-gold' : 'text-gray-400 hover:text-white'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* ICONS */}
        <div className="flex items-center gap-4">
          <Link href="/profile" className="p-2 bg-white/5 rounded-full hover:bg-white/20 text-white transition-colors">
            <User size={20} />
          </Link>
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-white p-2">
             {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {isOpen && (
        <div className="md:hidden bg-midnight-950 border-b border-white/10 absolute top-20 left-0 right-0 p-6 flex flex-col gap-4 shadow-2xl animate-in slide-in-from-top-2">
          {navItems.map((item) => (
             <Link 
               key={item.href} 
               href={item.href} 
               onClick={() => setIsOpen(false)}
               className="text-lg font-serif font-bold text-white py-3 border-b border-white/5 last:border-0 hover:text-museum-gold"
             >
               {item.name}
             </Link>
          ))}
        </div>
      )}
    </header>
  );
}
