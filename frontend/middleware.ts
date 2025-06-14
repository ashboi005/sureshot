import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

type Role = 'USER' | 'ADMIN' | 'WORKER' | 'DOCTOR';

const rolePaths: Record<Role, string[]> = {
  USER: ['/user', '/dashboard'],
  ADMIN: ['/admin'],
  WORKER: ['/worker'],
  DOCTOR: ['/doctor']
};

// Public paths - now using exact matches or specific subpaths
const publicPaths = [
  '/auth',
  '/login',
  '/register',
  '/api/auth' // If you have auth API routes
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log('Processing path:', pathname); // Debug log


  // Improved public paths check
  const isPublicPath = publicPaths.some(publicPath => 
    pathname === publicPath || // Exact match
    pathname.startsWith(`${publicPath}/`) // Subpaths
  );

  if (isPublicPath) {
    console.log('Public path allowed:', pathname);
    return NextResponse.next();
  }

  // Auth check
  const token = request.cookies.get('accessToken')?.value;
  const role = request.cookies.get('role')?.value as Role | undefined;

  console.log('Auth check - Token:', !!token, 'Role:', role); // Debug log

  if (!token) {
    console.log('No token - redirecting to login');
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (!role) {
    console.log('No role - redirecting to login');
    const response = NextResponse.redirect(new URL('/auth/login', request.url));
    response.cookies.delete('accessToken');
    return response;
  }

  // Role-based access check
  const hasAccess = rolePaths[role].some(allowedPath => 
    pathname === allowedPath ||
    pathname.startsWith(`${allowedPath}/`)
  );

  if (!hasAccess) {
    console.log(`Role ${role} cannot access ${pathname}`);
    const defaultPath = rolePaths[role][0] || '/dashboard';
    const redirectUrl = new URL(defaultPath, request.url);
    redirectUrl.searchParams.set('unauthorized', 'true');
    return NextResponse.redirect(redirectUrl);
  }

  console.log('Access granted to', pathname);
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}