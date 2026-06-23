'use client'

import { useState, type FormEvent } from 'react'
import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react'
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
  AlertDialogTrigger,
} from '@/src/components/ui/alert-dialog'
import { Badge } from '@/src/components/ui/badge'
import { Button } from '@/src/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/src/components/ui/dialog'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { Skeleton } from '@/src/components/ui/skeleton'
import type { CreatePlanRequest, FixedProductType, ProductPlan } from '@/src/types/api/pricing'
import { usePricingPlans } from '../hooks/use-pricing-plans'
import { usePricingPlansActions } from '../hooks/use-pricing-plans-actions'

const FIXED_PRODUCTS: { value: FixedProductType; label: string }[] = [
  { value: 'bolso', label: 'Bolso protegido' },
  { value: 'hogar', label: 'Hogar' },
]

function money(value: number): string {
  return value.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })
}

interface CoverageRow {
  label: string
  category: string
  amount: string
}

interface FormState {
  productType: FixedProductType
  name: string
  monthlyPrice: string
  description: string
  coverageItems: CoverageRow[]
  isActive: boolean
  sortOrder: string
}

const emptyRow = (): CoverageRow => ({ label: '', category: '', amount: '' })

const emptyForm = (productType: FixedProductType): FormState => ({
  productType,
  name: '',
  monthlyPrice: '',
  description: '',
  coverageItems: [emptyRow()],
  isActive: true,
  sortOrder: '0',
})

function planToForm(plan: ProductPlan): FormState {
  return {
    productType: plan.productType as FixedProductType,
    name: plan.name,
    monthlyPrice: String(plan.monthlyPrice),
    description: plan.description ?? '',
    coverageItems: plan.coverageItems.length
      ? plan.coverageItems.map(c => ({ label: c.label, category: c.category ?? '', amount: String(c.amount) }))
      : [emptyRow()],
    isActive: plan.isActive,
    sortOrder: String(plan.sortOrder),
  }
}

