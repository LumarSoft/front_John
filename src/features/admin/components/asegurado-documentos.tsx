'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Building2, CreditCard, Download, FileText, Shield } from 'lucide-react'
import { Button } from '@/src/components/ui/button'
import { Separator } from '@/src/components/ui/separator'
import type { AdminClientDetail, AdminPolizaDetail } from '@/src/types/api/clients'
import { formatCurrency, formatDate, polizaStatus, RISK_LABELS, RiskIcon } from '../lib/asegurados-ui'
import { PolizaStatusBadge } from './poliza-status-badge'

type DocFormat = 'credencial' | 'certificado'

// ─── Tarjeta credencial ─────────────────────────────────────────────────────────

function TarjetaCredencial({ poliza, client }: { poliza: AdminPolizaDetail; client: AdminClientDetail }) {
  const status = polizaStatus(poliza.vigenciaHasta)

  const statusPill =
    status.estado === 'vigente'
      ? 'bg-emerald-500/20 text-emerald-400'
      : status.estado === 'expiring'
        ? 'bg-amber/20 text-amber'
        : 'bg-destructive/20 text-red-400'

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-ink-2 via-[#1c1812] to-ink shadow-xl ring-1 ring-white/5">
      {/* Noise grain */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.06]"
        style={{
          backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`,
        }}
      />
      {/* Glow orbs */}
      <div aria-hidden className="absolute -right-16 -top-12 z-0 size-52 rounded-full bg-ember/8 blur-3xl" />
      <div aria-hidden className="absolute -bottom-20 -left-8 z-0 size-44 rounded-full bg-ember/5 blur-2xl" />
      {/* Gold top edge */}
      <div
        aria-hidden
        className="absolute left-0 right-0 top-0 z-10 h-[2px] bg-gradient-to-r from-transparent via-ember to-transparent opacity-70"
      />

      <div className="relative z-10 flex flex-col gap-5 p-6">
        {/* Top: company + JP logo */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-ember/25 bg-ember/10 text-ember">
              <Shield className="size-4" />
            </div>
            <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-on-dark-muted">
              {poliza.company.charAt(0).toUpperCase() + poliza.company.slice(1)} Seguros
            </span>
          </div>
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber to-ember-2 font-display text-[12px] font-bold text-[#1a1206] shadow-[0_4px_14px_-4px_rgba(232,168,32,0.65)]">
            JP
          </div>
        </div>

        {/* Client name */}
        <div>
          <div className="font-display text-[19px] font-bold uppercase leading-tight tracking-[0.02em] text-on-dark">
            {client.firstName} {client.lastName}
          </div>
          <div className="mt-1.5 text-[12px] text-on-dark-muted">DNI {client.dni}</div>
        </div>

        {/* Ramo + plate */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-ember">
            <RiskIcon type={poliza.riskType} className="size-4" />
            <span className="text-[11px] font-bold uppercase tracking-[0.14em]">{RISK_LABELS[poliza.riskType]}</span>
          </div>
          {poliza.vehiculo?.dominio && (
            <div className="rounded-lg border border-ember/30 bg-ember/10 px-3 py-1 font-mono text-[13px] font-bold tracking-widest text-ember">
              {poliza.vehiculo.dominio}
            </div>
          )}
        </div>

        {/* Footer: certificado / estado / vigencia */}
        <div className="space-y-3 border-t border-ember/15 pt-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <div className="text-[9px] font-semibold uppercase tracking-[0.16em] text-on-dark-muted/70">
                Certificado
              </div>
              <div className="mt-1 font-mono text-[13px] font-semibold text-on-dark">
                {poliza.certificado}
                {poliza.suplemento > 0 && (
                  <span className="ml-1.5 text-on-dark-muted">· Supl. {poliza.suplemento}</span>
                )}
              </div>
            </div>
            <div
              className={`inline-flex shrink-0 rounded-full px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-[0.1em] ${statusPill}`}
            >
              {status.label}
            </div>
          </div>
          <div>
            <div className="text-[9px] font-semibold uppercase tracking-[0.16em] text-on-dark-muted/70">Vigencia</div>
            <div className="mt-1 text-[12px] text-on-dark">
              {formatDate(poliza.vigenciaDesde)} — {formatDate(poliza.vigenciaHasta)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Certificado de cobertura ─────────────────────────────────────────────────────

function CertificadoCard({ poliza, client }: { poliza: AdminPolizaDetail; client: AdminClientDetail }) {
  const status = polizaStatus(poliza.vigenciaHasta)

  return (
    <div className="overflow-hidden rounded-2xl border border-line-2 bg-card shadow-sm">
      <div className="flex items-stretch">
        {/* Left accent bar */}
        <div className="w-1.5 shrink-0 bg-gradient-to-b from-ember via-amber/70 to-amber/20" />

        <div className="flex-1 px-5 py-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-amber-border bg-ember-soft text-ember-2">
                <RiskIcon type={poliza.riskType} className="size-4.5" />
              </div>
              <div>
                <div className="text-[9.5px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Certificado de Cobertura
                </div>
                <div className="text-[15.5px] font-semibold text-ink">{RISK_LABELS[poliza.riskType]}</div>
              </div>
            </div>
            <div className="shrink-0 text-right">
              <div className="font-mono text-[13px] font-bold text-ink">{poliza.certificado}</div>
              {poliza.suplemento > 0 && (
                <div className="text-[10.5px] text-muted-foreground">Suplemento {poliza.suplemento}</div>
              )}
              <div className="mt-1.5">
                <PolizaStatusBadge status={status} />
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Content grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            <section>
              <div className="mb-1.5 text-[9.5px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                Asegurado
              </div>
              <div className="text-[13.5px] font-semibold text-ink">
                {client.firstName} {client.lastName}
              </div>
              <div className="mt-0.5 text-[12px] text-ink-3">DNI {client.dni}</div>
              {client.city && <div className="text-[11.5px] text-muted-foreground">{client.city}</div>}
            </section>

            <section>
              <div className="mb-1.5 text-[9.5px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                Aseguradora
              </div>
              <div className="flex items-center gap-1.5">
                <Building2 className="size-3.5 shrink-0 text-muted-foreground" />
                <span className="text-[13.5px] font-semibold capitalize text-ink">{poliza.company}</span>
              </div>
              {poliza.paymentMethod && (
                <div className="mt-0.5 text-[11.5px] text-muted-foreground">{poliza.paymentMethod}</div>
              )}
            </section>

            {poliza.vehiculo && (
              <section>
                <div className="mb-1.5 text-[9.5px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  Objeto asegurado
                </div>
                <div className="text-[13.5px] font-semibold text-ink">
                  {[poliza.vehiculo.marca, poliza.vehiculo.modelo].filter(Boolean).join(' ') || '—'}
                  {poliza.vehiculo.anio ? ` (${poliza.vehiculo.anio})` : ''}
                </div>
                <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[11.5px] text-ink-3">
                  {poliza.vehiculo.dominio && <span>Dominio: {poliza.vehiculo.dominio}</span>}
                  {poliza.vehiculo.cobertura && <span>Cobertura {poliza.vehiculo.cobertura}</span>}
                  {poliza.vehiculo.tipo && <span>{poliza.vehiculo.tipo}</span>}
                </div>
                {poliza.vehiculo.sumaAsegurada && (
                  <div className="mt-0.5 text-[11.5px] text-muted-foreground">
                    Suma asegurada: {formatCurrency(poliza.vehiculo.sumaAsegurada)}
                  </div>
                )}
                {poliza.vehiculo.chasis && (
                  <div className="mt-0.5 text-[11px] text-muted-foreground">
                    Chasis: <span className="font-mono">{poliza.vehiculo.chasis}</span>
                  </div>
                )}
              </section>
            )}

            <section>
              <div className="mb-1.5 text-[9.5px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                Vigencia
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-[12px] text-ink-3">
                  <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Desde</span>
                  <span className="font-medium text-ink">{formatDate(poliza.vigenciaDesde)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[12px] text-ink-3">
                  <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Hasta</span>
                  <span className="font-medium text-ink">{formatDate(poliza.vigenciaHasta)}</span>
                </div>
              </div>
              {poliza.premio && (
                <div className="mt-2 inline-flex items-baseline gap-1">
                  <span className="text-[10.5px] text-muted-foreground">Premio</span>
                  <span className="font-display text-[16px] font-semibold text-ink">
                    {formatCurrency(poliza.premio)}
                  </span>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Documentos tab ───────────────────────────────────────────────────────────────

const FORMAT_OPTIONS: { value: DocFormat; label: string; icon: typeof CreditCard }[] = [
  { value: 'credencial', label: 'Credenciales', icon: CreditCard },
  { value: 'certificado', label: 'Certificados', icon: FileText },
]

// ─── Printing ───────────────────────────────────────────────────────────────────

// Renders a document into an isolated, print-only layer and opens the browser print
// dialog (where the user can save as PDF). Native print is used on purpose: Tailwind v4
// emits oklch colors that html-to-canvas libraries fail to rasterize.
function PrintFrame({ children, onDone }: { children: ReactNode; onDone: () => void }) {
  const onDoneRef = useRef(onDone)

  useEffect(() => {
    onDoneRef.current = onDone
  })

  useEffect(() => {
    const handleAfterPrint = () => onDoneRef.current()
    window.addEventListener('afterprint', handleAfterPrint)
    const timer = window.setTimeout(() => window.print(), 80)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('afterprint', handleAfterPrint)
    }
  }, [])

  return createPortal(<div className="print-area">{children}</div>, document.body)
}

function printableDoc(format: DocFormat, poliza: AdminPolizaDetail, client: AdminClientDetail): ReactNode {
  if (format === 'credencial') {
    return (
      <div className="mx-auto w-[420px] max-w-full">
        <TarjetaCredencial poliza={poliza} client={client} />
      </div>
    )
  }
  return (
    <div className="mx-auto w-[720px] max-w-full">
      <CertificadoCard poliza={poliza} client={client} />
    </div>
  )
}

export function AseguradoDocumentosTab({ client }: { client: AdminClientDetail }) {
  const [format, setFormat] = useState<DocFormat>('credencial')
  const [printDoc, setPrintDoc] = useState<ReactNode>(null)

  if (client.polizas.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
          <FileText className="size-5" />
        </div>
        <p className="text-[14px] text-muted-foreground">
          Este asegurado no tiene pólizas, por lo que no hay documentos para emitir.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4 pb-6">
      {/* Format switch — fixed equal-width segments, no reflow on change */}
      <div className="grid grid-cols-2 gap-1 rounded-lg border border-line-2 bg-secondary/50 p-1">
        {FORMAT_OPTIONS.map(option => {
          const active = format === option.value
          const Icon = option.icon
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setFormat(option.value)}
              className={`flex h-8 items-center justify-center gap-1.5 rounded-md text-[12.5px] font-medium transition-colors ${
                active ? 'bg-background text-ink shadow-sm' : 'text-muted-foreground hover:text-ink'
              }`}
            >
              <Icon className="size-3.5 shrink-0" />
              {option.label}
            </button>
          )
        })}
      </div>

      <div className={format === 'credencial' ? 'grid grid-cols-1 gap-5 sm:grid-cols-2' : 'space-y-5'}>
        {client.polizas.map(poliza => (
          <div key={poliza.id} className="space-y-2">
            {format === 'credencial' ? (
              <TarjetaCredencial poliza={poliza} client={client} />
            ) : (
              <CertificadoCard poliza={poliza} client={client} />
            )}
            <div className="flex justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setPrintDoc(printableDoc(format, poliza, client))}
                className="h-7 gap-1.5 px-2 text-[12px] text-ink-3 hover:bg-ember-soft hover:text-ember-2"
              >
                <Download className="size-3.5" />
                Descargar PDF
              </Button>
            </div>
          </div>
        ))}
      </div>

      {printDoc && <PrintFrame onDone={() => setPrintDoc(null)}>{printDoc}</PrintFrame>}
    </div>
  )
}
