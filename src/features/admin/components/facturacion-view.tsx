'use client'

import { useState } from 'react'
import { Loader2, Pencil, Plus, Sparkles, Trash2, TrendingUp } from 'lucide-react'
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
import type { BillingNumber, CatalogPlan } from '@/src/types/api/billing'
import { useBillingActions, useBillingOverview, useTokenPlans } from '../hooks/use-billing'
import { useRole } from '../hooks/use-role'

const int = (n: number) => n.toLocaleString('es-AR')
const usd = (n: number) => `USD ${n.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
const round2 = (n: number) => Math.round(n * 100) / 100

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
          <span className="font-semibold text-ink">{int(row.tokensUsed)}</span> de {int(row.includedTokens)} tokens
          {row.trialTokens > 0 && <span className="text-muted-foreground"> · {int(row.trialTokens)} de prueba</span>}
        </span>
        <span className="text-muted-foreground">quedan {int(row.remainingTokens)}</span>
      </div>
    </div>
  )
}

// ─── Number card ───────────────────────────────────────────────────────────────

/** The plan its tokens put the number on this month; nobody chooses it. */
function NumberCard({ row }: { row: BillingNumber }) {
  const planLabel = row.plan.trial
    ? `Prueba · ${int(row.trialTokens)} tokens gratis`
    : `${row.plan.name} · ${int(row.plan.includedTokens)} tokens · ${usd(row.plan.priceUsd)}`
  return (
    <Card className="flex flex-col gap-4 border-line-2 p-4 shadow-sm">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[14px] font-semibold tracking-wide text-ink">{row.number}</span>
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
        </div>
        <div className="mt-0.5 text-[12px] text-muted-foreground">
          {row.responsibleCode ? `Productor ${row.responsibleCode.code}` : 'Sin productor responsable'}
        </div>
      </div>

      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[11px] uppercase tracking-[0.12em] text-faint">Plan del mes</span>
        <span className="text-right text-[13.5px] font-semibold text-ink">{planLabel}</span>
      </div>

      <ConsumptionBar row={row} />

      <div className="flex items-start gap-1.5 border-t border-line-2 pt-3 text-[12.5px] text-muted-foreground">
        <TrendingUp className="mt-0.5 size-3.5 shrink-0 text-ember-2" />
        {row.nextPlan ? (
          <span>
            {row.plan.trial ? 'Pasados los tokens gratis' : `Pasados los ${int(row.includedTokens)} tokens`}, este mes
            sube a <span className="font-medium text-ink">{row.nextPlan.name}</span> ({int(row.nextPlan.tokens)}{' '}
            tokens).
          </span>
        ) : (
          <span>La organización todavía no tiene planes.</span>
        )}
      </div>
    </Card>
  )
}

// ─── Catalog (SuperAdmin) ──────────────────────────────────────────────────────

function PlanDialog({
  plan,
  open,
  unitPriceUsd,
  pending,
  onSave,
  onClose,
}: {
  plan: CatalogPlan | null
  open: boolean
  unitPriceUsd: number
  pending: boolean
  onSave: (data: { name: string; tokens: number; priceUsd: number }) => void
  onClose: () => void
}) {
  const [name, setName] = useState(plan?.name ?? '')
  const [tokens, setTokens] = useState(plan ? String(plan.tokens) : '')
  const [price, setPrice] = useState(plan ? String(plan.priceUsd) : '')
  // The price follows the size until the office types one of its own.
  const [priceTouched, setPriceTouched] = useState(plan !== null)
  const size = Number(tokens)
  const sizeOk = Number.isInteger(size) && size > 0
  const cost = sizeOk ? round2(size * unitPriceUsd) : null
  const priceValue = priceTouched && price.trim() !== '' ? Number(price) : cost
  const priceOk = priceValue !== null && Number.isFinite(priceValue) && cost !== null && priceValue >= cost
  const belowCost = cost !== null && priceValue !== null && Number.isFinite(priceValue) && priceValue < cost
  const margin = priceOk && cost !== null ? round2((priceValue as number) - cost) : null
  const valid = name.trim().length > 0 && sizeOk && priceOk
  return (
    <Dialog open={open} onOpenChange={o => !o && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{plan ? 'Editar plan' : 'Nuevo plan'}</DialogTitle>
          <DialogDescription>
            Cada token te cuesta {usd(unitPriceUsd)}. El precio es lo que paga el productor y nunca puede quedar por
            debajo del costo.
          </DialogDescription>
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
            <Label htmlFor="plan-tokens">Tokens por mes</Label>
            <Input
              id="plan-tokens"
              type="number"
              min={1}
              step={50}
              value={tokens}
              onChange={e => setTokens(e.target.value)}
              placeholder="500"
              className="h-10 border-line-2 text-[13px]"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="plan-price">Precio mensual (USD)</Label>
            <Input
              id="plan-price"
              type="number"
              min={cost ?? 0}
              step={0.5}
              value={priceTouched ? price : cost !== null ? String(cost) : ''}
              onChange={e => {
                setPriceTouched(true)
                setPrice(e.target.value)
              }}
              placeholder={cost !== null ? String(cost) : '25'}
              aria-invalid={belowCost}
              className={`h-10 border-line-2 text-[13px] ${belowCost ? 'border-destructive' : ''}`}
            />
            {belowCost && (
              <p className="text-[12px] text-destructive">No puede ser menor que el costo ({usd(cost as number)}).</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2 rounded-lg border border-line-2 bg-secondary/40 px-3 py-2 text-[12.5px]">
            <span className="text-muted-foreground">
              Costo <span className="font-semibold text-ink">{cost !== null ? usd(cost) : '—'}</span>
            </span>
            <span className="text-right text-muted-foreground">
              Margen{' '}
              <span
                className={`font-semibold ${margin !== null && margin > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-ink'}`}
              >
                {margin !== null ? usd(margin) : '—'}
              </span>
            </span>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose} className="border-line-2">
            Cancelar
          </Button>
          <Button
            type="button"
            disabled={!valid || pending}
            onClick={() => onSave({ name: name.trim(), tokens: size, priceUsd: priceValue as number })}
          >
            {pending && <Loader2 className="size-4 animate-spin" />}
            Guardar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function PlansTab() {
  const { data, isLoading } = useTokenPlans()
  const { createPlan, updatePlan, removePlan } = useBillingActions()
  const [editing, setEditing] = useState<CatalogPlan | null>(null)
  const [creating, setCreating] = useState(false)
  const [retiring, setRetiring] = useState<CatalogPlan | null>(null)
  const unitPriceUsd = data?.unitPriceUsd ?? 0.05
  const plans = data?.plans ?? []

  const save = (values: { name: string; tokens: number; priceUsd: number }) => {
    if (editing) {
      updatePlan.mutate(
        { id: editing.id, data: values },
        {
          onSuccess: () => {
            toast.success('Plan actualizado')
            setEditing(null)
          },
          onError: error => failed(error, 'No se pudo guardar el plan'),
        },
      )
    } else {
      createPlan.mutate(values, {
        onSuccess: () => {
          toast.success('Plan agregado al catálogo')
          setCreating(false)
        },
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

  const head = 'text-[11px] uppercase tracking-[0.12em] text-faint'

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-xl text-[13px] text-muted-foreground">
          Nadie elige el plan: cada mes, cada número queda en el plan más chico que cubre los mensajes que envió y sube
          si envía más. Cada token te cuesta {usd(unitPriceUsd)}; vos decidís los tamaños y el precio, siempre por
          encima del costo. Pasado el plan más grande, el mes se cobra de 1.000 en 1.000.
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
              <TableHead className={`h-11 pl-5 ${head}`}>Plan</TableHead>
              <TableHead className={`text-right ${head}`}>Tokens</TableHead>
              <TableHead className={`text-right ${head}`}>Costo</TableHead>
              <TableHead className={`text-right ${head}`}>Precio</TableHead>
              <TableHead className={`hidden text-right sm:table-cell ${head}`}>Margen</TableHead>
              <TableHead className={head}>Estado</TableHead>
              <TableHead className={`pr-5 text-right ${head}`}>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 2 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="pl-5">
                    <Skeleton className="h-4 w-28" />
                  </TableCell>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="ml-auto h-4 w-12" />
                    </TableCell>
                  ))}
                  <TableCell className="pr-5">
                    <Skeleton className="ml-auto h-8 w-20" />
                  </TableCell>
                </TableRow>
              ))}
            {!isLoading && plans.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-[14px] text-muted-foreground">
                  Todavía no hay planes. Creá el primero.
                </TableCell>
              </TableRow>
            )}
            {plans.map(plan => (
              <TableRow key={plan.id} className={plan.isActive ? '' : 'opacity-60'}>
                <TableCell className="pl-5 text-[14px] font-medium text-ink">{plan.name}</TableCell>
                <TableCell className="text-right text-[13px] text-ink-3">{int(plan.tokens)}</TableCell>
                <TableCell className="text-right text-[13px] text-ink-3">
                  {plan.costUsd !== undefined ? usd(plan.costUsd) : '—'}
                </TableCell>
                <TableCell className="text-right text-[13px] font-semibold text-ink">{usd(plan.priceUsd)}</TableCell>
                <TableCell
                  className={`hidden text-right text-[13px] sm:table-cell ${
                    (plan.marginUsd ?? 0) > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-ink-3'
                  }`}
                >
                  {plan.marginUsd !== undefined ? usd(plan.marginUsd) : '—'}
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
          open
          unitPriceUsd={unitPriceUsd}
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
              Deja de usarse: desde ahora los números se ubican en los planes que quedan. Podés volver a crearlo cuando
              quieras.
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

// ─── Main view ─────────────────────────────────────────────────────────────────

type BillingTab = 'consumo' | 'planes'

export function FacturacionView() {
  const { isSuperAdmin, isAdmin, isLoading: roleLoading } = useRole()
  const [tab, setTab] = useState<BillingTab>('consumo')
  const { data, isLoading, isError } = useBillingOverview()

  if (!roleLoading && !isSuperAdmin && !isAdmin) {
    return (
      <div className="mx-auto w-full max-w-6xl px-5 py-8 md:px-8 md:py-10">
        <p className="text-[14px] text-muted-foreground">Acceso restringido.</p>
      </div>
    )
  }

  const numbers = data?.numbers ?? []
  const showsCost = data?.plans.some(plan => plan.costUsd !== undefined) ?? false

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 md:px-8 md:py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-[10.5px] font-medium uppercase tracking-[0.3em] text-ember-2">Planes y consumo</div>
          <h1 className="mt-2 font-display text-[clamp(26px,3.5vw,36px)] tracking-[-0.035em] text-ink">Facturación</h1>
          <p className="mt-1.5 text-[14px] text-muted-foreground">
            1 token = 1 mensaje que envía el asistente o la oficina por WhatsApp. Cada número queda en el plan que
            cubren sus mensajes del mes y se factura a mes vencido
            {showsCost && data ? ` · cada token te cuesta ${usd(data.unitPriceUsd)}` : ''}.
          </p>
        </div>
      </div>

      {isSuperAdmin && (
        <Tabs value={tab} onValueChange={v => setTab(v as BillingTab)} className="mb-5">
          <TabsList>
            <TabsTrigger value="consumo">Consumo</TabsTrigger>
            <TabsTrigger value="planes">Planes</TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      {tab === 'planes' ? (
        <PlansTab />
      ) : (
        <>
          {isLoading && (
            <div className="grid gap-3 md:grid-cols-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-[168px] rounded-xl" />
              ))}
            </div>
          )}
          {isError && <p className="text-[14px] text-destructive">No se pudo cargar la facturación.</p>}
          {!isLoading && !isError && numbers.length === 0 && (
            <Card className="border-line-2 p-8 text-center text-[14px] text-muted-foreground">
              No hay números de WhatsApp a tu nombre todavía.
            </Card>
          )}
          {numbers.length > 0 && (
            <div className="grid gap-3 md:grid-cols-2">
              {numbers.map(row => (
                <NumberCard key={row.id} row={row} />
              ))}
            </div>
          )}
          {data && data.trialTokens > 0 && (
            <p className="mt-4 text-[12px] text-muted-foreground">
              Las cuentas nuevas no pagan los primeros {int(data.trialTokens)} tokens del primer mes de cada número.
            </p>
          )}
        </>
      )}
    </div>
  )
}
