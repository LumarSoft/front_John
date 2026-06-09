'use client'

import type { ReactNode } from 'react'
import { Calendar, CheckCircle2, Mail, MapPin, Phone, Shield, User, XCircle } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/src/components/ui/avatar'
import { Badge } from '@/src/components/ui/badge'
import { WhatsAppIcon } from '@/src/components/ui/brand-icons'
import { Button } from '@/src/components/ui/button'
import { Separator } from '@/src/components/ui/separator'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/src/components/ui/sheet'
import { Skeleton } from '@/src/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/src/components/ui/tooltip'
import type { AdminCuota, AdminPolizaDetail } from '@/src/types/api/clients'
import { useAdminClient } from '../hooks/use-admin-client'
import { formatCurrency, formatDate, initials, polizaStatus, RISK_LABELS, RiskIcon } from '../lib/asegurados-ui'
import { PolizaStatusBadge } from './poliza-status-badge'

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

function cuotaStatusIcon(status: AdminCuota['status']) {
  if (status === 'paid') return <CheckCircle2 className="size-3.5 text-emerald-500" />
  if (status === 'overdue') return <XCircle className="size-3.5 text-destructive" />
  return <Calendar className="size-3.5 text-muted-foreground" />
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
        <div className="mx-4 mb-3 rounded-lg bg-secondary/50 px-3 py-2">
          <div className="text-[13px] font-medium text-ink">
            {[poliza.vehiculo.marca, poliza.vehiculo.modelo].filter(Boolean).join(' ') || 'Vehículo'}
            {poliza.vehiculo.anio ? ` (${poliza.vehiculo.anio})` : ''}
          </div>
          <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5">
            {poliza.vehiculo.dominio && (
              <span className="text-[11px] text-muted-foreground">Dominio: {poliza.vehiculo.dominio}</span>
            )}
            {poliza.vehiculo.cobertura && (
              <span className="text-[11px] text-muted-foreground">Cobertura {poliza.vehiculo.cobertura}</span>
            )}
            {poliza.vehiculo.sumaAsegurada && (
              <span className="text-[11px] text-muted-foreground">
                Suma asegurada: {formatCurrency(poliza.vehiculo.sumaAsegurada)}
              </span>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 px-4">
        <div>
          <div className="text-[10.5px] uppercase tracking-[0.1em] text-muted-foreground">Vigencia</div>
          <div className="text-[12.5px] text-ink-3">
            {formatDate(poliza.vigenciaDesde)} → {formatDate(poliza.vigenciaHasta)}
          </div>
        </div>
        {poliza.premio && (
          <div>
            <div className="text-[10.5px] uppercase tracking-[0.1em] text-muted-foreground">Premio</div>
            <div className="text-[12.5px] font-medium text-ink">{formatCurrency(poliza.premio)}</div>
          </div>
        )}
        {poliza.paymentMethod && (
          <div className="col-span-2">
            <div className="text-[10.5px] uppercase tracking-[0.1em] text-muted-foreground">Forma de pago</div>
            <div className="text-[12.5px] text-ink-3">{poliza.paymentMethod}</div>
          </div>
        )}
      </div>

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
                {cuotaStatusIcon(c.status)}
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

export function AseguradoSheet({ clientId, onClose }: AseguradoSheetProps) {
  const { data: client, isLoading } = useAdminClient(clientId)
  const vigentesCount = client?.polizas.filter(p => p.vigenciaHasta && new Date(p.vigenciaHasta) >= new Date()).length

  return (
    <Sheet open={clientId !== null} onOpenChange={open => !open && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-[540px]" side="right">
        <SheetHeader className="px-6 pb-0 pt-6">
          {isLoading ? (
            <div className="flex items-center gap-3">
              <Skeleton className="size-14 rounded-full" />
              <div className="space-y-2">
                <SheetTitle className="sr-only">Cargando asegurado</SheetTitle>
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          ) : client ? (
            <>
              <div className="flex items-center gap-4">
                <Avatar className="size-14">
                  <AvatarFallback className="bg-ember-soft text-xl font-semibold text-ember-2">
                    {initials(client.firstName, client.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <SheetTitle className="font-display text-[22px] tracking-tight text-ink">
                    {client.firstName} {client.lastName}
                  </SheetTitle>
                  <p className="text-[13px] text-muted-foreground">DNI {client.dni}</p>
                </div>
              </div>

              <div className="mt-4">
                <div className="mb-2 text-[10px] font-medium uppercase tracking-[0.2em] text-faint">Contacto</div>
                <TooltipProvider delayDuration={150}>
                  <div className="flex items-center gap-2">
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

              <div className="mt-4 grid grid-cols-1 gap-1.5">
                <div className="flex items-center gap-2 text-[13px] text-ink-3">
                  <Mail className="size-3.5 shrink-0 text-muted-foreground" />
                  {client.email}
                </div>
                {client.phone && (
                  <div className="flex items-center gap-2 text-[13px] text-ink-3">
                    <Phone className="size-3.5 shrink-0 text-muted-foreground" />
                    {client.phone}
                  </div>
                )}
                {client.city && (
                  <div className="flex items-center gap-2 text-[13px] text-ink-3">
                    <MapPin className="size-3.5 shrink-0 text-muted-foreground" />
                    {client.city}
                  </div>
                )}
                <div className="flex items-center gap-2 text-[13px] text-ink-3">
                  <User className="size-3.5 shrink-0 text-muted-foreground" />
                  Cliente desde {formatDate(client.createdAt)}
                </div>
              </div>
            </>
          ) : (
            <SheetTitle className="sr-only">Detalle de asegurado</SheetTitle>
          )}
        </SheetHeader>

        {isLoading && (
          <div className="space-y-3 px-6 pt-5">
            <Skeleton className="h-px w-full" />
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))}
          </div>
        )}

        {client && (
          <>
            <Separator className="my-5" />

            <div className="space-y-1.5 px-6">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-[10.5px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  Pólizas
                </div>
                <div className="flex items-center gap-1.5">
                  {vigentesCount !== undefined && vigentesCount > 0 && (
                    <Badge
                      variant="secondary"
                      className="bg-emerald-50 text-[11px] text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                    >
                      {vigentesCount} {vigentesCount === 1 ? 'vigente' : 'vigentes'}
                    </Badge>
                  )}
                  <Badge variant="secondary" className="text-[11px]">
                    {client.polizas.length} {client.polizas.length === 1 ? 'póliza' : 'pólizas'}
                  </Badge>
                </div>
              </div>

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
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
