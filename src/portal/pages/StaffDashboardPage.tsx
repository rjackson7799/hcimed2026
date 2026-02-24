import { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Users, Phone, AlertCircle } from 'lucide-react';
import { useAuth } from '@/portal/context/AuthContext';
import { useMyProjects } from '@/portal/hooks/useMyProjects';
import { PatientQueue } from '@/portal/components/staff/PatientQueue';
import { PageSkeleton } from '@/portal/components/shared/LoadingStates';

export function StaffDashboardPage() {
  const { profile } = useAuth();
  const { data: projects, isLoading } = useMyProjects();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Auto-select first project when loaded
  useEffect(() => {
    if (projects && projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  if (isLoading) return <PageSkeleton />;

  if (!projects || projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <div className="rounded-full bg-muted p-4">
          <AlertCircle className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="text-center">
          <h2 className="text-lg font-semibold">No Projects Assigned</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Contact your administrator to be assigned to a project.
          </p>
        </div>
      </div>
    );
  }

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  return (
    <div className="space-y-6">
      {/* Header with project selector */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display">Patient Outreach</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Welcome, {profile?.full_name ?? 'Staff'}
          </p>
        </div>

        {projects.length > 1 && (
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

      {/* Project info card */}
      {selectedProject && (
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium">{selectedProject.name}</p>
              {selectedProject.description && (
                <p className="text-sm text-muted-foreground truncate">
                  {selectedProject.description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>Outreach Queue</span>
            </div>
          </div>
        </Card>
      )}

      {/* Patient queue */}
      {selectedProjectId && (
        <PatientQueue projectId={selectedProjectId} />
      )}
    </div>
  );
}
