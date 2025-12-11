'use client'; // <--- Hierdoor werkt het mobiele menu wel!

import { useState } from 'react';
import Link from 'next/link';
import { User, Menu, X } from 'lucide-react';

export default function Navbar({ user }: { user: any }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      {/* --- HEADER --- */}
      <nav className="fixed top-0 w-full z-50 bg-midnight-950/95 backdrop-blur-xl border-b border-white/5 h-20 transition-all">
        <div className="container mx-auto px-6 h-full flex justify-between items-center">
          
          {/* LOGO */}
          <Link href="/" className="font-serif text-3xl font-black tracking-[0.15em] text-museum-gold hover:text-white transition-colors drop-shadow-md relative z-50">
            MUSEATHUIS
          </Link>
          
          {/* DESKTOP MENU */}
          <div className="hidden lg:flex items-center gap-8 text-sm font-bold uppercase tracking-wider text-gray-400">
             <Link href="/tour" className="hover:text-museum-gold transition-colors">Tour</Link>
             <Link href="/game" className="hover:text-museum-gold transition-colors">Game</Link>
             <Link href="/focus" className="hover:text-museum-gold transition-colors">Focus</Link>
             <Link href="/salon" className="hover:text-museum-gold transition-colors">Salon</Link>
             <Link href="/academie" className="hover:text-museum-gold transition-colors">Academie</Link>
             <Link href="/best-of" className="hover:text-museum-gold transition-colors">Best of</Link>
          </div>

          {/* RECHTS: ACCOUNT & MOBIEL KNOP */}
          <div className="flex items-center gap-4 text-sm font-bold relative z-50">
             {user ? (
               <Link href="/profile" className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors border border-white/5">
                  <User size={16} /> <span className="hidden md:inline">Mijn Profiel</span>
               </Link>
             ) : (
               <>
                 <Link href="/login" className="hidden md:block text-gray-300 hover:text-white transition-colors">Inloggen</Link>
                 <Link href="/pricing" className="text-black bg-museum-gold hover:bg-white transition-colors px-5 py-2.5 rounded-full font-bold shadow-lg shadow-museum-gold/10">
                    Word Lid
                 </Link>
               </>
             )}
            
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
               <Link onClick={() => setIsMenuOpen(false)} href="/tour" className="text-white hover:text-museum-gold border-b border-white/10 pb-4">Audiotours</Link>
               <Link onClick={() => setIsMenuOpen(false)} href="/game" className="text-white hover:text-museum-gold border-b border-white/10 pb-4">Games</Link>
               <Link onClick={() => setIsMenuOpen(false)} href="/focus" className="text-white hover:text-museum-gold border-b border-white/10 pb-4">In Focus</Link>
               <Link onClick={() => setIsMenuOpen(false)} href="/salon" className="text-white hover:text-museum-gold border-b border-white/10 pb-4">De Salon</Link>
               <Link onClick={() => setIsMenuOpen(false)} href="/academie" className="text-white hover:text-museum-gold border-b border-white/10 pb-4">Academie</Link>
               <Link onClick={() => setIsMenuOpen(false)} href="/best-of" className="text-white hover:text-museum-gold border-b border-white/10 pb-4">Best of</Link>
          </div>
      </div>
    </>
  );
}
