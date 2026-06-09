'use client'

import { useState, type ReactNode } from 'react'
import {
  AlertTriangle,
  ArrowRight,
  Ban,
  Calendar,
  CheckCircle2,
  CreditCard,
  FileText,
  Mail,
  MapPin,
  Phone,
  Shield,
  User,
  XCircle,
  type LucideIcon,
} from 'lucide-react'
import { Avatar, AvatarFallback } from '@/src/components/ui/avatar'
import { Badge } from '@/src/components/ui/badge'
import { WhatsAppIcon } from '@/src/components/ui/brand-icons'
import { Button } from '@/src/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/src/components/ui/dialog'
import { Skeleton } from '@/src/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/src/components/ui/tooltip'
import type { AdminCuota, AdminPolizaDetail } from '@/src/types/api/clients'
import { useAdminClient } from '../hooks/use-admin-client'
import { formatCurrency, formatDate, initials, polizaStatus, RISK_LABELS, RiskIcon } from '../lib/asegurados-ui'
import { AseguradoDocumentosTab } from './asegurado-documentos'
import { PolizaStatusBadge } from './poliza-status-badge'

type SheetTab = 'polizas' | 'pagos' | 'documentos'

interface AseguradoSheetProps {
  clientId: number | null
  onClose: () => void
}

function whatsappLink(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  return `https://wa.me/${digits}`
}

interface ContactButtonProps {
  label: string
  href: string
  accent?: boolean
  external?: boolean
  children: ReactNode
}

