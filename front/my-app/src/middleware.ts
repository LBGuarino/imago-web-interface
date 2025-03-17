// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('__session');
  const path = request.nextUrl.pathname;

  // Redirigir si se accede a /admin sin sesión
  if (path.startsWith('/admin') && !sessionCookie) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Si está logueado y accede a login/register
  if ((path === '/login' || path === '/register') && sessionCookie) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}