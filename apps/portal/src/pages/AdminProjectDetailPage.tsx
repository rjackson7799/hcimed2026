import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@hci/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@hci/shared/ui/card';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { useProject } from '@/hooks/useProjects';
import { useProjectSummary, useStaffActivity, useDailyCallVolume } from '@/hooks/useDashboard';
import { useRealtime } from '@/hooks/useRealtime';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ExportButton } from '@/components/shared/ExportButton';
import { CsvUploader } from '@/components/admin/CsvUploader';
import { AddPatientDialog } from '@/components/admin/AddPatientDialog';
import { ProjectAssignments } from '@/components/admin/ProjectAssignments';
import { useProjectAssignments } from '@/hooks/useProjectAssignments';
import { SummaryCards } from '@/components/admin/SummaryCards';
import { DispositionChart } from '@/components/admin/DispositionChart';
import { DailyCallChart } from '@/components/admin/DailyCallChart';
import { PipelineFunnel } from '@/components/admin/PipelineFunnel';
import { StaffActivityTable } from '@/components/admin/StaffActivityTable';
import { PageSkeleton } from '@/components/shared/LoadingStates';
import { formatDate } from '@/utils/formatters';

export function AdminProjectDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [addOpen, setAddOpen] = useState(false);
  const { data: project, isLoading, error, refetch } = useProject(id!);

  const { data: assignments } = useProjectAssignments(id!);
  const assignedBrokers = (assignments || []).filter((a: any) => a.role_in_project === 'broker');
  const assignedStaff = (assignments || []).filter((a: any) => a.role_in_project === 'staff');

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
          <Link to="/admin/projects">
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
            {assignedBrokers.length > 0 && (
              <div>
                <dt className="text-muted-foreground">
                  {assignedBrokers.length > 1 ? 'Brokers' : 'Broker'}
                </dt>
                <dd>
                  {assignedBrokers.map((a: any) => {
                    const p = a.profiles;
                    return p.phone ? `${p.full_name} (${p.phone})` : p.full_name;
                  }).join(', ')}
                </dd>
              </div>
            )}
            {assignedStaff.length > 0 && (
              <div>
                <dt className="text-muted-foreground">Staff</dt>
                <dd>{assignedStaff.map((a: any) => a.profiles.full_name).join(', ')}</dd>
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

      {/* Add Patients */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Add Patients</CardTitle>
            <Button size="sm" onClick={() => setAddOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Patient
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <CsvUploader projectId={project.id} onImportComplete={() => refetch()} />
        </CardContent>
      </Card>
      <AddPatientDialog open={addOpen} onOpenChange={setAddOpen} projectId={project.id} />

      {/* Assignments */}
      <ProjectAssignments projectId={project.id} />
      </div>
    </div>
  );
}