function ContactButton({ label, href, accent, external, children }: ContactButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          asChild
          size="icon"
          variant="outline"
          className={`size-10 rounded-full transition-colors ${
            accent
              ? 'border-ember-ring text-ember-2 hover:border-ember-2/50 hover:bg-ember-soft'
              : 'border-line-2 text-ink-3 hover:border-ember-ring hover:bg-ember-soft hover:text-ember-2'
          }`}
        >
          <a href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
            {children}
            <span className="sr-only">{label}</span>
          </a>
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

function PolizaCard({ poliza }: { poliza: AdminPolizaDetail }) {
  const status = polizaStatus(poliza.vigenciaHasta)
  const paidCount = poliza.cuotas.filter(c => c.status === 'paid').length
  const overdueCount = poliza.cuotas.filter(c => c.status === 'overdue').length
  const nextCuota = poliza.cuotas.find(c => c.status === 'pending' || c.status === 'overdue')

  return (
    <div className="overflow-hidden rounded-xl border border-line-2 bg-card">
      <div className="flex items-start justify-between gap-3 p-4 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-amber-border bg-ember-soft text-ember-2">
            <RiskIcon type={poliza.riskType} className="size-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold text-ink">{RISK_LABELS[poliza.riskType]}</span>
              <span className="text-[11px] text-muted-foreground">#{poliza.certificado}</span>
            </div>
            <div className="text-[11px] capitalize text-muted-foreground">{poliza.company}</div>
          </div>
        </div>
        <PolizaStatusBadge status={status} />
      </div>

      {poliza.vehiculo && (
        <div className="mx-4 mb-3 flex items-start justify-between gap-3 rounded-lg bg-secondary/50 px-3.5 py-3">
          <div className="min-w-0">
            <div className="text-[13.5px] font-medium text-ink">
              {[poliza.vehiculo.marca, poliza.vehiculo.modelo].filter(Boolean).join(' ') || 'Vehículo'}
              {poliza.vehiculo.anio ? ` (${poliza.vehiculo.anio})` : ''}
            </div>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-[11.5px] text-muted-foreground">
              {poliza.vehiculo.cobertura && <span>Cobertura {poliza.vehiculo.cobertura}</span>}
              {poliza.vehiculo.sumaAsegurada && (
                <span>Suma asegurada {formatCurrency(poliza.vehiculo.sumaAsegurada)}</span>
              )}
            </div>
          </div>
          {poliza.vehiculo.dominio && (
            <span className="shrink-0 rounded-md border border-line-strong/40 bg-ink px-2.5 py-1 font-mono text-[12px] font-bold tracking-widest text-on-dark">
              {poliza.vehiculo.dominio}
            </span>
          )}
        </div>
      )}

      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 px-4">
        <div className="col-span-2 min-w-0">
          <dt className="text-[10.5px] uppercase tracking-[0.1em] text-muted-foreground">Vigencia</dt>
          <dd className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[12.5px] text-ink-3">
            <span>{formatDate(poliza.vigenciaDesde)}</span>
            <ArrowRight className="size-3 shrink-0 text-muted-foreground" />
            <span>{formatDate(poliza.vigenciaHasta)}</span>
          </dd>
        </div>
        {poliza.premio && (
          <div className="min-w-0">
            <dt className="text-[10.5px] uppercase tracking-[0.1em] text-muted-foreground">Premio</dt>
            <dd className="mt-0.5 text-[12.5px] font-medium text-ink">{formatCurrency(poliza.premio)}</dd>
          </div>
        )}
        {poliza.paymentMethod && (
          <div className="min-w-0">
            <dt className="text-[10.5px] uppercase tracking-[0.1em] text-muted-foreground">Forma de pago</dt>
            <dd className="mt-0.5 break-words text-[12.5px] text-ink-3">{poliza.paymentMethod}</dd>
          </div>
        )}
      </dl>

      {poliza.cuotas.length > 0 && (
        <div className="mt-3 border-t border-line-2 bg-secondary/30 px-4 py-3">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-[10.5px] uppercase tracking-[0.1em] text-muted-foreground">Cuotas</div>
            <span className="text-[11.5px] font-medium text-ink-3">
              {paidCount}/{poliza.cuotas.length} pagas
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {poliza.cuotas.map(c => (
              <div
                key={c.id}
                className="flex items-center gap-1 rounded-md border border-line-2 bg-background px-2 py-1"
              >
                {c.status === 'paid' && <CheckCircle2 className="size-3.5 text-emerald-500" />}
                {c.status === 'overdue' && <XCircle className="size-3.5 text-destructive" />}
                {c.status === 'rejected' && <Ban className="size-3.5 text-destructive" />}
                {c.status === 'pending' && <Calendar className="size-3.5 text-muted-foreground" />}
                <span className="text-[11px] text-ink-3">#{c.numeroCuota}</span>
                {c.dueDate && <span className="text-[10.5px] text-muted-foreground">{formatDate(c.dueDate)}</span>}
              </div>
            ))}
          </div>
          {overdueCount > 0 ? (
            <div className="mt-2 flex items-center gap-1 text-[11.5px] font-medium text-destructive">
              <XCircle className="size-3.5" />
              {overdueCount} {overdueCount === 1 ? 'cuota vencida' : 'cuotas vencidas'}
            </div>
          ) : nextCuota ? (
            <div className="mt-2 text-[11.5px] text-muted-foreground">
              Próxima cuota: <span className="font-medium text-ink">{formatCurrency(nextCuota.amount)}</span>
              {nextCuota.dueDate ? ` — ${formatDate(nextCuota.dueDate)}` : ''}
            </div>
          ) : (
            <div className="mt-2 flex items-center gap-1 text-[11.5px] text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-3.5" />
              Todas las cuotas pagadas
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function cuotaStatusIcon(status: AdminCuota['status']) {
  if (status === 'paid') return <CheckCircle2 className="size-4 text-emerald-500" />
  if (status === 'overdue') return <XCircle className="size-4 text-destructive" />
  if (status === 'rejected') return <Ban className="size-4 text-destructive" />
  return <Calendar className="size-4 text-muted-foreground" />
}

function cuotaStatusLabel(status: AdminCuota['status']): string {
  if (status === 'paid') return 'Pagada'
  if (status === 'overdue') return 'Vencida'
  if (status === 'rejected') return 'Rechazada'
  return 'Pendiente'
}

function cuotaRowClass(status: AdminCuota['status']): string {
  if (status === 'overdue' || status === 'rejected') return 'border-l-destructive/50 bg-destructive/5'
  if (status === 'paid') return 'border-l-emerald-300/50 bg-emerald-50/30 dark:bg-emerald-950/10'
  return 'border-l-line-2 bg-transparent'
}

function PolizaPagosCard({ poliza }: { poliza: AdminPolizaDetail }) {
  const allCuotas = poliza.cuotas
  const overdueCount = allCuotas.filter(c => c.status === 'overdue').length
  const rejectedCount = allCuotas.filter(c => c.status === 'rejected').length
  const paidCount = allCuotas.filter(c => c.status === 'paid').length
  const totalDeuda = allCuotas.filter(c => c.status !== 'paid').reduce((s, c) => s + parseFloat(c.amount), 0)

  if (allCuotas.length === 0) return null

  return (
    <div className="overflow-hidden rounded-xl border border-line-2">
      <div className="flex items-center gap-2.5 border-b border-line-2 bg-secondary/40 px-4 py-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-amber-border bg-ember-soft text-ember-2">
          <RiskIcon type={poliza.riskType} className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[13px] font-semibold text-ink">{RISK_LABELS[poliza.riskType]}</span>
            <span className="text-[11px] text-muted-foreground">#{poliza.certificado}</span>
          </div>
          {poliza.vehiculo?.dominio && (
            <span className="font-mono text-[11px] text-muted-foreground">{poliza.vehiculo.dominio}</span>
          )}
        </div>
        <div className="text-right">
          <div className="text-[11px] text-muted-foreground">
            {paidCount}/{allCuotas.length} pagas
          </div>
          {totalDeuda > 0 && (
            <div className="text-[12px] font-semibold text-destructive">{formatCurrency(totalDeuda.toFixed(2))}</div>
          )}
        </div>
      </div>

      <div className="divide-y divide-line-2/60">
        {allCuotas.map(cuota => (
          <div
            key={cuota.id}
            className={`flex items-center gap-3 border-l-2 px-4 py-2.5 ${cuotaRowClass(cuota.status)}`}
          >
            {cuotaStatusIcon(cuota.status)}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[12.5px] font-medium text-ink">Cuota #{cuota.numeroCuota}</span>
                <span className="text-[11px] text-muted-foreground">{cuotaStatusLabel(cuota.status)}</span>
              </div>
              {cuota.dueDate && (
                <div className="text-[11px] text-muted-foreground">Vto. {formatDate(cuota.dueDate)}</div>
              )}
            </div>
            <div className="text-[13px] font-semibold text-ink">{formatCurrency(cuota.amount)}</div>
          </div>
        ))}
      </div>

      {(overdueCount > 0 || rejectedCount > 0) && (
        <div className="flex flex-wrap gap-2 border-t border-line-2 bg-secondary/20 px-4 py-2.5">
          {overdueCount > 0 && (
            <div className="flex items-center gap-1 text-[11.5px] font-medium text-destructive">
              <AlertTriangle className="size-3.5" />
              {overdueCount} {overdueCount === 1 ? 'vencida' : 'vencidas'}
            </div>
          )}
          {rejectedCount > 0 && (
            <div className="flex items-center gap-1 text-[11.5px] font-medium text-destructive">
              <Ban className="size-3.5" />
              {rejectedCount} {rejectedCount === 1 ? 'rechazada' : 'rechazadas'}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function PagosTab({ polizas }: { polizas: AdminPolizaDetail[] }) {
  const allCuotas = polizas.flatMap(p => p.cuotas)
  const totalDeuda = allCuotas.filter(c => c.status !== 'paid').reduce((s, c) => s + parseFloat(c.amount), 0)
  const overdueCount = allCuotas.filter(c => c.status === 'overdue').length
  const rejectedCount = allCuotas.filter(c => c.status === 'rejected').length
  const pendingCount = allCuotas.filter(c => c.status === 'pending').length
  const paidCount = allCuotas.filter(c => c.status === 'paid').length
  const polizasConCuotas = polizas.filter(p => p.cuotas.length > 0)

  return (
    <div className="space-y-4 pb-6">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          { label: 'Pagas', value: paidCount, cls: 'border-line-2 bg-card text-ink' },
          {
            label: 'Pendientes',
            value: pendingCount,
            cls:
              pendingCount > 0
                ? 'border-amber/30 bg-amber/5 text-amber-700 dark:text-amber'
                : 'border-line-2 bg-card text-ink',
          },
          {
            label: 'Vencidas',
            value: overdueCount,
            cls:
              overdueCount > 0
                ? 'border-destructive/25 bg-destructive/5 text-destructive'
                : 'border-line-2 bg-card text-ink',
          },
          {
            label: 'Rechazadas',
            value: rejectedCount,
            cls:
              rejectedCount > 0
                ? 'border-destructive/25 bg-destructive/5 text-destructive'
                : 'border-line-2 bg-card text-ink',
          },
        ].map(item => (
          <div key={item.label} className={`rounded-lg border p-3 text-center ${item.cls}`}>
            <div className="font-display text-[20px] font-semibold leading-none">{item.value}</div>
            <div className="mt-1 text-[11px] text-muted-foreground">{item.label}</div>
          </div>
        ))}
      </div>

      {totalDeuda > 0 ? (
        <div className="flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3">
          <CreditCard className="size-5 shrink-0 text-destructive" />
          <div>
            <div className="text-[10.5px] uppercase tracking-[0.1em] text-muted-foreground">Deuda total pendiente</div>
            <div className="text-[18px] font-semibold text-destructive">{formatCurrency(totalDeuda.toFixed(2))}</div>
          </div>
        </div>
      ) : allCuotas.length > 0 ? (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/60 px-4 py-3 dark:border-emerald-900/40 dark:bg-emerald-950/20">
          <CheckCircle2 className="size-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <div className="text-[13px] font-medium text-emerald-700 dark:text-emerald-400">Todas las cuotas al día</div>
        </div>
      ) : null}

      {polizasConCuotas.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
            <CreditCard className="size-5" />
          </div>
          <p className="text-[14px] text-muted-foreground">No hay cuotas registradas para este asegurado.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {polizasConCuotas.map(p => (
            <PolizaPagosCard key={p.id} poliza={p} />
          ))}
        </div>
      )}
    </div>
  )
}

function InfoCell({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-card text-muted-foreground ring-1 ring-line-2">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-faint">{label}</div>
        <div className="truncate text-[13.5px] text-ink-3" title={value}>
          {value}
        </div>
      </div>
    </div>
  )
}

export function AseguradoSheet({ clientId, onClose }: AseguradoSheetProps) {
  const { data: client, isLoading } = useAdminClient(clientId)
  const [tab, setTab] = useState<SheetTab>('polizas')
  const vigentesCount = client?.polizas.filter(p => p.vigenciaHasta && new Date(p.vigenciaHasta) >= new Date()).length

  return (
    <Dialog
      open={clientId !== null}
      onOpenChange={open => {
        if (!open) {
          setTab('polizas')
          onClose()
        }
      }}
    >
      <DialogContent
        aria-describedby={undefined}
        className="flex max-h-[88vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl"
      >
        {isLoading ? (
          <div className="flex flex-col gap-5 p-6">
            <div className="flex items-center gap-4">
              <Skeleton className="size-16 rounded-full" />
              <div className="space-y-2">
                <DialogTitle className="sr-only">Cargando asegurado</DialogTitle>
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-28" />
              </div>
            </div>
            <Skeleton className="h-px w-full" />
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-xl" />
            ))}
          </div>
        ) : client ? (
          <>
            {/* ── Header (fixed) ──────────────────────────────────────────── */}
            <div className="border-b border-line-2 px-6 pb-5 pt-6">
              <div className="flex items-start justify-between gap-4 pr-8">
                <div className="flex min-w-0 items-center gap-4">
                  <Avatar className="size-16 shrink-0">
                    <AvatarFallback className="bg-ember-soft text-2xl font-semibold text-ember-2">
                      {initials(client.firstName, client.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <DialogTitle className="font-display text-[22px] leading-tight tracking-tight text-ink">
                      {client.firstName} {client.lastName}
                    </DialogTitle>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <span className="text-[13px] text-muted-foreground">DNI {client.dni}</span>
                      {vigentesCount !== undefined && vigentesCount > 0 && (
                        <Badge
                          variant="secondary"
                          className="h-5 bg-emerald-50 px-2 text-[11px] text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                        >
                          {vigentesCount} {vigentesCount === 1 ? 'vigente' : 'vigentes'}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <TooltipProvider delayDuration={150}>
                  <div className="flex shrink-0 items-center gap-2">
                    {client.phone && (
                      <ContactButton label="WhatsApp" href={whatsappLink(client.phone)} accent external>
                        <WhatsAppIcon className="size-[18px]" />
                      </ContactButton>
                    )}
                    {client.phone && (
                      <ContactButton label="Llamar" href={`tel:${client.phone}`}>
                        <Phone className="size-4" />
                      </ContactButton>
                    )}
                    <ContactButton label="Enviar email" href={`mailto:${client.email}`}>
                      <Mail className="size-4" />
                    </ContactButton>
                  </div>
                </TooltipProvider>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-x-8 gap-y-3.5 rounded-xl border border-line-2 bg-secondary/30 px-5 py-4 sm:grid-cols-2">
                <InfoCell icon={Mail} label="Email" value={client.email} />
                <InfoCell icon={Phone} label="Teléfono" value={client.phone ?? '—'} />
                <InfoCell icon={MapPin} label="Ciudad" value={client.city ?? '—'} />
                <InfoCell icon={User} label="Cliente desde" value={formatDate(client.createdAt)} />
              </div>
            </div>

            {/* ── Tabs + scrollable body ──────────────────────────────────── */}
            <Tabs value={tab} onValueChange={v => setTab(v as SheetTab)} className="flex min-h-0 flex-1 flex-col">
              <TabsList className="mx-6 mt-4 grid h-9 shrink-0 grid-cols-3 rounded-lg border border-line-2 bg-secondary/50 p-0.5">
                <TabsTrigger
                  value="polizas"
                  className="h-8 gap-1.5 rounded-md text-[12.5px] data-[state=active]:bg-background data-[state=active]:text-ink data-[state=active]:shadow-sm"
                >
                  <Shield className="size-3.5 shrink-0" />
                  Pólizas
                </TabsTrigger>
                <TabsTrigger
                  value="pagos"
                  className="h-8 gap-1.5 rounded-md text-[12.5px] data-[state=active]:bg-background data-[state=active]:text-ink data-[state=active]:shadow-sm"
                >
                  <CreditCard className="size-3.5 shrink-0" />
                  Pagos
                </TabsTrigger>
                <TabsTrigger
                  value="documentos"
                  className="h-8 gap-1.5 rounded-md text-[12.5px] data-[state=active]:bg-background data-[state=active]:text-ink data-[state=active]:shadow-sm"
                >
                  <FileText className="size-3.5 shrink-0" />
                  Documentos
                </TabsTrigger>
              </TabsList>

              <div className="min-h-0 flex-1 overflow-y-auto">
                <TabsContent value="polizas" className="mt-0 px-6 pt-5">
                  {client.polizas.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 py-10 text-center">
                      <div className="flex size-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                        <Shield className="size-5" />
                      </div>
                      <p className="text-[14px] text-muted-foreground">Este asegurado no tiene pólizas registradas.</p>
                    </div>
                  ) : (
                    <div className="space-y-3 pb-6">
                      {client.polizas.map(p => (
                        <PolizaCard key={p.id} poliza={p} />
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="pagos" className="mt-0 px-6 pt-5">
                  <PagosTab polizas={client.polizas} />
                </TabsContent>

                <TabsContent value="documentos" className="mt-0 px-6 pt-5">
                  <AseguradoDocumentosTab client={client} />
                </TabsContent>
              </div>
            </Tabs>
          </>
        ) : (
          <div className="flex h-40 items-center justify-center">
            <DialogTitle className="sr-only">Detalle de asegurado</DialogTitle>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
