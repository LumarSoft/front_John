'use client'

import { useState, type FormEvent } from 'react'
import { ArrowDown, ArrowUp, Eye, EyeOff, Loader2, Pencil, Save, Star } from 'lucide-react'
import { toast } from 'sonner'
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
import type { CoverageSetting, UpdateCoverageSettingRequest } from '@/src/types/api/coverage-settings'
import { useCoverageSettings, useCoverageSettingsActions } from '../hooks/use-coverage-settings'

const rangeLabel = (from: number | null, to: number | null): string | null => {
  if (from === null && to === null) return null
  if (from !== null && to !== null) return `${from}–${to}`
  if (from !== null) return `${from} en adelante`
  return `hasta ${to}`
}

const yearLabel = (coverage: CoverageSetting): string | null => {
  const range = rangeLabel(coverage.yearFrom, coverage.yearTo)
  return range && `Años ${range}`
}

const recommendedLabel = (coverage: CoverageSetting): string => {
  const range = rangeLabel(coverage.highlightYearFrom ?? null, coverage.highlightYearTo ?? null)
  return range ? `Recomendada ${range}` : 'Recomendada'
}

const parseLines = (value: string): string[] =>
  value
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)

const parseYear = (value: string): number | null => {
  const trimmed = value.trim()
  if (trimmed === '') return null
  const year = Number(trimmed)
  return Number.isInteger(year) ? year : null
}

interface EditDialogProps {
  coverage: CoverageSetting
  saving: boolean
  onClose: () => void
  onSave: (data: UpdateCoverageSettingRequest) => void
}

