import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import Link from 'next/link';

export const revalidate = 3600; // Cache voor 1 uur

export default async function MuseumsPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Haal musea op uit de database
  const { data: museums } = await supabase
    .from('museums')
    .select('id, name, city, country')
    .order('name');

  return (
    <main className="container mx-auto max-w-5xl px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Musea</h1>
        <p className="text-gray-600">Partners van MuseaThuis</p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {museums && museums.length > 0 ? (
          museums.map((museum) => (
            <div key={museum.id} className="rounded-lg border bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <h2 className="text-xl font-semibold text-gray-900">{museum.name}</h2>
              <p className="mt-2 text-sm text-gray-500">
                {museum.city ? `${museum.city}, ` : ''}{museum.country || 'Locatie onbekend'}
              </p>
            </div>
          ))
        ) : (
          <div className="col-span-full py-10 text-center text-gray-500 border-2 border-dashed rounded-xl">
            Nog geen musea aangesloten.
          </div>
        )}
      </div>
    </main>
  );
}
