import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}

// Progress Indicator Types and Utils (GOATY-style)
export type ProgressIndicator = {
  value: number | null
  previousValue: number | null
  change: number
  direction: 'up' | 'down' | 'neutral'
  isImprovement: boolean
  isPersonalBest: boolean
}

export function calculateProgress(
  current: number | null, 
  previous: number | null,
  personalBest: number | null = null
): ProgressIndicator {
  if (current === null) {
    return {
      value: current,
      previousValue: previous,
      change: 0,
      direction: 'neutral',
      isImprovement: false,
      isPersonalBest: false
    }
  }

  const change = previous !== null ? current - previous : 0
  const direction = change > 0 ? 'up' : change < 0 ? 'down' : 'neutral'
  const isImprovement = change > 0
  const isPersonalBest = personalBest !== null && current >= personalBest

  return {
    value: current,
    previousValue: previous,
    change,
    direction,
    isImprovement,
    isPersonalBest
  }
}

export function formatProgressChange(change: number): string {
  if (change === 0) return '—'
  const sign = change > 0 ? '+' : ''
  return `${sign}${change}`
}

export function getProgressIcon(direction: 'up' | 'down' | 'neutral'): string {
  if (direction === 'up') return '↑'
  if (direction === 'down') return '↓'
  return '→'
}

export function getProgressColor(direction: 'up' | 'down' | 'neutral', isPersonalBest: boolean = false): string {
  if (isPersonalBest) return 'text-yellow-400'
  if (direction === 'up') return 'text-green-400'
  if (direction === 'down') return 'text-red-400'
  return 'text-gray-400'
}