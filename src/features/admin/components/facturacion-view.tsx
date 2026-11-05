'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowUpRight,
  ChevronDown,
  ChevronRight,
  Loader2,
  Lock,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  TrendingUp,
} from 'lucide-react'
import { toast } from 'sonner'
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
import { Badge } from '@/src/components/ui/badge'
import { Button } from '@/src/components/ui/button'
import { Card } from '@/src/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/src/components/ui/dialog'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { Skeleton } from '@/src/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/components/ui/table'
import { Tabs, TabsList, TabsTrigger } from '@/src/components/ui/tabs'
import { ApiError } from '@/src/lib/api-client'
import type {
  BillingNumber,
  CatalogPlan,
  OwnerBillingOrganization,
  OwnerBillingTotals,
  PlanOffer,
} from '@/src/types/api/billing'
import { useAssignPlan, useBillingOverview, useOwnerBilling, useOwnerPlans, usePlanActions } from '../hooks/use-billing'
import { useRole } from '../hooks/use-role'
import { numberLabel } from '../lib/number-label'
import { PlanLimitActions } from './plan-limit-actions'
import { HEAD, int, Kpi, MonthPicker, thisMonth, usd } from './billing-ui'
import { LiquidacionTab } from './liquidacion-tab'

const price = (n: number) => (n === 0 ? 'Gratis' : usd(n))
const day = (iso: string) => new Date(iso).toLocaleDateString('es-AR', { day: 'numeric', month: 'numeric' })

function failed(error: unknown, fallback: string) {
  toast.error(error instanceof ApiError && error.status < 500 ? error.message : fallback)
}

// ─── Consumption bar ──────────────────────────────────────────────────────────

