/**
 * Report Parsers — Parse, validate, and normalize eCW report files (CSV/Excel).
 * Orchestrates PHI scanning, report detection, Zod validation, and data cleaning.
 */

import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { scanForPhi } from '@/lib/phi-scanner';
import { detectReportType } from '@/lib/report-detection';
import {
  POS_SERVICE_LINE_MAP,
  MAX_UPLOAD_FILE_SIZE_BYTES,
  MAX_UPLOAD_ROW_COUNT,
  MIN_UPLOAD_ROW_COUNT,
  MAX_SERVICE_DATE_AGE_DAYS,
  QUALITY_CODE_PREFIX,
} from '@/lib/practice-health-constants';
import { normalizeProviderName } from '@/utils/practice-health-formatters';
import { chargesRowSchema } from '@/schemas/chargesReportSchema';
import { collectionsRowSchema } from '@/schemas/collectionsReportSchema';
import { productivityRowSchema } from '@/schemas/productivityReportSchema';
import type { ChargesReportRow } from '@/schemas/chargesReportSchema';
import type { CollectionsReportRow } from '@/schemas/collectionsReportSchema';
import type { ProductivityReportRow } from '@/schemas/productivityReportSchema';
import type {
  ParsedUploadData,
  ReportDetectionResult,
  PhiScanResult,
  ValidationError,
  ReportType,
  ServiceLine,
} from '@/types/practice-health';

// ─── Result types for the client-side parsing step ──────────────────

export interface ReportParseResult {
  detection: ReportDetectionResult;
  phiScan: PhiScanResult;
  validRows: Record<string, unknown>[];
  errors: ValidationError[];
  duplicateCount: number;
  totalRows: number;
  dateRangeStart: string;
  dateRangeEnd: string;
  fileName: string;
  fileSizeBytes: number;
}

// ─── Header Transform ───────────────────────────────────────────────

const transformHeader = (h: string) => h.trim().toLowerCase().replace(/\s+/g, '_');

// ─── File Reading ───────────────────────────────────────────────────

function readCsvFile(file: File): Promise<{ headers: string[]; rows: Record<string, string>[] }> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader,
      complete: (results) => {
        const headers = results.meta.fields || [];
        resolve({ headers, rows: results.data as Record<string, string>[] });
      },
      error: (err: Error) => reject(new Error(`CSV parse error: ${err.message}`)),
    });
  });
}

async function readExcelFile(file: File): Promise<{ headers: string[]; rows: Record<string, string>[] }> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) throw new Error('Excel file has no sheets');

  const sheet = workbook.Sheets[sheetName];
  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });

  if (rawRows.length === 0) throw new Error('Excel file has no data rows');

  // Transform headers and stringify values to match CSV pipeline
  const headers = Object.keys(rawRows[0]).map(transformHeader);
  const rows = rawRows.map((row) => {
    const transformed: Record<string, string> = {};
    const keys = Object.keys(row);
    for (let i = 0; i < keys.length; i++) {
      const key = transformHeader(keys[i]);
      const val = row[keys[i]];
      // Convert dates to ISO strings, numbers to strings
      if (val instanceof Date) {
        transformed[key] = val.toISOString().split('T')[0];
      } else {
        transformed[key] = String(val ?? '');
      }
    }
    return transformed;
  });

  return { headers, rows };
}

// ─── Date Parsing ───────────────────────────────────────────────────

/**
 * Parse a date string to ISO YYYY-MM-DD format.
 * Handles: MM/DD/YYYY, M/D/YYYY, YYYY-MM-DD, MM-DD-YYYY
 */
function parseToIsoDate(dateStr: string): string | null {
  if (!dateStr || !dateStr.trim()) return null;
  const trimmed = dateStr.trim();

  // Already ISO format
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;

  // MM/DD/YYYY or M/D/YYYY
  const slashMatch = trimmed.match(/^(\d{1,2})[/\-](\d{1,2})[/\-](\d{4})$/);
  if (slashMatch) {
    const month = slashMatch[1].padStart(2, '0');
    const day = slashMatch[2].padStart(2, '0');
    return `${slashMatch[3]}-${month}-${day}`;
  }

  // Try native Date parse as fallback
  const d = new Date(trimmed);
  if (!isNaN(d.getTime())) {
    return d.toISOString().split('T')[0];
  }

  return null;
}

// ─── Date Validation ────────────────────────────────────────────────

