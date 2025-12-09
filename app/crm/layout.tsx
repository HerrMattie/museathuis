import "../globals.css"; // Gebruik zelfde styles
import Link from 'next/link';
import { LayoutDashboard, Image as ImageIcon, Users, Settings, LogOut } from 'lucide-react';

export default function CRMLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-midnight-950 text-white">
      {/* SIDEBAR */}
      <aside className="w-64 border-r border-white/10 bg-midnight-900 hidden md:flex flex-col">
        <div className="p-6 border-b border-white/10">
          <span className="font-serif text-xl font-bold tracking-widest text-white">
            MUSEA<span className="text-museum-lime">ADMIN</span>
          </span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/crm" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/5 text-white">
            <LayoutDashboard size={18} /> Dashboard
          </Link>
          <Link href="/crm/tours" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
            <ImageIcon size={18} /> Tours & Content
          </Link>
          <Link href="/crm/users" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
            <Users size={18} /> Gebruikers
          </Link>
        </nav>

        <div className="p-4 border-t border-white/10">
          <Link href="/" className="flex items-center gap-3 px-4 py-3 text-sm text-gray-500 hover:text-white">
            <LogOut size={16} /> Terug naar site
          </Link>
        </div>
      </aside>

      {/* CONTENT */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
