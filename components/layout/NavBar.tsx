'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Menu, X } from 'lucide-react';

export default function NavBar({ user }: { user: any }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  // Helper om te zien of een link actief is
  const isActive = (path: string) => pathname.startsWith(path);

  const navLinks = [
    { name: 'Tour', href: '/tour' },
    { name: 'Game', href: '/game' },
    { name: 'Focus', href: '/focus' },
    { name: 'Salon', href: '/salon' },
    { name: 'Academie', href: '/academie' },
    { name: 'Best of', href: '/best-of' },
  ];

  return (
    <>
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-midnight-950/90 backdrop-blur-md h-20 transition-all">
        <div className="container mx-auto px-6 h-full flex justify-between items-center">
          
          {/* LOGO */}
          <Link href="/" className="font-serif text-3xl font-black tracking-[0.15em] text-white hover:text-museum-gold transition-colors drop-shadow-md relative z-50 group">
             MUSEA<span className="text-museum-gold group-hover:text-white transition-colors">THUIS</span>
          </Link>
          
          {/* DESKTOP MENU */}
          <div className="hidden lg:flex items-center gap-8 text-sm font-bold uppercase tracking-wider text-gray-400">
             {navLinks.map((link) => (
               <Link 
                 key={link.name} 
                 href={link.href} 
                 className={`transition-colors ${isActive(link.href) ? 'text-museum-gold' : 'hover:text-white'}`}
               >
                 {link.name}
               </Link>
             ))}
          </div>

          {/* RECHTS: ACCOUNT & MOBIEL KNOP */}
          <div className="flex items-center gap-4 text-sm font-bold relative z-50">
             {user ? (
               <Link href="/profile" className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors border border-white/5">
                  <User size={16} /> <span className="hidden md:inline">Mijn Profiel</span>
               </Link>
             ) : (
               <div className="flex items-center gap-4">
                 <Link href="/login" className="hidden md:block text-gray-300 hover:text-white transition-colors">Inloggen</Link>
                 <Link href="/pricing" className="text-black bg-museum-gold hover:bg-white transition-colors px-5 py-2.5 rounded-full font-bold shadow-lg shadow-museum-gold/10">
                    Word Lid
                 </Link>
               </div>
             )}
            
            {/* HAMBURGER MENU KNOP (Alleen mobiel) */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden text-white p-2 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Menu openen"
            >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* --- MOBIELE MENU OVERLAY --- */}
      <div 
         className={`fixed inset-0 z-40 lg:hidden bg-midnight-950 transition-transform duration-300 ease-in-out pt-24 px-6 ${
            isMenuOpen ? 'translate-x-0' : 'translate-x-full'
         }`}
      >
          <div className="flex flex-col gap-6 text-xl font-serif font-bold">
               {navLinks.map((link) => (
                 <Link 
                    key={link.name} 
                    onClick={() => setIsMenuOpen(false)} 
                    href={link.href} 
                    className="text-white hover:text-museum-gold border-b border-white/10 pb-4"
                 >
                    {link.name}
                 </Link>
               ))}
          </div>
      </div>
    </>
  );
}
