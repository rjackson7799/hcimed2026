import { z } from 'zod';

export const patientCsvRowSchema = z.object({
  first_name: z.string().min(1, 'First name required'),
  last_name: z.string().min(1, 'Last name required'),
  date_of_birth: z.string().min(1, 'Date of birth required'),
  phone_primary: z.string().min(10, 'Phone number required (10+ digits)'),
  phone_secondary: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  zip_code: z.string().optional().or(z.literal('')),
  current_insurance: z.string().optional().or(z.literal('')),
  member_id: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
});

export type PatientCsvRow = z.infer<typeof patientCsvRowSchema>;

export interface CsvError {
  row: number;
  issues: z.ZodIssue[];
}

export interface CsvParseResult {
  valid: PatientCsvRow[];
  errors: CsvError[];
  duplicates: PatientCsvRow[];
  total: number;
}

export const CSV_TEMPLATE_HEADERS = [
  'first_name',
  'last_name',
  'date_of_birth',
  'phone_primary',
  'phone_secondary',
  'address',
  'city',
  'zip_code',
  'current_insurance',
  'member_id',
  'notes',
] as const;
