'use client'

import { Fragment, type ReactNode } from 'react'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Check, Loader2, Pointer } from 'lucide-react'
import { cn } from '@/src/lib/utils'
import type { AssistantAction, AssistantStep } from '@/src/types/api/assistant'
import { clientHref, parseReply, replyScreenHref, type ReplyInline } from '../lib/assistant-format'
import { tourStore } from '../lib/tour-store'
import { AssistantActionCard } from './assistant-action-card'
import { AssistantLogo } from './assistant-logo'

const PILL =
  'my-0.5 inline-flex items-center gap-1.5 rounded-full border border-ember-ring bg-ember-soft px-3 py-1 align-middle text-[12.5px] font-medium text-ember-2 transition-colors hover:bg-ember hover:text-on-ember'

function Inline({ pieces, onNavigate }: { pieces: ReplyInline[]; onNavigate: () => void }) {
  return (
    <>
      {pieces.map((piece, i) => {
        const text = piece.code ? (
          <code className="rounded-md bg-secondary px-1.5 py-0.5 font-mono text-[12.5px] text-ink">{piece.text}</code>
        ) : piece.bold ? (
          <strong className="font-semibold text-ink">{piece.text}</strong>
        ) : (
          piece.text
        )
        const { tourId, screenId, clientId } = piece
        if (tourId) {
          return (
            <button
              key={i}
              type="button"
              onClick={() => {
                onNavigate()
                tourStore.start(tourId)
              }}
              className={PILL}
            >
              <Pointer className="size-3.5" />
              {piece.text}
            </button>
          )
        }
        if (screenId) {
          return (
            <Link key={i} href={replyScreenHref(piece)} onClick={onNavigate} className={PILL}>
              {piece.text}
              <ArrowRight className="size-3.5" />
            </Link>
          )
        }
        return clientId ? (
          <Link
            key={i}
            href={clientHref(clientId)}
            onClick={onNavigate}
            className="font-medium text-ember-2 underline decoration-ember/40 underline-offset-2 hover:decoration-ember"
          >
            {text}
          </Link>
        ) : (
          <Fragment key={i}>{text}</Fragment>
        )
      })}
    </>
  )
}

/** The assistant's reply, rendered from its light markdown with the panel's own elements (never as HTML). */
export function AssistantReply({ content, onNavigate }: { content: string; onNavigate: () => void }) {
  return (
    <div className="flex flex-col gap-2.5">
      {parseReply(content).map((block, i) =>
        block.kind === 'list' ? (
          <ul key={i} className="flex list-disc flex-col gap-1 pl-4 marker:text-faint">
            {block.lines.map((line, j) => (
              <li key={j}>
                <Inline pieces={line} onNavigate={onNavigate} />
              </li>
            ))}
          </ul>
        ) : (
          <p key={i}>
            {block.lines.map((line, j) => (
              <Fragment key={j}>
                {j > 0 && <br />}
                <Inline pieces={line} onNavigate={onNavigate} />
              </Fragment>
            ))}
          </p>
        ),
      )}
    </div>
  )
}

/** Fades a message in as it arrives. */
function Appear({ children, className }: { children: ReactNode; className?: string }) {
  const reduced = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}

export function UserBubble({ content, faded = false }: { content: string; faded?: boolean }) {
  return (
    <Appear className="flex justify-end">
      <div
        className={cn(
          'max-w-[85%] rounded-2xl rounded-br-md bg-ember px-3.5 py-2 text-[13.5px] leading-relaxed whitespace-pre-wrap break-words text-on-ember shadow-sm',
          faded && 'opacity-70',
        )}
      >
        {content}
      </div>
    </Appear>
  )
}

/** What the assistant checked to answer: live while it works, a quiet line once saved. */
function Steps({ steps, live }: { steps: AssistantStep[]; live: boolean }) {
  if (!steps.length) return null
  return (
    <ul className="flex flex-col gap-1">
      {steps.map(step => (
        <motion.li
          key={step.id}
          initial={live ? { opacity: 0, x: -4 } : false}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-1.5 text-[12px] text-muted-foreground"
        >
          {step.state === 'running' ? (
            <Loader2 className="size-3.5 animate-spin text-ember-2" />
          ) : (
            <Check className="size-3.5 text-ember-2" />
          )}
          <span className={cn(step.state === 'running' && 'text-ink-3')}>
            {step.label}
            {step.state === 'running' && '…'}
          </span>
        </motion.li>
      ))}
    </ul>
  )
}

/** "Pensando…" with a light sweeping across it, until the first step or word arrives. */
function Thinking() {
  const reduced = useReducedMotion()
  return (
    <motion.span
      className="bg-[linear-gradient(90deg,var(--color-faint)_0%,var(--color-ink)_50%,var(--color-faint)_100%)] bg-[length:200%_100%] bg-clip-text text-[13px] text-transparent"
      animate={reduced ? undefined : { backgroundPosition: ['100% 0%', '-100% 0%'] }}
      transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
    >
      Pensando…
    </motion.span>
  )
}

interface AssistantTurnProps {
  content: string
  steps: AssistantStep[]
  actions: AssistantAction[]
  /** Still being written. */
  live?: boolean
  busyActions: number[]
  onConfirm: (id: number) => void
  onCancel: (id: number) => void
  /** Unset while an answer is being written: one question at a time. */
  onUndo?: (id: number) => void
  onNavigate: () => void
  footer?: ReactNode
}

/** One answer of the assistant: the steps it took, its reply and the changes it prepared. */
export function AssistantTurn({
  content,
  steps,
  actions,
  live = false,
  busyActions,
  onConfirm,
  onCancel,
  onUndo,
  onNavigate,
  footer,
}: AssistantTurnProps) {
  const working = live && !content && !steps.some(s => s.state === 'running')
  return (
    <Appear className="flex gap-2.5">
      <AssistantLogo size={24} thinking={live} className="mt-0.5" />
      <div className="flex min-w-0 flex-1 flex-col gap-2.5 text-[13.5px] leading-relaxed text-ink-2">
        <Steps steps={steps} live={live} />
        {working && <Thinking />}
        {content && <AssistantReply content={content} onNavigate={onNavigate} />}
        {actions.map(action => (
          <AssistantActionCard
            key={action.id}
            action={action}
            busy={busyActions.includes(action.id)}
            onConfirm={() => onConfirm(action.id)}
            onCancel={() => onCancel(action.id)}
            onUndo={onUndo && (() => onUndo(action.id))}
            onNavigate={onNavigate}
          />
        ))}
        {footer}
      </div>
    </Appear>
  )
}
