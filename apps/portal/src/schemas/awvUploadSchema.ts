import { z } from 'zod';
import {
  PHI_COLUMN_BLACKLIST,
  UPLOAD_REQUIRED_COLUMNS,
} from '@/lib/awv-tracker-constants';

// ─── CSV Row Schema ─────────────────────────────────────────────

const VALID_AWV_CPTS = ['G0402', 'G0438', 'G0439'] as const;

const twentyFourMonthsAgo = () => {
  const d = new Date();
  d.setMonth(d.getMonth() - 24);
  return d.toISOString().split('T')[0];
};

export const awvUploadRowSchema = z.object({
  'Patient Acct No': z.string().min(1, 'Patient Acct No is required'),
  'Patient Last Name': z.string().min(1, 'Patient Last Name is required'),
  'Rendering Provider': z.string().min(1, 'Rendering Provider is required'),
  'Facility': z.string().optional().or(z.literal('')),
  'Primary Payer Name': z.string().optional().or(z.literal('')),
  'Last AWV Date': z
    .string()
    .optional()
    .or(z.literal(''))
    .refine(
      (val) => {
        if (!val) return true;
        const d = new Date(val);
        if (isNaN(d.getTime())) return false;
        const today = new Date().toISOString().split('T')[0];
        if (val > today) return false;
        if (val < twentyFourMonthsAgo()) return false;
        return true;
      },
      { message: 'Last AWV Date must be a valid date within the last 24 months and not in the future' }
    ),
  'Last AWV CPT': z
    .string()
    .optional()
    .or(z.literal(''))
    .refine(
      (val) => !val || (VALID_AWV_CPTS as readonly string[]).includes(val),
      { message: 'Last AWV CPT must be G0402, G0438, or G0439' }
    ),
});

export type AwvUploadRow = z.infer<typeof awvUploadRowSchema>;

// ─── File Header Validation ─────────────────────────────────────

interface FileValidationResult {
  valid: boolean;
  missingColumns: string[];
  phiColumns: string[];
}

export function validateUploadHeaders(headers: string[]): FileValidationResult {
  const normalized = headers.map((h) => h.trim().toLowerCase());

  // Check for PHI columns
  const phiColumns = headers.filter((h) =>
    PHI_COLUMN_BLACKLIST.some((phi) => h.trim().toLowerCase().includes(phi))
  );

  // Check required columns present
  const missingColumns = UPLOAD_REQUIRED_COLUMNS.filter(
    (req) => !normalized.includes(req.toLowerCase())
  );

  return {
    valid: phiColumns.length === 0 && missingColumns.length === 0,
    missingColumns,
    phiColumns,
  };
}
