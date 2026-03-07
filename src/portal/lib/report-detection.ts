/**
 * Report Detection — Auto-identifies the eCW report type from column headers.
 * Matches against known signatures defined in practice-health-constants.
 */

import { REPORT_SIGNATURES } from '@/portal/lib/practice-health-constants';
import type { ReportSignatureKey } from '@/portal/lib/practice-health-constants';
import type { ReportDetectionResult } from '@/portal/types/practice-health';
import type { ReportType } from '@/portal/types/practice-health';

/**
 * Normalize a header for case-insensitive comparison.
 * Trims and lowercases but preserves internal spacing/parens for signature matching.
 */
function normalizeForMatch(header: string): string {
  return header.trim().toLowerCase();
}

/**
 * Detect report type by matching file headers against known column signatures.
 * Returns the best match (all required columns must be present) or null.
 */
export function detectReportType(headers: string[]): ReportDetectionResult | null {
  const normalizedHeaders = headers.map(normalizeForMatch);

  let bestMatch: ReportDetectionResult | null = null;

  const reportTypes = Object.keys(REPORT_SIGNATURES) as ReportSignatureKey[];

  for (const reportType of reportTypes) {
    const signature = REPORT_SIGNATURES[reportType];

    // Check required columns
    const matchedRequired: string[] = [];
    const missingRequired: string[] = [];

    for (const reqCol of signature.required) {
      const reqNorm = normalizeForMatch(reqCol);
      if (normalizedHeaders.some((h) => h === reqNorm)) {
        matchedRequired.push(reqCol);
      } else {
        missingRequired.push(reqCol);
      }
    }

    // All required columns must match
    if (missingRequired.length > 0) continue;

    // Check optional columns
    const matchedOptional: string[] = [];
    const missingOptional: string[] = [];

    for (const optCol of signature.optional) {
      const optNorm = normalizeForMatch(optCol);
      if (normalizedHeaders.some((h) => h === optNorm)) {
        matchedOptional.push(optCol);
      } else {
        missingOptional.push(optCol);
      }
    }

    const totalSignatureCols = signature.required.length + signature.optional.length;
    const totalMatched = matchedRequired.length + matchedOptional.length;
    const confidence = totalMatched / totalSignatureCols;

    const result: ReportDetectionResult = {
      reportType: reportType as ReportType,
      confidence,
      matchedHeaders: [...matchedRequired, ...matchedOptional],
      missingOptional,
    };

    if (!bestMatch || confidence > bestMatch.confidence) {
      bestMatch = result;
    }
  }

  return bestMatch;
}
