'use client'

import { useState, type FormEvent } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Bot, Check, CheckCircle2, CreditCard, KeyRound, Loader2, Mail, MessageSquare, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/src/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/src/components/ui/dialog'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { ApiError } from '@/src/lib/api-client'
import { QUERY_KEYS } from '@/src/lib/query-keys'
import type { TokenPlanOption } from '@/src/types/api/billing'
import type { ProducerCodeOption } from '@/src/types/api/users'
import type { OnboardWhatsappResponse } from '@/src/types/api/whatsapp-onboarding'
import { useBillingActions, useTokenPlans } from '../hooks/use-billing'
import { useCreateProducerCode } from '../hooks/use-create-producer-code'
import { useCreateUser } from '../hooks/use-create-user'
import { ConectarWhatsapp } from './conectar-whatsapp'
import { NumberAssistantSheet } from './number-assistant-sheet'

type Step = 'branch' | 'user' | 'number' | 'assistant' | 'plan' | 'done'

const STEPS: { key: Step; label: string }[] = [
  { key: 'branch', label: 'Sucursal' },
  { key: 'user', label: 'Usuario' },
  { key: 'number', label: 'WhatsApp' },
  { key: 'assistant', label: 'Asistente' },
  { key: 'plan', label: 'Plan' },
]

const usd = (n: number) => `USD ${n.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`

function failed(error: unknown, fallback: string) {
  toast.error(error instanceof ApiError && error.status < 500 ? error.message : fallback)
}

function Stepper({ current }: { current: Step }) {
  const index = STEPS.findIndex(s => s.key === current)
  return (
    <ol className="flex flex-wrap items-center gap-1.5 text-[11.5px]">
      {STEPS.map((step, i) => {
        const state = i < index || current === 'done' ? 'done' : i === index ? 'current' : 'todo'
        return (
          <li key={step.key} className="flex items-center gap-1.5">
            <span
              className={`flex size-5 items-center justify-center rounded-full border text-[10.5px] font-semibold ${
                state === 'done'
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400'
                  : state === 'current'
                    ? 'border-ember bg-ember text-on-ember'
                    : 'border-line-2 text-muted-foreground'
              }`}
            >
              {state === 'done' ? <Check className="size-3" /> : i + 1}
            </span>
            <span className={state === 'current' ? 'font-medium text-ink' : 'text-muted-foreground'}>{step.label}</span>
            {i < STEPS.length - 1 && <span className="mx-0.5 h-px w-4 bg-line-2" />}
          </li>
        )
      })}
    </ol>
  )
}

// ─── Steps ───────────────────────────────────────────────────────────────────────

function BranchStep({ onCreated }: { onCreated: (code: ProducerCodeOption) => void }) {
  const [code, setCode] = useState('')
  const [holderName, setHolderName] = useState('')
  const create = useCreateProducerCode()
  const submit = (e: FormEvent) => {
    e.preventDefault()
    create.mutate(
      { code: code.trim(), holderName: holderName.trim() || undefined },
      { onSuccess: onCreated, onError: error => failed(error, 'No se pudo crear la sucursal') },
    )
  }
  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <p className="text-[13px] text-muted-foreground">
        Cada sucursal es un código de productor de Triunfo. Su cartera, su número y su administrador quedan atados a ese
        código y separados del resto.
      </p>
      <div className="flex flex-col gap-2">
        <Label htmlFor="branch-code">Código de productor (Triunfo)</Label>
        <Input
          id="branch-code"
          required
          maxLength={20}
          pattern="[0-9A-Za-z-]+"
          placeholder="14831"
          className="h-10"
          value={code}
          onChange={e => setCode(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="branch-name">
          Sucursal o titular <span className="text-muted-foreground">(como figura en Triunfo)</span>
        </Label>
        <Input
          id="branch-name"
          maxLength={120}
          placeholder="Sucursal Pueblo Esther"
          className="h-10"
          value={holderName}
          onChange={e => setHolderName(e.target.value)}
        />
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={create.isPending || !code.trim()}>
          {create.isPending && <Loader2 className="size-4 animate-spin" />}
          Crear sucursal
        </Button>
      </div>
    </form>
  )
}

function UserStep({ code, onCreated }: { code: ProducerCodeOption; onCreated: (email: string) => void }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const create = useCreateUser()
  const submit = (e: FormEvent) => {
    e.preventDefault()
    create.mutate(
      { email, name, password, role: 'ADMIN', producerCodeIds: [code.id] },
      {
        onSuccess: () => onCreated(email),
        onError: error =>
          toast.error(
            error instanceof ApiError && error.status === 409
              ? 'Ese correo ya está en uso.'
              : 'No se pudo crear el usuario',
          ),
      },
    )
  }
  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <p className="text-[13px] text-muted-foreground">
        El administrador de <span className="font-medium text-ink">{code.holderName ?? code.code}</span>. Solo ve los
        asegurados, chats y números del código {code.code}.
      </p>
      <div className="flex flex-col gap-2">
        <Label htmlFor="branch-user-name">
          Nombre <span className="text-muted-foreground">(como lo llaman en la oficina)</span>
        </Label>
        <Input
          id="branch-user-name"
          maxLength={80}
          placeholder="Mili"
          className="h-10"
          value={name}
          onChange={e => setName(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="branch-user-email">Correo electrónico</Label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="branch-user-email"
            type="email"
            required
            placeholder="nombre@gmail.com"
            className="h-10 pl-9"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="branch-user-password">Contraseña</Label>
        <div className="relative">
          <KeyRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="branch-user-password"
            type="password"
            required
            minLength={6}
            placeholder="Mínimo 6 caracteres"
            className="h-10 pl-9"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={create.isPending}>
          {create.isPending && <Loader2 className="size-4 animate-spin" />}
          Crear usuario
        </Button>
      </div>
    </form>
  )
}

function NumberStep({
  code,
  onConnected,
  onLater,
}: {
  code: ProducerCodeOption
  onConnected: (result: OnboardWhatsappResponse) => void
  onLater: () => void
}) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-[13px] text-muted-foreground">
        El número de WhatsApp de la sucursal, facturado al código {code.code}. Tiene que estar activo en la app WhatsApp
        Business del celular; Meta pide confirmarlo desde ahí.
      </p>
      <div className="rounded-lg border border-line-2 bg-secondary/40 p-4">
        <ConectarWhatsapp
          responsibleProducerCodeId={code.id}
          onConnected={onConnected}
          label="Conectar número de WhatsApp"
        />
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className="text-[12px] text-muted-foreground">
          Sin número, la sucursal queda creada igual: se conecta después desde Números.
        </span>
        <Button type="button" variant="outline" onClick={onLater} className="border-line-2">
          Conectar más tarde
        </Button>
      </div>
    </div>
  )
}

