import { useState } from 'react';
import { Button } from '@hci/shared/ui/button';
import { Input } from '@hci/shared/ui/input';
import { Label } from '@hci/shared/ui/label';
import { Textarea } from '@hci/shared/ui/textarea';
import { Checkbox } from '@hci/shared/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@hci/shared/ui/select';
import { CheckCircle2, AlertTriangle, Calendar } from 'lucide-react';
import { EnrollmentStatusBadge, ProgramTypeBadge } from './CcmStatusBadge';
import { DISENROLLMENT_REASONS } from '@/lib/ccm-rpm-constants';
import { useCcmUpdateEnrollment } from '@/hooks/useCcmEnrollment';
import type { CcmEnrollment, CcmProgramType, DisenrollmentReason } from '@/types/ccm-rpm';

type ActiveAction = 'enroll' | 'decline' | 'disenroll' | 're-enroll' | null;

interface EnrollmentSectionProps {
  enrollment: CcmEnrollment;
  patientId: string;
}

export function EnrollmentSection({ enrollment, patientId }: EnrollmentSectionProps) {
  const updateEnrollment = useCcmUpdateEnrollment();
  const [activeAction, setActiveAction] = useState<ActiveAction>(null);

  // Enroll / Re-enroll form state
  const [programType, setProgramType] = useState<CcmProgramType | ''>('');
  const [enrollDate, setEnrollDate] = useState(new Date().toISOString().split('T')[0]);
  const [consentObtained, setConsentObtained] = useState(false);
  const [consentDate, setConsentDate] = useState('');

  // Decline form state
  const [declineNotes, setDeclineNotes] = useState('');

  // Disenroll form state
  const [disenrollDate, setDisenrollDate] = useState(new Date().toISOString().split('T')[0]);
  const [disenrollReason, setDisenrollReason] = useState<DisenrollmentReason | ''>('');
  const [disenrollNotes, setDisenrollNotes] = useState('');

  function resetForm(): void {
    setActiveAction(null);
    setProgramType('');
    setEnrollDate(new Date().toISOString().split('T')[0]);
    setConsentObtained(false);
    setConsentDate('');
    setDeclineNotes('');
    setDisenrollDate(new Date().toISOString().split('T')[0]);
    setDisenrollReason('');
    setDisenrollNotes('');
  }

  function handleEnroll(): void {
    if (!programType) return;
    updateEnrollment.mutate(
      {
        enrollmentId: enrollment.id,
        updates: {
          enrollment_status: 'Enrolled',
          program_type: programType,
          enrollment_date: enrollDate,
          consent_obtained: consentObtained,
          consent_date: consentObtained ? consentDate || enrollDate : null,
          disenrollment_date: null,
          disenrollment_reason: null,
        },
      },
      { onSuccess: resetForm },
    );
  }

  function handleDecline(): void {
    updateEnrollment.mutate(
      {
        enrollmentId: enrollment.id,
        updates: {
          enrollment_status: 'Declined',
          notes: declineNotes || null,
        },
      },
      { onSuccess: resetForm },
    );
  }

  function handleDisenroll(): void {
    if (!disenrollReason) return;
    updateEnrollment.mutate(
      {
        enrollmentId: enrollment.id,
        updates: {
          enrollment_status: 'Disenrolled',
          disenrollment_date: disenrollDate,
          disenrollment_reason: disenrollReason,
          notes: disenrollNotes || enrollment.notes,
        },
      },
      { onSuccess: resetForm },
    );
  }

  function renderActionButtons(): React.ReactNode {
    if (activeAction) return null;

    const status = enrollment.enrollment_status;

    if (status === 'Eligible') {
      return (
        <div className="mt-4 flex flex-wrap gap-2">
          <Button size="sm" onClick={() => setActiveAction('enroll')}>Enroll Patient</Button>
          <Button size="sm" variant="outline" onClick={() => setActiveAction('decline')}>Mark Declined</Button>
        </div>
      );
    }

    if (status === 'Enrolled') {
      return (
        <div className="mt-4 flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => setActiveAction('disenroll')}>Disenroll</Button>
          <Button size="sm" variant="outline" onClick={() => setActiveAction('enroll')}>Update Program</Button>
        </div>
      );
    }

    if (status === 'Declined' || status === 'Disenrolled') {
      return (
        <div className="mt-4 flex flex-wrap gap-2">
          <Button size="sm" onClick={() => setActiveAction('re-enroll')}>Re-enroll</Button>
        </div>
      );
    }

    return null;
  }

  function renderEnrollForm(): React.ReactNode {
    return (
      <div className="mt-3 space-y-3 rounded border border-border bg-muted/30 p-3">
        <div>
          <Label className="text-xs text-muted-foreground">Program Type *</Label>
          <Select value={programType} onValueChange={(v) => setProgramType(v as CcmProgramType)}>
            <SelectTrigger className="mt-1 w-full">
              <SelectValue placeholder="Select program..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CCM Only">CCM Only</SelectItem>
              <SelectItem value="RPM Only">RPM Only</SelectItem>
              <SelectItem value="CCM + RPM">CCM + RPM</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Enrollment Date</Label>
          <Input
            type="date"
            className="mt-1"
            value={enrollDate}
            onChange={(e) => setEnrollDate(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="consent"
            checked={consentObtained}
            onCheckedChange={(checked) => setConsentObtained(checked === true)}
          />
          <Label htmlFor="consent" className="text-sm">Patient consent obtained</Label>
        </div>
        {consentObtained && (
          <div>
            <Label className="text-xs text-muted-foreground">Consent Date</Label>
            <Input
              type="date"
              className="mt-1"
              value={consentDate}
              onChange={(e) => setConsentDate(e.target.value)}
            />
          </div>
        )}
        <div className="flex gap-2">
          <Button size="sm" onClick={handleEnroll} disabled={!programType || updateEnrollment.isPending}>
            {activeAction === 're-enroll' ? 'Re-enroll' : 'Enroll'}
          </Button>
          <Button size="sm" variant="ghost" onClick={resetForm}>Cancel</Button>
        </div>
      </div>
    );
  }

  function renderDeclineForm(): React.ReactNode {
    return (
      <div className="mt-3 space-y-3 rounded border border-border bg-muted/30 p-3">
        <div>
          <Label className="text-xs text-muted-foreground">Notes (optional)</Label>
          <Textarea
            className="mt-1"
            rows={2}
            value={declineNotes}
            onChange={(e) => setDeclineNotes(e.target.value)}
            placeholder="Reason for declining..."
          />
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={handleDecline} disabled={updateEnrollment.isPending}>
            Confirm Declined
          </Button>
          <Button size="sm" variant="ghost" onClick={resetForm}>Cancel</Button>
        </div>
      </div>
    );
  }

  function renderDisenrollForm(): React.ReactNode {
    return (
      <div className="mt-3 space-y-3 rounded border border-border bg-muted/30 p-3">
        <div>
          <Label className="text-xs text-muted-foreground">Disenrollment Date</Label>
          <Input
            type="date"
            className="mt-1"
            value={disenrollDate}
            onChange={(e) => setDisenrollDate(e.target.value)}
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Reason *</Label>
          <Select value={disenrollReason} onValueChange={(v) => setDisenrollReason(v as DisenrollmentReason)}>
            <SelectTrigger className="mt-1 w-full">
              <SelectValue placeholder="Select reason..." />
            </SelectTrigger>
            <SelectContent>
              {DISENROLLMENT_REASONS.map((reason) => (
                <SelectItem key={reason} value={reason}>{reason}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Notes (optional)</Label>
          <Textarea
            className="mt-1"
            rows={2}
            value={disenrollNotes}
            onChange={(e) => setDisenrollNotes(e.target.value)}
            placeholder="Additional details..."
          />
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={handleDisenroll} disabled={!disenrollReason || updateEnrollment.isPending}>
            Confirm Disenroll
          </Button>
          <Button size="sm" variant="ghost" onClick={resetForm}>Cancel</Button>
        </div>
      </div>
    );
  }

  function renderActiveForm(): React.ReactNode {
    if (activeAction === 'enroll' || activeAction === 're-enroll') {
      return renderEnrollForm();
    }
    if (activeAction === 'decline') {
      return renderDeclineForm();
    }
    if (activeAction === 'disenroll') {
      return renderDisenrollForm();
    }
    return null;
  }

  return (
    <div className="p-5">
      <h3 className="text-sm font-medium text-muted-foreground mb-3">Enrollment</h3>

      <div className="space-y-3">
        {/* Status + program badges */}
        <div className="flex flex-wrap items-center gap-2">
          <EnrollmentStatusBadge status={enrollment.enrollment_status} />
          <ProgramTypeBadge programType={enrollment.program_type} />
        </div>

        {/* Enrollment date */}
        {enrollment.enrollment_date && (
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            Enrolled: {enrollment.enrollment_date}
          </p>
        )}

        {/* Consent status */}
        {enrollment.enrollment_status === 'Enrolled' && (
          <div className="flex items-center gap-1.5 text-sm">
            {enrollment.consent_obtained ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-300">
                  Consent obtained{enrollment.consent_date ? ` on ${enrollment.consent_date}` : ''}
                </span>
              </>
            ) : (
              <>
                <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                <span className="text-amber-300">Consent not yet obtained</span>
              </>
            )}
          </div>
        )}

        {/* Disenrollment info */}
        {enrollment.enrollment_status === 'Disenrolled' && (
          <div className="space-y-1 text-sm text-muted-foreground">
            {enrollment.disenrollment_date && (
              <p className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                Disenrolled: {enrollment.disenrollment_date}
              </p>
            )}
            {enrollment.disenrollment_reason && (
              <p className="text-xs">Reason: {enrollment.disenrollment_reason}</p>
            )}
          </div>
        )}
      </div>

      {renderActionButtons()}
      {renderActiveForm()}
    </div>
  );
}
