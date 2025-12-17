'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MAIN_NAV_LINKS } from '@/lib/navConfig';
import { cn } from '@/lib/utils';

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-midnight-950/95 backdrop-blur-xl border-t border-white/10 z-50 pb-safe">
      <div className="flex justify-around items-center h-20 px-2">
        {MAIN_NAV_LINKS.map((link) => {
          const Icon = link.icon;
          const isActive = pathname.startsWith(link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              className="flex-1 flex flex-col items-center justify-center gap-1.5 py-2"
            >
              <div
                className={cn(
                  "p-2 rounded-xl transition-all duration-300",
                  isActive
                    ? "bg-museum-gold text-black shadow-[0_0_15px_rgba(234,179,8,0.4)] translate-y-[-4px]"
                    : "text-gray-500 hover:text-gray-300"
                )}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span
                className={cn(
                  "text-[10px] font-bold uppercase tracking-wider transition-colors",
                  isActive ? "text-white" : "text-gray-600"
                )}
              >
                {link.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