function isDateValid(isoDate: string): { valid: boolean; reason?: string } {
  const date = new Date(isoDate);
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  if (date > today) {
    return { valid: false, reason: 'Service date cannot be in the future' };
  }

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - MAX_SERVICE_DATE_AGE_DAYS);
  if (date < cutoff) {
    return { valid: false, reason: `Service date is older than ${MAX_SERVICE_DATE_AGE_DAYS} days` };
  }

  return { valid: true };
}

// ─── Service Line Resolution ────────────────────────────────────────

function resolveServiceLine(facilityPos?: number, facilityName?: string): ServiceLine {
  if (facilityPos !== undefined && facilityPos in POS_SERVICE_LINE_MAP) {
    return POS_SERVICE_LINE_MAP[facilityPos as keyof typeof POS_SERVICE_LINE_MAP];
  }
  // Fallback: check facility name for known mobile docs keywords
  if (facilityName) {
    const lower = facilityName.toLowerCase();
    if (
      lower.includes('home') ||
      lower.includes('villa') ||
      lower.includes('care facility') ||
      lower.includes('snf') ||
      lower.includes('nursing')
    ) {
      return 'mobile_docs';
    }
  }
  return 'hci_office';
}

// ─── Report-Specific Parsing ────────────────────────────────────────

function parseChargesRows(
  rows: Record<string, string>[]
): { valid: Record<string, unknown>[]; errors: ValidationError[]; duplicateCount: number; dateMin: string; dateMax: string } {
  const valid: Record<string, unknown>[] = [];
  const errors: ValidationError[] = [];
  const seen = new Set<string>();
  let duplicateCount = 0;
  let dateMin = '9999-12-31';
  let dateMax = '0000-01-01';

  for (let i = 0; i < rows.length; i++) {
    const parsed = chargesRowSchema.safeParse(rows[i]);
    if (!parsed.success) {
      errors.push({
        row: i + 2, // 1-based + header row
        field: parsed.error.issues[0]?.path?.join('.') || 'unknown',
        message: parsed.error.issues.map((iss) => iss.message).join('; '),
      });
      continue;
    }

    const row = parsed.data;

    // Parse and validate date
    const isoDate = parseToIsoDate(row.service_date);
    if (!isoDate) {
      errors.push({ row: i + 2, field: 'service_date', message: `Invalid date format: ${row.service_date}` });
      continue;
    }
    const dateCheck = isDateValid(isoDate);
    if (!dateCheck.valid) {
      errors.push({ row: i + 2, field: 'service_date', message: dateCheck.reason! });
      continue;
    }

    // Duplicate detection (within file)
    const dedupKey = `${isoDate}|${row.rendering_provider_name.toLowerCase()}|${row.cpt_code}|${row.facility.toLowerCase()}|${row.billed_charge}`;
    if (seen.has(dedupKey)) {
      duplicateCount++;
      continue;
    }
    seen.add(dedupKey);

    // Determine service line
    const serviceLine = resolveServiceLine(row.facility_pos, row.facility);

    // Determine billability
    const isBillable = !(row.cpt_code.startsWith(QUALITY_CODE_PREFIX) && row.billed_charge === 0);

    // Collect ICD codes and modifiers into arrays
    const icdCodes = [row.icd1_code, row.icd2_code, row.icd3_code, row.icd4_code].filter(Boolean) as string[];
    const icdNames = [row.icd1_name, row.icd2_name, row.icd3_name, row.icd4_name].filter(Boolean) as string[];
    const modifiers = [row.modifiers_1, row.modifiers_2, row.modifiers_3, row.modifiers_4].filter(Boolean) as string[];

    // Track date range
    if (isoDate < dateMin) dateMin = isoDate;
    if (isoDate > dateMax) dateMax = isoDate;

    valid.push({
      service_date: isoDate,
      claim_date: row.claim_date ? parseToIsoDate(row.claim_date) : null,
      facility: row.facility.trim(),
      facility_pos: row.facility_pos ?? null,
      service_line: serviceLine,
      rendering_provider: normalizeProviderName(row.rendering_provider_name),
      cpt_code: row.cpt_code.trim(),
      cpt_description: row.cpt_description ?? null,
      cpt_group: row.cpt_group_name ?? null,
      primary_payer: row.primary_payer_name ?? null,
      secondary_payer: row.secondary_payer_name ?? null,
      icd_codes: icdCodes,
      icd_names: icdNames,
      billed_charge: row.billed_charge,
      payer_charge: row.payer_charge ?? 0,
      self_charge: row.self_charge ?? 0,
      units: row.units ?? 1,
      modifiers,
      is_billable: isBillable,
    });
  }

  return { valid, errors, duplicateCount, dateMin, dateMax };
}