function EditCoverageDialog({ coverage, saving, onClose, onSave }: Readonly<EditDialogProps>) {
  const [name, setName] = useState(coverage.name)
  const [tagline, setTagline] = useState(coverage.tagline ?? '')
  const [benefits, setBenefits] = useState(coverage.benefits.join('\n'))
  const [exclusions, setExclusions] = useState(coverage.exclusions.join('\n'))
  const [highlighted, setHighlighted] = useState(coverage.highlighted)
  const [yearFrom, setYearFrom] = useState(coverage.yearFrom?.toString() ?? '')
  const [yearTo, setYearTo] = useState(coverage.yearTo?.toString() ?? '')
  const [highlightFrom, setHighlightFrom] = useState(coverage.highlightYearFrom?.toString() ?? '')
  const [highlightTo, setHighlightTo] = useState(coverage.highlightYearTo?.toString() ?? '')

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!name.trim()) {
      toast.error('El nombre no puede quedar vacío')
      return
    }
    const recommendedFrom = highlighted ? parseYear(highlightFrom) : null
    const recommendedTo = highlighted ? parseYear(highlightTo) : null
    if (recommendedFrom !== null && recommendedTo !== null && recommendedFrom > recommendedTo) {
      toast.error('En "Recomendada", el año desde no puede ser mayor que el año hasta')
      return
    }
    onSave({
      name: name.trim(),
      tagline: tagline.trim(),
      benefits: parseLines(benefits),
      exclusions: parseLines(exclusions),
      highlighted,
      yearFrom: parseYear(yearFrom),
      yearTo: parseYear(yearTo),
      highlightYearFrom: recommendedFrom,
      highlightYearTo: recommendedTo,
    })
  }

  return (
    <Dialog open onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Cobertura {coverage.code}</DialogTitle>
          <DialogDescription>
            Así se muestra esta cobertura en el cotizador de la web y en el asistente de WhatsApp.
          </DialogDescription>
        </DialogHeader>

        {coverage.needsReview && (
          <p className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
            Todavía no se ofrece a los clientes: nadie confirmó qué cubre este código. Cargá qué incluye y qué no, y al
            guardar empieza a aparecer en las cotizaciones.
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="coverage-name">Nombre</Label>
            <Input id="coverage-name" value={name} maxLength={80} onChange={e => setName(e.target.value)} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="coverage-tagline">Bajada</Label>
            <Input
              id="coverage-tagline"
              value={tagline}
              maxLength={160}
              placeholder="Ej.: RC + incendio total"
              onChange={e => setTagline(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="coverage-benefits">Beneficios</Label>
            <textarea
              id="coverage-benefits"
              value={benefits}
              rows={5}
              onChange={e => setBenefits(e.target.value)}
              className="border-input placeholder:text-muted-foreground focus-visible:ring-ring/50 min-h-[96px] w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
            />
            <p className="text-muted-foreground text-xs">Uno por línea. Máximo 12.</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="coverage-exclusions">No incluye</Label>
            <textarea
              id="coverage-exclusions"
              value={exclusions}
              rows={3}
              placeholder="Ej.: Destrucción total por accidente"
              onChange={e => setExclusions(e.target.value)}
              className="border-input placeholder:text-muted-foreground focus-visible:ring-ring/50 min-h-[72px] w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
            />
            <p className="text-muted-foreground text-xs">
              Uno por línea. Es lo que distingue coberturas parecidas (por ejemplo, B y B1).
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="coverage-year-from">Año desde</Label>
              <Input
                id="coverage-year-from"
                value={yearFrom}
                inputMode="numeric"
                placeholder="Sin límite"
                onChange={e => setYearFrom(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="coverage-year-to">Año hasta</Label>
              <Input
                id="coverage-year-to"
                value={yearTo}
                inputMode="numeric"
                placeholder="Sin límite"
                onChange={e => setYearTo(e.target.value)}
              />
            </div>
          </div>
          <p className="text-muted-foreground -mt-2 text-xs">
            Dejalos vacíos para que aplique a todos los años del vehículo.
          </p>

          <Button
            type="button"
            variant={highlighted ? 'default' : 'outline'}
            onClick={() => setHighlighted(!highlighted)}
            className="justify-start gap-2"
          >
            <Star className={`size-4 ${highlighted ? 'fill-current' : ''}`} />
            {highlighted ? 'Recomendada ("La más elegida")' : 'Marcar como recomendada ("La más elegida")'}
          </Button>

          {highlighted && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="coverage-highlight-from">Recomendada desde el año</Label>
                  <Input
                    id="coverage-highlight-from"
                    value={highlightFrom}
                    inputMode="numeric"
                    placeholder="Sin límite"
                    onChange={e => setHighlightFrom(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="coverage-highlight-to">Recomendada hasta el año</Label>
                  <Input
                    id="coverage-highlight-to"
                    value={highlightTo}
                    inputMode="numeric"
                    placeholder="Sin límite"
                    onChange={e => setHighlightTo(e.target.value)}
                  />
                </div>
              </div>
              <p className="text-muted-foreground -mt-2 text-xs">
                Para autos de esos años aparece primera y con el distintivo, en la web y en WhatsApp. Por ejemplo, desde
                2010 para recomendarla a autos 2010 en adelante. Vacíos: recomendada para todos los años.
              </p>
            </>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving} className="gap-2">
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              Guardar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function CoverageSettingsSection() {
  const { data: coverages, isLoading } = useCoverageSettings()
  const { update, reorder } = useCoverageSettingsActions()
  const [editing, setEditing] = useState<CoverageSetting | null>(null)

  const handleSave = (data: UpdateCoverageSettingRequest) => {
    if (!editing) return
    update.mutate(
      { id: editing.id, data },
      {
        onSuccess: () => {
          toast.success('Cobertura actualizada')
          setEditing(null)
        },
        onError: () => toast.error('No se pudo guardar la cobertura'),
      },
    )
  }

  const toggleActive = (coverage: CoverageSetting) => {
    update.mutate(
      { id: coverage.id, data: { isActive: !coverage.isActive } },
      {
        onSuccess: () => toast.success(coverage.isActive ? 'Cobertura oculta' : 'Cobertura visible'),
        onError: () => toast.error('No se pudo cambiar la visibilidad'),
      },
    )
  }

  // Swaps a coverage with its neighbour and persists the whole list, so the
  // resulting order is exactly what the screen shows.
  const move = (index: number, direction: -1 | 1) => {
    if (!coverages) return
    const target = index + direction
    if (target < 0 || target >= coverages.length) return

    const next = [...coverages]
    ;[next[index], next[target]] = [next[target], next[index]]

    reorder.mutate(
      { items: next.map((coverage, position) => ({ id: coverage.id, sortOrder: (position + 1) * 10 })) },
      { onError: () => toast.error('No se pudo reordenar') },
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Coberturas de automotor</CardTitle>
        <CardDescription>
          Qué coberturas ve el cliente al cotizar, en qué orden y con qué texto. Las coberturas aparecen solas la
          primera vez que Triunfo las cotiza — no se crean a mano. Qué coberturas ofrece Triunfo para cada vehículo y
          año lo decide Triunfo; acá se elige cuáles de esas mostrar. Una cobertura nueva no se ofrece hasta que se
          carga qué incluye y qué no.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-2">
        {isLoading && (
          <>
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </>
        )}

        {!isLoading && coverages?.length === 0 && (
          <p className="text-muted-foreground py-6 text-center text-sm">
            Todavía no se registró ninguna cobertura. Van a aparecer acá en cuanto se haga la primera cotización.
          </p>
        )}

        {coverages?.map((coverage, index) => (
          <div
            key={coverage.id}
            className={`flex items-center gap-3 rounded-xl border px-3.5 py-3 ${
              coverage.isActive && !coverage.needsReview ? 'bg-card' : 'bg-muted/40 opacity-70'
            }`}
          >
            <div className="flex flex-col gap-0.5">
              <Button
                size="icon"
                variant="ghost"
                className="size-6"
                disabled={index === 0 || reorder.isPending}
                onClick={() => move(index, -1)}
                aria-label="Subir"
              >
                <ArrowUp className="size-3.5" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="size-6"
                disabled={index === (coverages?.length ?? 0) - 1 || reorder.isPending}
                onClick={() => move(index, 1)}
                aria-label="Bajar"
              >
                <ArrowDown className="size-3.5" />
              </Button>
            </div>

            <Badge variant="outline" className="font-mono">
              {coverage.code}
            </Badge>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="truncate text-sm font-medium">{coverage.name}</span>
                {coverage.highlighted && (
                  <Badge variant="secondary" className="gap-1">
                    <Star className="size-3 fill-current" />
                    {recommendedLabel(coverage)}
                  </Badge>
                )}
                {coverage.needsReview ? (
                  <Badge
                    variant="outline"
                    className="border-amber-300 text-amber-800 dark:border-amber-800 dark:text-amber-300"
                  >
                    Falta cargar qué cubre · no se ofrece
                  </Badge>
                ) : (
                  !coverage.isConfigured && <Badge variant="outline">Sin configurar</Badge>
                )}
                {yearLabel(coverage) && <Badge variant="outline">{yearLabel(coverage)}</Badge>}
                {!coverage.isActive && <Badge variant="outline">Oculta</Badge>}
              </div>
              {coverage.tagline && <p className="text-muted-foreground truncate text-xs">{coverage.tagline}</p>}
            </div>

            <Button
              size="icon"
              variant="ghost"
              onClick={() => toggleActive(coverage)}
              disabled={update.isPending}
              aria-label={coverage.isActive ? 'Ocultar' : 'Mostrar'}
            >
              {coverage.isActive ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
            </Button>

            <Button size="icon" variant="ghost" onClick={() => setEditing(coverage)} aria-label="Editar">
              <Pencil className="size-4" />
            </Button>
          </div>
        ))}
      </CardContent>

      {editing && (
        <EditCoverageDialog
          coverage={editing}
          saving={update.isPending}
          onClose={() => setEditing(null)}
          onSave={handleSave}
        />
      )}
    </Card>
  )
}
