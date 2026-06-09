'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { loginClient, saveToken } from '@/src/services/portal-auth.service'

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { access_token, requiresPasswordChange } = await loginClient({ email, password })
      saveToken(access_token)

      if (requiresPasswordChange) {
        router.push('/portal/change-password')
      } else {
        router.push('/portal/dashboard')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-canvas flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-[10px] mb-10 group">
        <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-ink text-paper transition-transform group-hover:rotate-[-4deg]">
          <span className="font-display text-[16px] font-semibold italic leading-none tracking-[-0.04em]">Jp</span>
          <span className="absolute -bottom-[3px] -right-[3px] block h-[9px] w-[9px] rounded-full bg-ember ring-2 ring-canvas" />
        </div>
        <div className="leading-none">
          <div className="font-display text-[17px] font-semibold tracking-[-0.025em] text-ink">John Pellegrini</div>
          <div className="mt-[3px] text-[9px] font-medium uppercase tracking-[0.22em] text-muted">
            Seguros · desde 1974
          </div>
        </div>
      </Link>

      {/* Card */}
      <div className="w-full max-w-[400px] rounded-2xl bg-paper shadow-[0_8px_40px_-12px_rgba(15,13,10,0.14),0_0_0_1px_rgba(15,13,10,0.06)] p-8">
        <h1 className="font-display text-[22px] font-semibold tracking-[-0.025em] text-ink mb-1">Área cliente</h1>
        <p className="text-[13.5px] text-muted mb-7">Ingresá con tu email y contraseña.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-[12px] font-semibold uppercase tracking-[0.08em] text-muted">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="h-[46px] w-full rounded-xl border border-line-2 bg-canvas px-4 text-[14px] text-ink placeholder:text-muted-2 outline-none transition-[border-color,box-shadow] focus:border-ember focus:shadow-[0_0_0_3px_rgba(232,168,32,0.15)]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-[12px] font-semibold uppercase tracking-[0.08em] text-muted">
                Contraseña
              </label>
            </div>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-[46px] w-full rounded-xl border border-line-2 bg-canvas px-4 text-[14px] text-ink placeholder:text-muted-2 outline-none transition-[border-color,box-shadow] focus:border-ember focus:shadow-[0_0_0_3px_rgba(232,168,32,0.15)]"
            />
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-[13px] text-red-600">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-1 h-[48px] w-full rounded-xl bg-ink text-paper text-[14px] font-semibold tracking-[-0.01em] transition-[background-color,opacity] hover:bg-ink-2 disabled:opacity-50"
          >
            {loading ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>

        <p className="mt-6 text-center text-[12.5px] text-muted">
          ¿Primera vez? Tu contraseña inicial es tu número de DNI.
        </p>
      </div>

      <Link
        href="/"
        className="mt-8 text-[12.5px] text-muted hover:text-ink transition-colors flex items-center gap-1.5"
      >
        <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M11 7H3M6.5 3.5L3 7l3.5 3.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Volver al sitio
      </Link>
    </div>
  )
}
