import { MessageSquareReply } from 'lucide-react'
import { cn } from '@/src/lib/utils'
import { PROPOSAL_STATUS_LABEL, type Proposal, type ProposalStatus } from '@/src/types/api/improvements'

const STATUS_CLASS: Record<ProposalStatus, string> = {
  NEW: 'bg-ember-2 text-on-ember',
  REVIEWING: 'bg-ember-soft text-ember-2',
  PLANNED: 'bg-ember-soft text-ember-2',
  DONE: 'bg-ink text-paper',
  DISCARDED: 'border border-line-strong text-faint',
}

const DATE_FORMAT = new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })

export function ProposalStatusBadge({ status }: { status: ProposalStatus }) {
  return (
    <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-semibold', STATUS_CLASS[status])}>
      {PROPOSAL_STATUS_LABEL[status]}
    </span>
  )
}

interface ProposalCardProps {
  proposal: Omit<Proposal, 'mine'> & { mine?: boolean }
  /** Extra context next to the author (the organization, for the owner). */
  meta?: React.ReactNode
  /** Owner controls, rendered at the bottom of the card. */
  children?: React.ReactNode
}

export function ProposalCard({ proposal, meta, children }: ProposalCardProps) {
  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-line-2 bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-center gap-2 text-[12px] text-faint">
        <ProposalStatusBadge status={proposal.status} />
        <span>
          {proposal.mine ? 'Tu propuesta' : (proposal.author?.email ?? 'Usuario eliminado')} ·{' '}
          {DATE_FORMAT.format(new Date(proposal.createdAt))}
        </span>
        {meta}
      </div>
      <div>
        <h3 className="font-display text-[16px] font-semibold tracking-tight text-ink">{proposal.title}</h3>
        <p className="mt-1.5 text-[13.5px] leading-relaxed whitespace-pre-line text-ink-3">{proposal.description}</p>
      </div>
      {proposal.response && (
        <div className="rounded-xl border border-ember/30 bg-ember-soft p-3.5">
          <span className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-ember-2">
            <MessageSquareReply className="size-3.5" /> Respuesta de Lumar
          </span>
          <p className="mt-1.5 text-[13.5px] leading-relaxed whitespace-pre-line text-ink">{proposal.response}</p>
        </div>
      )}
      {children}
    </article>
  )
}
