import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import LandingPage from '@/components/home/LandingPage';
import DashboardPage from '@/components/dashboard/DashboardPage'; // We verplaatsen je oude dashboard hierheen

export const revalidate = 60;

export default async function HomePage() {
  const supabase = createClient(cookies());
  
  // Check of de gebruiker is ingelogd
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // 1. NIET INGELOGD -> Toon de glimmende Landing Page
    return <LandingPage />;
  }

  // 2. WEL INGELOGD -> Toon het Dashboard
  // Omdat we het dashboard component hebben verplaatst, renderen we die hier
  return <DashboardPage user={user} />;
}
