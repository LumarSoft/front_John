import Image from 'next/image'
import { BrandMark } from '@/src/components/brand-mark'
import { apiAssetUrl } from '@/src/lib/api-client'
import type { PanelBrand } from '../lib/org-brand'

interface OrgMarkProps {
  brand: PanelBrand
  size?: number
  className?: string
}

/** The site's mark (JPMG's logo), the organization's logo, or a tile with its initials. */
export function OrgMark({ brand, size = 36, className = '' }: OrgMarkProps) {
  if (brand.mark === 'platform') return <BrandMark size={size} className={className} />
  if (brand.logoUrl) {
    return (
      <Image
        src={apiAssetUrl(brand.logoUrl)}
        alt={brand.name}
        width={size}
        height={size}
        unoptimized
        className={`shrink-0 bg-paper object-contain ${className}`}
      />
    )
  }
  return (
    <span
      role="img"
      aria-label={brand.name}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.38) }}
      className={`flex shrink-0 items-center justify-center bg-ember font-display text-on-ember ${className}`}
    >
      {brand.initials}
    </span>
  )
}
