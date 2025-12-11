'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Headphones, Gamepad2, FileText, Calendar, Image as ImageIcon, Settings, LogOut, Download, Globe } from 'lucide-react';
import { createClient } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    const menu = [
        { icon: LayoutDashboard, label: 'Dashboard', href: '/crm' },
        { icon: Calendar, label: 'Weekplanning', href: '/crm/schedule' },
        { icon: Download, label: 'Art Curator', href: '/crm/import' }, // De Import Tool
        { icon: Check, label: 'Review Queue', href: '/crm/review' },   // De Review Queue
        { type: 'divider' },
        { icon: Headphones, label: 'Tours', href: '/crm/tours' },
        { icon: Gamepad2, label: 'Games', href: '/crm/games' },
        { icon: FileText, label: 'Artikelen', href: '/crm/focus' },
        { icon: ImageIcon, label: 'Collectie', href: '/crm/artworks' },
        { type: 'divider' },
        { icon: Globe, label: 'Site Teksten', href: '/crm/pages' }, // DEZE MISTE NOG
        { icon: Settings, label: 'Instellingen', href: '/crm/settings' },
    ];

    return (
        <aside className="w-64 bg-white border-r border-slate-200 min-h-screen flex flex-col fixed left-0 top-0">
            <div className="p-6 border-b border-slate-100">
                <span className="font-serif font-black text-2xl text-slate-900 tracking-widest">MUSEAADMIN</span>
                <p className="text-xs text-slate-400 mt-1">Backoffice Beheer</p>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {menu.map((item, idx) => {
                    if (item.type === 'divider') return <div key={idx} className="h-px bg-slate-100 my-4 mx-2"></div>;
                    
                    const Icon = item.icon as any;
                    const isActive = pathname === item.href;

                    return (
                        <Link 
                            key={idx} 
                            href={item.href || '#'}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-colors ${
                                isActive 
                                ? 'bg-slate-900 text-white shadow-md' 
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                        >
                            <Icon size={18} />
                            {item.label}
                        </Link>
                    )
                })}
            </nav>

            <div className="p-4 border-t border-slate-100">
                <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-lg text-sm font-bold w-full transition-colors">
                    <LogOut size={18} /> Uitloggen
                </button>
            </div>
        </aside>
    );
}

// Helper import voor icon
import { Check } from 'lucide-react';
