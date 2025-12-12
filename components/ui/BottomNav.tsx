'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, Heart, User, Layers } from 'lucide-react';

export default function BottomNav() {
    const pathname = usePathname();

    const items = [
        { href: '/', label: 'Home', icon: Home },
        { href: '/tour', label: 'Ontdek', icon: Compass }, // Of /game of /focus, wat jij de belangrijkste vindt
        { href: '/salon', label: 'Salon', icon: Layers },
        { href: '/favorites', label: 'Collectie', icon: Heart },
        { href: '/profile', label: 'Profiel', icon: User },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-midnight-950/90 backdrop-blur-lg border-t border-white/10 pb-safe z-50 md:hidden">
            <div className="flex justify-around items-center h-16">
                {items.map((item) => {
                    const Icon = item.icon;
                    // Check of we op deze pagina zijn (of een subpagina ervan)
                    const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

                    return (
                        <Link 
                            key={item.href} 
                            href={item.href}
                            className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
                                isActive ? 'text-museum-gold' : 'text-gray-500 hover:text-gray-300'
                            }`}
                        >
                            <Icon size={20} className={isActive ? 'fill-current' : ''} />
                            <span className="text-[10px] font-bold mt-1 tracking-wide">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
