import type { NextConfig } from 'next'
import path from 'node:path'

// The admin panel now lives in Polisend, the one panel for every organization (same API, same users).
// Temporary redirects (307): browsers don't cache them, so going back is just reverting this change.
const POLISEND_URL = (process.env.POLISEND_URL ?? 'https://polisend.vercel.app').replace(/\/$/, '')

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  async redirects() {
    return [{ source: '/admin/:path*', destination: `${POLISEND_URL}/admin/:path*`, permanent: false }]
  },
}

export default nextConfig
