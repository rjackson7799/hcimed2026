import { z } from 'zod';

// Strip CSV formula injection trigger characters from imported values
const safeCsvString = (schema: z.ZodString) =>
  schema.transform((val) => val.replace(/^[=+\-@\t\r]+/, ''));

const optionalSafeCsvString = z
  .string()
  .optional()
  .or(z.literal(''))
  .transform((val) => (val ? val.replace(/^[=+\-@\t\r]+/, '') : val));

export const patientCsvRowSchema = z.object({
  first_name: safeCsvString(z.string().min(1, 'First name required')),
  last_name: safeCsvString(z.string().min(1, 'Last name required')),
  date_of_birth: z.string().min(1, 'Date of birth required'),
  phone_primary: z.string().min(10, 'Phone number required (10+ digits)'),
  phone_secondary: optionalSafeCsvString,
  address: optionalSafeCsvString,
  city: optionalSafeCsvString,
  zip_code: optionalSafeCsvString,
  current_insurance: optionalSafeCsvString,
  member_id: optionalSafeCsvString,
  notes: optionalSafeCsvString,
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
