import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { useProject } from '@/portal/hooks/useProjects';
import { useProjectSummary, useStaffActivity, useDailyCallVolume } from '@/portal/hooks/useDashboard';
import { useRealtime } from '@/portal/hooks/useRealtime';
import { StatusBadge } from '@/portal/components/shared/StatusBadge';
import { ExportButton } from '@/portal/components/shared/ExportButton';
import { CsvUploader } from '@/portal/components/admin/CsvUploader';
import { ProjectAssignments } from '@/portal/components/admin/ProjectAssignments';
import { SummaryCards } from '@/portal/components/admin/SummaryCards';
import { DispositionChart } from '@/portal/components/admin/DispositionChart';
import { DailyCallChart } from '@/portal/components/admin/DailyCallChart';
import { PipelineFunnel } from '@/portal/components/admin/PipelineFunnel';
import { StaffActivityTable } from '@/portal/components/admin/StaffActivityTable';
import { PageSkeleton } from '@/portal/components/shared/LoadingStates';
import { formatDate } from '@/portal/utils/formatters';

export function AdminProjectDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: project, isLoading, error, refetch } = useProject(id!);

  // Dashboard data hooks
  useRealtime(id ?? null);
  const { data: summary, isLoading: summaryLoading } = useProjectSummary(id ?? '');
  const { data: staffActivity } = useStaffActivity(id ?? '');
  const { data: dailyVolume } = useDailyCallVolume(id ?? '');

  if (isLoading) return <PageSkeleton />;
  if (error || !project) {
    return <p className="text-destructive">Project not found.</p>;
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-2 flex items-center justify-between">
        <Button variant="ghost" size="sm" className="-ml-3" asChild>
          <Link to="/portal/admin/projects">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Projects
          </Link>
        </Button>
        <ExportButton projectId={project.id} projectName={project.name} />
      </div>

      <div className="space-y-6">
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

      {/* Dashboard Summary */}
      {summaryLoading ? (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : summary ? (
        <>
          <SummaryCards summary={summary} />
          <div className="grid gap-6 lg:grid-cols-2">
            <DispositionChart summary={summary} />
            <PipelineFunnel summary={summary} />
          </div>
        </>
      ) : null}

      {dailyVolume && <DailyCallChart data={dailyVolume} />}
      {staffActivity && <StaffActivityTable data={staffActivity} />}

      {/* CSV Upload */}
      <CsvUploader projectId={project.id} onImportComplete={() => refetch()} />

      {/* Assignments */}
      <ProjectAssignments projectId={project.id} />
      </div>
    </div>
  );
}
