'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { name: 'Tour', href: '/tour' },
    { name: 'Game', href: '/game' },
    { name: 'Focus', href: '/focus' },
    { name: 'Academie', href: '/academie' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-midnight-950/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* LOGO */}
        <Link href="/" className="text-2xl font-serif font-bold tracking-widest text-white hover:text-museum-gold transition-colors">
          MUSEA<span className="text-museum-gold">THUIS</span>
        </Link>

        {/* DESKTOP NAV */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              className={`text-sm font-bold tracking-widest uppercase transition-colors ${
                pathname.startsWith(item.href) ? 'text-museum-gold' : 'text-gray-400 hover:text-white'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* PROFILE / MENU */}
        <div className="flex items-center gap-4">
          <Link href="/profile" className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
            <User size={20} className="text-white" />
          </Link>
          
          {/* Mobile Menu Button */}
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-white">
             {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {isOpen && (
        <div className="md:hidden bg-midnight-950 border-b border-white/10 absolute top-20 left-0 right-0 p-6 flex flex-col gap-4 shadow-2xl">
          {navItems.map((item) => (
             <Link 
               key={item.href} 
               href={item.href} 
               onClick={() => setIsOpen(false)}
               className="text-lg font-serif font-bold text-white py-2 border-b border-white/5"
             >
               {item.name}
             </Link>
          ))}
        </div>
      )}
    </header>
  );
}
