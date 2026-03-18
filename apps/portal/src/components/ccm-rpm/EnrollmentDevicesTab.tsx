import { useQuery } from '@tanstack/react-query';
import { Card } from '@hci/shared/ui/card';
import { Skeleton } from '@hci/shared/ui/skeleton';
import { cn } from '@hci/shared/lib/utils';
import { Users, Cpu, ShieldCheck, AlertTriangle } from 'lucide-react';
import { getMockCcmPatients, getMockDeviceSummary } from '@/lib/ccm-rpm-mock-data';
import { useCcmKpiSummary } from '@/hooks/useCcmRegistry';
import { ENROLLMENT_STATUS_CONFIG, DEVICE_TYPE_CONFIG } from '@/lib/ccm-rpm-constants';
import type { CcmPatientWithEnrollment } from '@/types/ccm-rpm';

export function EnrollmentDevicesTab() {
  const { data: kpi, isLoading: kpiLoading } = useCcmKpiSummary();
  const { data: patients, isLoading: patientsLoading } = useQuery({
    queryKey: ['ccm', 'all-patients'],
    queryFn: () => getMockCcmPatients(),
    staleTime: 30_000,
  });
  const { data: deviceSummary, isLoading: devicesLoading } = useQuery({
    queryKey: ['ccm', 'device-summary'],
    queryFn: () => getMockDeviceSummary(),
    staleTime: 30_000,
  });

  if (kpiLoading || patientsLoading || devicesLoading) {
    return (
      <div className="space-y-6">
        <Card className="p-5">
          <Skeleton className="h-4 w-40 mb-4" />
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </Card>
        <Card className="p-5">
          <Skeleton className="h-4 w-36 mb-4" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </Card>
        <Card className="p-5">
          <Skeleton className="h-4 w-40 mb-4" />
          <Skeleton className="h-16 w-full" />
        </Card>
      </div>
    );
  }

  // Section 1: Enrollment Worklist
  const eligiblePatients = (patients ?? []).filter(
    (p) => p.enrollment.enrollment_status === 'Eligible'
  );
  // Group by provider
  const groupedByProvider = eligiblePatients.reduce<
    Record<string, CcmPatientWithEnrollment[]>
  >((acc, p) => {
    const key = p.provider_name ?? 'Unassigned';
    (acc[key] ??= []).push(p);
    return acc;
  }, {});

  // Section 3: Consent Compliance
  const enrolledMissingConsent = (patients ?? []).filter(
    (p) =>
      p.enrollment.enrollment_status === 'Enrolled' &&
      !p.enrollment.consent_obtained
  );

  return (
    <div className="space-y-6">
      {/* Section 1: Enrollment Worklist */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Enrollment Worklist</h3>
          <span className="ml-auto text-xs text-muted-foreground">
            {eligiblePatients.length} eligible patient
            {eligiblePatients.length !== 1 ? 's' : ''} awaiting enrollment
          </span>
        </div>

        {Object.keys(groupedByProvider).length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No eligible patients — all patients have been processed
          </p>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedByProvider).map(([provider, pts]) => (
              <div key={provider}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium text-foreground">
                    {provider}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({pts.length})
                  </span>
                </div>
                <div className="rounded-lg border border-border divide-y divide-border">
                  {pts.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between px-3 py-2 text-sm"
                    >
                      <div>
                        <span className="font-medium">{p.last_name}</span>
                        <span className="ml-2 text-xs text-muted-foreground">
                          ECW# {p.ecw_patient_id}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {p.service_line}
                        </span>
                        <span
                          className={cn(
                            'rounded px-2 py-0.5 text-xs font-medium',
                            ENROLLMENT_STATUS_CONFIG['Eligible'].bg,
                            ENROLLMENT_STATUS_CONFIG['Eligible'].text
                          )}
                        >
                          Eligible
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Section 2: Device Inventory */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Cpu className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Device Inventory</h3>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-4">
          <div className="rounded-lg bg-emerald-950/50 p-3">
            <p className="text-xs font-medium text-emerald-300">
              Active Devices
            </p>
            <p className="mt-1 text-2xl font-bold text-emerald-300">
              {deviceSummary?.totalActive ?? 0}
            </p>
          </div>
          <div className="rounded-lg bg-slate-800 p-3">
            <p className="text-xs font-medium text-slate-300">Non-Active</p>
            <p className="mt-1 text-2xl font-bold text-slate-300">
              {deviceSummary?.nonActiveCount ?? 0}
            </p>
          </div>
          <div className="rounded-lg bg-blue-950/50 p-3">
            <p className="text-xs font-medium text-blue-300">Coverage Rate</p>
            <p className="mt-1 text-2xl font-bold text-blue-300">
              {deviceSummary?.coverageRate ?? 0}%
            </p>
            <p className="text-xs text-blue-300/60">
              RPM patients with devices
            </p>
          </div>
          <div className="rounded-lg bg-purple-950/50 p-3">
            <p className="text-xs font-medium text-purple-300">RPM Enrolled</p>
            <p className="mt-1 text-2xl font-bold text-purple-300">
              {(kpi?.rpmOnlyCount ?? 0) + (kpi?.dualCount ?? 0)}
            </p>
          </div>
        </div>

        {/* Device type breakdown */}
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          By Type
        </h4>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {deviceSummary &&
            Object.entries(deviceSummary.byType)
              .filter(([, count]) => count > 0)
              .map(([type, count]) => {
                const cfg =
                  DEVICE_TYPE_CONFIG[type as keyof typeof DEVICE_TYPE_CONFIG];
                return (
                  <div
                    key={type}
                    className={cn(
                      'rounded px-3 py-2 flex items-center justify-between',
                      cfg.bg
                    )}
                  >
                    <span className={cn('text-xs font-medium', cfg.text)}>
                      {type}
                    </span>
                    <span className={cn('text-sm font-bold', cfg.text)}>
                      {count}
                    </span>
                  </div>
                );
              })}
        </div>
      </Card>

      {/* Section 3: Consent Compliance */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Consent Compliance</h3>
          {(kpi?.consentMissing ?? 0) > 0 && (
            <div className="ml-auto flex items-center gap-1 text-amber-300">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">
                {kpi?.consentMissing} missing consent
              </span>
            </div>
          )}
        </div>

        {enrolledMissingConsent.length === 0 ? (
          <div className="flex items-center gap-2 rounded-md bg-emerald-950/30 px-3 py-4 text-sm text-emerald-300">
            <ShieldCheck className="h-4 w-4" />
            All enrolled patients have documented consent
          </div>
        ) : (
          <div className="space-y-2">
            <div className="rounded-lg border border-amber-900/50 bg-amber-950/20 px-3 py-2 text-xs text-amber-300">
              <AlertTriangle className="mr-1 inline h-3 w-3" />
              {enrolledMissingConsent.length} enrolled patient
              {enrolledMissingConsent.length !== 1 ? 's' : ''} missing
              documented consent
            </div>
            <div className="rounded-lg border border-border divide-y divide-border">
              {enrolledMissingConsent.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between px-3 py-2 text-sm"
                >
                  <div>
                    <span className="font-medium">{p.last_name}</span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      ECW# {p.ecw_patient_id}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {p.provider_name ?? 'Unassigned'}
                    </span>
                    <span className="text-xs text-amber-300">No consent</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Consent stats */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">
              {kpi?.enrolledCount ?? 0}
            </p>
            <p className="text-xs text-muted-foreground">Total Enrolled</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-400">
              {(kpi?.enrolledCount ?? 0) - (kpi?.consentMissing ?? 0)}
            </p>
            <p className="text-xs text-muted-foreground">With Consent</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-amber-400">
              {kpi?.consentMissing ?? 0}
            </p>
            <p className="text-xs text-muted-foreground">Missing Consent</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
