import { useState } from 'react';
import { Button } from '@hci/shared/ui/button';
import { Cpu, Plus } from 'lucide-react';
import { useCcmDevices, useCcmUpdateDeviceStatus } from '@/hooks/useCcmEnrollment';
import { DEVICE_TYPE_CONFIG, DEVICE_STATUS_CONFIG } from '@/lib/ccm-rpm-constants';
import type { CcmProgramType, CcmDevice } from '@/types/ccm-rpm';
import { cn } from '@hci/shared/lib/utils';
import { AddDeviceDialog } from './AddDeviceDialog';

interface DeviceSectionProps {
  enrollmentId: string;
  programType: CcmProgramType | null;
}

const RPM_PROGRAM_TYPES: CcmProgramType[] = ['RPM Only', 'CCM + RPM'];

export function DeviceSection({ enrollmentId, programType }: DeviceSectionProps) {
  const [addOpen, setAddOpen] = useState(false);
  const { data: devices = [] } = useCcmDevices(enrollmentId);
  const updateStatus = useCcmUpdateDeviceStatus();

  const isRpmEligible = programType !== null && RPM_PROGRAM_TYPES.includes(programType);

  if (!isRpmEligible) {
    return (
      <div className="p-5">
        <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-3">
          <Cpu className="h-4 w-4" />
          RPM Devices
        </h3>
        <p className="text-sm text-muted-foreground/60">
          RPM device tracking available for RPM-enrolled patients
        </p>
      </div>
    );
  }

  const activeCount = devices.filter((d) => d.device_status === 'Active').length;

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Cpu className="h-4 w-4" />
          RPM Devices
        </h3>
        <Button size="sm" variant="outline" onClick={() => setAddOpen(true)}>
          <Plus className="mr-1 h-3.5 w-3.5" />
          Add Device
        </Button>
      </div>

      <p className="text-xs text-muted-foreground mb-3">
        {activeCount} active device{activeCount !== 1 ? 's' : ''}
      </p>

      {devices.length === 0 ? (
        <p className="text-sm text-muted-foreground/60">No devices assigned yet.</p>
      ) : (
        <div className="space-y-3">
          {devices.map((device) => (
            <DeviceCard
              key={device.id}
              device={device}
              onStatusChange={(status) =>
                updateStatus.mutate({ deviceId: device.id, status })
              }
              isPending={updateStatus.isPending}
            />
          ))}
        </div>
      )}

      <AddDeviceDialog open={addOpen} onOpenChange={setAddOpen} enrollmentId={enrollmentId} />
    </div>
  );
}

// ─── Device Card ──────────────────────────────────────────────────

interface DeviceCardProps {
  device: CcmDevice;
  onStatusChange: (status: CcmDevice['device_status']) => void;
  isPending: boolean;
}

function DeviceCard({ device, onStatusChange, isPending }: DeviceCardProps) {
  const typeConfig = DEVICE_TYPE_CONFIG[device.device_type];
  const statusConfig = DEVICE_STATUS_CONFIG[device.device_status];
  const isActive = device.device_status === 'Active';

  return (
    <div className="rounded-md border p-3 space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        {/* Device type badge */}
        <span className={cn('inline-flex items-center rounded px-2 py-0.5 text-xs font-medium', typeConfig.bg, typeConfig.text)}>
          {device.device_type}
        </span>

        {/* Status badge */}
        <span className={cn('inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-xs font-medium', statusConfig.bg, statusConfig.text)}>
          <span className={cn('h-1.5 w-1.5 rounded-full', statusConfig.dotClass)} />
          {device.device_status}
        </span>
      </div>

      <p className="text-xs text-muted-foreground">
        Assigned: {device.assigned_date}
      </p>

      {device.notes && (
        <p className="text-xs text-muted-foreground/80">{device.notes}</p>
      )}

      {isActive && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs text-blue-400 border-blue-800 hover:bg-blue-950/50"
            disabled={isPending}
            onClick={() => onStatusChange('Returned')}
          >
            Returned
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs text-red-400 border-red-800 hover:bg-red-950/50"
            disabled={isPending}
            onClick={() => onStatusChange('Lost')}
          >
            Lost
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs text-amber-400 border-amber-800 hover:bg-amber-950/50"
            disabled={isPending}
            onClick={() => onStatusChange('Malfunctioning')}
          >
            Malfunction
          </Button>
        </div>
      )}
    </div>
  );
}
