import { Bot, Calculator, LayoutDashboard, MessageSquare, UserRound, type LucideIcon } from 'lucide-react'
import { cn } from '@/src/lib/utils'
import { IMPROVEMENT_AREA_LABEL, type Improvement, type ImprovementArea } from '@/src/types/api/improvements'

export const AREA_ICON: Record<ImprovementArea, LucideIcon> = {
  BOT: Bot,
  BANDEJA: MessageSquare,
  COTIZADOR: Calculator,
  PANEL: LayoutDashboard,
  PORTAL: UserRound,
}

const DATE_FORMAT = new Intl.DateTimeFormat('es-AR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
})

/** The date the card shows: the day of the change, else the day it was published. */
export function improvementDate(improvement: Pick<Improvement, 'releasedOn' | 'publishedAt'>): string | null {
  const iso = improvement.releasedOn ?? improvement.publishedAt
  return iso ? DATE_FORMAT.format(new Date(iso)) : null
}

type ExampleLine = { kind: 'customer' | 'business'; speaker: string; text: string } | { kind: 'note'; text: string }

// Whoever isn't the customer speaks for the business (NICO, Oficina, Mili…).
const CUSTOMER = /^cliente$/i

/** "Cliente: hola" → a bubble; "(el bot no responde)" or a line without a speaker → a note. */
function parseExample(example: string): ExampleLine[] {
  return example
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      const match = /^([^:()]{1,24}):\s*(.+)$/.exec(line)
      if (!match) return { kind: 'note', text: line.replace(/^\((.*)\)$/, '$1') }
      const speaker = match[1].trim()
      return { kind: CUSTOMER.test(speaker) ? 'customer' : 'business', speaker, text: match[2] }
    })
}

function ExampleChat({ example }: { example: string }) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-line-2 bg-paper-2 p-3">
      <span className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-faint">Ejemplo</span>
      {parseExample(example).map((line, i) =>
        line.kind === 'note' ? (
          <p key={i} className="text-center text-[12px] italic text-faint">
            {line.text}
          </p>
        ) : (
          <div
            key={i}
            className={cn(
              'max-w-[85%] rounded-2xl px-3 py-2 text-[13px] leading-snug whitespace-pre-line',
              line.kind === 'customer'
                ? 'self-start rounded-bl-sm border border-line-2 bg-card text-ink'
                : 'self-end rounded-br-sm bg-ember-soft text-ink',
            )}
          >
            <span
              className={cn(
                'mb-0.5 block text-[10.5px] font-semibold',
                line.kind === 'customer' ? 'text-faint' : 'text-ember-2',
              )}
            >
              {line.speaker}
            </span>
            {line.text}
          </div>
        ),
      )}
    </div>
  )
}

interface ImprovementCardProps {
  improvement: Improvement
  isNew?: boolean
  /** Owner-only context shown above the title (draft state, target organization). */
  meta?: React.ReactNode
  /** Owner-only actions, rendered at the bottom of the card. */
  actions?: React.ReactNode
}

export function ImprovementCard({ improvement, isNew, meta, actions }: ImprovementCardProps) {
  const Icon = AREA_ICON[improvement.area]
  const date = improvementDate(improvement)
  const hasBefore = !!improvement.beforeText
  const hasAfter = !!improvement.afterText

  return (
    <article
      className={cn(
        'flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-sm',
        isNew ? 'border-ember/60' : 'border-line-2',
      )}
    >
      <div className="flex flex-wrap items-center gap-2 text-[12px]">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-paper-2 px-2.5 py-1 font-medium text-ink-3">
          <Icon className="size-3.5" />
          {IMPROVEMENT_AREA_LABEL[improvement.area]}
        </span>
        {date && <span className="text-faint">{date}</span>}
        {isNew && (
          <span className="rounded-full bg-ember-2 px-2 py-0.5 text-[11px] font-semibold text-on-ember">Nueva</span>
        )}
        {meta}
      </div>

      <div>
        <h2 className="font-display text-[17px] font-semibold tracking-tight text-ink">{improvement.title}</h2>
        <p className="mt-1.5 text-[14px] leading-relaxed text-ink-3">{improvement.summary}</p>
      </div>

      {(hasBefore || hasAfter) && (
        <div className={cn('grid gap-3', hasBefore && hasAfter && 'md:grid-cols-2')}>
          {hasBefore && (
            <div className="rounded-xl border border-line-2 p-3.5">
              <span className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-faint">Antes</span>
              <p className="mt-1.5 text-[13.5px] leading-relaxed whitespace-pre-line text-ink-3">
                {improvement.beforeText}
              </p>
            </div>
          )}
          {hasAfter && (
            <div className="rounded-xl border border-ember/30 bg-ember-soft p-3.5">
              <span className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-ember-2">Ahora</span>
              <p className="mt-1.5 text-[13.5px] leading-relaxed whitespace-pre-line text-ink">
                {improvement.afterText}
              </p>
            </div>
          )}
        </div>
      )}

      {improvement.example && <ExampleChat example={improvement.example} />}

      {actions && <div className="flex flex-wrap items-center gap-2 border-t border-line pt-3">{actions}</div>}
    </article>
  )
}
