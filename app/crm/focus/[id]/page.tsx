import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import Link from 'next/link';
import EditFocusForm from './EditFocusForm';

export const revalidate = 0;

export default async function EditFocusPage({ params }: { params: { id: string } }) {
  const supabase = createClient(cookies());
  let initialItem = { 
      id: params.id, 
      title: '', 
      intro: '', 
      content_markdown: '', 
      audio_script_main: '',
      status: 'draft', 
      is_premium: true 
  };

  if (params.id !== 'new') {
    const { data } = await supabase.from('focus_items').select('*').eq('id', params.id).single();
    if (data) initialItem = data;
  }

  return (
    <div>
      <Link href="/crm/focus" className="text-blue-600 hover:underline mb-4 block text-sm">
        &larr; Terug naar Overzicht
      </Link>
      <h2 className="text-3xl font-bold text-slate-800 mb-6">
          {params.id === 'new' ? 'Nieuw Focus Item' : 'Focus Item Bewerken'}
      </h2>
      <EditFocusForm initialItem={initialItem} isNew={params.id === 'new'} />
    </div>
  );
}
