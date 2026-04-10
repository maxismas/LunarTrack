import { auth } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const session = await auth()

  // Allow access to login and auth routes
  if (
    request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/api/auth')
  ) {
    return NextResponse.next()
  }

  // Redirect to login if not authenticated
  if (!session?.user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Check role-based access
  const { role } = session.user

  if (
    request.nextUrl.pathname.startsWith('/manager') &&
    role !== 'MANAGER' &&
    role !== 'SUPER_ADMIN'
  ) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  if (
    request.nextUrl.pathname.startsWith('/employee') &&
    role !== 'EMPLOYEE' &&
    role !== 'SUPER_ADMIN'
  ) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  if (
    request.nextUrl.pathname.startsWith('/hr') &&
    role !== 'HR_ADMIN' &&
    role !== 'SUPER_ADMIN'
  ) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  if (
    request.nextUrl.pathname.startsWith('/admin') &&
    role !== 'SUPER_ADMIN'
  ) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
