/**
 * Zod schema for Report 371.02 — Charges at CPT Level
 * Validates rows after PapaParse header transform (lowercase_underscore).
 */

import { z } from 'zod';
import { parseCurrency } from '@/utils/practice-health-formatters';

const safeCsvString = (schema: z.ZodString) =>
  schema.transform((val) => val.replace(/^[=+\-@\t\r]+/, ''));

const optionalString = z
  .string()
  .optional()
  .or(z.literal(''))
  .transform((val) => (val && val.trim() ? val.replace(/^[=+\-@\t\r]+/, '').trim() : undefined));

const currencyField = z
  .union([z.string(), z.number()])
  .transform((val) => (typeof val === 'number' ? val : parseCurrency(String(val))))
  .pipe(z.number());

const optionalCurrency = z
  .union([z.string(), z.number()])
  .optional()
  .or(z.literal(''))
  .transform((val) => {
    if (val === undefined || val === '' || val === null) return 0;
    return typeof val === 'number' ? val : parseCurrency(String(val));
  });

export const chargesRowSchema = z.object({
  // Required fields
  facility: safeCsvString(z.string().min(1, 'Facility required')),
  rendering_provider_name: safeCsvString(z.string().min(1, 'Rendering Provider Name required')),
  cpt_code: safeCsvString(z.string().min(1, 'CPT Code required')),
  service_date: z.string().min(1, 'Service Date required').transform((val) => val.trim()),
  billed_charge: currencyField,

  // Optional core fields
  facility_pos: z
    .union([z.string(), z.number()])
    .optional()
    .or(z.literal(''))
    .transform((val) => {
      if (val === undefined || val === '' || val === null) return undefined;
      const num = typeof val === 'number' ? val : parseInt(String(val));
      return isNaN(num) ? undefined : num;
    }),
  cpt_description: optionalString,
  cpt_group_name: optionalString,
  primary_payer_name: optionalString,
  secondary_payer_name: optionalString,
  claim_date: optionalString,
  start_date_of_service: optionalString,
  end_date_of_service: optionalString,

  // Currency fields
  payer_charge: optionalCurrency,
  self_charge: optionalCurrency,

  // Units
  units: z
    .union([z.string(), z.number()])
    .optional()
    .or(z.literal(''))
    .transform((val) => {
      if (val === undefined || val === '' || val === null) return 1;
      const num = typeof val === 'number' ? val : parseInt(String(val));
      return isNaN(num) || num < 1 ? 1 : num;
    }),

  // Modifiers (1-4)
  modifiers_1: optionalString,
  modifiers_2: optionalString,
  modifiers_3: optionalString,
  modifiers_4: optionalString,

  // ICD codes (1-4)
  icd1_code: optionalString,
  icd2_code: optionalString,
  icd3_code: optionalString,
  icd4_code: optionalString,
  icd1_name: optionalString,
  icd2_name: optionalString,
  icd3_name: optionalString,
  icd4_name: optionalString,

  // Resource/Appointment provider (may appear in some eCW exports)
  'appointment/servicing_provider': optionalString,
  resource_provider_name: optionalString,
  rendering_provider_npi: optionalString,
});

export type ChargesReportRow = z.infer<typeof chargesRowSchema>;

export interface ChargesParseError {
  row: number;
  issues: z.ZodIssue[];
}

export interface ChargesParseResult {
  valid: ChargesReportRow[];
  errors: ChargesParseError[];
  duplicates: ChargesReportRow[];
  total: number;
}
