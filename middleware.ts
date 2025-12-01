// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { nextUrl } = req;

  // Alleen alles onder /admin beveiligen
  if (!nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  const basicAuth = req.headers.get('authorization');
  const adminUser = process.env.ADMIN_USER;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminUser || !adminPassword) {
    console.error(
      '[middleware] ADMIN_USER of ADMIN_PASSWORD ontbreekt. Stel deze in als environment variables.'
    );
    return new NextResponse('Admin configuratie ontbreekt', { status: 500 });
  }

  if (basicAuth) {
    const [, base64] = basicAuth.split(' ');
    const [user, password] = Buffer.from(base64, 'base64').toString().split(':');

    if (user === adminUser && password === adminPassword) {
      return NextResponse.next();
    }
  }

  return new NextResponse('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="MuseaThuis Admin"'
    }
  });
}

// Zorg dat dit alleen op /admin wordt toegepast
export const config = {
  matcher: ['/admin/:path*']
};
