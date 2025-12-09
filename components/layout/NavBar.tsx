'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, LogIn } from 'lucide-react';

// De NavBar accepteert nu de 'user' prop die we vanuit layout.tsx sturen
export default function NavBar({ user }: { user: any }) {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-midnight-950/80 backdrop-blur-md">
      <div className="container mx-auto px-6 h-20 flex justify-between items-center">
        
        {/* LOGO */}
        <Link href="/" className="font-serif text-2xl font-bold tracking-widest text-white group">
          MUSEA<span className="text-museum-gold group-hover:text-white transition-colors">THUIS</span>
        </Link>
        
        {/* LOGICA: WEL OF GEEN MENU? */}
        {user ? (
          // SCENARIO A: INGELOGD (Het volledige menu)
          <>
            <div className="hidden md:flex gap-8">
              {['Vandaag', 'Salon', 'Academie', 'Best of'].map((item) => {
                const href = item === 'Vandaag' ? '/' : `/${item.toLowerCase().replace(' ', '-')}`;
                return (
                  <Link key={item} href={href} className={`text-sm font-medium transition-colors ${isActive(href) ? 'text-museum-gold' : 'text-gray-400 hover:text-white'}`}>
                    {item}
                  </Link>
                )
              })}
            </div>

            <Link href="/profile" className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-museum-gold transition-colors border border-transparent hover:border-museum-gold/20">
              <User size={20} />
            </Link>
          </>
        ) : (
          // SCENARIO B: NIET INGELOGD (Alleen inlogknop)
          <div className="flex gap-4">
             <Link href="/login" className="flex items-center gap-2 text-sm font-bold text-white hover:text-museum-gold transition-colors">
               <LogIn size={18} /> Inloggen
             </Link>
             <Link href="/pricing" className="hidden md:block bg-white text-black px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-museum-lime transition-colors">
               Word Lid
             </Link>
          </div>
        )}

      </div>
    </nav>
  );
}
