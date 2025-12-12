'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
    LayoutDashboard, 
    Calendar, 
    Download, 
    CheckSquare, 
    Headphones, 
    Gamepad2, 
    FileText, 
    Layers, 
    Award, 
    Settings,
    Type
} from 'lucide-react';

const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/crm' },
    { icon: Calendar, label: 'Weekplanning', href: '/crm/schedule' },
    { icon: Type, label: 'Pagina Teksten', href: '/crm/pages' },
    { icon: Calendar, label: 'AI Regisseur', href: '/crm/planning' },
    
    { type: 'divider' },
    
    { icon: Download, label: 'Art Curator', href: '/crm/import' },
    { icon: CheckSquare, label: 'Review Queue', href: '/crm/review' },
    
    { type: 'divider' },
    
    { icon: Headphones, label: 'Tours', href: '/crm/tours' },
    { icon: Gamepad2, label: 'Games', href: '/crm/games' },
    { icon: FileText, label: 'Focus', href: '/crm/focus' },
    { icon: Layers, label: 'Salons', href: '/crm/salons' },
    { icon: Award, label: 'Badge Manager', href: '/crm/badges' },
    
    { type: 'divider' },
    
    { icon: Settings, label: 'Instellingen', href: '/crm/settings' },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 bg-midnight-950 border-r border-white/10 h-screen fixed left-0 top-0 overflow-y-auto z-50 hidden md:block">
            <div className="p-6">
                <h1 className="text-2xl font-serif font-bold text-white tracking-wider mb-1">
                    MUSEA<span className="text-museum-gold">THUIS</span>
                </h1>
                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Studio</p>
            </div>

            <nav className="px-4 pb-4 space-y-1">
                {menuItems.map((item, idx) => {
                    // 1. Render Divider
                    if (item.type === 'divider') {
                        return <div key={idx} className="h-px bg-white/10 my-4 mx-2" />;
                    }

                    // 2. TypeScript Veiligheidscheck: Als er geen href is, render niets
                    if (!item.href) return null;

                    const isActive = pathname === item.href;
                    // @ts-ignore
                    const Icon = item.icon;

                    return (
                        <Link 
                            key={item.href} 
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
                                isActive 
                                ? 'bg-museum-gold text-black font-bold shadow-[0_0_15px_rgba(234,179,8,0.3)]' 
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            {Icon && <Icon size={18} />}
                            {item.label}
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}
