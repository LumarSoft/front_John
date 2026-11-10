'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Card } from '@/src/components/ui/card'
import { Skeleton } from '@/src/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/components/ui/table'
import { ApiError } from '@/src/lib/api-client'
import type { CatalogPlan, FeatureRoleName, PlanFeatureInfo } from '@/src/types/api/billing'
import { useFeatureRoles, useOwnerPlans, usePlanActions, useUpdateFeatureRoles } from '../hooks/use-billing'
import { useRole } from '../hooks/use-role'
import { HEAD } from './billing-ui'
import { PanelSwitch } from './panel-switch'

/** The roles a function can be turned off for, next to the plans. */
const ROLE_COLUMNS: Array<{ role: FeatureRoleName; label: string }> = [
  { role: 'ADMIN', label: 'Administradores' },
  { role: 'SUPERADMIN', label: 'SuperAdmins' },
]

function failed(error: unknown) {
  toast.error(error instanceof ApiError && error.status < 500 ? error.message : 'No se pudo cambiar la función')
}

/** What each plan includes besides its messages: the owner turns each function on or off per plan and per role. */
function PlanFeaturesTable({ features, plans }: { features: PlanFeatureInfo[]; plans: CatalogPlan[] }) {
  const { updatePlan } = usePlanActions()
  const { data: rolesData } = useFeatureRoles()
  const updateRoles = useUpdateFeatureRoles()
  const [pending, setPending] = useState<string | null>(null)

  const flipRole = (feature: PlanFeatureInfo, role: FeatureRoleName, on: boolean) => {
    setPending(`${role}:${feature.key}`)
    updateRoles.mutate(
      { key: feature.key, data: { [role]: on } },
      {
        onSuccess: () =>
          toast.success(
            `${feature.label}: ${on ? 'habilitada' : 'deshabilitada'} para ${role === 'ADMIN' ? 'administradores' : 'SuperAdmins'}`,
          ),
        onError: failed,
        onSettled: () => setPending(null),
      },
    )
  }

  const flip = (plan: CatalogPlan, feature: PlanFeatureInfo, on: boolean) => {
    setPending(`${plan.id}:${feature.key}`)
    updatePlan.mutate(
      { id: plan.id, data: { features: { [feature.key]: on } } },
      {
        onSuccess: () =>
          toast.success(
            on
              ? `${feature.label}: ahora en el plan ${plan.name}`
              : `${feature.label}: ya no está en el plan ${plan.name}`,
          ),
        onError: failed,
        onSettled: () => setPending(null),
      },
    )
  }

  return (
    <Card className="overflow-hidden border-line-2 py-0 shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="border-line-2 hover:bg-transparent">
            <TableHead className={`h-11 pl-5 ${HEAD}`}>Función</TableHead>
            {plans.map(plan => (
              <TableHead key={plan.id} className={`text-center ${HEAD} ${plan.isActive ? '' : 'opacity-60'}`}>
                {plan.name}
              </TableHead>
            ))}
            {ROLE_COLUMNS.map((column, index) => (
              <TableHead
                key={column.role}
                className={`text-center ${HEAD} ${index === 0 ? 'border-l border-line-2' : ''} ${index === ROLE_COLUMNS.length - 1 ? 'pr-5' : ''}`}
              >
                {column.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {features.map(feature => (
            <TableRow key={feature.key}>
              <TableCell className="min-w-[220px] whitespace-normal pl-5">
                <div className="text-[14px] font-medium text-ink">{feature.label}</div>
                <div className="text-[12px] text-muted-foreground">{feature.description}</div>
              </TableCell>
              {plans.map(plan => {
                const on = plan.features?.[feature.key] ?? true
                return (
                  <TableCell key={plan.id} className={`text-center ${plan.isActive ? '' : 'opacity-60'}`}>
                    <PanelSwitch
                      on={on}
                      label={`${feature.label} en el plan ${plan.name}`}
                      busy={pending === `${plan.id}:${feature.key}`}
                      onChange={value => flip(plan, feature, value)}
                    />
                  </TableCell>
                )
              })}
              {ROLE_COLUMNS.map((column, index) => (
                <TableCell
                  key={column.role}
                  className={`text-center ${index === 0 ? 'border-l border-line-2' : ''} ${index === ROLE_COLUMNS.length - 1 ? 'pr-5' : ''}`}
                >
                  <PanelSwitch
                    on={rolesData?.roles[feature.key]?.[column.role] ?? true}
                    label={`${feature.label} para ${column.label}`}
                    busy={pending === `${column.role}:${feature.key}` || !rolesData}
                    onChange={value => flipRole(feature, column.role, value)}
                  />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}

/** "Funciones por plan": the owner's switches of what each plan, and each role, can use. */
export function PlanFeaturesView() {
  const { isOwner, isLoading: roleLoading } = useRole()
  const { data, isLoading, isError } = useOwnerPlans(isOwner)
  const plans = data?.plans ?? []
  const features = data?.features ?? []

  if (!roleLoading && !isOwner) {
    return (
      <div className="mx-auto w-full max-w-6xl px-5 py-8 md:px-8 md:py-10">
        <p className="text-[14px] text-muted-foreground">Acceso restringido.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 md:px-8 md:py-10">
      <div className="mb-6">
        <div className="text-[10.5px] font-medium uppercase tracking-[0.3em] text-ember-2">Plataforma</div>
        <h1 className="mt-2 font-display text-[clamp(26px,3.5vw,36px)] tracking-[-0.035em] text-ink">
          Funciones por plan
        </h1>
        <p className="mt-1.5 max-w-2xl text-[14px] text-muted-foreground">
          Qué incluye cada plan además de los mensajes. Una organización puede usar una función si el plan de alguno de
          sus números la incluye; si no, el panel la muestra bloqueada y dice desde qué plan está. Las columnas de roles
          la apagan para todos los administradores o SuperAdmins, aunque su plan la incluya. Una función nueva arranca
          apagada en todos los planes.
        </p>
      </div>

      {isError && <p className="text-[14px] text-destructive">No se pudieron cargar los planes.</p>}
      {(roleLoading || isLoading) && <Skeleton className="h-[320px] rounded-xl" />}
      {!isLoading && !isError && plans.length === 0 && (
        <p className="text-[14px] text-muted-foreground">Todavía no hay planes. Se crean en Facturación → Planes.</p>
      )}
      {features.length > 0 && plans.length > 0 && <PlanFeaturesTable features={features} plans={plans} />}
    </div>
  )
}
