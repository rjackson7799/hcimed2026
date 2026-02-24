import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { useProject } from '@/portal/hooks/useProjects';
import { StatusBadge } from '@/portal/components/shared/StatusBadge';
import { CsvUploader } from '@/portal/components/admin/CsvUploader';
import { StaffAssignment } from '@/portal/components/admin/StaffAssignment';
import { PageSkeleton } from '@/portal/components/shared/LoadingStates';
import { formatDate } from '@/portal/utils/formatters';

export function AdminProjectDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: project, isLoading, error, refetch } = useProject(id!);

  if (isLoading) return <PageSkeleton />;
  if (error || !project) {
    return <p className="text-destructive">Project not found.</p>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/portal/admin/projects">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Projects
          </Link>
        </Button>
      </div>

      {/* Project Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{project.name}</CardTitle>
            <StatusBadge status={project.status} type="project" size="md" />
          </div>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            {project.description && (
              <div className="sm:col-span-2">
                <dt className="text-muted-foreground">Description</dt>
                <dd>{project.description}</dd>
              </div>
            )}
            <div>
              <dt className="text-muted-foreground">Created</dt>
              <dd>{formatDate(project.created_at)}</dd>
            </div>
            {project.broker_email && (
              <div>
                <dt className="text-muted-foreground">Broker Email</dt>
                <dd>{project.broker_email}</dd>
              </div>
            )}
            {project.target_start && (
              <div>
                <dt className="text-muted-foreground">Target Start</dt>
                <dd>{formatDate(project.target_start)}</dd>
              </div>
            )}
            {project.target_end && (
              <div>
                <dt className="text-muted-foreground">Target End</dt>
                <dd>{formatDate(project.target_end)}</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      {/* CSV Upload */}
      <CsvUploader projectId={project.id} onImportComplete={() => refetch()} />

      {/* Staff Assignment */}
      <StaffAssignment projectId={project.id} />
    </div>
  );
}
