'use client'

import { useState, type FormEvent } from 'react'
import { Loader2, Phone, Plus, Trash2 } from 'lucide-react'
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/src/components/ui/alert-dialog'
import type { AdminPhoneNumber } from '@/src/types/api/phone-numbers'
import { useRole } from '../hooks/use-role'
import { useProducerCodes } from '../hooks/use-producer-codes'
import { usePhoneNumbers, usePhoneNumberMutations } from '../hooks/use-phone-numbers'

const money = (n: number) => `USD ${n.toFixed(2)}`

function NumberForm({ existing, onDone }: { existing: AdminPhoneNumber | null; onDone: () => void }) {
  const isEdit = !!existing
  const { data: codes } = useProducerCodes()
  const { create, update } = usePhoneNumberMutations()

  const [phoneNumberId, setPhoneNumberId] = useState(existing?.phoneNumberId ?? '')
  const [number, setNumber] = useState(existing?.number ?? '')
  const [responsible, setResponsible] = useState<number | undefined>(existing?.responsibleCode?.id)
  const [budget, setBudget] = useState<string>(
    existing?.monthlyBudgetUsd != null ? String(existing.monthlyBudgetUsd) : '',
  )
  const [served, setServed] = useState<number[]>(existing?.servedCodes.map(c => c.id) ?? [])

  const pending = create.isPending || update.isPending
  const toggleServed = (id: number) =>
    setServed(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]))

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const body = {
      responsibleProducerCodeId: responsible,
      servedCodeIds: served,
      monthlyBudgetUsd: budget.trim() ? Number(budget) : undefined,
    }
    if (isEdit) {
      update.mutate(
        { id: existing.id, data: { number, ...body } },
        {
          onSuccess: () => {
            toast.success('Número actualizado')
            onDone()
          },
          onError: () => toast.error('No se pudo guardar.'),
        },
      )
    } else {
      create.mutate(
        { phoneNumberId, number, ...body },
        {
          onSuccess: () => {
            toast.success('Número registrado')
            onDone()
          },
          onError: () => toast.error('No se pudo registrar (¿id de Meta repetido?).'),
        },
      )
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="meta-id">Meta phone_number_id</Label>
        <Input
          id="meta-id"
          required
          disabled={isEdit}
          placeholder="p.ej. 552431122334455"
          value={phoneNumberId}
          onChange={e => setPhoneNumberId(e.target.value)}
        />
        <p className="text-[12px] text-muted-foreground">El id que Meta envía en el webhook (no el número visible).</p>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="display">Número visible</Label>
        <Input
          id="display"
          required
          placeholder="+54 9 11 5555-5555"
          value={number}
          onChange={e => setNumber(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Código responsable (facturación)</Label>
        <select
          value={responsible ?? ''}
          onChange={e => setResponsible(e.target.value ? Number(e.target.value) : undefined)}
          className="h-10 rounded-md border border-line-2 bg-background px-3 text-[13px]"
        >
          <option value="">— Sin asignar —</option>
          {(codes ?? []).map(c => (
            <option key={c.id} value={c.id}>
              {c.code}
              {c.holderName ? ` · ${c.holderName}` : ''}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <Label>Códigos que también atiende</Label>
        <div className="max-h-40 overflow-y-auto rounded-md border border-line-2 p-2">
          {(codes ?? []).map(c => (
            <label
              key={c.id}
              className="flex cursor-pointer items-center gap-2 rounded px-1.5 py-1.5 hover:bg-secondary"
            >
              <input
                type="checkbox"
                className="size-4 accent-ember-2"
                checked={served.includes(c.id)}
                onChange={() => toggleServed(c.id)}
              />
              <span className="text-[13px] text-ink">
                <span className="font-medium">{c.code}</span>
                {c.holderName ? <span className="text-muted-foreground"> · {c.holderName}</span> : null}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="budget">Presupuesto mensual (USD)</Label>
        <Input
          id="budget"
          type="number"
          min={0}
          step="1"
          placeholder="20 (por defecto)"
          value={budget}
          onChange={e => setBudget(e.target.value)}
        />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone}>
          Cancelar
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Guardando…
            </>
          ) : isEdit ? (
            'Guardar'
          ) : (
            'Registrar'
          )}
        </Button>
      </DialogFooter>
    </form>
  )
}

export function NumerosView() {
  const { isSuperAdmin, isLoading: roleLoading } = useRole()
  const { data: numbers, isLoading } = usePhoneNumbers(isSuperAdmin)
  const { remove } = usePhoneNumberMutations()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<AdminPhoneNumber | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AdminPhoneNumber | null>(null)

  if (!roleLoading && !isSuperAdmin) {
    return (
      <div className="mx-auto w-full max-w-5xl px-5 py-16 text-center md:px-8">
        <h1 className="font-display text-[22px] text-ink">Acceso restringido</h1>
        <p className="mt-2 text-[14px] text-muted-foreground">Solo un SuperAdmin puede gestionar los números.</p>
      </div>
    )
  }

  const grandTotal = (numbers ?? []).reduce((sum, n) => sum + n.usage.totalCostUsd, 0)

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 md:px-8 md:py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-[10.5px] font-medium uppercase tracking-[0.3em] text-ember-2">Plataforma</div>
          <h1 className="mt-2 font-display text-[clamp(26px,3.5vw,36px)] tracking-[-0.035em] text-ink">
            Números y costos
          </h1>
          <p className="mt-1.5 text-[14px] text-muted-foreground">
            Números de WhatsApp, código responsable de facturación y consumo del mes (OpenAI + Meta).
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null)
            setDialogOpen(true)
          }}
          className="h-10"
        >
          <Plus className="size-4" /> Registrar número
        </Button>
      </div>

      <Card className="mb-4 flex items-center justify-between border-line-2 p-4">
        <span className="text-[13px] text-muted-foreground">Costo total del mes (todos los números)</span>
        <span className="font-display text-[20px] text-ink">{money(grandTotal)}</span>
      </Card>

      <Card className="overflow-hidden border-line-2 py-0 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-11 pl-5 text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                Número
              </TableHead>
              <TableHead className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                Responsable
              </TableHead>
              <TableHead className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Costo mes</TableHead>
              <TableHead className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                Presupuesto
              </TableHead>
              <TableHead className="w-24 pr-5" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="pl-5">
                    <Skeleton className="h-4 w-40" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell className="pr-5">
                    <Skeleton className="ml-auto h-8 w-16" />
                  </TableCell>
                </TableRow>
              ))}

            {numbers && numbers.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex size-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                      <Phone className="size-5" />
                    </div>
                    <p className="text-[14px] text-muted-foreground">Todavía no hay números registrados.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {numbers?.map(n => (
              <TableRow key={n.id}>
                <TableCell className="pl-5">
                  <div className="flex flex-col">
                    <span className="text-[14px] font-medium text-ink">{n.number}</span>
                    <span className="font-mono text-[11px] text-muted-foreground">{n.phoneNumberId}</span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {!n.isActive && (
                        <Badge variant="secondary" className="text-faint-2">
                          Inactivo
                        </Badge>
                      )}
                      {n.budgetExceededAt && (
                        <Badge className="bg-destructive/15 text-destructive">Sobre presupuesto</Badge>
                      )}
                      {n.servedCodes.length > 0 && (
                        <Badge variant="secondary" className="text-ink-3">
                          {n.servedCodes.length} código(s) servidos
                        </Badge>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-[13px] text-ink-3">
                  {n.responsibleCode
                    ? `${n.responsibleCode.code}${n.responsibleCode.holderName ? ` · ${n.responsibleCode.holderName}` : ''}`
                    : '—'}
                </TableCell>
                <TableCell className="text-[13px]">
                  <div className="flex flex-col">
                    <span className="font-medium text-ink">{money(n.usage.totalCostUsd)}</span>
                    <span className="text-[11px] text-muted-foreground">
                      OpenAI {money(n.usage.openaiCostUsd)} · Meta {money(n.usage.metaCostUsd)}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-[13px] text-ink-3">
                  {n.monthlyBudgetUsd != null ? money(n.monthlyBudgetUsd) : 'Por defecto'}
                </TableCell>
                <TableCell className="pr-5">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8"
                      onClick={() => {
                        setEditing(n)
                        setDialogOpen(true)
                      }}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground"
                      onClick={() => setDeleteTarget(n)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="font-display text-[20px]">
              {editing ? 'Editar número' : 'Registrar número'}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? 'Actualizá el código responsable, los códigos servidos o el presupuesto.'
                : 'Registrá un número de Meta para que el bot lo atienda.'}
            </DialogDescription>
          </DialogHeader>
          {dialogOpen && (
            <NumberForm key={editing?.id ?? 'new'} existing={editing} onDone={() => setDialogOpen(false)} />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Dar de baja el número?</AlertDialogTitle>
            <AlertDialogDescription>
              El bot dejará de atender <span className="font-medium text-ink">{deleteTarget?.number}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={remove.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={e => {
                e.preventDefault()
                if (!deleteTarget) return
                remove.mutate(deleteTarget.id, {
                  onSuccess: () => {
                    toast.success('Número dado de baja')
                    setDeleteTarget(null)
                  },
                  onError: () => toast.error('No se pudo dar de baja.'),
                })
              }}
              disabled={remove.isPending}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {remove.isPending ? 'Procesando…' : 'Dar de baja'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
