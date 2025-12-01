// app/health/page.tsx
import { supabaseServerClient } from '@/lib/supabaseServer';

export const revalidate = 0;

export default async function HealthPage() {
  let dbOk = false;
  let dbMessage = '';

  try {
    const { error } = await supabaseServerClient.from('tours').select('id').limit(1);
    if (error) {
      dbOk = false;
      dbMessage = error.message;
    } else {
      dbOk = true;
      dbMessage = 'Verbinding met database succesvol.';
    }
  } catch (e: any) {
    dbOk = false;
    dbMessage = e?.message ?? 'Onbekende fout';
  }

  return (
    <main className="max-w-xl mx-auto px-4 py-10 space-y-4">
      <h1 className="text-2xl font-semibold">
        Systeemstatus
      </h1>

      <section className="border rounded-lg p-4 bg-white">
        <h2 className="text-lg font-semibold mb-2">
          Database
        </h2>
        <p className="text-sm">
          Status:{' '}
          <span className={dbOk ? 'text-green-700' : 'text-red-700'}>
            {dbOk ? 'OK' : 'NIET OK'}
          </span>
        </p>
        <p className="text-xs text-gray-600 mt-1">
          {dbMessage}
        </p>
      </section>
    </main>
  );
}
