export function CalendarLegend() {
  return (
    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
      <div className="flex items-center gap-1.5">
        <div className="h-3 w-3 rounded-sm bg-primary/20 border border-primary/30" />
        <span>Working</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="h-3 w-3 rounded-sm bg-amber-100 border border-amber-300" />
        <span>Time Off</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="h-3 w-3 rounded-sm bg-red-100 border border-red-300" />
        <span>Coverage Gap</span>
      </div>
    </div>
  );
}
