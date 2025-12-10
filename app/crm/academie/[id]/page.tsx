import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import EditAcademieForm from './EditAcademieForm'; // <--- DEZE WAS FOUT

export const revalidate = 0;

export default async function EditAcademiePage({ params }: { params: { id: string } }) {
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
    // We halen data op uit de 'academie' tabel
    const { data } = await supabase.from('academie').select('*').eq('id', params.id).single();
    if (data) {
      initialItem = data;
    }
  }

  return (
    <div>
      <h2 className="text-3xl font-bold text-slate-800 mb-6">
        {params.id === 'new' ? 'Nieuwe Cursus / Les Aanmaken' : `Cursus bewerken: ${initialItem.title}`}
      </h2>
      <EditAcademieForm initialItem={initialItem} isNew={params.id === 'new'} />
    </div>
  );
}
