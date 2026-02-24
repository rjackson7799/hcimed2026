import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { PatientCsvRow } from '@/portal/schemas/patientCsvSchema';

interface CsvPreviewTableProps {
  rows: PatientCsvRow[];
}

export function CsvPreviewTable({ rows }: CsvPreviewTableProps) {
  return (
    <div className="rounded-lg border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>DOB</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead className="hidden sm:table-cell">Insurance</TableHead>
            <TableHead className="hidden md:table-cell">Member ID</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, i) => (
            <TableRow key={i}>
              <TableCell className="font-medium">
                {row.last_name}, {row.first_name}
              </TableCell>
              <TableCell>{row.date_of_birth}</TableCell>
              <TableCell>{row.phone_primary}</TableCell>
              <TableCell className="hidden sm:table-cell">
                {row.current_insurance || '—'}
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {row.member_id || '—'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {rows.length >= 10 && (
        <p className="p-2 text-center text-xs text-muted-foreground">
          Showing first 10 rows of preview
        </p>
      )}
    </div>
  );
}
