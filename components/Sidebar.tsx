'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ... } from 'lucide-react'; // Importeer je iconen

export default function Sidebar() {
  const pathname = usePathname();

  const AdminLink = ({ href, icon, label }: any) => {
    const isActive = pathname.startsWith(href);
    return (
      <Link href={href} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium ${isActive ? 'bg-museum-gold text-black' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}>
        {icon}
        <span>{label}</span>
      </Link>
    );
  };

  return (
    <aside className="w-64 bg-midnight-950 text-white flex flex-col fixed h-full z-20">
       {/* ... Jouw logo en navigatie items hier, gebruikmakend van AdminLink ... */}
    </aside>
  );
}
