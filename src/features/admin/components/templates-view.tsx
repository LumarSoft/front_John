'use client'

import { AlertTriangle, Loader2, RefreshCw } from 'lucide-react'
import { Button } from '@/src/components/ui/button'
import { Card } from '@/src/components/ui/card'
import { Skeleton } from '@/src/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/components/ui/table'
import type { TemplateRow, TemplatesAccount, TemplatesNumber } from '@/src/types/api/templates'
import { useOwnerTemplates } from '../hooks/use-owner-templates'
import { useRole } from '../hooks/use-role'
import { categoryLabel, messagingLimitLabel, needsAttention, qualityOf, templateStatus } from '../lib/templates-format'
import { HEAD } from './billing-ui'

const CHIP = 'inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap'

function NumberLine({ number }: { number: TemplatesNumber }) {
  const quality = qualityOf(number.quality)
  const limit = messagingLimitLabel(number.messagingLimit)
  return (
    <li className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[12.5px]">
      <span className="font-medium text-ink">
        {number.number}
        {number.branchName ? ` · ${number.branchName}` : ''}
      </span>
      <span className="inline-flex items-center gap-1 text-muted-foreground">
        <span className={`size-2 rounded-full ${quality.dot}`} aria-hidden />
        {quality.label}
      </span>
      {limit && <span className="text-muted-foreground">· {limit}</span>}
    </li>
  )
}

function TemplateLine({ template }: { template: TemplateRow }) {
  const status = templateStatus(template.status)
  const use = template.use ?? 'No la usa la plataforma'
  return (
    <TableRow className={template.inUse ? '' : 'opacity-70'}>
      <TableCell className="min-w-[180px] whitespace-normal pl-5">
        <div className="break-all font-mono text-[12.5px] text-ink">{template.name}</div>
        <div className="text-[11.5px] text-muted-foreground">{template.language}</div>
        <div className="mt-0.5 text-[12px] text-muted-foreground md:hidden">{use}</div>
      </TableCell>
      <TableCell
        className={`hidden whitespace-normal text-[13px] md:table-cell ${template.use ? 'text-ink-3' : 'text-muted-foreground'}`}
      >
        {use}
      </TableCell>
      <TableCell className="hidden text-[13px] text-ink-3 lg:table-cell">{categoryLabel(template.category)}</TableCell>
      <TableCell className="whitespace-normal pr-5">
        <span className={`${CHIP} ${status.classes}`}>{status.label}</span>
        {template.reason && <div className="mt-1 text-[12px] text-red-700 dark:text-red-400">{template.reason}</div>}
        {template.status === 'MISSING' && (
          <div className="mt-1 text-[12px] text-muted-foreground">
            {template.managed
              ? 'Se crea sola en la próxima hora. Hasta que Meta la apruebe, los números de esta cuenta no pueden enviarla.'
              : 'Los números de esta cuenta no pueden enviarla.'}
          </div>
        )}
        {template.inUse && template.use?.endsWith('(texto anterior)') && (
          <div className="mt-1 text-[12px] text-muted-foreground">
            Se sigue mandando hasta que Meta apruebe el texto nuevo.
          </div>
        )}
      </TableCell>
    </TableRow>
  )
}

function AccountCard({ account }: { account: TemplatesAccount }) {
  const pending = needsAttention(account)
  return (
    <Card className="gap-0 overflow-hidden border-line-2 py-0 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line-2 px-5 py-4">
        <div className="min-w-0">
          <div className="text-[15px] font-semibold text-ink">{account.wabaName ?? 'Cuenta sin nombre'}</div>
          <ul className="mt-1.5 space-y-1">
            {account.numbers.map(number => (
              <NumberLine key={number.number} number={number} />
            ))}
          </ul>
        </div>
        {pending > 0 && (
          <span
            className={`${CHIP} border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400`}
          >
            {pending === 1 ? '1 plantilla necesaria sin aprobar' : `${pending} plantillas necesarias sin aprobar`}
          </span>
        )}
      </div>
      {account.error ? (
        <p className="flex items-start gap-2 px-5 py-4 text-[13px] text-amber-800 dark:text-amber-300">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          {account.error}
        </p>
      ) : account.templates.length === 0 ? (
        <p className="px-5 py-4 text-[13px] text-muted-foreground">Esta cuenta no tiene plantillas en Meta.</p>
      ) : (
        <Table className="table-fixed">
          <TableHeader>
            <TableRow className="border-line-2 hover:bg-transparent">
              <TableHead className={`h-10 pl-5 md:w-[36%] lg:w-[32%] ${HEAD}`}>Plantilla</TableHead>
              <TableHead className={`hidden md:table-cell md:w-[34%] lg:w-[30%] ${HEAD}`}>Uso</TableHead>
              <TableHead className={`hidden lg:table-cell lg:w-[12%] ${HEAD}`}>Categoría</TableHead>
              <TableHead className={`pr-5 ${HEAD}`}>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {account.templates.map(template => (
              <TemplateLine key={`${template.name}:${template.language}`} template={template} />
            ))}
          </TableBody>
        </Table>
      )}
    </Card>
  )
}

/** "Plantillas": the owner's view of every organization's Meta templates, account by account. */
export function TemplatesView() {
  const { isOwner, isLoading: roleLoading } = useRole()
  const { data, isLoading, isError, isFetching, refetch } = useOwnerTemplates(isOwner)

  if (!roleLoading && !isOwner) {
    return (
      <div className="mx-auto w-full max-w-6xl px-5 py-8 md:px-8 md:py-10">
        <p className="text-[14px] text-muted-foreground">Acceso restringido.</p>
      </div>
    )
  }

  const checkedAt = data
    ? new Date(data.checkedAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
    : null

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 md:px-8 md:py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <div className="text-[10.5px] font-medium uppercase tracking-[0.3em] text-ember-2">Plataforma</div>
          <h1 className="mt-2 font-display text-[clamp(26px,3.5vw,36px)] tracking-[-0.035em] text-ink">Plantillas</h1>
          <p className="mt-1.5 text-[14px] text-muted-foreground">
            Las plantillas de Meta de cada cuenta de WhatsApp: si están aprobadas, para qué las usa la plataforma y
            cuáles le faltan. Cada plantilla vive en una sola cuenta, y un número solo puede enviar las de la suya. Los
            avisos y los textos de las campañas se crean solos en cada cuenta, al conectar un número y una vez por hora;
            Meta revisa cada copia. Cuando cambia el texto de un aviso, mientras Meta revisa el nuevo se sigue mandando
            el anterior.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {checkedAt && <span className="text-[12px] text-muted-foreground">Consultado a las {checkedAt}</span>}
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-9 text-[12.5px]"
          >
            {isFetching ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
            Consultar a Meta
          </Button>
        </div>
      </div>

      {isError && <p className="text-[14px] text-destructive">No se pudieron consultar las plantillas.</p>}
      {(roleLoading || isLoading) && <Skeleton className="h-[320px] rounded-xl" />}
      {data && data.organizations.length === 0 && (
        <p className="text-[14px] text-muted-foreground">Ninguna organización tiene un número de WhatsApp conectado.</p>
      )}

      <div className="space-y-10">
        {data?.organizations.map(org => (
          <section key={org.id}>
            <h2 className="mb-3 font-display text-[20px] tracking-[-0.02em] text-ink">{org.name}</h2>
            <div className="space-y-4">
              {org.accounts.map(account => (
                <AccountCard key={account.id} account={account} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
