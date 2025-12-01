// ============================================================
// BROKEN VERSION - Badly written helper functions
// This is intentionally bad code to demonstrate refactoring
// ============================================================

/**
 * BROKEN: formatScoreDisplay
 * Problems:
 * - Deeply nested if statements
 * - Duplicated logic
 * - Magic numbers without explanation
 * - Inconsistent return types
 * - No type safety
 * - Poor naming
 */
export function formatScoreDisplay_BROKEN(score: any): any {
  if (score !== null && score !== undefined) {
    if (typeof score === 'number') {
      if (score >= 0) {
        if (score <= 100) {
          if (score >= 90) {
            return { text: score + '/100', color: 'green', label: 'Excellent' }
          } else {
            if (score >= 70) {
              return { text: score + '/100', color: 'yellow', label: 'Good' }
            } else {
              if (score >= 50) {
                return { text: score + '/100', color: 'orange', label: 'Fair' }
              } else {
                return { text: score + '/100', color: 'red', label: 'Needs Work' }
              }
            }
          }
        } else {
          return { text: 'Invalid', color: 'gray', label: 'Error' }
        }
      } else {
        return { text: 'Invalid', color: 'gray', label: 'Error' }
      }
    } else {
      return { text: 'N/A', color: 'gray', label: 'No Score' }
    }
  } else {
    return { text: 'N/A', color: 'gray', label: 'No Score' }
  }
}

/**
 * BROKEN: formatDate
 * Problems:
 * - Manual string manipulation instead of using Intl
 * - Hardcoded month names
 * - No timezone handling
 * - Fragile parsing
 */
export function formatDate_BROKEN(dateStr: any): string {
  if (!dateStr) return 'Unknown'
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  
  try {
    const d = new Date(dateStr)
    const month = months[d.getMonth()]
    const day = d.getDate()
    const year = d.getFullYear()
    const hours = d.getHours()
    const minutes = d.getMinutes()
    
    let ampm = 'AM'
    let hour12 = hours
    if (hours >= 12) {
      ampm = 'PM'
      if (hours > 12) hour12 = hours - 12
    }
    if (hours === 0) hour12 = 12
    
    let minStr = '' + minutes
    if (minutes < 10) minStr = '0' + minutes
    
    return month + ' ' + day + ', ' + year + ' at ' + hour12 + ':' + minStr + ' ' + ampm
  } catch (e) {
    return 'Invalid Date'
  }
}

/**
 * BROKEN: truncateText
 * Problems:
 * - Doesn't handle edge cases well
 * - Can cut words in half
 * - Magic number for length
 */
export function truncateText_BROKEN(text: any, len?: any): string {
  if (!text) return ''
  if (len === undefined) len = 100
  if (text.length <= len) return text
  return text.substring(0, len) + '...'
}


// ============================================================
// REFACTORED VERSION - Clean, type-safe helper functions
// ============================================================

export interface ScoreDisplay {
  text: string
  colorClass: string
  bgClass: string
  label: string
}

type ScoreLevel = 'excellent' | 'good' | 'fair' | 'needsWork' | 'invalid' | 'none'

const SCORE_THRESHOLDS = {
  excellent: 90,
  good: 70,
  fair: 50,
} as const

const SCORE_CONFIG: Record<ScoreLevel, Omit<ScoreDisplay, 'text'>> = {
  excellent: {
    colorClass: 'text-emerald-400',
    bgClass: 'bg-emerald-500/20',
    label: 'Excellent',
  },
  good: {
    colorClass: 'text-amber-400',
    bgClass: 'bg-amber-500/20',
    label: 'Good',
  },
  fair: {
    colorClass: 'text-orange-400',
    bgClass: 'bg-orange-500/20',
    label: 'Fair',
  },
  needsWork: {
    colorClass: 'text-red-400',
    bgClass: 'bg-red-500/20',
    label: 'Needs Work',
  },
  invalid: {
    colorClass: 'text-surface-500',
    bgClass: 'bg-surface-500/20',
    label: 'Invalid',
  },
  none: {
    colorClass: 'text-surface-500',
    bgClass: 'bg-surface-500/20',
    label: 'Not Evaluated',
  },
}

