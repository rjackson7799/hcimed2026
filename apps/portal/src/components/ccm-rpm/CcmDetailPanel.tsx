import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@hci/shared/ui/sheet';
import { Textarea } from '@hci/shared/ui/textarea';
import { Button } from '@hci/shared/ui/button';
import { cn } from '@hci/shared/lib/utils';
import { Link as LinkIcon, Save } from 'lucide-react';
import { EnrollmentSection } from './EnrollmentSection';
import { DeviceSection } from './DeviceSection';
import { ReimbursementSection } from './ReimbursementSection';
import { CCM_SERVICE_LINE_CONFIG, CCM_MEDICARE_STATUS_CONFIG } from '@/lib/ccm-rpm-constants';
import { checkAwvCrossRef } from '@/lib/ccm-rpm-mock-data';
import { useCcmUpdateEnrollment } from '@/hooks/useCcmEnrollment';
import type { CcmPatientWithEnrollment } from '@/types/ccm-rpm';

interface CcmDetailPanelProps {
  patient: CcmPatientWithEnrollment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CcmDetailPanel({ patient, open, onOpenChange }: CcmDetailPanelProps) {
  const updateEnrollment = useCcmUpdateEnrollment();

  const [editingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState('');

  if (!patient) return null;

  const { enrollment } = patient;
  const slConfig = CCM_SERVICE_LINE_CONFIG[patient.service_line];
  const mcConfig = CCM_MEDICARE_STATUS_CONFIG[patient.medicare_status];
  const hasAwvCrossRef = checkAwvCrossRef(patient.ecw_patient_id);

  function handleSaveNotes(): void {
    updateEnrollment.mutate(
      {
        enrollmentId: enrollment.id,
        updates: { notes: notesValue },
      },
      { onSuccess: () => setEditingNotes(false) },
    );
  }

  function handleOpenChange(isOpen: boolean): void {
    if (!isOpen) {
      setEditingNotes(false);
    }
    onOpenChange(isOpen);
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="w-[520px] sm:max-w-[520px] overflow-y-auto p-0">
        <SheetHeader className="border-b border-border px-5 pt-5 pb-3">
          <div className="flex items-start justify-between">
            <div>
              <SheetTitle className="text-lg">{patient.last_name}</SheetTitle>
              <p className="mt-0.5 text-sm text-muted-foreground">
                ECW# {patient.ecw_patient_id}
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <span className={cn('rounded px-2 py-0.5 text-xs font-medium', slConfig.bg, slConfig.text)}>
                {patient.service_line}
              </span>
              <span className={cn('rounded px-2 py-0.5 text-xs font-medium', mcConfig.bg, mcConfig.text)}>
                Medicare {patient.medicare_status}
              </span>
            </div>
          </div>
          {patient.provider_name && (
            <p className="mt-2 text-sm text-muted-foreground">
              Provider: {patient.provider_name}
            </p>
          )}
        </SheetHeader>

        <div className="divide-y divide-border">
          {/* AWV Cross-Reference */}
          {hasAwvCrossRef && (
            <div className="px-5 pt-3 pb-0">
              <div className="flex items-center gap-2 rounded-md bg-blue-950/30 px-3 py-2 text-xs text-blue-300">
                <LinkIcon className="h-3.5 w-3.5" />
                Also tracked in AWV Tracker
              </div>
            </div>
          )}

          {/* Enrollment */}
          <EnrollmentSection enrollment={enrollment} patientId={patient.id} />

          {/* RPM Devices */}
          <DeviceSection enrollmentId={enrollment.id} programType={enrollment.program_type} />

          {/* Reimbursement History */}
          <ReimbursementSection enrollmentId={enrollment.id} programType={enrollment.program_type} />

          {/* Notes */}
          <div className="p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Notes
            </h3>
            {editingNotes ? (
              <div className="mt-2 space-y-2">
                <Textarea
                  value={notesValue}
                  onChange={(e) => setNotesValue(e.target.value)}
                  rows={3}
                  placeholder="Add notes about this patient's enrollment..."
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSaveNotes} disabled={updateEnrollment.isPending}>
                    <Save className="mr-1.5 h-3.5 w-3.5" />
                    Save
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditingNotes(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <p className="mt-2 min-h-[40px] rounded border border-border bg-muted/30 p-2.5 text-sm text-muted-foreground">
                  {enrollment.notes ?? 'No notes'}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    setNotesValue(enrollment.notes ?? '');
                    setEditingNotes(true);
                  }}
                >
                  Edit Notes
                </Button>
              </>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
