import { Link } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import { useProjects } from '@/portal/hooks/useProjects';
import { StatusBadge } from '@/portal/components/shared/StatusBadge';
import { TableSkeleton } from '@/portal/components/shared/LoadingStates';
import { ProjectCreateDialog } from './ProjectCreateDialog';
import { formatDate } from '@/portal/utils/formatters';

export function ProjectManager() {
  const { data: projects, isLoading, error } = useProjects();

  if (isLoading) return <TableSkeleton rows={3} />;
  if (error) return <p className="text-destructive">Failed to load projects.</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Projects</h2>
          <p className="text-sm text-muted-foreground">Manage outreach campaigns</p>
        </div>
        <ProjectCreateDialog />
      </div>

      {projects && projects.length > 0 ? (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden sm:table-cell">Created</TableHead>
                <TableHead className="hidden md:table-cell">Broker Email</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">{project.name}</TableCell>
                  <TableCell>
                    <StatusBadge status={project.status} type="project" />
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground">
                    {formatDate(project.created_at)}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {project.broker_email || '—'}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/portal/admin/projects/${project.id}`}>
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground mb-4">No projects yet. Create your first outreach project.</p>
          <ProjectCreateDialog />
        </div>
      )}
    </div>
  );
}
