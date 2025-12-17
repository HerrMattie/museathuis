'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MAIN_NAV_LINKS } from '@/lib/navConfig';
import { cn } from '@/lib/utils'; 
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { User } from 'lucide-react';

export default function Header() {
  const pathname = usePathname();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const supabase = createClient();

  // Haal de avatar op bij het laden
  useEffect(() => {
    const getAvatar = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('user_profiles')
          .select('avatar_url')
          .eq('user_id', user.id)
          .single();
        if (data?.avatar_url) setAvatarUrl(data.avatar_url);
      }
    };
    getAvatar();
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-midnight-950/80 backdrop-blur-md border-b border-white/5 h-20">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2 group">
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
            
            // Verberg 'Profiel' in de hoofdnavigatie als we rechts de avatar hebben (optioneel)
            // if (link.href === '/profile') return null; 

            const isActive = link.href === '/' 
                ? pathname === '/' 
                : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border border-transparent",
                  isActive 
                    ? "bg-museum-gold/10 text-museum-gold border-museum-gold/20" 
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                )}
              >
                <Icon size={16} className={cn(isActive ? "text-museum-gold" : "text-current opacity-70 group-hover:opacity-100")} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* RECHTS: Profiel Avatar Link */}
        <Link href="/profile" className="w-10 h-10 rounded-full overflow-hidden border border-white/10 hover:border-museum-gold transition-colors flex items-center justify-center bg-black/40 group">
            {avatarUrl ? (
                <img src={avatarUrl} alt="Profiel" className="w-full h-full object-cover" />
            ) : (
                <User size={20} className="text-gray-400 group-hover:text-white transition-colors"/>
            )}
        </Link>

      </div>
    </header>
  );
}