function ConsumptionBar({ row }: { row: BillingNumber }) {
  const percent = Math.min(100, row.percentUsed)
  const tone = row.plan.trial ? 'bg-emerald-500 dark:bg-emerald-400' : row.percentUsed >= 80 ? 'bg-amber' : 'bg-ember'
  return (
    <div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-line-2">
        <div
          className={`h-full rounded-full transition-[width] duration-500 ${tone}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="mt-1.5 flex flex-wrap items-baseline justify-between gap-x-3 text-[12px]">
        <span className="text-ink-3">
          <span className="font-semibold text-ink">{int(row.messagesUsed)}</span> de {int(row.includedMessages)}{' '}
          mensajes
        </span>
        <span className="text-muted-foreground">quedan {int(row.remainingMessages)}</span>
      </div>
    </div>
  )
}

// ─── Number card (admin and SuperAdmin) ───────────────────────────────────────

function PlanSelect({ row, plans }: { row: BillingNumber; plans: PlanOffer[] }) {
  const assign = useAssignPlan()
  const paid = plans.filter(plan => !plan.isTrial)
  const current = row.assignedPlan?.trial ? '' : String(row.assignedPlan?.id ?? '')
  return (
    <div className="flex items-center justify-between gap-3">
      <Label htmlFor={`plan-${row.id}`} className="text-[11px] font-normal uppercase tracking-[0.12em] text-faint">
        Plan asignado
      </Label>
      <div className="flex items-center gap-2">
        {assign.isPending && <Loader2 className="size-3.5 animate-spin text-muted-foreground" />}
        <select
          id={`plan-${row.id}`}
          value={current}
          disabled={assign.isPending}
          onChange={event => {
            const planId = Number(event.target.value)
            if (!planId) return
            assign.mutate(
              { numberId: row.id, planId },
              {
                onSuccess: () => toast.success('Plan asignado'),
                onError: error => failed(error, 'No se pudo asignar el plan'),
              },
            )
          }}
          className="h-8 rounded-md border border-line-2 bg-paper px-2 text-[13px] text-ink outline-none focus-visible:ring-2 focus-visible:ring-ember-ring"
        >
          {current === '' && (
            <option value="">{row.assignedPlan?.trial ? 'Prueba (primer mes)' : 'Elegí un plan'}</option>
          )}
          {paid.map(plan => (
            <option key={plan.id} value={plan.id}>
              {plan.name} · {int(plan.messages)} mensajes · {usd(plan.priceUsd)}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

function NumberCard({ row, plans, canAssign }: { row: BillingNumber; plans: PlanOffer[]; canAssign: boolean }) {
  const planLabel = row.plan.trial
    ? `Prueba · ${int(row.plan.includedMessages)} mensajes gratis`
    : `${row.plan.name} · ${int(row.plan.includedMessages)} mensajes · ${usd(row.plan.priceUsd)}`
  return (
    <Card className="flex flex-col gap-4 border-line-2 p-4 shadow-sm">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[14px] font-semibold tracking-wide text-ink">{numberLabel(row)}</span>
          {!row.isActive && (
            <Badge variant="outline" className="border-line-2 text-[10.5px] text-muted-foreground">
              Inactivo
            </Badge>
          )}
          {row.plan.trial && (
            <Badge className="bg-emerald-50 text-[10.5px] text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
              <Sparkles className="size-3" /> Prueba
            </Badge>
          )}
          {row.upgraded && (
            <Badge className="bg-ember-soft text-[10.5px] text-ember-2">
              <ArrowUpRight className="size-3" /> Subió de plan
            </Badge>
          )}
        </div>
        <div className="mt-0.5 text-[12px] text-muted-foreground">
          {row.responsibleCode ? `Productor ${row.responsibleCode.code}` : 'Sin productor responsable'}
        </div>
      </div>

      {canAssign && <PlanSelect row={row} plans={plans} />}

      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[11px] uppercase tracking-[0.12em] text-faint">Plan del mes</span>
        <span className="text-right text-[13.5px] font-semibold text-ink">{planLabel}</span>
      </div>

      <ConsumptionBar row={row} />

      <PlanLimitActions row={row} />

      <div className="flex flex-col gap-1.5 border-t border-line-2 pt-3 text-[12.5px] text-muted-foreground">
        {row.movedUpAt && (
          <span className="flex items-start gap-1.5">
            <ArrowUpRight className="mt-0.5 size-3.5 shrink-0 text-ember-2" />
            Pasó a {row.plan.name} el {day(row.movedUpAt)}.
          </span>
        )}
        {!row.limit?.paused && (
          <span className="flex items-start gap-1.5">
            <TrendingUp className="mt-0.5 size-3.5 shrink-0 text-ember-2" />
            {row.nextPlan ? (
              <span>
                Al llegar a los {int(row.includedMessages)} mensajes, el asistente se pausa y se puede pasar a{' '}
                <span className="font-medium text-ink">{row.nextPlan.name}</span> ({int(row.nextPlan.messages)}{' '}
                mensajes, {usd(row.nextPlan.priceUsd)}).
              </span>
            ) : (
              <span>Todavía no hay planes.</span>
            )}
          </span>
        )}
        <span className="flex items-baseline justify-between gap-3 pt-1">
          <span>Precio del plan</span>
          <span className="text-[13.5px] font-semibold text-ink">{price(row.billedUsd)} por mes</span>
        </span>
      </div>
    </Card>
  )
}

function ConsumptionTab({ canAssign }: { canAssign: boolean }) {
  const [period, setPeriod] = useState(thisMonth)
  const { data, isLoading, isError } = useBillingOverview(period)
  const numbers = data?.numbers ?? []
  const largest = data?.plans.filter(plan => !plan.isTrial).at(-1)

  return (
    <>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
        <MonthPicker value={period} onChange={setPeriod} />
        {data?.totalBilledUsd !== undefined && (
          <Card className="flex items-center gap-4 border-line-2 px-4 py-3">
            <span className="text-[13px] text-muted-foreground">
              Total a pagar · {int(numbers.length)} {numbers.length === 1 ? 'número' : 'números'}
            </span>
            <span className="font-display text-[20px] text-ink">{usd(data.totalBilledUsd)}</span>
          </Card>
        )}
      </div>
      {isLoading && (
        <div className="grid gap-3 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-[200px] rounded-xl" />
          ))}
        </div>
      )}
      {isError && <p className="text-[14px] text-destructive">No se pudo cargar la facturación.</p>}
      {!isLoading && !isError && numbers.length === 0 && (
        <Card className="border-line-2 p-8 text-center text-[14px] text-muted-foreground">
          No hay números de WhatsApp a tu nombre todavía.
        </Card>
      )}
      {numbers.length > 0 && data && (
        <div className="grid gap-3 md:grid-cols-2">
          {numbers.map(row => (
            <NumberCard key={row.id} row={row} plans={data.plans} canAssign={canAssign && period === thisMonth()} />
          ))}
        </div>
      )}
      {largest && data && (
        <p className="mt-4 text-[12px] text-muted-foreground">
          Pasado el plan {largest.name}, se pueden sumar de a {int(data.blockMessages)} mensajes por{' '}
          {usd(Math.round(((data.blockMessages * largest.priceUsd) / largest.messages) * 100) / 100)} al mes.
        </p>
      )}
    </>
  )
}

// ─── Catalog, read-only (SuperAdmin) ───────────────────────────────────────────

function OfferTab() {
  const { data, isLoading } = useBillingOverview()
  const plans = data?.plans ?? []
  return (
    <>
      <p className="mb-4 max-w-xl text-[13px] text-muted-foreground">
        Los planes y sus precios los define Lumarsoft. Elegís el plan de cada número en Consumo. Cuando un número llega
        a los mensajes de su plan, su asistente se pausa y te avisamos para que elijas si pasa al plan siguiente.
      </p>
      <Card className="overflow-hidden border-line-2 py-0 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-line-2 hover:bg-transparent">
              <TableHead className={`h-11 pl-5 ${HEAD}`}>Plan</TableHead>
              <TableHead className={`text-right ${HEAD}`}>Mensajes por mes</TableHead>
              <TableHead className={`pr-5 text-right ${HEAD}`}>Precio por mes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={3} className="pl-5">
                  <Skeleton className="h-4 w-40" />
                </TableCell>
              </TableRow>
            )}
            {plans.map(plan => (
              <TableRow key={plan.id}>
                <TableCell className="pl-5 text-[14px] font-medium text-ink">
                  {plan.name}
                  {plan.isTrial && (
                    <span className="ml-2 text-[11.5px] font-normal text-muted-foreground">
                      primer mes de una cuenta nueva
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right text-[13px] text-ink-3">{int(plan.messages)}</TableCell>
                <TableCell className="pr-5 text-right text-[13px] font-semibold text-ink">
                  {price(plan.priceUsd)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </>
  )
}

// ─── Catalog editor (owner) ────────────────────────────────────────────────────

interface PlanValues {
  name: string
  messages: number
  priceUsd: number
  isTrial: boolean
}

function PlanDialog({
  plan,
  pending,
  onSave,
  onClose,
}: {
  plan: CatalogPlan | null
  pending: boolean
  onSave: (values: PlanValues) => void
  onClose: () => void
}) {
  const [name, setName] = useState(plan?.name ?? '')
  const [messages, setMessages] = useState(plan ? String(plan.messages) : '')
  const [priceUsd, setPriceUsd] = useState(plan ? String(plan.priceUsd) : '')
  const [isTrial, setIsTrial] = useState(plan?.isTrial ?? false)
  const size = Number(messages)
  const amount = isTrial ? 0 : Number(priceUsd)
  const sizeOk = Number.isInteger(size) && size > 0
  const priceOk = isTrial || (priceUsd.trim() !== '' && Number.isFinite(amount) && amount >= 0)
  const valid = name.trim().length > 0 && sizeOk && priceOk
  const perMessage = sizeOk && priceOk && amount > 0 ? amount / size : null
  return (
    <Dialog open onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{plan ? 'Editar plan' : 'Nuevo plan'}</DialogTitle>
          <DialogDescription>Lo ven y lo pagan todas las organizaciones. El precio puede ser 0.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="plan-name">Nombre</Label>
            <Input
              id="plan-name"
              value={name}
              maxLength={60}
              onChange={e => setName(e.target.value)}
              placeholder="Inicial"
              className="h-10 border-line-2 text-[13px]"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="plan-messages">Mensajes por mes</Label>
            <Input
              id="plan-messages"
              type="number"
              min={1}
              step={50}
              value={messages}
              onChange={e => setMessages(e.target.value)}
              placeholder="500"
              className="h-10 border-line-2 text-[13px]"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="plan-price">Precio por mes (USD)</Label>
            <Input
              id="plan-price"
              type="number"
              min={0}
              step={0.5}
              value={isTrial ? '0' : priceUsd}
              disabled={isTrial}
              onChange={e => setPriceUsd(e.target.value)}
              placeholder="25"
              className="h-10 border-line-2 text-[13px]"
            />
            {perMessage !== null && (
              <p className="text-[12px] text-muted-foreground">
                USD {perMessage.toLocaleString('es-AR', { maximumFractionDigits: 4 })} por mensaje
              </p>
            )}
          </div>
          <label className="flex items-start gap-2.5 rounded-lg border border-line-2 bg-secondary/40 px-3 py-2.5 text-[12.5px] text-ink-3">
            <input
              type="checkbox"
              checked={isTrial}
              onChange={e => setIsTrial(e.target.checked)}
              className="mt-0.5 size-4 accent-[var(--color-ember)]"
            />
            <span>
              <span className="font-medium text-ink">Plan de prueba.</span> Gratis, para el primer mes de los números de
              una cuenta nueva. Solo puede haber uno activo.
            </span>
          </label>
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose} className="border-line-2">
            Cancelar
          </Button>
          <Button
            type="button"
            disabled={!valid || pending}
            onClick={() => onSave({ name: name.trim(), messages: size, priceUsd: amount, isTrial })}
          >
            {pending && <Loader2 className="size-4 animate-spin" />}
            Guardar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function OwnerPlansTab() {
  const { data, isLoading } = useOwnerPlans()
  const { createPlan, updatePlan, removePlan } = usePlanActions()
  const [editing, setEditing] = useState<CatalogPlan | null>(null)
  const [creating, setCreating] = useState(false)
  const [retiring, setRetiring] = useState<CatalogPlan | null>(null)
  const plans = data?.plans ?? []

  const save = (values: PlanValues) => {
    const done = (message: string) => () => {
      toast.success(message)
      setEditing(null)
      setCreating(false)
    }
    if (editing) {
      updatePlan.mutate(
        { id: editing.id, data: values },
        { onSuccess: done('Plan actualizado'), onError: error => failed(error, 'No se pudo guardar el plan') },
      )
    } else {
      createPlan.mutate(values, {
        onSuccess: done('Plan agregado'),
        onError: error => failed(error, 'No se pudo crear el plan'),
      })
    }
  }
  const toggle = (plan: CatalogPlan) =>
    updatePlan.mutate(
      { id: plan.id, data: { isActive: !plan.isActive } },
      { onError: error => failed(error, 'No se pudo cambiar el plan') },
    )
  const retire = () => {
    if (!retiring) return
    removePlan.mutate(retiring.id, {
      onSuccess: () => {
        toast.success('Plan retirado')
        setRetiring(null)
      },
      onError: error => failed(error, 'No se pudo retirar el plan'),
    })
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-xl text-[13px] text-muted-foreground">
          El catálogo de toda la plataforma: lo que ven y pagan todas las organizaciones, y lo que muestra la landing.
          Cada SuperAdmin elige el plan de sus números. Al llegar al límite, el asistente del número se pausa hasta que
          la organización lo pase al plan siguiente o empiece el mes. Pasado el plan más grande, se suman bloques de{' '}
          {int(data?.blockMessages ?? 1000)} mensajes al precio por mensaje de ese plan. Qué funciones incluye cada plan
          se elige en{' '}
          <Link href="/admin/funciones" className="font-medium text-ember-2 underline-offset-2 hover:underline">
            Funciones por plan
          </Link>
          .
        </p>
        <Button type="button" size="sm" onClick={() => setCreating(true)} className="h-9 text-[12.5px]">
          <Plus className="size-4" />
          Nuevo plan
        </Button>
      </div>

      <Card className="overflow-hidden border-line-2 py-0 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-line-2 hover:bg-transparent">
              <TableHead className={`h-11 pl-5 ${HEAD}`}>Plan</TableHead>
              <TableHead className={`text-right ${HEAD}`}>Mensajes</TableHead>
              <TableHead className={`text-right ${HEAD}`}>Precio</TableHead>
              <TableHead className={`hidden text-right sm:table-cell ${HEAD}`}>Por mensaje</TableHead>
              <TableHead className={HEAD}>Estado</TableHead>
              <TableHead className={`pr-5 text-right ${HEAD}`}>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="pl-5" colSpan={6}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                </TableRow>
              ))}
            {!isLoading && plans.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-[14px] text-muted-foreground">
                  Todavía no hay planes. Creá el primero.
                </TableCell>
              </TableRow>
            )}
            {plans.map(plan => (
              <TableRow key={plan.id} className={plan.isActive ? '' : 'opacity-60'}>
                <TableCell className="pl-5 text-[14px] font-medium text-ink">
                  {plan.name}
                  {plan.isTrial && (
                    <Badge className="ml-2 bg-emerald-50 text-[10.5px] text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                      <Sparkles className="size-3" /> Prueba
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right text-[13px] text-ink-3">{int(plan.messages)}</TableCell>
                <TableCell className="text-right text-[13px] font-semibold text-ink">{price(plan.priceUsd)}</TableCell>
                <TableCell className="hidden text-right text-[13px] text-ink-3 sm:table-cell">
                  {plan.priceUsd > 0
                    ? `USD ${(plan.priceUsd / plan.messages).toLocaleString('es-AR', { maximumFractionDigits: 4 })}`
                    : '—'}
                </TableCell>
                <TableCell>
                  <button
                    type="button"
                    onClick={() => toggle(plan)}
                    className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors ${
                      plan.isActive
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-400'
                        : 'border-line-2 bg-secondary text-muted-foreground'
                    }`}
                  >
                    {plan.isActive ? 'Activo' : 'Apagado'}
                  </button>
                </TableCell>
                <TableCell className="pr-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => setEditing(plan)}
                      className="size-8 rounded-full text-ink-3 hover:bg-ember-soft hover:text-ember-2"
                    >
                      <Pencil className="size-4" />
                      <span className="sr-only">Editar</span>
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => setRetiring(plan)}
                      className="size-8 rounded-full text-ink-3 hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                      <span className="sr-only">Retirar</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {(creating || editing) && (
        <PlanDialog
          key={editing?.id ?? 'new'}
          plan={editing}
          pending={createPlan.isPending || updatePlan.isPending}
          onSave={save}
          onClose={() => {
            setCreating(false)
            setEditing(null)
          }}
        />
      )}

      <AlertDialog open={retiring !== null} onOpenChange={open => !open && setRetiring(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Retirar el plan {retiring?.name}</AlertDialogTitle>
            <AlertDialogDescription>
              Deja de ofrecerse y sus números pasan al plan pago más chico. Podés volver a crearlo cuando quieras.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={retire} disabled={removePlan.isPending}>
              Retirar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

// ─── Dashboard (owner) ─────────────────────────────────────────────────────────

function MoneyCells({ totals }: { totals: OwnerBillingTotals }) {
  return (
    <>
      <TableCell className="text-right text-[13px] text-ink-3">{int(totals.messages)}</TableCell>
      <TableCell className="text-right text-[13px] font-semibold text-ink">{usd(totals.billedUsd)}</TableCell>
      <TableCell className="text-right text-[13px] text-ink-3">{usd(totals.metaCostUsd)}</TableCell>
      <TableCell
        className={`text-right text-[13px] font-semibold ${totals.profitUsd < 0 ? 'text-destructive' : 'text-emerald-600 dark:text-emerald-400'}`}
      >
        {usd(totals.profitUsd)}
      </TableCell>
      <TableCell className="hidden pr-5 text-right text-[13px] text-muted-foreground md:table-cell">
        {usd(totals.openaiCostUsd)}
      </TableCell>
    </>
  )
}

function OrganizationRows({ org }: { org: OwnerBillingOrganization }) {
  const [open, setOpen] = useState(false)
  const Chevron = open ? ChevronDown : ChevronRight
  return (
    <>
      <TableRow className="cursor-pointer" onClick={() => setOpen(!open)}>
        <TableCell className="pl-3 text-[14px] font-medium text-ink">
          <span className="flex items-center gap-1.5">
            <Chevron className="size-4 text-muted-foreground" />
            {org.name}
            {!org.isActive && (
              <Badge variant="outline" className="border-line-2 text-[10.5px] text-muted-foreground">
                Inactiva
              </Badge>
            )}
          </span>
        </TableCell>
        <TableCell className="text-right text-[13px] text-ink-3">{int(org.numbers.length)}</TableCell>
        <MoneyCells totals={org.totals} />
      </TableRow>
      {open &&
        org.numbers.map(n => (
          <TableRow key={n.id} className="bg-secondary/30">
            <TableCell className="pl-10 text-[13px] text-ink">
              <span className="font-mono">{numberLabel(n)}</span>
              <div className="text-[11.5px] text-muted-foreground">
                {n.plan.trial ? 'Prueba' : n.plan.name}
                {n.upgraded && ' · subió de plan'}
                {n.paused && ' · asistente en pausa'}
                {(n.templateMessages ?? 0) > 0 && ` · ${int(n.templateMessages ?? 0)} plantillas`}
                {n.metaBillableMessages > 0 && ` · ${int(n.metaBillableMessages)} cobrados por Meta`}
              </div>
            </TableCell>
            <TableCell className="text-right text-[12px] text-muted-foreground">
              {n.responsibleCode ? n.responsibleCode.code : '—'}
            </TableCell>
            <MoneyCells totals={n} />
          </TableRow>
        ))}
    </>
  )
}

function OwnerDashboardTab() {
  const [period, setPeriod] = useState(thisMonth)
  const { data, isLoading, isError } = useOwnerBilling(period)
  const totals = data?.totals

  return (
    <>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
        <MonthPicker value={period} onChange={setPeriod} />
        <p className="max-w-md text-[12.5px] text-muted-foreground">
          Meta cobra los mensajes de servicio pasados los 1.000 gratis de cada número y las plantillas desde el primero.
          OpenAI está precargado: se muestra aparte y no entra en la ganancia.
        </p>
      </div>
      {data?.closed && (
        <p className="mb-4 flex items-center gap-1.5 text-[12.5px] text-muted-foreground">
          <Lock className="size-3.5 shrink-0" />
          {data.backfilled
            ? 'Mes cerrado después de terminar: se calculó con los planes del día en que se cerró.'
            : 'Mes cerrado: se muestra como quedó el 1 del mes siguiente.'}
        </p>
      )}
      {isError && <p className="mb-4 text-[14px] text-destructive">No se pudo cargar el tablero.</p>}

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading || !totals ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[104px] rounded-xl" />)
        ) : (
          <>
            <Kpi
              label="Facturado"
              value={usd(totals.billedUsd)}
              hint={`${int(totals.activeNumbers)} números activos`}
            />
            <Kpi
              label="Pago real a Meta"
              value={usd(totals.metaCostUsd)}
              hint={`${int(totals.metaBillableMessages)} de ${int(totals.messages)} mensajes con cargo`}
            />
            <Kpi
              label="Ganancia"
              value={usd(totals.profitUsd)}
              hint="Facturado menos Meta"
              tone={totals.profitUsd < 0 ? 'bad' : 'good'}
            />
            <Kpi
              label="OpenAI (aparte)"
              value={usd(totals.openaiCostUsd)}
              hint={`${int(totals.upgradedNumbers)} ${totals.upgradedNumbers === 1 ? 'número subió' : 'números subieron'} de plan · ${int(totals.pausedNumbers ?? 0)} en pausa`}
            />
          </>
        )}
      </div>

      <Card className="overflow-hidden border-line-2 py-0 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-line-2 hover:bg-transparent">
              <TableHead className={`h-11 pl-5 ${HEAD}`}>Organización</TableHead>
              <TableHead className={`text-right ${HEAD}`}>Números</TableHead>
              <TableHead className={`text-right ${HEAD}`}>Mensajes</TableHead>
              <TableHead className={`text-right ${HEAD}`}>Facturado</TableHead>
              <TableHead className={`text-right ${HEAD}`}>Meta</TableHead>
              <TableHead className={`text-right ${HEAD}`}>Ganancia</TableHead>
              <TableHead className={`hidden pr-5 text-right md:table-cell ${HEAD}`}>OpenAI</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={7} className="pl-5">
                  <Skeleton className="h-4 w-full" />
                </TableCell>
              </TableRow>
            )}
            {data?.organizations.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-[14px] text-muted-foreground">
                  No hay organizaciones.
                </TableCell>
              </TableRow>
            )}
            {data?.organizations.map(org => (
              <OrganizationRows key={org.id} org={org} />
            ))}
          </TableBody>
        </Table>
      </Card>
    </>
  )
}

