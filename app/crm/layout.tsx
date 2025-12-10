import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/crm/Sidebar'; // Zorg dat het pad klopt

export default async function CrmLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient(cookies());
  
  // 1. Check Auth (Server Side - Veilig)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // 2. Check Admin Rechten
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('is_admin')
    .eq('user_id', user.id)
    .single();

  if (!profile || profile.is_admin !== true) {
    redirect('/'); 
  }

  // 3. Render de Layout
  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      <Sidebar /> 
      <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen">
         {children}
      </main>
    </div>
  );
}
