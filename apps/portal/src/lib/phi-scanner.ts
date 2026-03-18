/**
 * PHI Scanner — Scans uploaded file headers for Protected Health Information columns.
 * If any PHI columns are detected, the upload is immediately rejected.
 */

import { PHI_COLUMN_BLACKLIST } from '@/lib/practice-health-constants';
import type { PhiScanResult } from '@/types/practice-health';

/**
 * Normalize a header string for comparison: lowercase, strip underscores,
 * hyphens, extra spaces, and trim.
 */
function normalizeHeader(header: string): string {
  return header
    .toLowerCase()
    .replace(/[_\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Scan file headers against the PHI blacklist.
 * Returns which PHI columns were found (if any).
 */
export function scanForPhi(headers: string[]): PhiScanResult {
  const phiColumns: string[] = [];

  for (const header of headers) {
    const normalized = normalizeHeader(header);
    if (!normalized) continue;

    for (const blacklisted of PHI_COLUMN_BLACKLIST) {
      if (normalized === blacklisted || normalized.startsWith(blacklisted)) {
        phiColumns.push(header);
        break;
      }
    }
  }

  return {
    hasPhi: phiColumns.length > 0,
    phiColumns,
  };
}
