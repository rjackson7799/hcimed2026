import { useState } from 'react';
import { Plus, Building2, Users, Percent, DollarSign } from 'lucide-react';
import { Button } from '@hci/shared/ui/button';
import { Skeleton } from '@hci/shared/ui/skeleton';
import { useFacilities, useFacilityCensus, type FacilityFilters as FilterState } from '@/hooks/useFacilities';
import { getMockFacilityCensus } from '@/lib/mobile-docs-mock-data';
import { FacilityFilters } from './FacilityFilters';
import { FacilityCard } from './FacilityCard';
import { FacilityDetailPanel } from './FacilityDetailPanel';
import { CreateFacilityForm } from './CreateFacilityForm';

export function FacilityDirectory() {
  const [filters, setFilters] = useState<FilterState>({
    type: 'all',
    status: 'all',
    sortColumn: 'name',
    sortDirection: 'asc',
    showArchived: false,
  });
  const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const { data: facilities, isLoading } = useFacilities(filters);

  const handleFiltersChange = (partial: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
  };

  // Compute summary metrics from facilities list
  const summary = computeSummary(facilities ?? []);

  return (
    <div className="space-y-6">
      {/* Summary header */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard icon={Building2} label="Active Facilities" value={summary.activeFacilities} sub={`${summary.pipelineCount} in pipeline`} />
        <SummaryCard icon={Users} label="Total Patients" value={summary.totalPatients} sub="across all locations" />
        <SummaryCard icon={Percent} label="Avg Penetration" value={summary.avgPenetration != null ? `${summary.avgPenetration}%` : '—'} sub="of available beds" />
        <SummaryCard icon={DollarSign} label="Monthly Charges" value={`$${summary.monthlyCharges.toLocaleString()}`} sub="all active facilities" />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1">
          <FacilityFilters filters={filters} onFiltersChange={handleFiltersChange} />
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-1.5" />
          Add Facility
        </Button>
      </div>

      {/* Card grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-lg" />
          ))}
        </div>
      ) : facilities && facilities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {facilities.map((facility) => {
            const census = getMockFacilityCensus(facility.id);
            return (
              <FacilityCard
                key={facility.id}
                facility={facility}
                latestCensus={census}
                onClick={setSelectedFacilityId}
              />
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Building2 className="h-12 w-12 text-muted-foreground/40 mb-3" />
          <h3 className="text-sm font-medium mb-1">No facilities found</h3>
          <p className="text-sm text-muted-foreground">
            Try adjusting your search or filters.
          </p>
        </div>
      )}

      {/* Detail panel */}
      <FacilityDetailPanel
        facilityId={selectedFacilityId}
        onClose={() => setSelectedFacilityId(null)}
      />

      {/* Create dialog */}
      <CreateFacilityForm
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────

function SummaryCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  sub: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
    </div>
  );
}

// ─── Helpers ───────────────────────────────────────────────────────

interface Summary {
  activeFacilities: number;
  pipelineCount: number;
  totalPatients: number;
  avgPenetration: string | null;
  monthlyCharges: number;
}

function computeSummary(facilities: { id: string; status: string; type: string; total_beds: number | null }[]): Summary {
  const active = facilities.filter((f) => f.status === 'Active');
  const pipeline = facilities.filter((f) => f.status === 'Prospecting' || f.status === 'Onboarding');

  let totalPatients = 0;
  let totalBeds = 0;
  let totalPatientsForPenetration = 0;
  let facilitiesWithBeds = 0;

  for (const f of active) {
    const census = getMockFacilityCensus(f.id);
    const patients = census?.active_patients ?? 0;
    totalPatients += patients;

    if (f.type !== 'Homebound' && f.total_beds && f.total_beds > 0) {
      totalBeds += f.total_beds;
      totalPatientsForPenetration += patients;
      facilitiesWithBeds++;
    }
  }

  const avgPenetration = totalBeds > 0
    ? ((totalPatientsForPenetration / totalBeds) * 100).toFixed(1)
    : null;

  return {
    activeFacilities: active.length,
    pipelineCount: pipeline.length,
    totalPatients,
    avgPenetration,
    monthlyCharges: 47200, // Mock value matching KPI data
  };
}
