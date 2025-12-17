import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import SettingsForm from '@/components/profile/SettingsForm';

export const revalidate = 0;

export default async function SettingsPage() {
  const supabase = createClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // select('*') haalt automatisch al je nieuwe kolommen (education, gender, etc) op!
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  return (
    <div className="min-h-screen bg-midnight-950 text-white pt-24 pb-12 px-6">
      {/* AANGEPAST: Van max-w-2xl naar max-w-4xl voor meer ruimte voor de tabs */}
      <div className="max-w-4xl mx-auto">
        
        {/* Header Sectie */}
        <div className="flex items-center justify-between mb-8">
            <div>
                <Link href="/profile" className="text-gray-400 hover:text-white flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-colors mb-2">
                    <ArrowLeft size={16}/> Terug naar Profiel
                </Link>
                <h1 className="text-3xl font-serif font-bold text-white">Instellingen</h1>
            </div>
        </div>

        {/* Het Formulier */}
        <SettingsForm user={user} initialData={profile} />

      </div>
    </div>
  );
}
