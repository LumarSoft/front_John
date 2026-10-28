'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/src/components/ui/button'
import { Skeleton } from '@/src/components/ui/skeleton'
import { cn } from '@/src/lib/utils'
import {
  PROPOSAL_STATUSES,
  PROPOSAL_STATUS_LABEL,
  type OwnerProposal,
  type OwnerProposalFilter,
  type ProposalStatus,
} from '@/src/types/api/improvements'
import { useListPage } from '../hooks/use-list-page'
import { useOwnerProposals, useUpdateProposal } from '../hooks/use-proposals'
import { ListPagination } from './list-pagination'
import { ProposalCard } from './proposal-card'

const PAGE_SIZE = 10

const fieldClass =
  'rounded-xl border border-line-2 bg-paper px-3 py-2 text-[13px] text-ink outline-none focus:border-ember focus:shadow-[0_0_0_3px_var(--color-ember-soft)]'

function ProposalAnswer({ proposal }: { proposal: OwnerProposal }) {
  const update = useUpdateProposal()
  const [status, setStatus] = useState<ProposalStatus>(proposal.status)
  const [response, setResponse] = useState(proposal.response ?? '')
  const dirty = status !== proposal.status || response.trim() !== (proposal.response ?? '')

  const save = () =>
    update.mutate(
      { id: proposal.id, data: { status, response } },
      {
        onSuccess: () => toast.success('Propuesta actualizada'),
        onError: () => toast.error('No se pudo guardar la propuesta'),
      },
    )

  return (
    <div className="flex flex-col gap-2 border-t border-line pt-3">
      <textarea
        value={response}
        maxLength={5000}
        rows={2}
        onChange={e => setResponse(e.target.value)}
        placeholder="Respuesta para la organización (la ven todos)"
        aria-label="Respuesta"
        className={cn(fieldClass, 'w-full')}
      />
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={status}
          onChange={e => setStatus(e.target.value as ProposalStatus)}
          aria-label="Estado"
          className={fieldClass}
        >
          {PROPOSAL_STATUSES.map(s => (
            <option key={s} value={s}>
              {PROPOSAL_STATUS_LABEL[s]}
            </option>
          ))}
        </select>
        <Button size="sm" disabled={!dirty || update.isPending} onClick={save} className="ml-auto">
          {update.isPending && <Loader2 className="size-3.5 animate-spin" />} Guardar
        </Button>
      </div>
    </div>
  )
}

/** Lumar (OWNER): every organization's proposals, to answer and move through the statuses. */
export function OwnerProposalsView() {
  const [filter, setFilter] = useState<OwnerProposalFilter>('open')
  const { page, goTo, reset, keepWithin, topRef } = useListPage()
  const { data: result, isLoading, isError, isFetching } = useOwnerProposals({ page, pageSize: PAGE_SIZE, filter })
  keepWithin(result?.totalPages)

  const visible = result?.data ?? []

  const chooseFilter = (next: OwnerProposalFilter) => {
    setFilter(next)
    reset()
  }

  return (
    <div ref={topRef} className="flex scroll-mt-20 flex-col gap-4">
      <p className="text-[13px] text-muted-foreground">
        Lo que proponen las organizaciones. Tu respuesta y el estado los ve todo el equipo que propuso.
      </p>
      <div className="flex flex-wrap gap-2">
        {(
          [
            { key: 'open', label: 'Abiertas', count: result?.counts.open ?? 0 },
            { key: 'all', label: 'Todas', count: result?.counts.all ?? 0 },
          ] as const
        ).map(chip => (
          <button
            key={chip.key}
            type="button"
            onClick={() => chooseFilter(chip.key)}
            className={cn(
              'rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition-colors',
              filter === chip.key
                ? 'border-ember bg-ember-soft text-ember-2'
                : 'border-line-2 bg-card text-ink-3 hover:border-ember/50',
            )}
          >
            {chip.label} <span className="tabular-nums text-faint">{chip.count}</span>
          </button>
        ))}
      </div>

      {isLoading && <Skeleton className="h-32 rounded-2xl" />}
      {isError && (
        <p className="rounded-xl border border-line-2 bg-card p-6 text-center text-[13.5px] text-muted-foreground">
          No se pudieron cargar las propuestas.
        </p>
      )}
      {!isLoading && !isError && visible.length === 0 && (
        <p className="rounded-xl border border-line-2 bg-card p-6 text-center text-[13.5px] text-muted-foreground">
          No hay propuestas en esta lista.
        </p>
      )}
      <div className={cn('flex flex-col gap-4 transition-opacity', isFetching && !isLoading && 'opacity-60')}>
        {visible.map(proposal => (
          <ProposalCard key={proposal.id} proposal={proposal} meta={<span>· {proposal.producer.name}</span>}>
            <ProposalAnswer key={`${proposal.id}-${proposal.status}-${proposal.response}`} proposal={proposal} />
          </ProposalCard>
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
