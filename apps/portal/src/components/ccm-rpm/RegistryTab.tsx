import { useState } from 'react';
import { Button } from '@hci/shared/ui/button';
import { UserPlus } from 'lucide-react';
import type { CcmRegistryFilters, CcmPatientWithEnrollment } from '@/types/ccm-rpm';
import { useCcmRegistry } from '@/hooks/useCcmRegistry';
import { CcmRpmKpiStrip } from './CcmRpmKpiStrip';
import { CcmRpmFilterBar } from './CcmRpmFilterBar';
import { CcmPatientTable } from './CcmPatientTable';
import { AddCcmPatientDialog } from './AddCcmPatientDialog';
import { CcmDetailPanel } from './CcmDetailPanel';

const defaultFilters: CcmRegistryFilters = {
  search: '',
  enrollmentStatus: 'All',
  programType: 'All',
  serviceLine: 'All',
  providerId: 'All',
  deviceFilter: 'All',
};

export function RegistryTab() {
  const [filters, setFilters] = useState<CcmRegistryFilters>(defaultFilters);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<CcmPatientWithEnrollment | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const { data: patients = [], isLoading } = useCcmRegistry(filters);

  const handlePatientClick = (patient: CcmPatientWithEnrollment) => {
    setSelectedPatient(patient);
    setDetailOpen(true);
  };

  return (
    <div className="space-y-4">
      <CcmRpmKpiStrip />

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {!isLoading && `${patients.length} patient${patients.length !== 1 ? 's' : ''}`}
        </div>
        <Button size="sm" onClick={() => setAddDialogOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Patient
        </Button>
      </div>

      <CcmRpmFilterBar filters={filters} onFiltersChange={setFilters} />

      <CcmPatientTable
        patients={patients}
        isLoading={isLoading}
        onPatientClick={handlePatientClick}
      />

      <AddCcmPatientDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
      />

      <CcmDetailPanel
        patient={selectedPatient}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  );
}
