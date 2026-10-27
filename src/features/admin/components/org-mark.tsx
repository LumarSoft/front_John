import { ShieldCheck } from 'lucide-react'
import { BrandMark } from '@/src/components/brand-mark'
import type { PanelBrand } from '../lib/org-brand'

interface OrgMarkProps {
  brand: PanelBrand
  size?: number
  className?: string
}

/** JPMG's logo, or a mark of the organization's initials (or the platform's shield). */
export function OrgMark({ brand, size = 36, className = '' }: OrgMarkProps) {
  if (brand.mark === 'logo') return <BrandMark size={size} className={className} />
  return (
    <div
      aria-label={brand.name}
      role="img"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.38) }}
      className={`flex shrink-0 items-center justify-center bg-ink font-display text-ember ${className}`}
    >
      {brand.mark === 'initials' ? brand.initials : <ShieldCheck style={{ width: size * 0.55, height: size * 0.55 }} />}
    </div>
  )
}