function parseCollectionsRows(
  rows: Record<string, string>[]
): { valid: Record<string, unknown>[]; errors: ValidationError[]; duplicateCount: number } {
  const valid: Record<string, unknown>[] = [];
  const errors: ValidationError[] = [];
  const seen = new Set<string>();
  let duplicateCount = 0;

  for (let i = 0; i < rows.length; i++) {
    const parsed = collectionsRowSchema.safeParse(rows[i]);
    if (!parsed.success) {
      errors.push({
        row: i + 2,
        field: parsed.error.issues[0]?.path?.join('.') || 'unknown',
        message: parsed.error.issues.map((iss) => iss.message).join('; '),
      });
      continue;
    }

    const row = parsed.data;

    // Duplicate detection: facility only (period dates are user-supplied)
    const dedupKey = row.facility.toLowerCase();
    if (seen.has(dedupKey)) {
      duplicateCount++;
      continue;
    }
    seen.add(dedupKey);

    const serviceLine = resolveServiceLine(undefined, row.facility);

    valid.push({
      facility: row.facility.trim(),
      service_line: serviceLine,
      charges: row.charges ?? 0,
      payer_charges: row.payer_charges ?? 0,
      self_charges: row.self_charges ?? 0,
      payments: row.payments ?? 0,
      payer_payments: row.payer_payments ?? 0,
      patient_payments: row.patient_payments ?? 0,
      contractual_adj: row.contractual_adjustments ?? 0,
      payer_withheld: row.payer_withheld ?? 0,
      writeoffs: row.writeoff_adjustments ?? 0,
      refunds: row.refunds ?? 0,
      claim_count: row.claim_count ?? 0,
      patient_count: row.patient_count ?? 0,
      ar_change: row['change_in_a/r'] ?? 0,
    });
  }

  return { valid, errors, duplicateCount };
}

function parseProductivityRows(
  rows: Record<string, string>[]
): { valid: Record<string, unknown>[]; errors: ValidationError[]; duplicateCount: number; dateMin: string; dateMax: string } {
  const valid: Record<string, unknown>[] = [];
  const errors: ValidationError[] = [];
  const seen = new Set<string>();
  let duplicateCount = 0;
  let dateMin = '9999-12-31';
  let dateMax = '0000-01-01';

  for (let i = 0; i < rows.length; i++) {
    const parsed = productivityRowSchema.safeParse(rows[i]);
    if (!parsed.success) {
      errors.push({
        row: i + 2,
        field: parsed.error.issues[0]?.path?.join('.') || 'unknown',
        message: parsed.error.issues.map((iss) => iss.message).join('; '),
      });
      continue;
    }

    const row = parsed.data;

    // Parse and validate date
    const isoDate = parseToIsoDate(row.appointment_date);
    if (!isoDate) {
      errors.push({ row: i + 2, field: 'appointment_date', message: `Invalid date format: ${row.appointment_date}` });
      continue;
    }
    const dateCheck = isDateValid(isoDate);
    if (!dateCheck.valid) {
      errors.push({ row: i + 2, field: 'appointment_date', message: dateCheck.reason! });
      continue;
    }

    // Resolve provider name from whichever field is present
    const providerName =
      row.rendering_provider_name ||
      row['appointment/servicing_provider'] ||
      row.resource_provider_name ||
      null;

    // Duplicate detection
    const dedupKey = `${row.facility.toLowerCase()}|${isoDate}|${row.appointment_start_time ?? ''}|${row.visit_type ?? ''}`;
    if (seen.has(dedupKey)) {
      duplicateCount++;
      continue;
    }
    seen.add(dedupKey);

    const serviceLine = resolveServiceLine(undefined, row.facility);

    // Track date range
    if (isoDate < dateMin) dateMin = isoDate;
    if (isoDate > dateMax) dateMax = isoDate;

    valid.push({
      appointment_date: isoDate,
      facility: row.facility.trim(),
      service_line: serviceLine,
      rendering_provider: providerName ? normalizeProviderName(providerName) : null,
      visit_type: row.visit_type ?? null,
      visit_status: row.visit_status.trim(),
      is_televisit: row.is_televisit ?? false,
      scheduled_duration_min: row['appointment_duration_(scheduled)'] ?? null,
      actual_duration_min: row['appointment_duration_(actual)'] ?? null,
      variance_min: row.variance ?? null,
      wait_time_min: row.wait_time ?? null,
      clinician_time_min: row.time_with_clinician ?? null,
      appointment_start_time: row.appointment_start_time ?? null,
      appointment_end_time: row.appointment_end_time ?? null,
    });
  }

  return { valid, errors, duplicateCount, dateMin, dateMax };
}

