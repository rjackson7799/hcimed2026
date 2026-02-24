import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { formatRelativeTime } from '@/portal/utils/formatters';
import type { StaffActivity } from '@/portal/types';

interface StaffActivityTableProps {
  data: StaffActivity[];
}

export function StaffActivityTable({ data }: StaffActivityTableProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-sm font-medium mb-4">Staff Activity</p>
        <p className="text-sm text-muted-foreground text-center py-4">No staff activity yet</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <p className="text-sm font-medium mb-4">Staff Activity</p>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Staff Member</TableHead>
              <TableHead className="text-right">Today</TableHead>
              <TableHead className="text-right">This Week</TableHead>
              <TableHead className="text-right">Total Calls</TableHead>
              <TableHead className="text-right">Unique Patients</TableHead>
              <TableHead>Last Call</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.staff_id}>
                <TableCell className="font-medium">{row.staff_name}</TableCell>
                <TableCell className="text-right">{row.calls_today}</TableCell>
                <TableCell className="text-right">{row.calls_this_week}</TableCell>
                <TableCell className="text-right">{row.total_calls}</TableCell>
                <TableCell className="text-right">{row.unique_patients_contacted}</TableCell>
                <TableCell className="text-muted-foreground">
                  {row.last_call_at ? formatRelativeTime(row.last_call_at) : 'Never'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
