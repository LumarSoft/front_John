'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { Building2, KeyRound, Loader2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Card } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { Skeleton } from '@/src/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/src/components/ui/dialog'
import { ApiError } from '@/src/lib/api-client'
import { useRole } from '../hooks/use-role'
import { useOrganizations, useOrganizationMutations } from '../hooks/use-organizations'

function errMsg(error: unknown, fallback = 'No se pudo guardar. Intentá de nuevo.') {
  if (error instanceof ApiError && error.status === 409) return 'Ese correo o código ya está en uso.'
  return fallback
}

// ── Create-organization dialog ───────────────────────────
function CreateOrgForm({ onDone }: { onDone: () => void }) {
  const { create } = useOrganizationMutations()
  const [name, setName] = useState('')
  const [masterCode, setMasterCode] = useState('')
  const [botName, setBotName] = useState('')
  const [adminEmail, setAdminEmail] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [codesText, setCodesText] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    // Parse "codigo, nombre" per line (nombre optional).
    const codes = codesText
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean)
      .map(l => {
        const [code, ...rest] = l.split(',')
        return { code: code.trim(), holderName: rest.join(',').trim() || undefined }
      })
      .filter(c => c.code)

    create.mutate(
      {
        name,
        masterCode: masterCode.trim() || undefined,
        botName: botName.trim() || undefined,
        adminEmail,
        adminPassword,
        codes: codes.length ? codes : undefined,
      },
      {
        onSuccess: () => {
          toast.success('Organización creada')
          onDone()
        },
        onError: e => toast.error(errMsg(e)),
      },
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="org-name">Nombre de la organización</Label>
        <Input
          id="org-name"
          required
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="ACME Seguros SRL"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="org-master">Código master</Label>
          <Input id="org-master" value={masterCode} onChange={e => setMasterCode(e.target.value)} placeholder="11425" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="org-bot">Nombre del bot</Label>
          <Input id="org-bot" value={botName} onChange={e => setBotName(e.target.value)} placeholder="NICO" />
        </div>
      </div>

      <div className="rounded-md border border-line-2 p-3">
        <p className="mb-2 text-[12px] font-medium text-ink-3">Primer SuperAdmin de la organización</p>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <Label htmlFor="org-admin-email">Correo</Label>
            <Input
              id="org-admin-email"
              type="email"
              required
              value={adminEmail}
              onChange={e => setAdminEmail(e.target.value)}
              placeholder="admin@acme.com"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="org-admin-pass">Contraseña</Label>
            <Input
              id="org-admin-pass"
              type="password"
              required
              minLength={6}
              value={adminPassword}
              onChange={e => setAdminPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="org-codes">Códigos de productor (opcional)</Label>
        <textarea
          id="org-codes"
          value={codesText}
          onChange={e => setCodesText(e.target.value)}
          rows={4}
          placeholder={'Un código por línea. Formato: código, titular\n8074, PELLEGRINI JOHN\n14831, CANARELLI ADRIANA'}
          className="rounded-md border border-line-2 bg-background px-3 py-2 text-[13px] font-mono"
        />
        <p className="text-[12px] text-muted-foreground">
          El código master se agrega automáticamente si lo completaste arriba.
        </p>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone}>
          Cancelar
        </Button>
        <Button type="submit" disabled={create.isPending}>
          {create.isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Creando…
            </>
          ) : (
            'Crear organización'
          )}
        </Button>
      </DialogFooter>
    </form>
  )
}

// ── Organization detail (codes + admins) ─────────────────
// ── Main view ────────────────────────────────────────────
export function OrganizacionesView() {
  const { isOwner, isLoading: roleLoading } = useRole()
  const { data: orgs, isLoading } = useOrganizations(isOwner)
  const [createOpen, setCreateOpen] = useState(false)

  if (!roleLoading && !isOwner) {
    return (
      <div className="mx-auto w-full max-w-5xl px-5 py-16 text-center md:px-8">
        <div className="mx-auto flex max-w-md flex-col items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
            <KeyRound className="size-5" />
          </div>
          <h1 className="font-display text-[22px] text-ink">Acceso restringido</h1>
          <p className="text-[14px] text-muted-foreground">
            Solo el Owner de la plataforma (Lumar) puede gestionar organizaciones.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-8 md:px-8 md:py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-[10.5px] font-medium uppercase tracking-[0.3em] text-ember-2">Plataforma · Lumar</div>
          <h1 className="mt-2 font-display text-[clamp(26px,3.5vw,36px)] tracking-[-0.035em] text-ink">
            Organizaciones
          </h1>
          <p className="mt-1.5 text-[14px] text-muted-foreground">
            Cada organización es un cliente (tenant) con sus códigos, números y SuperAdmins.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="h-10">
          <Plus className="size-4" /> Nueva organización
        </Button>
      </div>

      <Card className="overflow-hidden border-line-2 py-0 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-11 pl-5 text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                Organización
              </TableHead>
              <TableHead className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Códigos</TableHead>
              <TableHead className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Usuarios</TableHead>
              <TableHead className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Números</TableHead>
              <TableHead className="w-20 pr-5" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 2 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="pl-5">
                    <Skeleton className="h-4 w-44" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-10" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-10" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-10" />
                  </TableCell>
                  <TableCell className="pr-5">
                    <Skeleton className="ml-auto h-8 w-16" />
                  </TableCell>
                </TableRow>
              ))}

            {orgs && orgs.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex size-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                      <Building2 className="size-5" />
                    </div>
                    <p className="text-[14px] text-muted-foreground">Todavía no hay organizaciones.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {orgs?.map(o => (
              <TableRow key={o.id}>
                <TableCell className="pl-5">
                  <div className="flex flex-col">
                    <span className="text-[14px] font-medium text-ink">{o.name}</span>
                    <span className="text-[11px] text-muted-foreground">
                      {o.masterCode ? `master ${o.masterCode} · ` : ''}
                      {o.slug}
                      {!o.isActive && ' · inactiva'}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-[13px] text-ink-3">{o.counts.codes}</TableCell>
                <TableCell className="text-[13px] text-ink-3">{o.counts.users}</TableCell>
                <TableCell className="text-[13px] text-ink-3">{o.counts.phoneNumbers}</TableCell>
                <TableCell className="pr-5">
                  <div className="flex justify-end">
                    <Button asChild variant="ghost" size="sm" className="h-8">
                      <Link href={`/admin/organizaciones/${o.id}`}>Gestionar</Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="font-display text-[20px]">Nueva organización</DialogTitle>
            <DialogDescription>Creá un cliente nuevo con su primer SuperAdmin y sus códigos.</DialogDescription>
          </DialogHeader>
          {createOpen && <CreateOrgForm onDone={() => setCreateOpen(false)} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}
