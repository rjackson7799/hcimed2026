/**
 * Practice Health Module — Formatters
 * Currency, RVU, duration, percentage, and provider name formatting.
 */

/**
 * Format a number as US currency (e.g., $1,234.56)
 */
export function formatCurrency(value: number, compact = false): string {
  if (compact && Math.abs(value) >= 1000) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format an RVU value (e.g., 12.4 → "12.40")
 */
export function formatRvu(value: number): string {
  return value.toFixed(2);
}

/**
 * Format a percentage (e.g., 0.856 → "85.6%", or 85.6 → "85.6%")
 * If the value is <= 1 it's treated as a ratio; otherwise as already a percentage.
 */
export function formatPercentage(value: number, decimals = 1): string {
  const pct = value <= 1 && value >= 0 ? value * 100 : value;
  return `${pct.toFixed(decimals)}%`;
}

/**
 * Format a duration in minutes (e.g., 22 → "22 min", 90 → "1h 30m")
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

/**
 * Format a plain number with commas (e.g., 1234 → "1,234")
 */
export function formatNumber(value: number, decimals = 0): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Normalize a provider name from eCW format to title case.
 * "JACKSON, ROY H" → "Jackson, Roy H"
 */
export function normalizeProviderName(name: string): string {
  return name
    .split(/([,\s]+)/)
    .map((part) => {
      if (/^[,\s]+$/.test(part)) return part;
      // Single character suffixes (middle initials) stay uppercase
      if (part.length <= 2) return part.toUpperCase();
      return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
    })
    .join('');
}

/**
 * Parse a currency string from CSV (e.g., "$1,234.56" or "1234.56") to a number.
 */
export function parseCurrency(value: string): number {
  const cleaned = value.replace(/[$,\s]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

/**
 * Parse an eCW duration string to minutes.
 * Handles: "0 hours 30 minutes", "1 hours 15 minutes", "30", "01:30"
 */
export function parseDuration(value: string): number {
  if (!value || value.trim() === '') return 0;

  // "X hours Y minutes" format
  const hhmm = value.match(/(\d+)\s*hours?\s*(\d+)\s*minutes?/i);
  if (hhmm) return parseInt(hhmm[1]) * 60 + parseInt(hhmm[2]);

  // "HH:MM" format
  const colon = value.match(/^(\d+):(\d+)$/);
  if (colon) return parseInt(colon[1]) * 60 + parseInt(colon[2]);

  // "Y minutes" format
  const minOnly = value.match(/(\d+)\s*minutes?/i);
  if (minOnly) return parseInt(minOnly[1]);

  // Plain number (assume minutes)
  const num = parseInt(value);
  return isNaN(num) ? 0 : num;
}

/**
 * Format the trend between current and previous values.
 * Returns { direction, percentage, label } for use in KPI cards.
 */
export function formatTrend(
  current: number,
  previous: number
): { direction: 'up' | 'down' | 'flat'; percentage: number; label: string } {
  if (previous === 0) {
    return { direction: current > 0 ? 'up' : 'flat', percentage: 0, label: 'N/A' };
  }
  const change = ((current - previous) / previous) * 100;
  const absChange = Math.abs(change);
  if (absChange < 0.5) {
    return { direction: 'flat', percentage: 0, label: '0%' };
  }
  return {
    direction: change > 0 ? 'up' : 'down',
    percentage: absChange,
    label: `${absChange.toFixed(1)}%`,
  };
}

/**
 * Strip CSV injection characters from a string value.
 */
export function sanitizeCsvValue(value: string): string {
  return value.replace(/^[=+\-@\t\r]/, "'$&");
}
