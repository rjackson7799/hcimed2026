import { useState } from 'react';
import type { AwvRegistryFilters } from '@/types/awv-tracker';
import { useAwvRegistry } from '@/hooks/useAwvRegistry';
import { AwvKpiStrip } from './AwvKpiStrip';
import { AwvFilterBar } from './AwvFilterBar';
import { AwvPatientTable } from './AwvPatientTable';
import { AwvDetailPanel } from './AwvDetailPanel';
import { AddPatientDialog } from './AddPatientDialog';

const DEFAULT_FILTERS: AwvRegistryFilters = {
  search: '',
  eligibilityStatus: 'All',
  completionStatus: 'All',
  serviceLine: 'All',
  providerId: 'All',
  eligibilityTiming: 'All',
};

export function RegistryTab() {
  const [filters, setFilters] = useState<AwvRegistryFilters>(DEFAULT_FILTERS);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const { data: patients, isLoading } = useAwvRegistry(filters);

  return (
    <div className="space-y-4">
      <AwvKpiStrip />

      <AwvFilterBar
        filters={filters}
        onFiltersChange={setFilters}
        onAddPatient={() => setAddDialogOpen(true)}
      />

      <AwvPatientTable
        patients={patients ?? []}
        isLoading={isLoading}
        onSelectPatient={(id) => setSelectedPatientId(id)}
      />

      <AwvDetailPanel
        patientId={selectedPatientId}
        onClose={() => setSelectedPatientId(null)}
      />

      <AddPatientDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
      />
    </div>
  );
}
