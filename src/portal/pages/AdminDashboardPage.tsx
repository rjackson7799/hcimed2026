import { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/portal/context/AuthContext';
import { useProjects } from '@/portal/hooks/useProjects';
import { useProjectSummary, useStaffActivity, useDailyCallVolume } from '@/portal/hooks/useDashboard';
import { useRealtime } from '@/portal/hooks/useRealtime';
import { SummaryCards } from '@/portal/components/admin/SummaryCards';
import { DispositionChart } from '@/portal/components/admin/DispositionChart';
import { DailyCallChart } from '@/portal/components/admin/DailyCallChart';
import { PipelineFunnel } from '@/portal/components/admin/PipelineFunnel';
import { StaffActivityTable } from '@/portal/components/admin/StaffActivityTable';
import { ExportButton } from '@/portal/components/shared/ExportButton';
import { PageSkeleton } from '@/portal/components/shared/LoadingStates';

export function AdminDashboardPage() {
  const { profile } = useAuth();
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Auto-select first project
  useEffect(() => {
    if (projects && projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  // Subscribe to realtime updates
  useRealtime(selectedProjectId);

  const { data: summary, isLoading: summaryLoading } = useProjectSummary(selectedProjectId || '');
  const { data: staffActivity } = useStaffActivity(selectedProjectId || '');
  const { data: dailyVolume } = useDailyCallVolume(selectedProjectId || '');

  if (projectsLoading) return <PageSkeleton />;

  const selectedProject = projects?.find(p => p.id === selectedProjectId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Welcome, {profile?.full_name ?? 'Admin'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {selectedProjectId && selectedProject && (
            <ExportButton
              projectId={selectedProjectId}
              projectName={selectedProject.name}
            />
          )}

          {projects && projects.length > 0 && (
            <Select
              value={selectedProjectId || ''}
              onValueChange={setSelectedProjectId}
            >
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* No projects state */}
      {(!projects || projects.length === 0) && (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">
            No projects yet. Create a project from the Projects page to get started.
          </p>
        </div>
      )}

      {/* Dashboard content */}
      {selectedProjectId && selectedProject && (
        <>
          <h2 className="text-lg font-semibold font-display">{selectedProject.name}</h2>

          {/* Summary cards */}
          {summaryLoading ? (
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-24 rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          ) : summary ? (
            <SummaryCards summary={summary} />
          ) : null}

          {/* Charts row */}
          <div className="grid gap-6 lg:grid-cols-2">
            {summary && <DispositionChart summary={summary} />}
            {summary && <PipelineFunnel summary={summary} />}
          </div>

          {/* Daily call volume */}
          {dailyVolume && <DailyCallChart data={dailyVolume} />}

          {/* Staff activity */}
          {staffActivity && <StaffActivityTable data={staffActivity} />}
        </>
      )}
    </div>
  );
}
