import Papa from 'papaparse';
import { patientCsvRowSchema, CSV_TEMPLATE_HEADERS } from '@/portal/schemas/patientCsvSchema';
import type { PatientCsvRow, CsvError, CsvParseResult } from '@/portal/schemas/patientCsvSchema';

export function parsePatientCsv(file: File): Promise<CsvParseResult> {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h: string) => h.trim().toLowerCase().replace(/\s+/g, '_'),
      complete: (results) => {
        const valid: PatientCsvRow[] = [];
        const errors: CsvError[] = [];
        const seen = new Set<string>();
        const duplicates: PatientCsvRow[] = [];

        (results.data as Record<string, string>[]).forEach((row, index) => {
          const parsed = patientCsvRowSchema.safeParse(row);
          if (parsed.success) {
            // Check for duplicates (name + DOB)
            const key = `${parsed.data.first_name.toLowerCase()}|${parsed.data.last_name.toLowerCase()}|${parsed.data.date_of_birth}`;
            if (seen.has(key)) {
              duplicates.push(parsed.data);
            } else {
              seen.add(key);
              valid.push(parsed.data);
            }
          } else {
            errors.push({ row: index + 2, issues: parsed.error.issues }); // +2 for 1-based + header
          }
        });

        resolve({ valid, errors, duplicates, total: results.data.length });
      },
    });
  });
}

export function generateCsvTemplate(): string {
  return CSV_TEMPLATE_HEADERS.join(',') + '\n';
}

export function downloadCsvTemplate() {
  const csv = generateCsvTemplate();
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'patient_import_template.csv');
  link.click();
  URL.revokeObjectURL(url);
}
