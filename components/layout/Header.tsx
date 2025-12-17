'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MAIN_NAV_LINKS } from '@/lib/navConfig';
import { cn } from '@/lib/utils'; 

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-midnight-950/80 backdrop-blur-md border-b border-white/5 h-20">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        
        {/* LOGO */}
        <Link href="/home" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-museum-gold rounded-lg flex items-center justify-center text-black font-serif font-bold text-xl group-hover:rotate-3 transition-transform">
            M
          </div>
          <span className="font-serif text-2xl font-bold tracking-tight text-white hidden sm:block">
            Musea<span className="text-museum-gold">Thuis</span>
          </span>
        </Link>

        {/* DESKTOP NAVIGATIE */}
        <nav className="hidden md:flex items-center gap-1">
          {MAIN_NAV_LINKS.map((link) => {
            const Icon = link.icon;
            // Check of we op deze pagina zijn (of een subpagina ervan)
            const isActive = pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300",
                  isActive 
                    ? "bg-white text-black shadow-lg shadow-white/10 scale-105" 
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                )}
              >
                <Icon size={18} className={cn(isActive ? "text-black" : "text-current")} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* RECHTS (Bijv. Upgrade knop of Avatar - optioneel) */}
        <div className="w-10">
            {/* Ruimte voor profiel foto of niets */}
        </div>

      </div>
    </header>
  );
}
