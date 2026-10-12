'use client'

import { useState, type FormEvent } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/src/components/ui/dialog'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import {
  IMPROVEMENT_AREAS,
  IMPROVEMENT_AREA_LABEL,
  type ImprovementArea,
  type ImprovementRequest,
  type OwnerImprovement,
} from '@/src/types/api/improvements'
import type { OrganizationSummary } from '@/src/types/api/organizations'
import { useOwnerImprovementActions } from '../hooks/use-improvements'
import { useOrganizations } from '../hooks/use-organizations'
import { ImprovementCard } from './improvement-card'

interface ImprovementFormDialogProps {
  /** Null = new improvement. */
  improvement: OwnerImprovement | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const fieldClass =
  'w-full rounded-xl border border-line-2 bg-paper px-3.5 py-2.5 text-[13.5px] text-ink outline-none transition-[border-color,box-shadow] focus:border-ember focus:shadow-[0_0_0_3px_rgba(232,168,32,0.12)]'

function todayYmd(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' }).format(new Date())
}

/** The organization a new improvement is for by default: the one with the most clients (the real tenant). */
function defaultOrganizationId(organizations: OrganizationSummary[] | undefined): number | null {
  const active = (organizations ?? []).filter(o => o.isActive)
  if (active.length === 0) return null
  return active.reduce((best, o) => (o.counts.clients > best.counts.clients ? o : best)).id
}

function initialForm(improvement: OwnerImprovement | null, organizations?: OrganizationSummary[]): ImprovementRequest {
  return {
    title: improvement?.title ?? '',
    summary: improvement?.summary ?? '',
    beforeText: improvement?.beforeText ?? '',
    afterText: improvement?.afterText ?? '',
    example: improvement?.example ?? '',
    area: improvement?.area ?? 'BOT',
    releasedOn: improvement ? (improvement.releasedOn?.slice(0, 10) ?? null) : todayYmd(),
    producerId: improvement ? improvement.producerId : defaultOrganizationId(organizations),
  }
}

function ImprovementForm({
  improvement,
  organizations,
  onDone,
}: {
  improvement: OwnerImprovement | null
  organizations: OrganizationSummary[] | undefined
  onDone: () => void
}) {
  const { create, update } = useOwnerImprovementActions()
  const [form, setForm] = useState<ImprovementRequest>(() => initialForm(improvement, organizations))
  const pending = create.isPending || update.isPending
  const isPublished = !!improvement?.publishedAt

  const set = <K extends keyof ImprovementRequest>(key: K, value: ImprovementRequest[K]) =>
    setForm(f => ({ ...f, [key]: value }))

  const save = (published: boolean) => {
    if (!form.title.trim() || !form.summary.trim()) {
      toast.error('Completá el título y el resumen.')
      return
    }
    const data = { ...form, published }
    const callbacks = {
      onSuccess: () => {
        toast.success(published ? 'Mejora publicada' : 'Borrador guardado')
        onDone()
      },
      onError: () => toast.error('No se pudo guardar. Intentá de nuevo.'),
    }
    if (improvement) update.mutate({ id: improvement.id, data }, callbacks)
    else create.mutate(data, callbacks)
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    save(isPublished)
  }

  const preview = {
    id: improvement?.id ?? 0,
    ...form,
    beforeText: form.beforeText.trim() || null,
    afterText: form.afterText.trim() || null,
    example: form.example.trim() || null,
    releasedOn: form.releasedOn ? `${form.releasedOn}T00:00:00.000Z` : null,
    publishedAt: improvement?.publishedAt ?? null,
  }

  return (
    <form onSubmit={handleSubmit} className="grid min-h-0 flex-1 gap-0 overflow-hidden lg:grid-cols-2">
      <div className="flex min-h-0 flex-col gap-4 overflow-y-auto p-5">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="improvement-title">Título</Label>
          <Input
            id="improvement-title"
            value={form.title}
            maxLength={140}
            onChange={e => set('title', e.target.value)}
            placeholder="El bot responde lo que le piden desde el primer mensaje"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="improvement-summary">Resumen</Label>
          <textarea
            id="improvement-summary"
            value={form.summary}
            maxLength={500}
            rows={2}
            onChange={e => set('summary', e.target.value)}
            placeholder="Una o dos oraciones que expliquen el cambio."
            className={fieldClass}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="improvement-area">Área</Label>
            <select
              id="improvement-area"
              value={form.area}
              onChange={e => set('area', e.target.value as ImprovementArea)}
              className={fieldClass}
            >
              {IMPROVEMENT_AREAS.map(a => (
                <option key={a} value={a}>
                  {IMPROVEMENT_AREA_LABEL[a]}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="improvement-date">Fecha</Label>
            <Input
              id="improvement-date"
              type="date"
              value={form.releasedOn ?? ''}
              onChange={e => set('releasedOn', e.target.value || null)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="improvement-org">Organización</Label>
            <select
              id="improvement-org"
              value={form.producerId ?? ''}
              onChange={e => set('producerId', e.target.value ? Number(e.target.value) : null)}
              className={fieldClass}
            >
              <option value="">Todas</option>
              {(organizations ?? []).map(o => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="improvement-before">Antes (opcional)</Label>
          <textarea
            id="improvement-before"
            value={form.beforeText}
            maxLength={5000}
            rows={3}
            onChange={e => set('beforeText', e.target.value)}
            placeholder="Qué pasaba antes del cambio."
            className={fieldClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="improvement-after">Ahora (opcional)</Label>
          <textarea
            id="improvement-after"
            value={form.afterText}
            maxLength={5000}
            rows={3}
            onChange={e => set('afterText', e.target.value)}
            placeholder="Qué pasa ahora."
            className={fieldClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="improvement-example">Ejemplo (opcional)</Label>
          <textarea
            id="improvement-example"
            value={form.example}
            maxLength={5000}
            rows={4}
            onChange={e => set('example', e.target.value)}
            placeholder={
              'Cliente: Hola, me pasás mi póliza\nNICO: ¡Hola! Pasame el DNI del titular…\n(El bot no responde)'
            }
            className={`${fieldClass} font-mono text-[12.5px]`}
          />
          <span className="text-[11.5px] text-faint">
            Un mensaje por línea, con quién habla adelante (Cliente:, NICO:, Oficina:). Entre paréntesis, una
            aclaración.
          </span>
        </div>
      </div>

      <div className="flex min-h-0 flex-col gap-3 overflow-y-auto border-t border-line-2 bg-paper-2 p-5 lg:border-t-0 lg:border-l">
        <span className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-faint">
          Así lo van a ver en el panel
        </span>
        <ImprovementCard improvement={preview} />
        <div className="mt-auto flex flex-wrap justify-end gap-2 pt-2">
          {isPublished ? (
            <Button type="submit" disabled={pending} className="h-10">
              {pending && <Loader2 className="size-4 animate-spin" />} Guardar cambios
            </Button>
          ) : (
            <>
              <Button type="button" variant="outline" disabled={pending} onClick={() => save(false)} className="h-10">
                Guardar borrador
              </Button>
              <Button type="button" disabled={pending} onClick={() => save(true)} className="h-10">
                {pending && <Loader2 className="size-4 animate-spin" />} Guardar y publicar
              </Button>
            </>
          )}
        </div>
      </div>
    </form>
  )
}

export function ImprovementFormDialog({ improvement, open, onOpenChange }: ImprovementFormDialogProps) {
  const { data: organizations, isLoading } = useOrganizations(open)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-5xl">
        <DialogHeader className="border-b border-line-2 p-5">
          <DialogTitle>{improvement ? 'Editar mejora' : 'Nueva mejora'}</DialogTitle>
          <DialogDescription>
            Escribila para la oficina, sin términos técnicos. Mientras sea borrador solo la ves vos.
          </DialogDescription>
        </DialogHeader>
        {open && !isLoading ? (
          <ImprovementForm
            key={improvement?.id ?? 'new'}
            improvement={improvement}
            organizations={organizations}
            onDone={() => onOpenChange(false)}
          />
        ) : (
          <div className="flex justify-center p-10">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