function AssistantStep({ numberId, onNext }: { numberId: number; onNext: () => void }) {
  const [open, setOpen] = useState(false)
  const [configured, setConfigured] = useState(false)
  return (
    <div className="flex flex-col gap-4">
      <p className="text-[13px] text-muted-foreground">
        Cómo atiende el bot en este número: su nombre, las personas de la oficina a las que los clientes pueden
        escribir, el horario, los datos que da (grúa, denuncias, cuenta para transferir, dónde pagar) y qué coberturas
        ofrece. Lo que no completes toma lo de la organización.
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          onClick={() => setOpen(true)}
          variant={configured ? 'outline' : 'default'}
          className={configured ? 'border-line-2' : ''}
        >
          <Bot className="size-4" />
          {configured ? 'Volver a editar' : 'Configurar el asistente'}
        </Button>
        {configured && (
          <span className="inline-flex items-center gap-1 text-[12.5px] text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="size-4" /> Asistente configurado
          </span>
        )}
      </div>
      <div className="flex justify-end">
        <Button
          type="button"
          onClick={onNext}
          variant={configured ? 'default' : 'outline'}
          className={configured ? '' : 'border-line-2'}
        >
          {configured ? 'Continuar' : 'Dejar como la organización'}
        </Button>
      </div>
      <NumberAssistantSheet
        numberId={numberId}
        open={open}
        onOpenChange={o => {
          setOpen(o)
          if (!o) setConfigured(true)
        }}
      />
    </div>
  )
}

function PlanStep({ numberId, onDone }: { numberId: number; onDone: (plan: TokenPlanOption | null) => void }) {
  const { data } = useTokenPlans()
  const { setNumberPlan } = useBillingActions()
  const [chosen, setChosen] = useState<number | null>(null)
  const plans = (data?.plans ?? []).filter(p => p.isActive)
  const confirm = () => {
    const plan = plans.find(p => p.id === chosen) ?? null
    if (!plan) return onDone(null)
    setNumberPlan.mutate(
      { numberId, planId: plan.id },
      { onSuccess: () => onDone(plan), onError: error => failed(error, 'No se pudo asignar el plan') },
    )
  }
  return (
    <div className="flex flex-col gap-4">
      <p className="text-[13px] text-muted-foreground">
        El plan de tokens del número (1 token = 1 mensaje enviado). Sin elegir, queda en el más chico del catálogo.
      </p>
      <div className="flex flex-col gap-2">
        {plans.map(plan => {
          const active = chosen === plan.id
          return (
            <button
              key={plan.id}
              type="button"
              onClick={() => setChosen(plan.id)}
              className={`flex items-center justify-between rounded-lg border px-3 py-2.5 text-left transition-colors ${
                active ? 'border-ember bg-ember-soft' : 'border-line-2 hover:bg-secondary'
              }`}
            >
              <span>
                <span className="text-[13.5px] font-medium text-ink">{plan.name}</span>
                <span className="ml-2 text-[12px] text-muted-foreground">
                  {plan.tokens.toLocaleString('es-AR')} tokens por mes
                </span>
              </span>
              <span className="flex items-center gap-2 text-[13.5px] font-semibold text-ink">
                {usd(plan.priceUsd)}
                {active && <Check className="size-4 text-ember-2" />}
              </span>
            </button>
          )
        })}
        {plans.length === 0 && (
          <p className="text-[13px] text-muted-foreground">
            No hay planes en el catálogo: se arman en Facturación → Planes.
          </p>
        )}
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => onDone(null)} className="border-line-2">
          Después
        </Button>
        <Button type="button" disabled={chosen === null || setNumberPlan.isPending} onClick={confirm}>
          {setNumberPlan.isPending && <Loader2 className="size-4 animate-spin" />}
          Asignar plan
        </Button>
      </div>
    </div>
  )
}

