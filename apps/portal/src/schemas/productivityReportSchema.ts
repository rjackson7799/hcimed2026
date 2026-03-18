/**
 * Zod schema for Report 4.06 — Productivity
 * Validates rows after PapaParse header transform (lowercase_underscore).
 */

import { z } from 'zod';
import { parseDuration } from '@/utils/practice-health-formatters';

const safeCsvString = (schema: z.ZodString) =>
  schema.transform((val) => val.replace(/^[=+\-@\t\r]+/, ''));

const optionalString = z
  .string()
  .optional()
  .or(z.literal(''))
  .transform((val) => (val && val.trim() ? val.replace(/^[=+\-@\t\r]+/, '').trim() : undefined));

const durationField = z
  .union([z.string(), z.number()])
  .optional()
  .or(z.literal(''))
  .transform((val) => {
    if (val === undefined || val === '' || val === null) return null;
    if (typeof val === 'number') return val;
    const mins = parseDuration(String(val));
    return mins === 0 && String(val).trim() !== '0' ? null : mins;
  });

const booleanField = z
  .union([z.string(), z.boolean()])
  .optional()
  .or(z.literal(''))
  .transform((val) => {
    if (typeof val === 'boolean') return val;
    if (val === undefined || val === '' || val === null) return false;
    const lower = String(val).toLowerCase().trim();
    return lower === 'yes' || lower === 'true' || lower === '1';
  });

export const productivityRowSchema = z.object({
  // Required
  facility: safeCsvString(z.string().min(1, 'Facility required')),
  appointment_date: z.string().min(1, 'Appointment Date required').transform((val) => val.trim()),
  visit_status: safeCsvString(z.string().min(1, 'Visit Status required')),

  // Optional strings
  visit_type: optionalString,
  is_televisit: booleanField,

  // Provider (field name varies in eCW exports)
  rendering_provider_name: optionalString,
  'appointment/servicing_provider': optionalString,
  resource_provider_name: optionalString,

  // Time fields
  appointment_start_time: optionalString,
  appointment_end_time: optionalString,
  appointment_arrived_time: optionalString,
  appointment_checked_out_time: optionalString,

  // Duration fields — parentheses become part of the header after transform
  'appointment_duration_(scheduled)': durationField,
  'appointment_duration_(actual)': durationField,
  variance: durationField,
  wait_time: durationField,
  time_with_clinician: durationField,
});

export type ProductivityReportRow = z.infer<typeof productivityRowSchema>;

export interface ProductivityParseError {
  row: number;
  issues: z.ZodIssue[];
}

export interface ProductivityParseResult {
  valid: ProductivityReportRow[];
  errors: ProductivityParseError[];
  duplicates: ProductivityReportRow[];
  total: number;
}
