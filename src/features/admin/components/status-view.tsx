'use client'

import type { ReactNode } from 'react'
import { Activity, CircleCheck, Loader2, RefreshCw, TriangleAlert } from 'lucide-react'
import { Button } from '@/src/components/ui/button'
import { Card } from '@/src/components/ui/card'
import { Skeleton } from '@/src/components/ui/skeleton'
import { cn } from '@/src/lib/utils'
import type {
  IntegrationComponent,
  IntegrationIncident,
  IntegrationState,
  StatusOverview,
  TriunfoAccess,
  WhatsappNumberStatus,
} from '@/src/types/api/status'
import { useIntegrationStatus } from '../hooks/use-integration-status'
import { useProfile } from '../hooks/use-profile'
import {
  COMPONENT_COPY,
  diagnose,
  failingNames,
  failuresLabel,
  formatDuration,
  formatWhen,
  STATE_LABELS,
  tokenExpiresSoon,
  usesTriunfo,
  whatsappProblem,
} from '../lib/integration-status'

/**
 * How the services the panel and the bot depend on are answering: each of
 * Triunfo's web services, InfoAuto's catalogs and the WhatsApp numbers. When
 * one fails it says since when, what it answers and on whose side the problem
 * is, so the office can tell its clients it is not on our end.
 */
export function StatusView() {
  const { data: profile } = useProfile()
  const isOwner = profile?.role === 'OWNER'
  const { data, isLoading, isError, refetch, isFetching } = useIntegrationStatus()

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 font-display text-[22px] tracking-tight text-ink">
            <Activity className="size-5 text-ember-2" />
            Status
          </h1>
          <p className="mt-1 max-w-2xl text-[13px] text-muted-foreground">
            Cómo responden los servicios externos de los que dependen el panel y el bot. Cuando uno falla, acá se ve
            desde cuándo, qué responde y de qué lado está el problema.
          </p>
        </div>
        <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
          {isFetching ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
          Actualizar
        </Button>
      </header>

      {isLoading ? (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-16 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      ) : isError || !data ? (
        <p role="alert" className="rounded-xl border border-line-2 bg-card p-5 text-[13px] text-destructive">
          No se pudo cargar el estado de los servicios.
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          <Summary overview={data} />
          <TriunfoGroup overview={data} isOwner={isOwner} />
          <Group title="InfoAuto" description="El catálogo de vehículos con el que se cotiza.">
            {data.components
              .filter(c => c.key.startsWith('infoauto.'))
              .map(component => (
                <ComponentRow key={component.key} component={component} isOwner={isOwner} />
              ))}
          </Group>
          <Group title="WhatsApp" description="Los números conectados a Meta por los que atienden el bot y la oficina.">
            {data.whatsapp.length === 0 ? (
              <p className="p-4 text-[13px] text-muted-foreground">No hay números para mostrar.</p>
            ) : (
              data.whatsapp.map(number => <WhatsappRow key={number.id} number={number} isOwner={isOwner} />)
            )}
          </Group>
          <History incidents={data.incidents} />
          <p className="text-[12px] text-muted-foreground">
            Revisado {formatWhen(data.checkedAt)}. El estado sale de los pedidos reales del bot y del panel: un servicio
            que nadie usa se vuelve a mirar en el próximo pedido.
          </p>
        </div>
      )}
    </div>
  )
}

function Summary({ overview }: { overview: StatusOverview }) {
  const failing = failingNames(overview)
  if (failing.length === 0) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[13.5px] text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200">
        <CircleCheck className="size-5 shrink-0" />
        <span className="font-semibold">Todo funciona</span>
      </div>
    )
  }
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13.5px] text-red-900 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200"
    >
      <TriangleAlert className="mt-0.5 size-5 shrink-0" />
      <p>
        <span className="font-semibold">
          {failing.length === 1
            ? 'Hay un servicio que no funciona'
            : `Hay ${failing.length} servicios que no funcionan`}
        </span>
        : {failing.join(', ')}.
      </p>
    </div>
  )
}

function TriunfoGroup({ overview, isOwner }: { overview: StatusOverview; isOwner: boolean }) {
  const triunfo = usesTriunfo(overview)
  return (
    <Group title="Triunfo" description="La aseguradora: cotizaciones, documentación de pólizas y cartera.">
      {isOwner ? (
        <OrganizationsAccessRow failing={overview.triunfoAccess} />
      ) : (
        overview.triunfoAccess.map(access => <OwnAccessRow key={access.producerId} access={access} />)
      )}
      {triunfo &&
        overview.components
          .filter(c => c.key.startsWith('triunfo.'))
          .map(component => <ComponentRow key={component.key} component={component} isOwner={isOwner} />)}
    </Group>
  )
}

