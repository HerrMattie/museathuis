import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import DashboardPage from '@/components/dashboard/DashboardPage';
import LandingPage from '@/components/home/LandingPage';

export const revalidate = 0;

// Hier voegen we searchParams toe aan de props
export default async function HomePage({ searchParams }: { searchParams: { date?: string } }) {
  const supabase = createClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <LandingPage />;
  }

  // Als er een datum in de URL staat, gebruik die. Anders vandaag.
  const requestedDate = searchParams.date || new Date().toISOString().split('T')[0];

  return <DashboardPage user={user} date={requestedDate} />;
}