function getScoreLevel(score: number | null | undefined): ScoreLevel {
  if (score === null || score === undefined) return 'none'
  if (typeof score !== 'number' || score < 0 || score > 100) return 'invalid'
  if (score >= SCORE_THRESHOLDS.excellent) return 'excellent'
  if (score >= SCORE_THRESHOLDS.good) return 'good'
  if (score >= SCORE_THRESHOLDS.fair) return 'fair'
  return 'needsWork'
}

/**
 * Formats a score (0-100) into a display object with text, color classes, and label.
 * Returns appropriate defaults for null/undefined/invalid scores.
 */
export function formatScoreDisplay(score: number | null | undefined): ScoreDisplay {
  const level = getScoreLevel(score)
  const config = SCORE_CONFIG[level]
  
  const text = level === 'none' || level === 'invalid' 
    ? 'N/A' 
    : `${score}/100`
  
  return {
    text,
    ...config,
  }
}

/**
 * Formats a date string into a human-readable format.
 * Uses Intl.DateTimeFormat for proper localization.
 */
export function formatDate(
  dateStr: string | null | undefined,
  options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }
): string {
  if (!dateStr) return 'Unknown'
  
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return 'Invalid Date'
    return new Intl.DateTimeFormat('en-US', options).format(date)
  } catch {
    return 'Invalid Date'
  }
}

/**
 * Formats a date as a relative time string (e.g., "2 hours ago").
 */
export function formatRelativeTime(dateStr: string | null | undefined): string {
  if (!dateStr) return 'Unknown'
  
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return 'Invalid Date'
    
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
    
    return formatDate(dateStr, { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return 'Invalid Date'
  }
}

interface TruncateOptions {
  maxLength?: number
  preserveWords?: boolean
  suffix?: string
}

/**
 * Truncates text to a specified length with customizable options.
 * Can preserve word boundaries to avoid cutting words in half.
 */
export function truncateText(
  text: string | null | undefined,
  options: TruncateOptions = {}
): string {
  const { maxLength = 100, preserveWords = true, suffix = '...' } = options
  
  if (!text) return ''
  if (text.length <= maxLength) return text
  
  if (!preserveWords) {
    return text.slice(0, maxLength - suffix.length) + suffix
  }
  
  // Find the last space before maxLength
  const truncated = text.slice(0, maxLength - suffix.length)
  const lastSpaceIndex = truncated.lastIndexOf(' ')
  
  if (lastSpaceIndex === -1) {
    // No space found, just cut at maxLength
    return truncated + suffix
  }
  
  return truncated.slice(0, lastSpaceIndex) + suffix
}

/**
 * Formats a status string into a display-friendly format.
 */
export function formatStatus(status: string | null | undefined): {
  text: string
  colorClass: string
  bgClass: string
} {
  switch (status) {
    case 'pending':
      return {
        text: 'Pending',
        colorClass: 'text-amber-400',
        bgClass: 'bg-amber-500/20',
      }
    case 'evaluated':
      return {
        text: 'Evaluated',
        colorClass: 'text-brand-400',
        bgClass: 'bg-brand-500/20',
      }
    case 'paid':
      return {
        text: 'Paid',
        colorClass: 'text-emerald-400',
        bgClass: 'bg-emerald-500/20',
      }
    case 'failed':
      return {
        text: 'Failed',
        colorClass: 'text-red-400',
        bgClass: 'bg-red-500/20',
      }
    default:
      return {
        text: status || 'Unknown',
        colorClass: 'text-surface-400',
        bgClass: 'bg-surface-500/20',
      }
  }
}

/**
 * Formats currency amount from cents to display string.
 */
export function formatCurrency(
  amountCents: number,
  currency: string = 'usd'
): string {
  const amount = amountCents / 100
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount)
}

