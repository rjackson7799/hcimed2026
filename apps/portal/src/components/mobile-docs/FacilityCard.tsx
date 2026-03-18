import { ArrowRight, Users, BedDouble, MapPin } from 'lucide-react';
import { cn } from '@hci/shared/lib/utils';
import type { Facility, FacilityCensus } from '@/types/mobile-docs';
import {
  FACILITY_TYPE_COLORS,
  FACILITY_STATUS_DOT_COLORS,
} from '@/lib/mobile-docs-constants';

interface FacilityCardProps {
  facility: Facility;
  latestCensus?: FacilityCensus | null;
  onClick: (id: string) => void;
}

export function FacilityCard({ facility, latestCensus, onClick }: FacilityCardProps) {
  const typeColor = FACILITY_TYPE_COLORS[facility.type];
  const statusDot = FACILITY_STATUS_DOT_COLORS[facility.status];

  return (
    <div
      onClick={() => onClick(facility.id)}
      className={cn(
        'rounded-lg border bg-card p-4 cursor-pointer transition-all hover:shadow-md hover:border-primary/40',
        facility.status === 'Inactive' && 'opacity-60'
      )}
    >
      {/* Header badges */}
      <div className="flex items-center gap-2 mb-2">
        <span
          className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
          style={{ backgroundColor: typeColor.bg, color: typeColor.text }}
        >
          {facility.type}
        </span>
        <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span className={cn('h-2 w-2 rounded-full', statusDot)} />
          {facility.status}
        </span>
      </div>

      {/* Name & address */}
      <h3 className="text-sm font-semibold truncate mb-0.5">{facility.name}</h3>
      <p className="text-xs text-muted-foreground truncate mb-3">
        {facility.address_line1}, {facility.city}
      </p>

      {/* Metrics row */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="flex items-center gap-1.5 text-xs">
          <Users className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="font-medium">{latestCensus?.active_patients ?? '—'}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <BedDouble className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="font-medium">
            {facility.type === 'Homebound' ? 'N/A' : (facility.total_beds ?? '—')}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="font-medium">
            {facility.distance_miles != null ? `${facility.distance_miles} mi` : '—'}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
          <span>{facility.assigned_provider_id ? 'Assigned' : 'Unassigned'}</span>
          <span>{facility.visit_cadence !== 'TBD' ? facility.visit_cadence : '—'}</span>
        </div>
        <span className="inline-flex items-center gap-1 text-primary font-medium">
          View <ArrowRight className="h-3 w-3" />
        </span>
      </div>
    </div>
  );
}
