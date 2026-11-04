import { Lock, Users } from 'lucide-react'
import { toast } from 'sonner'
import { ApiError } from '@/src/lib/api-client'
import type { Campaign } from '@/src/types/api/campaigns'
import { useCampaignSettingsActions } from '../hooks/use-campaigns'
import { campaignReview, REVIEW_CLASSES, REVIEW_LABELS } from '../lib/campaigns-format'
import { PanelSwitch } from './panel-switch'

const CHIP = 'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium'

/** One campaign in the list: what it looks for, on or off, and where its message stands with Meta. */
export function CampaignCard({
  campaign,
  selected,
  onSelect,
}: {
  campaign: Campaign
  selected: boolean
  onSelect: () => void
}) {
  const { update } = useCampaignSettingsActions()
  const review = campaignReview(campaign.templates)
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
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect()
        }
      }}
      aria-pressed={selected}
      className={`flex cursor-pointer flex-col gap-3 rounded-xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember-ring ${
        selected ? 'border-ember bg-ember-soft/40' : 'border-line-2 bg-card hover:bg-secondary/40'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[14.5px] font-semibold text-ink">{campaign.label}</div>
          <p className="mt-0.5 text-[12.5px] leading-snug text-muted-foreground">{campaign.description}</p>
        </div>
        <div onClick={e => e.stopPropagation()} onKeyDown={e => e.stopPropagation()} role="presentation">
          <PanelSwitch
            on={campaign.enabled}
            label={`${campaign.enabled ? 'Apagar' : 'Prender'} ${campaign.label}`}
            disabled={locked && !campaign.enabled}
            busy={busy}
            onChange={flip}
          />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        {locked ? (
          <span className={`${CHIP} border-line-2 bg-secondary text-muted-foreground`}>
            <Lock className="size-3" />
            {campaign.plan.availableIn
              ? `Disponible en el plan ${campaign.plan.availableIn}`
              : 'No incluida en tu plan'}
          </span>
        ) : (
          <>
            <span className={`${CHIP} border-line-2 bg-background text-ink-3`}>
              <Users className="size-3" />
              {campaign.candidates === 1 ? '1 cliente' : `${campaign.candidates.toLocaleString('es-AR')} clientes`}
            </span>
            <span className={`${CHIP} border-ember-ring bg-ember-soft text-ember-2`}>
              {campaign.discountPercent}% de beneficio
            </span>
            <span className={`${CHIP} ${REVIEW_CLASSES[review]}`}>{REVIEW_LABELS[review]}</span>
          </>
        )}
      </div>
    </div>
  )
}
