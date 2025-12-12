import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const supabase = createClient(cookies());

  // Check of er een sessie is
  const { data: { session } } = await supabase.auth.getSession();

  if (session) {
    await supabase.auth.signOut();
  }

  // Stuur de gebruiker terug naar de homepage (of login pagina)
  return NextResponse.redirect(new URL('/', req.url), {
    status: 302,
  });
}

// Voor het geval je een GET link gebruikt (bijv. <a href="/auth/signout">)
export async function GET(req: NextRequest) {
    const supabase = createClient(cookies());
    await supabase.auth.signOut();
    return NextResponse.redirect(new URL('/', req.url), { status: 302 });
}
