'use client'

import { useState, type FormEvent } from 'react'
import { AlertTriangle, Phone, ShieldCheck, Trash2, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/src/components/ui/badge'
import { Button } from '@/src/components/ui/button'
import { Card } from '@/src/components/ui/card'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/components/ui/table'
import { ApiError } from '@/src/lib/api-client'
import type {
  AssignableRole,
  OrganizationBilling,
  OrganizationCode,
  OrganizationNumber,
  OrganizationUser,
} from '@/src/types/api/organizations'
import { useOrganizationMutations } from '../hooks/use-organizations'

// ── helpers ────────────────────────────────────────────────

function errMsg(error: unknown, fallback = 'No se pudo guardar. Intentá de nuevo.') {
  return error instanceof ApiError ? error.message : fallback
}

/** Costs run to fractions of a cent, so a flat 2-decimal format would show 0.00. */
const usd = (n: number) => (n === 0 ? 'USD 0' : n < 0.01 ? `USD ${n.toFixed(4)}` : `USD ${n.toFixed(2)}`)
const int = (n: number) => n.toLocaleString('es-AR')

function fecha(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}

// ── resumen de facturación ─────────────────────────────────

/** Month-to-date summary for the whole organization. */
export function BillingSummary({ billing }: { billing: OrganizationBilling }) {
  const pct = Math.round(billing.elapsedFraction * 100)

  const cards = [
    { label: 'Números activos', value: int(billing.activeNumbers) },
    { label: 'Costo real del mes', value: usd(billing.costUsd), hint: 'OpenAI + Meta' },
    { label: 'Devengado a hoy', value: usd(billing.accruedUsd), hint: `${pct}% del mes transcurrido` },
    { label: 'Total al cierre', value: usd(billing.billedUsd), hint: 'si el consumo sigue igual' },
  ]

  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-[13px] font-semibold text-ink">Facturación · {billing.period}</h3>
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        {cards.map(c => (
          <Card key={c.label} className="flex flex-col gap-0.5 p-3">
            <span className="text-[11px] text-muted-foreground">{c.label}</span>
            <span className="text-[15px] font-semibold text-ink">{c.value}</span>
            {c.hint && <span className="text-[11px] text-muted-foreground">{c.hint}</span>}
          </Card>
        ))}
      </div>
      {billing.marginUsd < 0 && (
        <p className="flex items-center gap-1.5 text-[12px] text-destructive">
          <AlertTriangle className="size-3.5" />
          El costo supera lo facturado: margen {usd(billing.marginUsd)}
        </p>
      )}
    </section>
  )
}

// ── números ────────────────────────────────────────────────