function Group({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <div>
        <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
        <p className="text-[12.5px] text-muted-foreground">{description}</p>
      </div>
      <Card className="gap-0 divide-y divide-line overflow-hidden p-0">{children}</Card>
    </section>
  )
}

function Row({
  name,
  description,
  state,
  stateLabel,
  meta,
  children,
}: {
  name: string
  description: string
  state: IntegrationState
  stateLabel?: string
  meta?: string
  children?: ReactNode
}) {
  return (
    <div className="p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-1 items-start gap-2.5">
          <span
            className={cn(
              'mt-1.5 size-2 shrink-0 rounded-full',
              state === 'operational' && 'bg-emerald-500 dark:bg-emerald-400',
              state === 'failing' && 'bg-red-500 dark:bg-red-400',
              state === 'unknown' && 'bg-faint',
            )}
          />
          <div className="min-w-0">
            <p className="text-[13.5px] font-medium text-ink">{name}</p>
            <p className="text-[12.5px] text-muted-foreground">{description}</p>
          </div>
        </div>
        <div className="flex max-w-[45%] shrink-0 flex-col items-end gap-1">
          <StatePill state={state} label={stateLabel} />
          {meta && <span className="text-right text-[11.5px] text-muted-foreground">{meta}</span>}
        </div>
      </div>
      {children}
    </div>
  )
}

function StatePill({ state, label }: { state: IntegrationState; label?: string }) {
  return (
    <span
      className={cn(
        'rounded-full px-2 py-0.5 text-[11.5px] font-medium whitespace-nowrap',
        state === 'operational' && 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
        state === 'failing' && 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300',
        state === 'unknown' && 'bg-muted text-muted-foreground',
      )}
    >
      {label ?? STATE_LABELS[state]}
    </span>
  )
}

function ComponentRow({ component, isOwner }: { component: IntegrationComponent; isOwner: boolean }) {
  const copy = COMPONENT_COPY[component.key]
  const meta =
    component.status === 'unknown'
      ? 'Todavía no se usó'
      : component.lastSuccessAt
        ? `Último uso correcto: ${formatWhen(component.lastSuccessAt)}`
        : undefined
  return (
    <Row name={copy.name} description={copy.usedFor} state={component.status} meta={meta}>
      {component.incident && (
        <IncidentDetail incident={component.incident} isOwner={isOwner} lastSuccessAt={component.lastSuccessAt} />
      )}
    </Row>
  )
}

function IncidentDetail({
  incident,
  isOwner,
  lastSuccessAt,
}: {
  incident: IntegrationIncident
  isOwner: boolean
  lastSuccessAt: string | null
}) {
  const copy = COMPONENT_COPY[incident.key]
  const diagnosis = diagnose(copy.provider, incident)
  return (
    <ProblemBox title={diagnosis.title} detail={diagnosis.detail}>
      {incident.answer && (
        <p className="mt-2">
          <span className="font-medium">Qué responde {copy.provider}:</span> «{incident.answer}»
        </p>
      )}
      <dl className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-2">
        <Fact label="Desde">
          {formatWhen(incident.startedAt)} ({formatDuration(incident.startedAt, null)}) ·{' '}
          {failuresLabel(incident.failures)}, el último {formatWhen(incident.lastFailureAt)}
        </Fact>
        <Fact label="Origen del problema">{diagnosis.origin}</Fact>
        <Fact label="Qué afecta">{copy.impact}</Fact>
        <Fact label="Para que vuelva a andar">{diagnosis.resolution}</Fact>
      </dl>
      <details className="mt-3 text-[12px]">
        <summary className="cursor-pointer select-none opacity-80">Detalle técnico</summary>
        <p className="mt-1 break-words">
          {incident.message}
          {lastSuccessAt ? ` · funcionó por última vez ${formatWhen(lastSuccessAt)}` : ''}
        </p>
        {isOwner && incident.sample && (
          <pre className="mt-1 max-h-48 overflow-auto rounded-md bg-card p-2 font-mono text-[11px] break-all whitespace-pre-wrap text-ink">
            {incident.sample}
          </pre>
        )}
      </details>
    </ProblemBox>
  )
}

function ProblemBox({ title, detail, children }: { title: string; detail: string; children?: ReactNode }) {
  return (
    <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-[13px] text-red-900 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200">
      <p className="font-semibold">{title}</p>
      <p className="mt-1">{detail}</p>
      {children}
    </div>
  )
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-[11.5px] font-medium tracking-wide uppercase opacity-75">{label}</dt>
      <dd>{children}</dd>
    </div>
  )
}

