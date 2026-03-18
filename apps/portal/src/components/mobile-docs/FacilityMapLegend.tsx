import { MAP_PIN_COLORS, MAP_PIN_SIZE } from '@/lib/mobile-docs-constants';

export function FacilityMapLegend() {
  return (
    <div className="absolute bottom-4 left-4 z-[1000] rounded-lg border bg-background/95 backdrop-blur p-3 shadow-lg max-w-[280px]">
      <h4 className="text-xs font-semibold mb-2">Legend</h4>

      {/* Facility Type Colors */}
      <div className="space-y-1 mb-3">
        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Type</p>
        {(Object.entries(MAP_PIN_COLORS) as [string, string][]).map(([type, color]) => (
          <div key={type} className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
            <span className="text-xs">{type}</span>
          </div>
        ))}
      </div>

      {/* Size Scale */}
      <div className="space-y-1 mb-3">
        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Size = Patients</p>
        <div className="flex items-end gap-3 px-1">
          <div className="flex flex-col items-center">
            <span className="rounded-full bg-slate-400" style={{ width: MAP_PIN_SIZE.min * 2, height: MAP_PIN_SIZE.min * 2 }} />
            <span className="text-[10px] mt-0.5">0</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="rounded-full bg-slate-400" style={{ width: 24, height: 24 }} />
            <span className="text-[10px] mt-0.5">~10</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="rounded-full bg-slate-400" style={{ width: MAP_PIN_SIZE.max * 2, height: MAP_PIN_SIZE.max * 2 }} />
            <span className="text-[10px] mt-0.5">{MAP_PIN_SIZE.maxPatients}+</span>
          </div>
        </div>
      </div>

      {/* Status Border */}
      <div className="space-y-1">
        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Status</p>
        <div className="grid grid-cols-2 gap-1 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-slate-400" />
            <span>Active</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-slate-400 opacity-60" />
            <span>Onboarding</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full border-2 border-dashed border-slate-400" />
            <span>Prospecting</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-slate-400 opacity-30" />
            <span>Inactive</span>
          </div>
        </div>
      </div>
    </div>
  );
}
