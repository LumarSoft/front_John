import Image from 'next/image'

interface BrandMarkProps {
  size?: number
  className?: string
  priority?: boolean
}

export function BrandMark({ size = 36, className = '', priority = false }: BrandMarkProps) {
  return (
    <Image
      src="/logo.jpg"
      alt="John Pellegrini"
      width={size}
      height={size}
      priority={priority}
      className={`shrink-0 object-cover ${className}`}
    />
  )
}
