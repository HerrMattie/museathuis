import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import DashboardPage from '@/components/dashboard/DashboardPage';

export const revalidate = 0; 

export default async function HomePage() {
  const supabase = createClient(cookies());
  
  // We halen de user op, maar als die er niet is (null), is dat OOK prima.
  const { data: { user } } = await supabase.auth.getUser();

  // We sturen IEDEREEN naar het dashboard. 
  // De Dashboard component handelt af hoe het eruit ziet voor gast vs lid.
  return <DashboardPage user={user} />;
}