export function NumbersSection({ numbers }: { numbers: OrganizationNumber[] }) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-[13px] font-semibold text-ink">Números de WhatsApp ({numbers.length})</h3>
      <div className="overflow-x-auto rounded-md border border-line-2">
        <Table className="min-w-[780px]">
          <TableHeader>
            <TableRow>
              <TableHead>Número</TableHead>
              <TableHead>Código</TableHead>
              <TableHead className="text-right">Tokens</TableHead>
              <TableHead className="text-right">Conv. Meta</TableHead>
              <TableHead className="text-right">Costo</TableHead>
              <TableHead className="text-right">Devengado</TableHead>
              <TableHead className="text-right">Al cierre</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {numbers.map(n => {
              const tokens = n.usage.openaiInputTokens + n.usage.openaiOutputTokens
              return (
                <TableRow key={n.id}>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Phone className="size-3.5 text-muted-foreground" />
                      <span className="text-[13px] font-medium text-ink">{n.number}</span>
                      {!n.isActive && (
                        <Badge variant="destructive" className="text-[10px]">
                          inactivo
                        </Badge>
                      )}
                      {n.budget.exceededAt && (
                        <Badge variant="destructive" className="text-[10px]">
                          sin LLM
                        </Badge>
                      )}
                    </div>
                    <span className="text-[11px] text-muted-foreground">{n.phoneNumberId}</span>
                  </TableCell>
                  <TableCell className="text-[12px]">
                    {n.responsibleCode ? (
                      <>
                        <span className="text-ink">{n.responsibleCode.code}</span>
                        {n.servedCodes.length > 1 && (
                          <span className="text-muted-foreground"> +{n.servedCodes.length - 1}</span>
                        )}
                      </>
                    ) : (
                      <span className="text-muted-foreground">sin asignar</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right text-[12px] text-muted-foreground">{int(tokens)}</TableCell>
                  <TableCell className="text-right text-[12px] text-muted-foreground">
                    {int(n.usage.metaConversations)}
                  </TableCell>
                  <TableCell className="text-right text-[12px] text-muted-foreground">
                    {usd(n.usage.totalCostUsd)}
                  </TableCell>
                  <TableCell className="text-right text-[13px] font-medium text-ink">
                    {usd(n.usage.accruedUsd)}
                  </TableCell>
                  <TableCell className="text-right text-[12px] text-muted-foreground">
                    {usd(n.usage.billedUsd)}
                  </TableCell>
                </TableRow>
              )
            })}
            {numbers.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-4 text-center text-[13px] text-muted-foreground">
                  Sin números registrados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  )
}

// ── códigos de productor ───────────────────────────────────

export function CodesTable({
  codes,
  onToggle,
  toggling,
}: {
  codes: OrganizationCode[]
  onToggle: (codeId: number, isActive: boolean) => void
  toggling: boolean
}) {
  const totals = codes.reduce(
    (a, c) => ({
      clients: a.clients + c.clients,
      polizas: a.polizas + c.polizas,
      siniestros: a.siniestros + c.siniestros,
    }),
    { clients: 0, polizas: 0, siniestros: 0 },
  )

  return (
    <div className="overflow-x-auto rounded-md border border-line-2">
      <Table className="min-w-[680px]">
        <TableHeader>
          <TableRow>
            <TableHead>Código</TableHead>
            <TableHead className="text-right">Clientes</TableHead>
            <TableHead className="text-right">Pólizas</TableHead>
            <TableHead className="text-right">Siniestros</TableHead>
            <TableHead>Última sync</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {codes.map(c => (
            <TableRow key={c.id}>
              <TableCell>
                <div className="flex items-center gap-1.5">
                  <span className="text-[13px] font-medium text-ink">{c.code}</span>
                  {c.isMaster && (
                    <Badge variant="secondary" className="text-[10px]">
                      master
                    </Badge>
                  )}
                  {!c.isActive && (
                    <Badge variant="destructive" className="text-[10px]">
                      inactivo
                    </Badge>
                  )}
                </div>
                {c.holderName && <span className="text-[11px] text-muted-foreground">{c.holderName}</span>}
              </TableCell>
              <TableCell className="text-right text-[12px] text-muted-foreground">{int(c.clients)}</TableCell>
              <TableCell className="text-right text-[12px] text-muted-foreground">{int(c.polizas)}</TableCell>
              <TableCell className="text-right text-[12px] text-muted-foreground">{int(c.siniestros)}</TableCell>
              <TableCell className="text-[12px] text-muted-foreground">
                {c.lastCarteraSyncAt ? fecha(c.lastCarteraSyncAt) : <span className="text-amber-600">nunca</span>}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-[12px]"
                  disabled={toggling}
                  onClick={() => onToggle(c.id, !c.isActive)}
                >
                  {c.isActive ? 'Desactivar' : 'Activar'}
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {codes.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="py-4 text-center text-[13px] text-muted-foreground">
                Sin códigos.
              </TableCell>
            </TableRow>
          )}
          {codes.length > 0 && (
            <TableRow className="bg-muted/40">
              <TableCell className="text-[12px] font-medium text-ink">Total</TableCell>
              <TableCell className="text-right text-[12px] font-medium text-ink">{int(totals.clients)}</TableCell>
              <TableCell className="text-right text-[12px] font-medium text-ink">{int(totals.polizas)}</TableCell>
              <TableCell className="text-right text-[12px] font-medium text-ink">{int(totals.siniestros)}</TableCell>
              <TableCell colSpan={2} />
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

// ── usuarios ───────────────────────────────────────────────

export function UsersSection({ orgId, users }: { orgId: number; users: OrganizationUser[] }) {
  const { addUser, updateUser, removeUser } = useOrganizationMutations(orgId)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<AssignableRole>('ADMIN')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!email.trim() || password.length < 6) {
      toast.error('Correo válido y contraseña de al menos 6 caracteres.')
      return
    }
    addUser.mutate(
      { id: orgId, data: { email: email.trim(), password, role } },
      {
        onSuccess: () => {
          toast.success('Usuario creado')
          setEmail('')
          setPassword('')
        },
        onError: e2 => toast.error(errMsg(e2)),
      },
    )
  }

  const changeRole = (userId: number, next: AssignableRole) =>
    updateUser.mutate(
      { id: orgId, userId, data: { role: next } },
      { onSuccess: () => toast.success('Rol actualizado'), onError: e2 => toast.error(errMsg(e2)) },
    )

  const resetPassword = (userId: number, email2: string) => {
    const pass = window.prompt(`Nueva contraseña para ${email2} (mínimo 6 caracteres)`)
    if (!pass) return
    if (pass.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres.')
      return
    }
    updateUser.mutate(
      { id: orgId, userId, data: { password: pass } },
      { onSuccess: () => toast.success('Contraseña actualizada'), onError: e2 => toast.error(errMsg(e2)) },
    )
  }

  const remove = (userId: number, email2: string) => {
    if (!window.confirm(`¿Eliminar a ${email2}? Pierde el acceso al panel.`)) return
    removeUser.mutate(
      { id: orgId, userId },
      { onSuccess: () => toast.success('Usuario eliminado'), onError: e2 => toast.error(errMsg(e2)) },
    )
  }

  const busy = addUser.isPending || updateUser.isPending || removeUser.isPending

  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-[13px] font-semibold text-ink">Usuarios ({users.length})</h3>

      <div className="rounded-md border border-line-2">
        {users.map(u => (
          <div key={u.id} className="flex flex-wrap items-center gap-2 border-b border-line-2 px-3 py-2 last:border-0">
            <ShieldCheck className="size-3.5 text-ember-2" />
            <span className="text-[13px] text-ink">{u.email}</span>
            <Badge variant="secondary" className="text-[11px]">
              {u.role === 'SUPERADMIN' ? 'SuperAdmin' : u.role === 'OWNER' ? 'Owner' : 'Admin'}
            </Badge>

            {u.role !== 'OWNER' && (
              <div className="ml-auto flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-[12px]"
                  disabled={busy}
                  onClick={() => changeRole(u.id, u.role === 'SUPERADMIN' ? 'ADMIN' : 'SUPERADMIN')}
                >
                  {u.role === 'SUPERADMIN' ? 'Pasar a Admin' : 'Pasar a SuperAdmin'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-[12px]"
                  disabled={busy}
                  onClick={() => resetPassword(u.id, u.email)}
                >
                  Contraseña
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 text-destructive"
                  disabled={busy}
                  onClick={() => remove(u.id, u.email)}
                  aria-label={`Eliminar ${u.email}`}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            )}
          </div>
        ))}
        {users.length === 0 && <p className="px-3 py-3 text-[13px] text-muted-foreground">Sin usuarios.</p>}
      </div>

      <form onSubmit={submit} className="flex flex-wrap items-end gap-2">
        <div className="flex flex-[2] flex-col gap-1">
          <Label htmlFor="nu-email" className="text-[11px]">
            Correo
          </Label>
          <Input
            id="nu-email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="usuario@org.com"
            className="h-9"
            required
          />
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <Label htmlFor="nu-pass" className="text-[11px]">
            Contraseña
          </Label>
          <Input
            id="nu-pass"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="mínimo 6"
            className="h-9"
            required
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="nu-role" className="text-[11px]">
            Rol
          </Label>
          <select
            id="nu-role"
            value={role}
            onChange={e => setRole(e.target.value as AssignableRole)}
            className="h-9 rounded-md border border-line-2 bg-transparent px-2 text-[13px] text-ink"
          >
            <option value="ADMIN">Admin</option>
            <option value="SUPERADMIN">SuperAdmin</option>
          </select>
        </div>
        <Button type="submit" size="icon" className="size-9" disabled={busy} aria-label="Crear usuario">
          <UserPlus className="size-4" />
        </Button>
      </form>
    </section>
  )
}
