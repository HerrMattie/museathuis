'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { 
  Menu, X, User, 
  Home, Compass, Gamepad2, BookOpen, Coffee, GraduationCap, Star 
} from 'lucide-react';

// We voegen hier de iconen toe aan de configuratie
const navItems = [
  { label: 'Tour', href: '/tour', icon: Compass },
  { label: 'Game', href: '/game', icon: Gamepad2 },
  { label: 'Focus', href: '/focus', icon: BookOpen },
  { label: 'Salon', href: '/salon', icon: Coffee },
  { label: 'Best Of', href: '/best-of', icon: Star },
];

export default function Header() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Detecteer scrollen voor extra "subtiele arcering" effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll lock voor mobiel menu
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  return (
    <>
      {/* HEADER BALK */}
      <header 
        className={`fixed top-0 left-0 right-0 z-[60] transition-all duration-300 border-b ${
          scrolled || isOpen 
            ? 'bg-midnight-950/90 backdrop-blur-md border-white/10 shadow-lg py-2' 
            : 'bg-transparent border-transparent py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          
          {/* LOGO (Stijlvol & Elegant) */}
          <Link href="/" className="flex items-center gap-3 group z-[70]" onClick={() => setIsOpen(false)}>
            <div className="w-10 h-10 bg-museum-gold rounded-sm flex items-center justify-center text-black font-serif font-bold text-xl shadow-[0_0_15px_rgba(212,175,55,0.3)] group-hover:scale-105 transition-transform">
              M
            </div>
            <span className="font-serif font-bold text-2xl tracking-tight text-white group-hover:text-museum-gold transition-colors">
              Musea<span className="text-museum-gold">Thuis</span>
            </span>
          </Link>

          {/* DESKTOP NAVIGATIE (Met Icoontjes!) */}
          <nav className="hidden lg:flex items-center gap-1 bg-white/5 rounded-full px-2 py-1 border border-white/5 backdrop-blur-sm">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                    isActive 
                      ? 'bg-museum-gold text-black shadow-lg shadow-yellow-900/20' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon size={14} className={isActive ? 'text-black' : 'text-museum-gold/70'} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* RECHTS: PROFIEL & MOBIEL KNOP */}
          <div className="flex items-center gap-4 z-[70]">
              <Link 
                href="/profile" 
                className="hidden md:flex w-10 h-10 rounded-full border border-white/10 bg-white/5 items-center justify-center hover:bg-museum-gold hover:text-black hover:border-museum-gold transition-all duration-300"
              >
                  <User size={18} />
              </Link>

              {/* Hamburger Knop (Mobiel) */}
              <button 
                  onClick={() => setIsOpen(!isOpen)} 
                  className="lg:hidden p-2 text-white hover:text-museum-gold transition-colors relative focus:outline-none"
              >
                  {isOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
          </div>
        </div>
      </header>

      {/* MOBIEL MENU OVERLAY (Volledig scherm, blijft werken) */}
      <div 
        className={`fixed inset-0 z-[50] bg-midnight-950 flex flex-col justify-center px-8 transition-all duration-500 ease-in-out lg:hidden ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        }`}
      >
          {/* Sfeervolle achtergrond gloed */}
          <div className="absolute top-1/4 right-0 w-80 h-80 bg-museum-gold/10 rounded-full blur-[100px]"></div>
          
          <nav className="flex flex-col gap-6 relative z-10 max-w-md mx-auto w-full">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-4 text-2xl font-serif font-bold transition-all duration-300 group ${
                     isOpen ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'
                  }`}
                  style={{ transitionDelay: `${index * 50}ms` }}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                      isActive ? 'bg-museum-gold text-black' : 'bg-white/5 text-gray-400 group-hover:text-white group-hover:bg-white/10'
                  }`}>
                      <Icon size={24} />
                  </div>
                  <span className={isActive ? 'text-museum-gold' : 'text-gray-300 group-hover:text-white'}>
                      {item.label}
                  </span>
                </Link>
              );
            })}
            
            <hr className="border-white/10 my-4" />
            
            <Link 
              href="/profile" 
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-4 text-lg font-bold uppercase tracking-widest text-gray-400 hover:text-white"
            >
               <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                  <User size={24}/> 
               </div>
               Mijn Profiel
            </Link>
          </nav>
      </div>
    </>
  );
}
