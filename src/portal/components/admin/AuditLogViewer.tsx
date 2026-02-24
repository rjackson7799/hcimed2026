import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { supabase } from '@/portal/lib/supabase';
import { TableSkeleton } from '@/portal/components/shared/LoadingStates';
import { formatDateTime } from '@/portal/utils/formatters';
import type { AuditLog } from '@/portal/types';

const PAGE_SIZE = 25;

export function AuditLogViewer() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ['audit-log', search, page],
    queryFn: async () => {
      let query = supabase
        .from('audit_log')
        .select('*, profiles:user_id(full_name)', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (search) {
        const term = `%${search}%`;
        query = query.or(`action.ilike.${term},table_name.ilike.${term}`);
      }

      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;
      if (error) throw error;
      return {
        logs: data as (AuditLog & { profiles: { full_name: string } | null })[],
        total: count || 0,
      };
    },
    staleTime: 10_000,
  });

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 0;

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Filter by action or table..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          className="pl-9"
        />
      </div>

      {/* Count */}
      {data && (
        <p className="text-sm text-muted-foreground">
          {data.total} log entr{data.total !== 1 ? 'ies' : 'y'}
        </p>
      )}

      {/* Table */}
      {isLoading ? (
        <TableSkeleton rows={10} />
      ) : data && data.logs.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Table</TableHead>
                <TableHead>Record ID</TableHead>
                <TableHead className="hidden lg:table-cell">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="whitespace-nowrap text-xs">
                    {formatDateTime(log.created_at)}
                  </TableCell>
                  <TableCell className="text-sm">
                    {log.profiles?.full_name || log.user_id?.slice(0, 8) || 'System'}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium">
                      {log.action}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {log.table_name || '—'}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground font-mono">
                    {log.record_id?.slice(0, 8) || '—'}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-xs text-muted-foreground max-w-xs truncate">
                    {log.new_values ? JSON.stringify(log.new_values).slice(0, 100) : '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">
            {search ? 'No log entries match your filter.' : 'No audit log entries yet.'}
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 0}
            onClick={() => setPage(p => p - 1)}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page + 1} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages - 1}
            onClick={() => setPage(p => p + 1)}
          >
            Next
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
