'use client'

import Link from 'next/link'
import { MapPin, User } from 'lucide-react'
import type { PolizaListItem } from '@/src/services/polizas.service'
import { effectiveRiskType, formatCurrency, formatDate, isVigente, RISK_ICONS, RISK_LABELS } from '../lib/portal-ui'

export function BienCard({ poliza }: { poliza: PolizaListItem }) {
  const ramo = effectiveRiskType(poliza)
  const Icon = RISK_ICONS[ramo]
  const v = poliza.vehiculo
  const b = poliza.bien
  const vigente = isVigente(poliza.status)

  return (
    <Link
      href={`/portal/polizas/${poliza.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line-2 bg-paper shadow-[0_2px_12px_-4px_rgba(15,13,10,0.07)] transition-shadow hover:shadow-[0_4px_20px_-4px_rgba(15,13,10,0.13)]"
    >
      <div className="flex items-center justify-between px-5 pb-4 pt-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-canvas-2">
          <Icon className="h-5 w-5 text-ink-3" />
        </div>
        <span
          className={[
            'inline-flex items-center rounded-full px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wider',
            vigente
              ? 'border border-ember-ring bg-ember-soft text-ember-2'
              : 'border border-line-2 bg-canvas-2 text-faint',
          ].join(' ')}
        >
          {poliza.status}
        </span>
      </div>

      {v ? (
        <>
          <div className="px-5">
            {v.subModelo ? (
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-faint">{v.subModelo}</p>
            ) : null}
            <h3 className="mt-0.5 font-display text-[18px] font-bold leading-tight tracking-[-0.025em] text-ink">
              {[v.marca, v.modelo].filter(Boolean).join(' ') || `Póliza ${poliza.certificado}`}
            </h3>
            {v.anio ? <p className="mt-0.5 text-[13px] text-faint">{v.anio}</p> : null}
          </div>
          {v.dominio ? (
            <div className="mx-5 mt-4 flex items-center justify-center rounded-xl border-2 border-line-2 bg-canvas py-3">
              <span className="font-display text-[22px] font-black tracking-[0.25em] text-ink">{v.dominio}</span>
            </div>
          ) : null}
          <div className="mx-5 mt-4 grid grid-cols-2 gap-3">
            {v.cobertura ? (
              <div className="rounded-lg bg-canvas-2 px-3 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-faint">Cobertura</p>
                <p className="mt-0.5 font-display text-[15px] font-bold text-ink">{v.cobertura}</p>
              </div>
            ) : null}
            {v.sumaAsegurada ? (
              <div className="rounded-lg bg-canvas-2 px-3 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-faint">Suma asegurada</p>
                <p className="mt-0.5 font-display text-[13px] font-bold text-ink">{formatCurrency(v.sumaAsegurada)}</p>
              </div>
            ) : null}
          </div>
        </>
      ) : (
        <div className="px-5">
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-faint">{RISK_LABELS[ramo]}</p>
          <h3 className="mt-0.5 font-display text-[17px] font-bold leading-tight tracking-[-0.02em] text-ink">
            {b?.descripcion?.split(' - DNI:')[0].trim() ?? `Póliza ${poliza.certificado}`}
          </h3>
          {b?.descripcion ? (
            <div className="mt-3 flex items-start gap-2">
              {ramo === 'home' || ramo === 'commercial' ? (
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-faint" />
              ) : (
                <User className="mt-0.5 h-3.5 w-3.5 shrink-0 text-faint" />
              )}
              <p className="text-[12px] leading-snug text-faint">{b.descripcion}</p>
            </div>
          ) : null}
        </div>
      )}

      <div className="mt-auto border-t border-line px-5 py-3 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10.5px] font-medium uppercase tracking-[0.09em] text-faint">Vigente hasta</p>
            <p className="mt-0.5 text-[13px] font-semibold text-ink">{formatDate(poliza.vigenciaHasta)}</p>
          </div>
          <span className="text-[12px] font-medium text-ember-2 group-hover:underline">Ver cobertura →</span>
        </div>
      </div>
    </Link>
  )
}
