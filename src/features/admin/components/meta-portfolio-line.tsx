import { BadgeCheck, Briefcase, ExternalLink } from 'lucide-react'
import type { MetaPortfolio } from '@/src/types/api/phone-numbers'

const VERIFICATION: Record<string, { label: string; tone: string }> = {
  verified: { label: 'verificado', tone: 'text-emerald-600 dark:text-emerald-400' },
  not_verified: { label: 'sin verificar', tone: 'text-amber-700 dark:text-amber' },
}

function verificationOf(status: string | null) {
  if (!status) return null
  if (VERIFICATION[status]) return VERIFICATION[status]
  if (status.startsWith('pending')) return { label: 'verificación en curso', tone: 'text-muted-foreground' }
  return { label: 'verificación rechazada', tone: 'text-destructive' }
}

/**
 * The Meta business portfolio that owns a number's WhatsApp account: whose it is (its name), its ID with a link to
 * Meta's business settings, and whether Meta verified it. Nothing until Meta was read.
 */
export function MetaPortfolioLine({ portfolio }: { portfolio?: MetaPortfolio | null }) {
  if (!portfolio?.businessId) return null
  const verification = verificationOf(portfolio.verification)
  const detail = [
    `Portfolio de Meta: ${portfolio.businessName ?? 'sin nombre'} (ID ${portfolio.businessId})`,
    portfolio.wabaName ? `Cuenta de WhatsApp: ${portfolio.wabaName}` : null,
  ]
    .filter(Boolean)
    .join(' · ')
  return (
    <div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11.5px] text-muted-foreground">
      <a
        href={`https://business.facebook.com/settings/info?business_id=${portfolio.businessId}`}
        target="_blank"
        rel="noreferrer"
        title={detail}
        className="inline-flex items-center gap-1 font-medium text-ink-3 hover:text-ink hover:underline"
      >
        <Briefcase className="size-3 shrink-0" />
        {portfolio.businessName ?? `Portfolio ${portfolio.businessId}`}
        <ExternalLink className="size-2.5" />
      </a>
      {verification && (
        <span className={`inline-flex items-center gap-0.5 ${verification.tone}`}>
          <BadgeCheck className="size-3" />
          {verification.label}
        </span>
      )}
    </div>
  )
}
