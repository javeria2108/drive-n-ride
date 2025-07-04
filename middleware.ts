import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    // Get the pathname of the request
    const pathname = req.nextUrl.pathname
    
    // Get the user's role from the token
    const role = req.nextauth.token?.role

    // Redirect authenticated users away from auth pages
    if (pathname.startsWith('/auth/') && req.nextauth.token) {
      if (role === 'driver') {
        return NextResponse.redirect(new URL('/driver/dashboard', req.url))
      } else {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    }

    // Role-based access control
    if (pathname.startsWith('/driver/') && role !== 'driver') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    if (pathname.startsWith('/passenger/') && role !== 'passenger') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname

        // Allow access to auth pages without authentication
        if (pathname.startsWith('/auth/')) {
          return true
        }

        // Allow access to public pages
        if (pathname === '/' || pathname.startsWith('/api/auth/')) {
          return true
        }

        // Require authentication for protected routes
        if (pathname.startsWith('/dashboard') || 
            pathname.startsWith('/driver/') || 
            pathname.startsWith('/passenger/')) {
          return !!token
        }

        return true
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}