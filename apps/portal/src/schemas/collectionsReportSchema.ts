/**
 * Zod schema for Report 36.14 — Financial Analysis at Claim Level
 * Validates rows after PapaParse header transform (lowercase_underscore).
 */

import { z } from 'zod';
import { parseCurrency } from '@/utils/practice-health-formatters';

const safeCsvString = (schema: z.ZodString) =>
  schema.transform((val) => val.replace(/^[=+\-@\t\r]+/, ''));

const currencyField = z
  .union([z.string(), z.number()])
  .optional()
  .or(z.literal(''))
  .transform((val) => {
    if (val === undefined || val === '' || val === null) return 0;
    return typeof val === 'number' ? val : parseCurrency(String(val));
  });

const integerField = z
  .union([z.string(), z.number()])
  .optional()
  .or(z.literal(''))
  .transform((val) => {
    if (val === undefined || val === '' || val === null) return 0;
    const num = typeof val === 'number' ? val : parseInt(String(val).replace(/,/g, ''));
    return isNaN(num) ? 0 : num;
  });

export const collectionsRowSchema = z.object({
  // Required
  facility: safeCsvString(z.string().min(1, 'Facility required')),

  // Financial fields
  charges: currencyField,
  payer_charges: currencyField,
  self_charges: currencyField,
  payments: currencyField,
  payer_payments: currencyField,
  patient_payments: currencyField,
  contractual_adjustments: currencyField,
  payer_withheld: currencyField,
  writeoff_adjustments: currencyField,
  refunds: currencyField,

  // Counts
  claim_count: integerField,
  patient_count: integerField,

  // A/R change — header may appear as "change_in_a/r" after transform
  'change_in_a/r': currencyField,
});

export type CollectionsReportRow = z.infer<typeof collectionsRowSchema>;

export interface CollectionsParseError {
  row: number;
  issues: z.ZodIssue[];
}

export interface CollectionsParseResult {
  valid: CollectionsReportRow[];
  errors: CollectionsParseError[];
  duplicates: CollectionsReportRow[];
  total: number;
}
