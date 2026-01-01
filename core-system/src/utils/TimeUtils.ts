/**
 * TimeUtils - Time and timestamp utilities
 * 
 * Utilities for handling time in a deterministic way for event sourcing.
 */

/**
 * Get current timestamp
 */
export function now(): Date {
  return new Date();
}

/**
 * Convert date to ISO string
 */
export function toISOString(date: Date): string {
  return date.toISOString();
}

/**
 * Parse ISO string to date
 */
export function fromISOString(iso: string): Date {
  return new Date(iso);
}

/**
 * Get date only (YYYY-MM-DD) from timestamp
 */
export function toDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Parse date string (YYYY-MM-DD) to Date
 */
export function fromDateString(dateStr: string): Date {
  return new Date(dateStr);
}

/**
 * Check if two dates are on the same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return toDateString(date1) === toDateString(date2);
}

/**
 * Add days to date
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Calculate difference in days
 */
export function daysBetween(date1: Date, date2: Date): number {
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Check if date is in the past
 */
export function isPast(date: Date): boolean {
  return date < now();
}

/**
 * Check if date is in the future
 */
export function isFuture(date: Date): boolean {
  return date > now();
}

/**
 * Format date for display (localized)
 */
export function formatDate(date: Date, locale = 'zh-TW'): string {
  return date.toLocaleDateString(locale);
}

/**
 * Format datetime for display (localized)
 */
export function formatDateTime(date: Date, locale = 'zh-TW'): string {
  return date.toLocaleString(locale);
}