// ─── Main Entry Point ───────────────────────────────────────────────

/**
 * Parse a report file (CSV or Excel). Returns the parsed result for
 * preview/confirmation before the actual upload to the server.
 */
export async function parseReport(file: File): Promise<ReportParseResult> {
  // File size check
  if (file.size > MAX_UPLOAD_FILE_SIZE_BYTES) {
    throw new Error(
      `File size (${(file.size / 1024 / 1024).toFixed(1)} MB) exceeds the ${MAX_UPLOAD_FILE_SIZE_BYTES / 1024 / 1024} MB limit.`
    );
  }

  // Read file based on extension
  const ext = file.name.split('.').pop()?.toLowerCase();
  let headers: string[];
  let rows: Record<string, string>[];

  if (ext === 'csv') {
    ({ headers, rows } = await readCsvFile(file));
  } else if (ext === 'xlsx' || ext === 'xls') {
    ({ headers, rows } = await readExcelFile(file));
  } else {
    throw new Error('Unsupported file format. Please upload a CSV or Excel (.xlsx/.xls) file.');
  }

  // Row count check
  if (rows.length < MIN_UPLOAD_ROW_COUNT) {
    throw new Error('File contains no data rows.');
  }
  if (rows.length > MAX_UPLOAD_ROW_COUNT) {
    throw new Error(
      `File has ${rows.length} rows, exceeding the ${MAX_UPLOAD_ROW_COUNT} row limit. Please split the file.`
    );
  }

  // PHI scan (on original headers before transform)
  const phiScan = scanForPhi(headers);
  if (phiScan.hasPhi) {
    // Still return the result so the UI can show which PHI columns were found
    return {
      detection: { reportType: '371.02' as ReportType, confidence: 0, matchedHeaders: [], missingOptional: [] },
      phiScan,
      validRows: [],
      errors: [],
      duplicateCount: 0,
      totalRows: rows.length,
      dateRangeStart: '',
      dateRangeEnd: '',
      fileName: file.name,
      fileSizeBytes: file.size,
    };
  }

  // Report type detection
  const detection = detectReportType(headers);
  if (!detection) {
    throw new Error(
      'Could not identify the report type. Expected one of: Charges at CPT Level (371.02), Financial Analysis (36.14), or Productivity (4.06). Please verify the file has the correct column headers.'
    );
  }

  // Parse based on detected type
  let validRows: Record<string, unknown>[] = [];
  let errors: ValidationError[] = [];
  let duplicateCount = 0;
  let dateRangeStart = '';
  let dateRangeEnd = '';

  switch (detection.reportType) {
    case '371.02': {
      const result = parseChargesRows(rows);
      validRows = result.valid;
      errors = result.errors;
      duplicateCount = result.duplicateCount;
      dateRangeStart = result.dateMin !== '9999-12-31' ? result.dateMin : '';
      dateRangeEnd = result.dateMax !== '0000-01-01' ? result.dateMax : '';
      break;
    }
    case '36.14': {
      const result = parseCollectionsRows(rows);
      validRows = result.valid;
      errors = result.errors;
      duplicateCount = result.duplicateCount;
      // Collections report date range comes from user input — not set here
      break;
    }
    case '4.06': {
      const result = parseProductivityRows(rows);
      validRows = result.valid;
      errors = result.errors;
      duplicateCount = result.duplicateCount;
      dateRangeStart = result.dateMin !== '9999-12-31' ? result.dateMin : '';
      dateRangeEnd = result.dateMax !== '0000-01-01' ? result.dateMax : '';
      break;
    }
  }

  return {
    detection,
    phiScan,
    validRows,
    errors,
    duplicateCount,
    totalRows: rows.length,
    dateRangeStart,
    dateRangeEnd,
    fileName: file.name,
    fileSizeBytes: file.size,
  };
}
