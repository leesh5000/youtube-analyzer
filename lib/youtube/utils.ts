/**
 * Parses ISO 8601 duration string to total seconds
 * Examples:
 * - "PT59S" -> 59
 * - "PT1M2S" -> 62
 * - "PT2M" -> 120
 * - "PT1H30M" -> 5400
 *
 * @param duration ISO 8601 duration string (e.g., "PT59S")
 * @returns Total duration in seconds
 */
export function parseDuration(duration: string): number {
  if (!duration || !duration.startsWith('PT')) {
    return 0
  }

  // Remove 'PT' prefix
  const timeString = duration.substring(2)

  // Match hours, minutes, and seconds
  const hoursMatch = timeString.match(/(\d+)H/)
  const minutesMatch = timeString.match(/(\d+)M/)
  const secondsMatch = timeString.match(/(\d+)S/)

  const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0
  const minutes = minutesMatch ? parseInt(minutesMatch[1], 10) : 0
  const seconds = secondsMatch ? parseInt(secondsMatch[1], 10) : 0

  return hours * 3600 + minutes * 60 + seconds
}

/**
 * Determines if a video is a Short based on duration
 * Shorts are limited to 60 seconds, but we allow up to 62 seconds
 * to account for YouTube's encoding tolerances
 *
 * @param duration ISO 8601 duration string (e.g., "PT59S")
 * @returns True if the video is likely a Short (≤60 seconds)
 */
export function isShortVideo(duration: string): boolean {
  const totalSeconds = parseDuration(duration)
  // Allow up to 60 seconds for Shorts
  // YouTube Shorts must be 60 seconds or less
  return totalSeconds > 0 && totalSeconds <= 60
}

/**
 * Formats duration in seconds to human-readable format
 * Examples:
 * - 59 -> "0:59"
 * - 125 -> "2:05"
 * - 3661 -> "1:01:01"
 *
 * @param seconds Total duration in seconds
 * @returns Formatted duration string
 */
export function formatDuration(seconds: number): string {
  if (seconds < 0) return '0:00'

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return `${minutes}:${secs.toString().padStart(2, '0')}`
}
