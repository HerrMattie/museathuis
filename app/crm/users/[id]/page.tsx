import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import Link from 'next/link';
import EditUserForm from './EditUserForm';

export const revalidate = 0;

export default async function EditUserPage({ params }: { params: { id: string } }) {
  const supabase = createClient(cookies());
  
  // We zoeken op het ID van het profiel (niet perse user_id, maar de primary key van de tabel)
  const { data: userProfile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!userProfile) return <div className="p-8">Gebruiker niet gevonden.</div>;

  return (
    <div>
      <Link href="/crm/users" className="text-blue-600 hover:underline mb-4 block text-sm">
        &larr; Terug naar Ledenlijst
      </Link>
      <h2 className="text-3xl font-bold text-slate-800 mb-6">
        Lid Bewerken: {userProfile.display_name}
      </h2>
      
      <EditUserForm user={userProfile} />
    </div>
  );
}
