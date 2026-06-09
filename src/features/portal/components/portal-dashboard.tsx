'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Car, Bike, Home, Heart, Briefcase, Shield, AlertCircle, Loader2, MapPin, User } from 'lucide-react'
import { fetchPolizas, type PolizaListItem, type RiskType, type BienCobertura } from '@/src/services/polizas.service'

// ─── Helpers ────────────────────────────────────────────

const RISK_ICONS: Record<RiskType, React.ElementType> = {
  auto: Car,
  moto: Bike,
  home: Home,
  life: Heart,
  commercial: Briefcase,
  other: Shield,
}

const RISK_LABELS: Record<RiskType, string> = {
  auto: 'Automotor',
  moto: 'Moto',
  home: 'Hogar',
  life: 'Vida / Sepelio',
  commercial: 'Comercio',
  other: 'Otro',
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatCurrency(raw: string | null): string {
  if (!raw) return '—'
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(parseFloat(raw))
}

function isVigente(status: string) {
  return status.toUpperCase().includes('VIGENTE')
}

// Coverage / description keywords that mark a policy as covering a *person*
// (sepelio, vida, accidentes personales, salud) rather than a physical good.
const PERSON_POLICY_RE = /SEPELIO|VIDA|ACCIDENTE|SALUD/i

// A "bien" is a physical insured object (vehicle, property, etc.). Policies that
// insure a person — life/sepelio — belong in "Mis pólizas" only, never in bienes.
// These can arrive classified as `life` OR mislabeled as `other`, so we also detect
// them by their shape: an insured person identified by DNI, or a person-type coverage.
function isBien(poliza: PolizaListItem): boolean {
  if (poliza.riskType === 'life') return false
  // Vehicles and properties are always physical goods.
  if (poliza.vehiculo) return true
  const descripcion = poliza.bien?.descripcion ?? ''
  // Person policies describe the insured as "APELLIDO NOMBRE - DNI: XXXXXXXX".
  if (/\bDNI:/i.test(descripcion)) return false
  if (PERSON_POLICY_RE.test(descripcion)) return false
  const coberturas = poliza.bien?.coberturas ?? []
  if (coberturas.some(c => PERSON_POLICY_RE.test(c.riesgo))) return false
  return true
}

// ─── Coverage chips for non-vehicle policies ─────────────

function BienCoberturas({ coberturas }: { coberturas: BienCobertura[] }) {
  const unique = coberturas.filter((c, i, arr) => arr.findIndex(x => x.riesgo === c.riesgo) === i)
  if (!unique.length) return null
  return (
    <div className="mx-5 mt-4 flex flex-wrap gap-2">
      {unique.slice(0, 3).map((c, i) => (
        <span key={i} className="rounded-lg bg-canvas-2 px-3 py-1.5 text-[11px] font-semibold text-ink">
          {c.riesgo}
        </span>
      ))}
    </div>
  )
}

// ─── Asset Card — focused on the physical object ────────

function isMotoTipo(tipo: string | null | undefined): boolean {
  if (!tipo) return false
  const t = tipo.toUpperCase()
  return t.includes('MOTO') || t === 'MOTOCICLETA'
}

function AssetCard({ poliza }: { poliza: PolizaListItem }) {
  // Derive effective type from vehicle data — riskType in DB may be stale
  const effectiveRiskType: RiskType = poliza.vehiculo && isMotoTipo(poliza.vehiculo.tipo) ? 'moto' : poliza.riskType
  const Icon = RISK_ICONS[effectiveRiskType]
  const v = poliza.vehiculo
  const b = poliza.bien
  const vigente = isVigente(poliza.status)

  // vehiculo presence is the source of truth — riskType in DB may be stale from before resolveRiskType fix
  if (v) {
    const vehicleName = [v.marca, v.modelo].filter(Boolean).join(' ') || `Póliza ${poliza.certificado}`
    return (
      <Link
        href={`/portal/polizas/${poliza.id}`}
        className="group flex flex-col rounded-2xl border border-line-2 bg-paper shadow-[0_2px_12px_-4px_rgba(15,13,10,0.07)] transition-shadow hover:shadow-[0_4px_20px_-4px_rgba(15,13,10,0.13)] overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-canvas-2">
            <Icon className="h-5 w-5 text-ink-3" />
          </div>
          <span
            className={[
              'inline-flex items-center rounded-full px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wider',
              vigente
                ? 'bg-ember-soft text-ember-2 border border-ember-ring'
                : 'bg-canvas-2 text-faint border border-line-2',
            ].join(' ')}
          >
            {poliza.status}
          </span>
        </div>
        <div className="px-5">
          {v.subModelo ? (
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              {v.subModelo}
            </p>
          ) : null}
          <h3 className="mt-0.5 font-display text-[18px] font-bold tracking-[-0.025em] text-ink leading-tight">
            {vehicleName}
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
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Cobertura</p>
              <p className="mt-0.5 font-display text-[15px] font-bold text-ink">{v.cobertura}</p>
            </div>
          ) : null}
          {v.sumaAsegurada ? (
            <div className="rounded-lg bg-canvas-2 px-3 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                Suma asegurada
              </p>
              <p className="mt-0.5 font-display text-[13px] font-bold text-ink">{formatCurrency(v.sumaAsegurada)}</p>
            </div>
          ) : null}
        </div>
        <div className="mt-6 border-t border-line px-5 py-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10.5px] font-medium uppercase tracking-[0.09em] text-muted-foreground">
                Vigente hasta
              </p>
              <p className="mt-0.5 text-[13px] font-semibold text-ink">{formatDate(poliza.vigenciaHasta)}</p>
            </div>
            <span className="text-[12px] font-medium text-ember-2 group-hover:underline">Ver cobertura →</span>
          </div>
        </div>
      </Link>
    )
  }

  // ── Non-vehicle card (life, home, commercial, other) ────
  const riskLabel = RISK_LABELS[effectiveRiskType]
  const isAddress = poliza.riskType === 'home' || poliza.riskType === 'commercial'
  const isPerson = poliza.riskType === 'life'
  const DescIcon = isAddress ? MapPin : isPerson ? User : Shield
  const descText = b?.descripcion ?? `Póliza ${poliza.certificado}`
  // For life: descripcion = "APELLIDO NOMBRE - DNI: XXXXX" — extract just the name
  const cleanDesc = isPerson ? descText.split(' - DNI:')[0].trim() : descText

  return (
    <Link
      href={`/portal/polizas/${poliza.id}`}
      className="group flex flex-col rounded-2xl border border-line-2 bg-paper shadow-[0_2px_12px_-4px_rgba(15,13,10,0.07)] transition-shadow hover:shadow-[0_4px_20px_-4px_rgba(15,13,10,0.13)] overflow-hidden"
    >
      <div className="flex items-center justify-between px-5 pt-5 pb-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-canvas-2">
          <Icon className="h-5 w-5 text-ink-3" />
        </div>
        <span
          className={[
            'inline-flex items-center rounded-full px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wider',
            vigente
              ? 'bg-ember-soft text-ember-2 border border-ember-ring'
              : 'bg-canvas-2 text-faint border border-line-2',
          ].join(' ')}
        >
          {poliza.status}
        </span>
      </div>
      <div className="px-5">
        <p className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{riskLabel}</p>
        <h3 className="mt-0.5 font-display text-[17px] font-bold tracking-[-0.02em] text-ink leading-tight">
          {cleanDesc}
        </h3>
      </div>
      {b?.descripcion ? (
        <div className="mx-5 mt-3 flex items-start gap-2">
          <DescIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <p className="text-[12px] text-muted-foreground leading-snug">{b.descripcion}</p>
        </div>
      ) : null}
      {b?.coberturas?.length ? <BienCoberturas coberturas={b.coberturas} /> : null}
      <div className="mt-auto mt-4 border-t border-line px-5 py-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10.5px] font-medium uppercase tracking-[0.09em] text-muted-foreground">Vigente hasta</p>
            <p className="mt-0.5 text-[13px] font-semibold text-ink">{formatDate(poliza.vigenciaHasta)}</p>
          </div>
          <span className="text-[12px] font-medium text-ember-2 group-hover:underline">Ver cobertura →</span>
        </div>
      </div>
    </Link>
  )
}

// ─── Dashboard ──────────────────────────────────────────

export function PortalDashboard() {
  const [polizas, setPolizas] = useState<PolizaListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPolizas()
      .then(setPolizas)
      .catch(e => setError(e instanceof Error ? e.message : 'Error al cargar'))
      .finally(() => setLoading(false))
  }, [])

  const bienes = polizas.filter(isBien)

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <AlertCircle className="h-8 w-8 text-muted-foreground/50" />
        <p className="text-[14px] text-muted-foreground">{error}</p>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="font-display text-[22px] font-semibold tracking-[-0.025em] text-ink">Mis bienes asegurados</h1>
        <p className="mt-1 text-[13.5px] text-muted-foreground">
          {bienes.length === 0
            ? 'No tenés bienes asegurados'
            : `${bienes.length} ${bienes.length === 1 ? 'bien asegurado' : 'bienes asegurados'}`}
        </p>
      </div>

      {bienes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line-2 p-12 text-center">
          <Shield className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
          <p className="text-[14px] text-muted-foreground">Todavía no tenés bienes asegurados registrados.</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {bienes.map(p => (
            <AssetCard key={p.id} poliza={p} />
          ))}
        </div>
      )}
    </div>
  )
}
