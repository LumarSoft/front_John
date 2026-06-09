'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Loader2, Lock, Mail } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { ApiError } from '@/src/lib/api-client'
import { useAuth } from '../context/auth-context'
import { useLogin } from '../hooks/use-login'

export function LoginForm() {
  const router = useRouter()
  const { isAuthenticated, hydrated } = useAuth()
  const login = useLogin()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    if (hydrated && isAuthenticated) router.replace('/admin')
  }, [hydrated, isAuthenticated, router])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    login.mutate(
      { email, password },
      {
        onSuccess: () => {
          toast.success('Bienvenido de nuevo')
          router.replace('/admin')
        },
        onError: error => {
          const message =
            error instanceof ApiError && error.status === 401
              ? 'Email o contraseña incorrectos.'
              : 'No se pudo iniciar sesión. Intentá de nuevo.'
          toast.error(message)
        },
      },
    )
  }

  return (
    <div className="relative flex min-h-svh items-center justify-center overflow-hidden bg-canvas px-5 py-16">
      <div className="pointer-events-none absolute -top-24 left-1/2 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-[radial-gradient(closed,_var(--tw-gradient-stops))] from-amber-subtle to-transparent blur-3xl" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-ember/40 to-transparent" />

      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-[400px]"
      >
        <div className="mb-8 text-center">
          <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber to-ember-2 font-display text-[17px] text-[#1a1206] shadow-[0_10px_30px_-8px_rgba(232,168,32,0.6)]">
            JP
          </div>
          <div className="mb-2 text-[10.5px] font-medium uppercase tracking-[0.36em] text-ember-2">
            Panel de administración
          </div>
          <h1 className="font-display text-[30px] leading-none text-ink">Iniciá sesión</h1>
          <p className="mt-3 text-sm text-muted-foreground">Gestioná usuarios y la configuración de la plataforma.</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5 rounded-3xl border border-line-2 bg-paper p-7 shadow-[0_30px_70px_-30px_rgba(15,13,10,0.25)]"
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                placeholder="test@gmail.com"
                className="h-11 pl-9"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="••••••••"
                className="h-11 pl-9"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
          </div>

          <Button type="submit" disabled={login.isPending} className="mt-2 h-11 w-full text-[14px]">
            {login.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Ingresando…
              </>
            ) : (
              'Iniciar sesión'
            )}
          </Button>
        </form>
      </motion.div>
    </div>
  )
}
