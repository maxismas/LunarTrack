import { getRatingColor, getRatingLabel } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

interface RatingBadgeProps {
  rating: number
  size?: 'sm' | 'md' | 'lg'
}

export function RatingBadge({ rating, size = 'md' }: RatingBadgeProps) {
  const label = getRatingLabel(rating)
  const colorClass = getRatingColor(rating)

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  }

  return (
    <div className={`inline-flex items-center gap-2 ${sizeClasses[size]} rounded-full border ${colorClass}`}>
      <span className="font-semibold">{rating}</span>
      <span className="hidden sm:inline text-xs">{label}</span>
    </div>
  )
}
