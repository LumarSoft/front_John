import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PROTECTED_PREFIX = '/portal'
const LOGIN_PATH = '/portal/login'
const DASHBOARD_PATH = '/portal/dashboard'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('portal_token')?.value

  const isPortalRoute = pathname.startsWith(PROTECTED_PREFIX)
  const isLoginPage = pathname === LOGIN_PATH

  // Redirect authenticated users away from login
  if (isLoginPage && token) {
    return NextResponse.redirect(new URL(DASHBOARD_PATH, request.url))
  }

  // Protect all portal routes except login
  if (isPortalRoute && !isLoginPage && !token) {
    return NextResponse.redirect(new URL(LOGIN_PATH, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/portal/:path*'],
}