// ─── Dialog ──────────────────────────────────────────────────────────────────────

interface Summary {
  code: ProducerCodeOption | null
  email: string | null
  number: OnboardWhatsappResponse | null
  plan: TokenPlanOption | null
}

/**
 * The onboarding of a new branch: its code, its administrator, its WhatsApp
 * number, how the bot attends on it and its token plan, one step at a time.
 * Every step is saved as it goes, so closing early leaves what was done.
 */
export function BranchOnboardingDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const queryClient = useQueryClient()
  const [step, setStep] = useState<Step>('branch')
  const [summary, setSummary] = useState<Summary>({ code: null, email: null, number: null, plan: null })

  const reset = () => {
    setStep('branch')
    setSummary({ code: null, email: null, number: null, plan: null })
  }
  const close = () => {
    void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.phoneNumbers })
    void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.billingAll })
    onOpenChange(false)
    reset()
  }

  const titles: Record<Step, string> = {
    branch: 'Nueva sucursal',
    user: 'Su administrador',
    number: 'Su número de WhatsApp',
    assistant: 'Cómo atiende el bot',
    plan: 'Su plan de tokens',
    done: 'Sucursal lista',
  }

  return (
    <Dialog open={open} onOpenChange={o => (o ? onOpenChange(true) : close())}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="font-display text-[20px]">{titles[step]}</DialogTitle>
          <DialogDescription asChild>
            <div className="pt-1">
              <Stepper current={step} />
            </div>
          </DialogDescription>
        </DialogHeader>

        {open && step === 'branch' && (
          <BranchStep
            onCreated={code => {
              setSummary(s => ({ ...s, code }))
              setStep('user')
            }}
          />
        )}
        {open && step === 'user' && summary.code && (
          <UserStep
            code={summary.code}
            onCreated={email => {
              setSummary(s => ({ ...s, email }))
              setStep('number')
            }}
          />
        )}
        {open && step === 'number' && summary.code && (
          <NumberStep
            code={summary.code}
            onConnected={number => {
              setSummary(s => ({ ...s, number }))
              setStep('assistant')
            }}
            onLater={() => setStep('done')}
          />
        )}
        {open && step === 'assistant' && summary.number && (
          <AssistantStep numberId={summary.number.phoneNumberId} onNext={() => setStep('plan')} />
        )}
        {open && step === 'plan' && summary.number && (
          <PlanStep
            numberId={summary.number.phoneNumberId}
            onDone={plan => {
              setSummary(s => ({ ...s, plan }))
              setStep('done')
            }}
          />
        )}
        {open && step === 'done' && (
          <div className="flex flex-col gap-4">
            <ul className="flex flex-col gap-2 text-[13px]">
              <li className="flex items-center gap-2 text-ink">
                <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                Sucursal <span className="font-medium">
                  {summary.code?.holderName ?? summary.code?.code}
                </span> (código {summary.code?.code})
              </li>
              <li className="flex items-center gap-2 text-ink">
                <UserPlus className="size-4 text-emerald-600 dark:text-emerald-400" />
                Administrador <span className="font-medium">{summary.email}</span>
              </li>
              <li className="flex items-center gap-2 text-ink">
                <MessageSquare
                  className={`size-4 ${summary.number ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}
                />
                {summary.number ? 'Número de WhatsApp conectado' : 'Número de WhatsApp: pendiente (Números → Conectar)'}
              </li>
              <li className="flex items-center gap-2 text-ink">
                <CreditCard
                  className={`size-4 ${summary.plan ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}
                />
                {summary.plan
                  ? `Plan ${summary.plan.name} · ${usd(summary.plan.priceUsd)} por mes`
                  : 'Plan: el más chico del catálogo'}
              </li>
            </ul>
            <p className="text-[12.5px] text-muted-foreground">
              Todo se puede ajustar después desde Usuarios, Números y Facturación.
            </p>
            <div className="flex justify-end">
              <Button type="button" onClick={close}>
                Listo
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
