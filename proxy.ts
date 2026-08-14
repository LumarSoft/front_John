import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PROTECTED_PREFIX = '/portal'
const LOGIN_PATH = '/portal/login'
const DASHBOARD_PATH = '/portal/dashboard'

function getTokenExp(token: string): number | null {
  const parts = token.split('.')
  if (parts.length !== 3) return null
  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const payload = JSON.parse(atob(base64)) as { exp?: number }
    return typeof payload.exp === 'number' ? payload.exp : null
  } catch {
    return null
  }
}

function hasUsableToken(token: string | undefined): boolean {
  if (!token) return false
  const exp = getTokenExp(token)
  return exp === null || Date.now() < exp * 1000
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('portal_token')?.value
  const authenticated = hasUsableToken(token)

  const isPortalRoute = pathname.startsWith(PROTECTED_PREFIX)
  const isLoginPage = pathname === LOGIN_PATH

  if (isLoginPage && authenticated) {
    return NextResponse.redirect(new URL(DASHBOARD_PATH, request.url))
  }

  if (isPortalRoute && !isLoginPage && !authenticated) {
    const response = NextResponse.redirect(new URL(LOGIN_PATH, request.url))
    if (token) response.cookies.delete('portal_token')
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/portal/:path*'],
}
