import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { RATING_SCALE } from "./constants"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getRatingLabel(rating: number): string {
  const scale = RATING_SCALE.find(s => s.value === rating)
  return scale?.label || 'Unknown'
}

export function getRatingColor(rating: number): string {
  switch (rating) {
    case 1:
      return 'bg-green-100 text-green-800 border-green-300'
    case 2:
      return 'bg-teal-100 text-teal-800 border-teal-300'
    case 3:
      return 'bg-blue-100 text-blue-800 border-blue-300'
    case 4:
      return 'bg-amber-100 text-amber-800 border-amber-300'
    case 5:
      return 'bg-red-100 text-red-800 border-red-300'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300'
  }
}

export function calculateOverallRating(mastery: number, objectives: number, behaviours: number): number {
  const average = (mastery + objectives + behaviours) / 3
  return Math.round(average)
}

export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatDateInput(date: Date | string): string {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
