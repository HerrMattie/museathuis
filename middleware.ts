import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return request.cookies.get(name)?.value; },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.delete(name);
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // 1. CRM is ALLEEN voor Admins (moet ingelogd zijn)
  if (request.nextUrl.pathname.startsWith('/crm') && !user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. Profiel is ALLEEN voor ingelogde users (gratis of premium)
  if (request.nextUrl.pathname.startsWith('/profile') && !user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // LET OP: We verwijderen de blokkades voor /tour, /salon, /game, etc.
  // Gasten mogen daar nu komen!

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
