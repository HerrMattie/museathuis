import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import SettingsForm from '@/components/profile/SettingsForm'; // Zorg dat dit pad klopt

export const revalidate = 0;

export default async function SettingsPage() {
  const supabase = createClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // Haal de profielgegevens op om het formulier vooraf in te vullen
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  return (
    <div className="min-h-screen bg-midnight-950 text-white pt-24 pb-12 px-6">
      <div className="max-w-2xl mx-auto">
        
        {/* Terug knop */}
        <Link href="/profile" className="text-gray-400 hover:text-white flex items-center gap-2 mb-8 text-sm font-bold uppercase tracking-widest transition-colors">
            <ArrowLeft size={16}/> Terug naar Profiel
        </Link>

        {/* Het Client Component Formulier */}
        {/* We geven de user en profile data mee als 'props' */}
        <SettingsForm user={user} initialData={profile} />

      </div>
    </div>
  );
}
