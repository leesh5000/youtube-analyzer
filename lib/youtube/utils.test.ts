import { parseDuration, isShortVideo, formatDuration } from './utils'

describe('parseDuration', () => {
  it('should parse seconds only', () => {
    expect(parseDuration('PT59S')).toBe(59)
    expect(parseDuration('PT1S')).toBe(1)
    expect(parseDuration('PT30S')).toBe(30)
  })

  it('should parse minutes and seconds', () => {
    expect(parseDuration('PT1M2S')).toBe(62)
    expect(parseDuration('PT2M30S')).toBe(150)
    expect(parseDuration('PT5M0S')).toBe(300)
  })

  it('should parse minutes only', () => {
    expect(parseDuration('PT1M')).toBe(60)
    expect(parseDuration('PT5M')).toBe(300)
    expect(parseDuration('PT10M')).toBe(600)
  })

  it('should parse hours, minutes, and seconds', () => {
    expect(parseDuration('PT1H0M0S')).toBe(3600)
    expect(parseDuration('PT1H30M0S')).toBe(5400)
    expect(parseDuration('PT2H15M30S')).toBe(8130)
  })

  it('should parse hours and minutes', () => {
    expect(parseDuration('PT1H30M')).toBe(5400)
    expect(parseDuration('PT2H45M')).toBe(9900)
  })

  it('should handle invalid or empty durations', () => {
    expect(parseDuration('')).toBe(0)
    expect(parseDuration('invalid')).toBe(0)
    expect(parseDuration('P1D')).toBe(0) // Days not supported
  })

  it('should handle PT prefix correctly', () => {
    expect(parseDuration('PT0S')).toBe(0)
    expect(parseDuration('PT')).toBe(0)
  })
})

describe('isShortVideo', () => {
  it('should identify Shorts (≤60 seconds)', () => {
    expect(isShortVideo('PT59S')).toBe(true)
    expect(isShortVideo('PT60S')).toBe(true)
    expect(isShortVideo('PT1M')).toBe(true)
    expect(isShortVideo('PT30S')).toBe(true)
    expect(isShortVideo('PT15S')).toBe(true)
  })

  it('should identify non-Shorts (>60 seconds)', () => {
    expect(isShortVideo('PT61S')).toBe(false)
    expect(isShortVideo('PT1M1S')).toBe(false)
    expect(isShortVideo('PT2M')).toBe(false)
    expect(isShortVideo('PT5M30S')).toBe(false)
    expect(isShortVideo('PT1H')).toBe(false)
  })

  it('should handle edge cases', () => {
    expect(isShortVideo('')).toBe(false)
    expect(isShortVideo('invalid')).toBe(false)
    expect(isShortVideo('PT0S')).toBe(false) // 0 seconds is not a valid Short
  })
})

describe('formatDuration', () => {
  it('should format seconds to MM:SS', () => {
    expect(formatDuration(0)).toBe('0:00')
    expect(formatDuration(59)).toBe('0:59')
    expect(formatDuration(60)).toBe('1:00')
    expect(formatDuration(125)).toBe('2:05')
  })

  it('should format to H:MM:SS for videos >= 1 hour', () => {
    expect(formatDuration(3600)).toBe('1:00:00')
    expect(formatDuration(3661)).toBe('1:01:01')
    expect(formatDuration(5400)).toBe('1:30:00')
    expect(formatDuration(7265)).toBe('2:01:05')
  })

  it('should handle negative values', () => {
    expect(formatDuration(-1)).toBe('0:00')
    expect(formatDuration(-100)).toBe('0:00')
  })

  it('should pad single digits correctly', () => {
    expect(formatDuration(5)).toBe('0:05')
    expect(formatDuration(65)).toBe('1:05')
    expect(formatDuration(3605)).toBe('1:00:05')
  })
})
