'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Image as ImageIcon, Headphones, Crosshair, 
  Gamepad2, Users, LogOut, Settings, BookOpen, Brush, Calendar 
} from 'lucide-react'; 

export default function Sidebar() {
  const pathname = usePathname();

  // Helper component voor de knoppen
  const AdminLink = ({ href, icon, label }: { href: string, icon: React.ReactNode, label: string }) => {
    // Check of we op deze pagina zijn (of een subpagina ervan)
    // Bijv: /crm/tours/create moet ook de knop 'Tours' arceren
    const isActive = pathname === href || (href !== '/crm' && pathname.startsWith(href));
    
    return (
      <Link 
        href={href} 
        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium ${
          isActive 
            ? 'bg-museum-gold text-black shadow-md' 
            : 'text-gray-400 hover:bg-white/10 hover:text-white'
        }`}
      >
        {icon}
        <span>{label}</span>
      </Link>
    );
  };

  return (
    <aside className="w-64 bg-midnight-950 text-white flex flex-col fixed h-full z-20 border-r border-white/5">
        <div className="p-6 border-b border-white/10">
           <h1 className="font-serif text-xl font-bold text-museum-gold tracking-widest">
             MUSEA<span className="text-white">ADMIN</span>
           </h1>
           <p className="text-xs text-gray-500 mt-1">Backoffice Beheer</p>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
           <AdminLink href="/crm" icon={<LayoutDashboard size={20}/>} label="Dashboard" />
           
           <div className="pt-6 pb-2 text-[10px] font-bold text-gray-600 uppercase tracking-widest px-4">Content</div>
           <AdminLink href="/crm/schedule" icon={<Calendar size={20}/>} label="Weekplanning" />
           <AdminLink href="/crm/tours" icon={<Headphones size={20}/>} label="Tours" />
           <AdminLink href="/crm/focus" icon={<Crosshair size={20}/>} label="Focus Items" />
           <AdminLink href="/crm/games" icon={<Gamepad2 size={20}/>} label="Games & Quiz" />
           <AdminLink href="/crm/artworks" icon={<ImageIcon size={20}/>} label="Kunstwerken" />
           
           <div className="pt-6 pb-2 text-[10px] font-bold text-gray-600 uppercase tracking-widest px-4">Pagina's</div>
           <AdminLink href="/crm/salons" icon={<Brush size={20}/>} label="Salons" />
           <AdminLink href="/crm/academie" icon={<BookOpen size={20}/>} label="Academie" />

           <div className="pt-6 pb-2 text-[10px] font-bold text-gray-600 uppercase tracking-widest px-4">Systeem</div>
           <AdminLink href="/crm/users" icon={<Users size={20}/>} label="Gebruikers" />
           <AdminLink href="/crm/settings" icon={<Settings size={20}/>} label="Instellingen" />
        </nav>

        <div className="p-4 border-t border-white/10 bg-midnight-900/50">
           <form action="/auth/signout" method="post">
             <button className="flex items-center gap-3 text-gray-400 hover:text-red-400 transition-colors w-full p-2 rounded-lg hover:bg-white/5 text-sm font-medium">
                <LogOut size={18} /> Uitloggen
             </button>
           </form>
        </div>
    </aside>
  );
}