export function PricingPlansSection() {
  const { data: plans, isLoading } = usePricingPlans()
  const { create, update, remove } = usePricingPlansActions()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<ProductPlan | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm('bolso'))

  const openCreate = (productType: FixedProductType) => {
    setEditing(null)
    setForm(emptyForm(productType))
    setDialogOpen(true)
  }

  const openEdit = (plan: ProductPlan) => {
    setEditing(plan)
    setForm(planToForm(plan))
    setDialogOpen(true)
  }

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm(prev => ({ ...prev, [key]: value }))

  const updateRow = (index: number, key: keyof CoverageRow, value: string) =>
    setForm(prev => ({
      ...prev,
      coverageItems: prev.coverageItems.map((row, i) => (i === index ? { ...row, [key]: value } : row)),
    }))

  const addRow = () => setForm(prev => ({ ...prev, coverageItems: [...prev.coverageItems, emptyRow()] }))

  const removeRow = (index: number) =>
    setForm(prev => ({ ...prev, coverageItems: prev.coverageItems.filter((_, i) => i !== index) }))

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const price = Number(form.monthlyPrice)
    if (!form.name.trim() || !Number.isFinite(price) || price < 0) {
      toast.error('Completá nombre y un precio válido.')
      return
    }
    const coverageItems = form.coverageItems
      .filter(r => r.label.trim() && r.amount !== '' && Number.isFinite(Number(r.amount)))
      .map(r => ({ label: r.label.trim(), category: r.category.trim() || undefined, amount: Number(r.amount) }))

    const payload: CreatePlanRequest = {
      productType: form.productType,
      name: form.name.trim(),
      monthlyPrice: price,
      description: form.description.trim() || undefined,
      coverageItems,
      isActive: form.isActive,
      sortOrder: Number(form.sortOrder) || 0,
    }

    const onSuccess = () => {
      toast.success(editing ? 'Plan actualizado' : 'Plan creado')
      setDialogOpen(false)
    }
    const onError = () => toast.error('No se pudo guardar. Intentá de nuevo.')

    if (editing) {
      // productType is fixed once created — send only the editable fields.
      update.mutate(
        {
          id: editing.id,
          data: {
            name: payload.name,
            monthlyPrice: payload.monthlyPrice,
            description: payload.description,
            coverageItems: payload.coverageItems,
            isActive: payload.isActive,
            sortOrder: payload.sortOrder,
          },
        },
        { onSuccess, onError },
      )
    } else {
      create.mutate(payload, { onSuccess, onError })
    }
  }

  const handleDelete = (plan: ProductPlan) => {
    remove.mutate(plan.id, {
      onSuccess: () => toast.success('Plan eliminado'),
      onError: () => toast.error('No se pudo eliminar.'),
    })
  }

  const saving = create.isPending || update.isPending

  return (
    <Card className="mt-6 max-w-xl border-line-2 shadow-sm">
      <CardHeader>
        <CardTitle className="font-display text-[18px]">Planes y precios</CardTitle>
        <CardDescription>
          Definí los planes de precio fijo que se muestran en el cotizador para Bolso y Hogar. El cliente elige uno y se
          genera una solicitud.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {isLoading ? (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : (
          FIXED_PRODUCTS.map(product => {
            const productPlans = (plans ?? []).filter(p => p.productType === product.value)
            return (
              <div key={product.value} className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-[13.5px] font-semibold text-ink">{product.label}</h3>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-8 gap-1.5 border-line-2 text-[12.5px]"
                    onClick={() => openCreate(product.value)}
                  >
                    <Plus className="size-3.5" />
                    Nuevo plan
                  </Button>
                </div>

                {productPlans.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-line-2 px-3 py-4 text-center text-[12.5px] text-muted-foreground">
                    Sin planes todavía.
                  </p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {productPlans.map(plan => (
                      <div
                        key={plan.id}
                        className="flex items-center gap-3 rounded-lg border border-line-2 px-3 py-2.5"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="truncate text-[13.5px] font-medium text-ink">{plan.name}</span>
                            {!plan.isActive && (
                              <Badge variant="outline" className="h-5 px-1.5 text-[10px]">
                                Inactivo
                              </Badge>
                            )}
                          </div>
                          <span className="text-[12px] text-muted-foreground">{money(plan.monthlyPrice)} / mes</span>
                        </div>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="size-8 text-ink-3"
                          onClick={() => openEdit(plan)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button type="button" size="icon" variant="ghost" className="size-8 text-destructive">
                              <Trash2 className="size-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Eliminar el plan “{plan.name}”?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Dejará de aparecer en el cotizador. Esta acción no se puede deshacer.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(plan)}>Eliminar</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })
        )}
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <DialogHeader>
              <DialogTitle>{editing ? 'Editar plan' : 'Nuevo plan'}</DialogTitle>
              <DialogDescription>{FIXED_PRODUCTS.find(p => p.value === form.productType)?.label}</DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-2">
              <Label htmlFor="plan-name">Nombre</Label>
              <Input
                id="plan-name"
                value={form.name}
                onChange={e => setField('name', e.target.value)}
                placeholder="Básico, Plus…"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="plan-price">Precio mensual (ARS)</Label>
                <Input
                  id="plan-price"
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.monthlyPrice}
                  onChange={e => setField('monthlyPrice', e.target.value)}
                  placeholder="4200"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="plan-order">Orden</Label>
                <Input
                  id="plan-order"
                  type="number"
                  min={0}
                  value={form.sortOrder}
                  onChange={e => setField('sortOrder', e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="plan-desc">Descripción (opcional)</Label>
              <Input
                id="plan-desc"
                value={form.description}
                onChange={e => setField('description', e.target.value)}
                placeholder="Protección esencial…"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Coberturas</Label>
              <p className="-mt-1 text-[11.5px] text-muted-foreground">
                Cobertura, rubro (opcional) y suma asegurada. Usá los mismos nombres en todos los planes del producto
                para que se alineen en la tabla.
              </p>
              <div className="flex flex-col gap-2">
                <div className="grid grid-cols-[1fr_minmax(70px,0.7fr)_minmax(90px,0.8fr)_auto] gap-2 px-1 text-[10px] uppercase tracking-[0.12em] text-faint">
                  <span>Cobertura</span>
                  <span>Rubro</span>
                  <span>Suma ($)</span>
                  <span />
                </div>
                {form.coverageItems.map((row, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-[1fr_minmax(70px,0.7fr)_minmax(90px,0.8fr)_auto] items-center gap-2"
                  >
                    <Input
                      value={row.label}
                      onChange={e => updateRow(i, 'label', e.target.value)}
                      placeholder="Incendio"
                      className="h-9"
                    />
                    <Input
                      value={row.category}
                      onChange={e => updateRow(i, 'category', e.target.value)}
                      placeholder="EDIFICIO"
                      className="h-9"
                    />
                    <Input
                      type="number"
                      min={0}
                      value={row.amount}
                      onChange={e => updateRow(i, 'amount', e.target.value)}
                      placeholder="9000000"
                      className="h-9"
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="size-9 text-destructive"
                      onClick={() => removeRow(i)}
                      disabled={form.coverageItems.length === 1}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="mt-1 h-8 w-fit gap-1.5 border-line-2 text-[12.5px]"
                onClick={addRow}
              >
                <Plus className="size-3.5" />
                Agregar cobertura
              </Button>
            </div>

            <label className="flex items-center gap-2 text-[13.5px] text-ink">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={e => setField('isActive', e.target.checked)}
                className="size-4 accent-ember"
              />
              Activo (visible en el cotizador)
            </label>

            <DialogFooter>
              <Button type="submit" disabled={saving} className="h-10">
                {saving ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Guardando…
                  </>
                ) : (
                  'Guardar plan'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
