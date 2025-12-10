import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, Image as ImageIcon, Headphones, Crosshair, 
  Gamepad2, Users, LogOut, Settings, BookOpen, Brush 
} from 'lucide-react'; 

function AdminLink({ href, icon, label }: { href: string, icon: React.ReactNode, label: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-museum-gold hover:text-black transition-all font-medium">
      {icon}
      <span>{label}</span>
    </Link>
  );
}

export default async function CrmLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient(cookies());
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('is_admin')
    .eq('user_id', user.id)
    .single();

  if (!profile || profile.is_admin !== true) {
    redirect('/'); 
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      
      <aside className="w-64 bg-midnight-950 text-white flex flex-col fixed h-full z-20">
        <div className="p-6 border-b border-white/10">
           <h1 className="font-serif text-xl font-bold text-museum-gold tracking-widest">
             MUSEA<span className="text-white">ADMIN</span>
           </h1>
           <p className="text-xs text-gray-400 mt-1">Backoffice Beheer</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
           <AdminLink href="/crm" icon={<LayoutDashboard size={20}/>} label="Dashboard" />
           <div className="pt-4 pb-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Content</div>
           <AdminLink href="/crm/schedule" icon={<LayoutDashboard size={20}/>} label="Weekplanning" />
           <AdminLink href="/crm/tours" icon={<Headphones size={20}/>} label="Tours" />
           <AdminLink href="/crm/focus" icon={<Crosshair size={20}/>} label="Focus Items" />
           <AdminLink href="/crm/games" icon={<Gamepad2 size={20}/>} label="Games & Quiz" />
           <AdminLink href="/crm/artworks" icon={<ImageIcon size={20}/>} label="Kunstwerken" />
           
           <div className="pt-4 pb-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Pagina's</div>
           {/* FIX: Nu consistent meervoud */}
           <AdminLink href="/crm/salons" icon={<Brush size={20}/>} label="Salons" />
           <AdminLink href="/crm/academie" icon={<BookOpen size={20}/>} label="Academie" />

           <div className="pt-4 pb-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Systeem</div>
           <AdminLink href="/crm/users" icon={<Users size={20}/>} label="Gebruikers" />
           <AdminLink href="/crm/settings" icon={<Settings size={20}/>} label="Instellingen" />
        </nav>

        <div className="p-4 border-t border-white/10">
           <form action="/auth/signout" method="post">
             <button className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors w-full p-2 rounded-lg hover:bg-white/5">
                <LogOut size={20} /> Uitloggen
             </button>
           </form>
        </div>
      </aside>

      <main className="flex-1 ml-64 p-8 overflow-y-auto">
         {children}
      </main>

    </div>
  );
}
