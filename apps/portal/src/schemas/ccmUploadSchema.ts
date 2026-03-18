import { z } from 'zod';
import {
  CCM_PHI_COLUMN_BLACKLIST,
  CCM_UPLOAD_REQUIRED_COLUMNS,
} from '@/lib/ccm-rpm-constants';

export const ccmUploadRowSchema = z.object({
  'Patient Acct No': z.string().min(1, 'Patient Acct No is required'),
  'Patient Last Name': z.string().min(1, 'Patient Last Name is required'),
  'Rendering Provider': z.string().min(1, 'Rendering Provider is required'),
  'Facility': z.string().optional().or(z.literal('')),
  'Primary Payer Name': z.string().optional().or(z.literal('')),
});

export type CcmUploadRow = z.infer<typeof ccmUploadRowSchema>;

interface FileValidationResult {
  valid: boolean;
  missingColumns: string[];
  phiColumns: string[];
}

export function validateCcmUploadHeaders(headers: string[]): FileValidationResult {
  const normalized = headers.map((h) => h.trim().toLowerCase());

  const phiColumns = headers.filter((h) =>
    CCM_PHI_COLUMN_BLACKLIST.some((phi) => h.trim().toLowerCase().includes(phi))
  );

  const missingColumns = (CCM_UPLOAD_REQUIRED_COLUMNS as readonly string[]).filter(
    (req) => !normalized.includes(req.toLowerCase())
  );

  return {
    valid: phiColumns.length === 0 && missingColumns.length === 0,
    missingColumns,
    phiColumns,
  };
}
