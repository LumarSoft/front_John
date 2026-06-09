'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getToken, clearToken } from '@/src/services/portal-auth.service'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

export function ChangePasswordForm() {
  const router = useRouter()
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }
    if (newPassword !== confirm) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setLoading(true)
    try {
      const token = getToken()
      const res = await fetch(`${API_URL}/auth/client/change-password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newPassword }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.message ?? 'Error al cambiar la contraseña')
      }

      router.push('/portal/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error')
    } finally {
      setLoading(false)
    }
  }

  function handleLogout() {
    clearToken()
    router.push('/portal/login')
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
        {/* Amber notice */}
        <div className="flex items-start gap-3 rounded-xl bg-ember-soft border border-ember-ring px-4 py-3 mb-6">
          <svg
            className="mt-[2px] shrink-0 text-ember"
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
          </svg>
          <p className="text-[13px] text-ink-2 leading-relaxed">
            Es tu primera vez ingresando. Por seguridad, elegí una contraseña personal.
          </p>
        </div>

        <h1 className="font-display text-[22px] font-semibold tracking-[-0.025em] text-ink mb-1">Nueva contraseña</h1>
        <p className="text-[13.5px] text-muted mb-7">Mínimo 6 caracteres.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="new-password" className="text-[12px] font-semibold uppercase tracking-[0.08em] text-muted">
              Nueva contraseña
            </label>
            <input
              id="new-password"
              type="password"
              autoComplete="new-password"
              required
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="h-[46px] w-full rounded-xl border border-line-2 bg-canvas px-4 text-[14px] text-ink placeholder:text-muted-2 outline-none transition-[border-color,box-shadow] focus:border-ember focus:shadow-[0_0_0_3px_rgba(232,168,32,0.15)]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="confirm" className="text-[12px] font-semibold uppercase tracking-[0.08em] text-muted">
              Confirmar contraseña
            </label>
            <input
              id="confirm"
              type="password"
              autoComplete="new-password"
              required
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
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
            {loading ? 'Guardando…' : 'Guardar contraseña'}
          </button>
        </form>
      </div>

      <button onClick={handleLogout} className="mt-8 text-[12.5px] text-muted hover:text-ink transition-colors">
        Cerrar sesión
      </button>
    </div>
  )
}