function OwnAccessRow({ access }: { access: TriunfoAccess }) {
  if (!access.configured) {
    return (
      <Row
        name="Usuario de TriunfoNet"
        description={`${access.producerName} no tiene Triunfo conectado, así que sus servicios no se usan.`}
        state="unknown"
        stateLabel="No conectado"
      />
    )
  }
  return (
    <Row
      name="Usuario de TriunfoNet"
      description={`El usuario y la contraseña de ${access.producerName} en Triunfo.`}
      state={access.failingSince ? 'failing' : 'operational'}
      stateLabel={access.failingSince ? 'Rechazado' : undefined}
    >
      {access.failingSince && (
        <ProblemBox
          title="Triunfo rechaza el usuario y la contraseña"
          detail={`Desde ${formatWhen(access.failingSince)}${
            access.failureMessage ? ` Triunfo responde «${access.failureMessage}»` : ''
          }. Mientras tanto no se puede cotizar ni pedir documentación, y la cartera no se actualiza.`}
        >
          <p className="mt-2">Si cambiaron la contraseña de TriunfoNet, avisá a soporte para cargar la nueva.</p>
        </ProblemBox>
      )}
    </Row>
  )
}

function OrganizationsAccessRow({ failing }: { failing: TriunfoAccess[] }) {
  return (
    <Row
      name="Usuarios de TriunfoNet"
      description={
        failing.length === 0
          ? 'Triunfo acepta el usuario de todas las organizaciones.'
          : 'Triunfo rechaza el usuario de estas organizaciones.'
      }
      state={failing.length === 0 ? 'operational' : 'failing'}
    >
      {failing.length > 0 && (
        <ul className="mt-3 flex flex-col gap-1.5 rounded-lg border border-red-200 bg-red-50 p-3 text-[13px] text-red-900 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200">
          {failing.map(access => (
            <li key={access.producerId}>
              <span className="font-medium">{access.producerName}</span>: rechazado desde{' '}
              {formatWhen(access.failingSince as string)}
              {access.failureMessage ? ` («${access.failureMessage}»)` : ''}
            </li>
          ))}
        </ul>
      )}
    </Row>
  )
}

function WhatsappRow({ number, isOwner }: { number: WhatsappNumberStatus; isOwner: boolean }) {
  const problem = whatsappProblem(number)
  return (
    <Row
      name={number.number}
      description={isOwner ? number.producerName : 'Número de WhatsApp conectado a Meta.'}
      state={number.status}
      stateLabel={number.status === 'failing' ? 'Desconectado' : undefined}
      meta={
        tokenExpiresSoon(number) && number.tokenExpiresAt
          ? `El permiso de Meta vence ${formatWhen(number.tokenExpiresAt)}`
          : undefined
      }
    >
      {problem && (
        <ProblemBox title={problem.title} detail={problem.detail}>
          <p className="mt-2">{problem.resolution}</p>
        </ProblemBox>
      )}
    </Row>
  )
}

function History({ incidents }: { incidents: IntegrationIncident[] }) {
  return (
    <section className="flex flex-col gap-2">
      <div>
        <h2 className="text-[15px] font-semibold text-ink">Historial</h2>
        <p className="text-[12.5px] text-muted-foreground">Las fallas de los últimos 30 días.</p>
      </div>
      <Card className="gap-0 overflow-hidden p-0">
        {incidents.length === 0 ? (
          <p className="p-4 text-[13px] text-muted-foreground">Ningún servicio falló en los últimos 30 días.</p>
        ) : (
          <ul className="divide-y divide-line">
            {incidents.map(incident => {
              const copy = COMPONENT_COPY[incident.key]
              return (
                <li key={incident.id} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 p-4">
                  <div className="min-w-0">
                    <p className="text-[13.5px] text-ink">
                      <span className="font-medium">{copy.name}</span>
                      <span className="text-muted-foreground"> · {copy.provider}</span>
                    </p>
                    <p className="text-[12.5px] text-muted-foreground">
                      {diagnose(copy.provider, incident).title}
                      {incident.httpStatus ? ` (error ${incident.httpStatus})` : ''} ·{' '}
                      {failuresLabel(incident.failures)}
                    </p>
                  </div>
                  <p className="text-[12px] text-muted-foreground tabular-nums">
                    {formatWhen(incident.startedAt)} →{' '}
                    {incident.endedAt ? (
                      formatWhen(incident.endedAt)
                    ) : (
                      <span className="font-medium text-red-700 dark:text-red-300">sigue</span>
                    )}{' '}
                    ({formatDuration(incident.startedAt, incident.endedAt)})
                  </p>
                </li>
              )
            })}
          </ul>
        )}
      </Card>
    </section>
  )
}
