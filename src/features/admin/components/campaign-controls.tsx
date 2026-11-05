import { Lock, Users } from 'lucide-react'
import { toast } from 'sonner'
import { ApiError } from '@/src/lib/api-client'
import type { Campaign } from '@/src/types/api/campaigns'
import { useCampaignSettingsActions } from '../hooks/use-campaigns'
import { campaignReview, REVIEW_CLASSES, REVIEW_LABELS } from '../lib/campaigns-format'
import { PanelSwitch } from './panel-switch'

const CHIP = 'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium'

/** The campaign's on/off switch, with what it says next to it. */
export function CampaignSwitch({ campaign }: { campaign: Campaign }) {
  const { update } = useCampaignSettingsActions()
  const locked = !campaign.plan.included
  const busy = update.isPending && update.variables?.kind === campaign.kind

  const flip = (enabled: boolean) =>
    update.mutate(
      { kind: campaign.kind, data: { enabled } },
      {
        onSuccess: () =>
          toast.success(enabled ? `${campaign.label}: prendida` : `${campaign.label}: apagada`, {
            description: enabled && !campaign.ready ? 'Se puede enviar cuando Meta apruebe el mensaje.' : undefined,
          }),
        onError: error =>
          toast.error(
            error instanceof ApiError && error.status < 500 ? error.message : 'No se pudo cambiar la campaña',
          ),
      },
    )

  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-line-2 bg-card px-3.5 py-2.5">
      <span className="text-[13px] font-medium text-ink">{campaign.enabled ? 'Prendida' : 'Apagada'}</span>
      <PanelSwitch
        on={campaign.enabled}
        label={`${campaign.enabled ? 'Apagar' : 'Prender'} ${campaign.label}`}
        disabled={locked && !campaign.enabled}
        busy={busy}
        onChange={flip}
      />
    </div>
  )
}

/** Where the campaign stands: its plan, how many clients it finds, its benefit and Meta's review. */
export function CampaignChips({ campaign }: { campaign: Campaign }) {
  if (!campaign.plan.included) {
    return (
      <div className="flex flex-wrap items-center gap-1.5">
        <span className={`${CHIP} border-line-2 bg-secondary text-muted-foreground`}>
          <Lock className="size-3" />
          {campaign.plan.byRole
            ? 'No habilitada para tu usuario'
            : campaign.plan.availableIn
              ? `Disponible en el plan ${campaign.plan.availableIn}`
              : 'No incluida en tu plan'}
        </span>
      </div>
    )
  }
  const review = campaignReview(campaign.templates)
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className={`${CHIP} border-line-2 bg-background text-ink-3`}>
        <Users className="size-3" />
        {campaign.candidates === 1 ? '1 cliente' : `${campaign.candidates.toLocaleString('es-AR')} clientes`}
      </span>
      <span className={`${CHIP} border-ember-ring bg-ember-soft text-ember-2`}>
        {campaign.discountPercent}% de beneficio
      </span>
      <span className={`${CHIP} ${REVIEW_CLASSES[review]}`}>{REVIEW_LABELS[review]}</span>
    </div>
  )
}
