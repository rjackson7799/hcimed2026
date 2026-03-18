import type { Facility } from '@/types/mobile-docs';

interface FacilityMapTooltipProps {
  facility: Facility;
  activePatients: number;
}

export function FacilityMapTooltip({ facility, activePatients }: FacilityMapTooltipProps) {
  return (
    <div className="min-w-[180px] space-y-1 text-sm">
      <p className="font-semibold">{facility.name}</p>
      <p className="text-xs text-muted-foreground">{facility.type}</p>
      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs pt-1 border-t">
        <span className="text-muted-foreground">Patients</span>
        <span className="font-medium text-right">{activePatients}</span>
        {facility.distance_miles != null && (
          <>
            <span className="text-muted-foreground">Distance</span>
            <span className="font-medium text-right">{facility.distance_miles.toFixed(1)} mi</span>
          </>
        )}
        {facility.drive_minutes != null && (
          <>
            <span className="text-muted-foreground">Drive Time</span>
            <span className="font-medium text-right">{facility.drive_minutes} min</span>
          </>
        )}
      </div>
    </div>
  );
}