// ─── Main view ─────────────────────────────────────────────────────────────────

type BillingTab = 'consumo' | 'planes' | 'tablero' | 'liquidacion'

export function FacturacionView() {
  const { isOwner, isSuperAdmin, isAdmin, isLoading: roleLoading } = useRole()
  const [tab, setTab] = useState<BillingTab | null>(null)
  const current: BillingTab = tab ?? (isOwner ? 'tablero' : 'consumo')

  if (!roleLoading && !isOwner && !isSuperAdmin && !isAdmin) {
    return (
      <div className="mx-auto w-full max-w-6xl px-5 py-8 md:px-8 md:py-10">
        <p className="text-[14px] text-muted-foreground">Acceso restringido.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 md:px-8 md:py-10">
      <div className="mb-6">
        <div className="text-[10.5px] font-medium uppercase tracking-[0.3em] text-ember-2">
          {isOwner ? 'Plataforma' : 'Planes y consumo'}
        </div>
        <h1 className="mt-2 font-display text-[clamp(26px,3.5vw,36px)] tracking-[-0.035em] text-ink">Facturación</h1>
        <p className="mt-1.5 max-w-2xl text-[14px] text-muted-foreground">
          {isOwner
            ? 'Lo que se factura a cada organización y lo que cobra Meta de verdad, cómo se reparte con el socio comercial y el catálogo de planes que ven todos.'
            : 'Cada número tiene un plan de mensajes por mes: cuenta cada mensaje que envía el asistente, la oficina desde el panel o un aviso. Cuando un número llega al límite de su plan, el asistente se pausa y elegís si pasa al siguiente. Se factura a mes vencido.'}
        </p>
      </div>

      {(isOwner || isSuperAdmin) && (
        <Tabs value={current} onValueChange={v => setTab(v as BillingTab)} className="mb-5">
          <TabsList>
            {isOwner ? (
              <>
                <TabsTrigger value="tablero">Tablero</TabsTrigger>
                <TabsTrigger value="liquidacion">Liquidación</TabsTrigger>
              </>
            ) : (
              <TabsTrigger value="consumo">Consumo</TabsTrigger>
            )}
            <TabsTrigger value="planes">Planes</TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      {roleLoading ? (
        <Skeleton className="h-[200px] rounded-xl" />
      ) : isOwner ? (
        current === 'planes' ? (
          <OwnerPlansTab />
        ) : current === 'liquidacion' ? (
          <LiquidacionTab />
        ) : (
          <OwnerDashboardTab />
        )
      ) : current === 'planes' && isSuperAdmin ? (
        <OfferTab />
      ) : (
        <ConsumptionTab canAssign={isSuperAdmin} />
      )}
    </div>
  )
}
