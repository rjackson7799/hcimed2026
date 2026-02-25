import type { Patient } from '@/portal/types';

const CSV_HEADERS = [
  'First Name',
  'Last Name',
  'Phone',
  'Member ID',
  'Current Insurance',
  'Target Insurance',
  'Status',
  'Total Attempts',
  'Last Contacted',
  'Address',
];

function escapeCSV(value: string | null | undefined): string {
  if (!value) return '';
  let str = String(value);
  // Prevent CSV formula injection (DDE attacks) by escaping trigger characters
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes("'")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function patientsToCSV(patients: Patient[]): string {
  const rows = patients.map((p) => [
    escapeCSV(p.first_name),
    escapeCSV(p.last_name),
    escapeCSV(p.phone_primary),
    escapeCSV(p.member_id),
    escapeCSV(p.current_insurance),
    escapeCSV(p.target_insurance),
    escapeCSV(p.outreach_status),
    String(p.total_attempts),
    escapeCSV(p.last_contacted_at),
    escapeCSV(
      [p.address_line1, p.address_city, p.address_state, p.address_zip]
        .filter(Boolean)
        .join(', ')
    ),
  ]);

  return [CSV_HEADERS.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

export function downloadBlob(content: string, filename: string, mimeType = 'text/csv') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
