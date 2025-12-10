import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import EditSalonForm from './EditSalonForm';

export const revalidate = 0;

export default async function EditSalonPage({ params }: { params: { id: string } }) {
  const supabase = createClient(cookies());
  
  let initialItem = {
    id: params.id,
    title: '',
    short_description: '',
    content_markdown: '',
    status: 'draft',
    created_at: new Date().toISOString(),
  };

  if (params.id !== 'new') {
    const { data } = await supabase.from('salons').select('*').eq('id', params.id).single();
    if (data) {
      initialItem = data;
    }
  }

  return (
    <div>
      <h2 className="text-3xl font-bold text-slate-800 mb-6">
        {params.id === 'new' ? 'Nieuwe Salon Aanmaken' : `Salon bewerken: ${initialItem.title}`}
      </h2>
      <EditSalonForm initialItem={initialItem} isNew={params.id === 'new'} />
    </div>
  );
}
