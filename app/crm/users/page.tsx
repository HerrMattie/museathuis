import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Users, Shield, Star, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';

export const revalidate = 0;

export default async function CrmUsersPage() {
  const supabase = createClient(cookies());
  
  // Haal profielen op, gesorteerd op nieuwste eerst
  const { data: users } = await supabase
    .from('user_profiles')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div>
      <header className="flex justify-between items-center mb-8">
        <div>
            <h2 className="text-3xl font-bold text-slate-800">Gebruikersbeheer</h2>
            <p className="text-slate-500">Beheer rechten en lidmaatschappen.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200 text-sm font-bold text-slate-600">
            Totaal: {users?.length || 0} Leden
        </div>
      </header>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
         <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                <tr>
                    <th className="p-4">Gebruiker</th>
                    <th className="p-4">Rol</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Lid Sinds</th>
                    <th className="p-4 text-right">Actie</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {users?.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4">
                            <div className="font-bold text-slate-800">{user.display_name || 'Naamloos'}</div>
                            <div className="text-xs text-slate-400">{user.email || 'Geen e-mail zichtbaar'}</div> 
                            {/* Let op: Email staat soms in auth.users, niet in user_profiles, afhankelijk van je setup. 
                                Als user.email leeg is, moeten we een 'View' maken of het ID tonen. */}
                        </td>
                        <td className="p-4">
                            {user.is_admin ? (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700">
                                    <Shield size={12}/> Admin
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                                    <Users size={12}/> Lid
                                </span>
                            )}
                        </td>
                        <td className="p-4">
                             {user.is_premium ? (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-museum-gold/20 text-yellow-800 border border-museum-gold/30">
                                    <Star size={12}/> Premium
                                </span>
                            ) : (
                                <span className="text-xs text-slate-400">Gratis</span>
                            )}
                        </td>
                        <td className="p-4 text-sm text-slate-500">
                            {user.created_at ? format(new Date(user.created_at), 'd MMM yyyy', { locale: nl }) : '-'}
                        </td>
                        <td className="p-4 text-right">
                            <Link href={`/crm/users/${user.id}`} className="inline-flex items-center justify-center p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                <Edit size={18} />
                            </Link>
                        </td>
                    </tr>
                ))}
            </tbody>
         </table>
         {(!users || users.length === 0) && (
             <div className="p-12 text-center text-slate-400">Nog geen gebruikers gevonden.</div>
         )}
      </div>
    </div>
  );
}
