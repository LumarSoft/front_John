'use client'

import { useState, type FormEvent } from 'react'
import { Building2, KeyRound, Loader2, Plus, ShieldCheck, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import { Card } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { Badge } from '@/src/components/ui/badge'
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
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/src/components/ui/sheet'
import { ApiError } from '@/src/lib/api-client'
import type { OrganizationSummary } from '@/src/types/api/organizations'
import { useRole } from '../hooks/use-role'
import { useOrganization, useOrganizations, useOrganizationMutations } from '../hooks/use-organizations'

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
function OrgDetail({ orgId }: { orgId: number }) {
  const { data: org, isLoading } = useOrganization(orgId)
  const { addCode, updateCode, addSuperAdmin } = useOrganizationMutations(orgId)

  const [newCode, setNewCode] = useState('')
  const [newCodeHolder, setNewCodeHolder] = useState('')
  const [saEmail, setSaEmail] = useState('')
  const [saPass, setSaPass] = useState('')

  if (isLoading || !org) {
    return (
      <div className="flex flex-col gap-3 py-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    )
  }

  const submitCode = (e: FormEvent) => {
    e.preventDefault()
    if (!newCode.trim()) return
    addCode.mutate(
      { id: orgId, data: { code: newCode.trim(), holderName: newCodeHolder.trim() || undefined } },
      {
        onSuccess: () => {
          toast.success('Código agregado')
          setNewCode('')
          setNewCodeHolder('')
        },
        onError: e => toast.error(errMsg(e)),
      },
    )
  }

  const submitSa = (e: FormEvent) => {
    e.preventDefault()
    addSuperAdmin.mutate(
      { id: orgId, data: { email: saEmail, password: saPass } },
      {
        onSuccess: () => {
          toast.success('SuperAdmin creado')
          setSaEmail('')
          setSaPass('')
        },
        onError: e => toast.error(errMsg(e)),
      },
    )
  }

  return (
    <div className="flex flex-col gap-6 py-4">
      <div className="flex flex-wrap items-center gap-2 text-[13px] text-muted-foreground">
        <Badge variant="secondary">slug: {org.slug}</Badge>
        {org.masterCode && <Badge variant="secondary">master {org.masterCode}</Badge>}
        <Badge variant={org.isActive ? 'secondary' : 'destructive'}>{org.isActive ? 'Activa' : 'Inactiva'}</Badge>
      </div>

      {/* Codes */}
      <section className="flex flex-col gap-2">
        <h3 className="text-[13px] font-semibold text-ink">Códigos de productor ({org.codes.length})</h3>
        <div className="max-h-52 overflow-y-auto rounded-md border border-line-2">
          {org.codes.map(c => (
            <div
              key={c.id}
              className="flex items-center justify-between border-b border-line-2 px-3 py-2 last:border-0"
            >
              <span className="text-[13px] text-ink">
                <span className="font-medium">{c.code}</span>
                {c.holderName ? <span className="text-muted-foreground"> · {c.holderName}</span> : null}
                {c.isMaster && (
                  <Badge variant="secondary" className="ml-2">
                    master
                  </Badge>
                )}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-[12px]"
                disabled={updateCode.isPending}
                onClick={() =>
                  updateCode.mutate(
                    { id: orgId, codeId: c.id, data: { isActive: !c.isActive } },
                    {
                      onError: () => toast.error('No se pudo actualizar.'),
                    },
                  )
                }
              >
                {c.isActive ? 'Desactivar' : 'Activar'}
              </Button>
            </div>
          ))}
          {org.codes.length === 0 && <p className="px-3 py-3 text-[13px] text-muted-foreground">Sin códigos.</p>}
        </div>
        <form onSubmit={submitCode} className="flex items-end gap-2">
          <div className="flex flex-1 flex-col gap-1">
            <Label htmlFor="new-code" className="text-[11px]">
              Código
            </Label>
            <Input
              id="new-code"
              value={newCode}
              onChange={e => setNewCode(e.target.value)}
              placeholder="8074"
              className="h-9"
            />
          </div>
          <div className="flex flex-[2] flex-col gap-1">
            <Label htmlFor="new-code-holder" className="text-[11px]">
              Titular
            </Label>
            <Input
              id="new-code-holder"
              value={newCodeHolder}
              onChange={e => setNewCodeHolder(e.target.value)}
              placeholder="Nombre (opcional)"
              className="h-9"
            />
          </div>
          <Button type="submit" size="icon" className="size-9" disabled={addCode.isPending}>
            <Plus className="size-4" />
          </Button>
        </form>
      </section>

      {/* Admins */}
      <section className="flex flex-col gap-2">
        <h3 className="text-[13px] font-semibold text-ink">SuperAdmins ({org.users.length})</h3>
        <div className="rounded-md border border-line-2">
          {org.users.map(u => (
            <div key={u.id} className="flex items-center gap-2 border-b border-line-2 px-3 py-2 last:border-0">
              <ShieldCheck className="size-3.5 text-ember-2" />
              <span className="text-[13px] text-ink">{u.email}</span>
              <Badge variant="secondary" className="ml-auto text-[11px]">
                {u.role === 'SUPERADMIN' ? 'SuperAdmin' : u.role === 'OWNER' ? 'Owner' : 'Admin'}
              </Badge>
            </div>
          ))}
          {org.users.length === 0 && <p className="px-3 py-3 text-[13px] text-muted-foreground">Sin usuarios.</p>}
        </div>
        <form onSubmit={submitSa} className="flex items-end gap-2">
          <div className="relative flex-[2]">
            <Label htmlFor="sa-email" className="text-[11px]">
              Correo
            </Label>
            <Input
              id="sa-email"
              type="email"
              value={saEmail}
              onChange={e => setSaEmail(e.target.value)}
              placeholder="admin@org.com"
              className="h-9"
              required
            />
          </div>
          <div className="relative flex-1">
            <Label htmlFor="sa-pass" className="text-[11px]">
              Contraseña
            </Label>
            <Input
              id="sa-pass"
              type="password"
              minLength={6}
              value={saPass}
              onChange={e => setSaPass(e.target.value)}
              placeholder="••••••"
              className="h-9"
              required
            />
          </div>
          <Button type="submit" size="icon" className="size-9" disabled={addSuperAdmin.isPending}>
            <UserPlus className="size-4" />
          </Button>
        </form>
      </section>
    </div>
  )
}

// ── Main view ────────────────────────────────────────────
export function OrganizacionesView() {
  const { isOwner, isLoading: roleLoading } = useRole()
  const { data: orgs, isLoading } = useOrganizations(isOwner)
  const [createOpen, setCreateOpen] = useState(false)
  const [selected, setSelected] = useState<OrganizationSummary | null>(null)

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
                    <Button variant="ghost" size="sm" className="h-8" onClick={() => setSelected(o)}>
                      Gestionar
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

      <Sheet open={!!selected} onOpenChange={open => !open && setSelected(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="font-display text-[20px]">{selected?.name}</SheetTitle>
            <SheetDescription>Códigos de productor y SuperAdmins de esta organización.</SheetDescription>
          </SheetHeader>
          <div className="px-4">{selected && <OrgDetail orgId={selected.id} />}</div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
