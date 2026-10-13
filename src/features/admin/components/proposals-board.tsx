'use client'

import { useState, type FormEvent } from 'react'
import { Lightbulb, Loader2, Send } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { Skeleton } from '@/src/components/ui/skeleton'
import { cn } from '@/src/lib/utils'
import { useListPage } from '../hooks/use-list-page'
import { useCreateProposal, useProposals } from '../hooks/use-proposals'
import { ListPagination } from './list-pagination'
import { ProposalCard } from './proposal-card'

const PAGE_SIZE = 10

const fieldClass =
  'w-full rounded-xl border border-line-2 bg-paper px-3.5 py-2.5 text-[13.5px] text-ink outline-none transition-[border-color,box-shadow] focus:border-ember focus:shadow-[0_0_0_3px_rgba(232,168,32,0.12)]'

function ProposalForm({ onCreated }: { onCreated: () => void }) {
  const create = useCreateProposal()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !description.trim()) {
      toast.error('Completá el título y el detalle.')
      return
    }
    create.mutate(
      { title, description },
      {
        onSuccess: () => {
          toast.success('¡Gracias! Le llegó tu propuesta a Lumar.')
          setTitle('')
          setDescription('')
          onCreated()
        },
        onError: () => toast.error('No se pudo enviar. Intentá de nuevo.'),
      },
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-2xl border border-line-2 bg-card p-5 shadow-sm"
    >
      <h2 className="flex items-center gap-2 font-display text-[16px] font-semibold text-ink">
        <Lightbulb className="size-4 text-ember-2" /> Proponer una mejora
      </h2>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="proposal-title">¿Qué te gustaría que cambie?</Label>
        <Input
          id="proposal-title"
          value={title}
          maxLength={140}
          onChange={e => setTitle(e.target.value)}
          placeholder="Ej.: Que el bot me avise al celular cuando alguien pide un asesor"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="proposal-description">Contanos el detalle</Label>
        <textarea
          id="proposal-description"
          value={description}
          maxLength={5000}
          rows={4}
          onChange={e => setDescription(e.target.value)}
          placeholder="Qué pasa hoy, por qué molesta y, si tenés, un ejemplo de un chat o de un cliente."
          className={fieldClass}
        />
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={create.isPending} className="h-10">
          {create.isPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />} Enviar
          propuesta
        </Button>
      </div>
    </form>
  )
}

/** The organization's shared board: propose, and see every proposal with its status and Lumar's answer. */
export function ProposalsBoard() {
  const { page, goTo, reset, keepWithin, topRef } = useListPage()
  const { data: result, isLoading, isError, isFetching } = useProposals({ page, pageSize: PAGE_SIZE })
  keepWithin(result?.totalPages)

  return (
    <div className="flex flex-col gap-5">
      <p className="text-[13px] text-muted-foreground">
        Todo el equipo ve las propuestas, en qué estado están y lo que respondemos. Antes de proponer, fijate si ya
        está.
      </p>
      {/* A new proposal goes first, so show the first page where it landed. */}
      <ProposalForm onCreated={reset} />

      {isLoading && <Skeleton className="h-32 rounded-2xl" />}
      {isError && (
        <p className="rounded-xl border border-line-2 bg-card p-6 text-center text-[13.5px] text-muted-foreground">
          No se pudieron cargar las propuestas.
        </p>
      )}
      {result && result.total === 0 && (
        <p className="rounded-xl border border-line-2 bg-card p-6 text-center text-[13.5px] text-muted-foreground">
          Todavía no hay propuestas. ¡Sé el primero!
        </p>
      )}
      <div
        ref={topRef}
        className={cn('flex scroll-mt-20 flex-col gap-5 transition-opacity', isFetching && !isLoading && 'opacity-60')}
      >
        {result?.data.map(proposal => (
          <ProposalCard key={proposal.id} proposal={proposal} />
        ))}
      </div>
      {result && (
        <ListPagination
          page={result.page}
          pageSize={result.pageSize}
          total={result.total}
          totalPages={result.totalPages}
          noun={['propuesta', 'propuestas']}
          onPageChange={goTo}
          disabled={isFetching}
        />
      )}
    </div>
  )
}
