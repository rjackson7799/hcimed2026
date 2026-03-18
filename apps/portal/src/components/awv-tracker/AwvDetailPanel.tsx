import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@hci/shared/ui/sheet';
import { Button } from '@hci/shared/ui/button';
import { Textarea } from '@hci/shared/ui/textarea';
import { Input } from '@hci/shared/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@hci/shared/ui/select';
import { cn } from '@hci/shared/lib/utils';
import { Calendar, CheckCircle, X, AlertCircle, Clock, Save } from 'lucide-react';
import { AwvStatusBadge } from './AwvStatusBadge';
import { AwvAddonsSection } from './AwvAddonsSection';
import { AwvHistorySection } from './AwvHistorySection';
import { AwvRevenueSection } from './AwvRevenueSection';
import { SERVICE_LINE_CONFIG, MEDICARE_STATUS_CONFIG, ELIGIBILITY_REASONS, DEFAULT_REIMBURSEMENT_RATES } from '@/lib/awv-tracker-constants';
import { useAwvUpdateEligibility, useAwvSchedule, useAwvComplete, useAwvUpdateStatus, useAwvUpdateNotes } from '@/hooks/useAwvTracking';
import { useAuth } from '@/context/AuthContext';
import type { AwvPatientWithTracking, AwvType, AwvEligibilityStatus } from '@/types/awv-tracker';
import { AWV_CPT_CODES } from '@/types/awv-tracker';

interface AwvDetailPanelProps {
  patient: AwvPatientWithTracking | null;
  open: boolean;
  onClose: () => void;
}

export function AwvDetailPanel({ patient, open, onClose }: AwvDetailPanelProps) {
  const { canViewRevenue, canWriteAwv } = useAuth();

  const updateEligibility = useAwvUpdateEligibility();
  const scheduleAwv = useAwvSchedule();
  const completeAwv = useAwvComplete();
  const updateStatus = useAwvUpdateStatus();
  const updateNotes = useAwvUpdateNotes();

  // Local form states
  const [showEligibilityForm, setShowEligibilityForm] = useState(false);
  const [eligibilityValue, setEligibilityValue] = useState<AwvEligibilityStatus>('Eligible');
  const [eligibilityReason, setEligibilityReason] = useState('');

  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleAwvType, setScheduleAwvType] = useState<AwvType | ''>('');

  const [showCompleteForm, setShowCompleteForm] = useState(false);
  const [completeDate, setCompleteDate] = useState(new Date().toISOString().split('T')[0]);
  const [completeAwvType, setCompleteAwvType] = useState<AwvType | ''>('');
  const [completeBilledAmount, setCompleteBilledAmount] = useState('');

  const [editingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState('');

  const resetForms = () => {
    setShowEligibilityForm(false);
    setShowScheduleForm(false);
    setShowCompleteForm(false);
    setEditingNotes(false);
  };

  if (!patient) return null;

  const { tracking } = patient;
  const slConfig = SERVICE_LINE_CONFIG[patient.service_line];
  const mcConfig = MEDICARE_STATUS_CONFIG[patient.medicare_status];

  const handleEligibilityUpdate = () => {
    updateEligibility.mutate({
      trackingId: tracking.id,
      eligibility_status: eligibilityValue,
      eligibility_reason: eligibilityValue === 'Not Eligible' ? eligibilityReason : undefined,
    }, { onSuccess: () => setShowEligibilityForm(false) });
  };

  const handleSchedule = () => {
    if (!scheduleDate) return;
    scheduleAwv.mutate({
      trackingId: tracking.id,
      scheduled_date: scheduleDate,
      awv_type: scheduleAwvType || undefined,
    }, { onSuccess: () => setShowScheduleForm(false) });
  };

  const handleComplete = () => {
    if (!completeDate || !completeAwvType) return;
    completeAwv.mutate({
      trackingId: tracking.id,
      patientId: patient.id,
      completion_date: completeDate,
      awv_type: completeAwvType,
      billed_amount: completeBilledAmount ? Number(completeBilledAmount) : undefined,
    }, { onSuccess: () => setShowCompleteForm(false) });
  };

  const handleRefused = () => {
    updateStatus.mutate({
      trackingId: tracking.id,
      completion_status: 'Refused',
    });
  };

  const handleUnable = () => {
    updateStatus.mutate({
      trackingId: tracking.id,
      completion_status: 'Unable to Complete',
    });
  };

  const handleSaveNotes = () => {
    updateNotes.mutate({
      trackingId: tracking.id,
      notes: notesValue,
    }, { onSuccess: () => setEditingNotes(false) });
  };

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) { resetForms(); onClose(); } }}>
      <SheetContent className="w-[520px] sm:max-w-[520px] overflow-y-auto p-0">
        <SheetHeader className="border-b border-border p-5">
          <div className="flex items-start justify-between">
            <div>
              <SheetTitle className="text-xl">{patient.last_name}</SheetTitle>
              <p className="mt-0.5 text-sm text-muted-foreground">ECW# {patient.ecw_patient_id}</p>
            </div>
            <div className="flex gap-1.5">
              <span className={cn('rounded px-2 py-0.5 text-xs font-medium', slConfig.bg, slConfig.text)}>
                {patient.service_line}
              </span>
              <span className={cn('rounded px-2 py-0.5 text-xs font-medium', mcConfig.bg, mcConfig.text)}>
                Medicare {patient.medicare_status}
              </span>
            </div>
          </div>
          <div className="mt-3 flex gap-4 text-sm text-muted-foreground">
            {patient.provider_name && <span>Provider: {patient.provider_name}</span>}
            {patient.facility_name && <span>Facility: {patient.facility_name}</span>}
            {patient.payer_name && <span>Payer: {patient.payer_name}</span>}
          </div>
        </SheetHeader>

        {/* Eligibility Section */}
        <div className="border-b border-border p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Eligibility</h3>
            <AwvStatusBadge type="eligibility" status={tracking.eligibility_status} />
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-xs uppercase text-muted-foreground">Last AWV Date</span>
              <p className="mt-0.5">{tracking.last_awv_date ?? '—'}</p>
            </div>
            <div>
              <span className="text-xs uppercase text-muted-foreground">Next Eligible</span>
              <p className={cn('mt-0.5', tracking.next_eligible_date && tracking.next_eligible_date < new Date().toISOString().split('T')[0] ? 'text-amber-400' : '')}>
                {tracking.next_eligible_date ?? 'Immediately eligible'}
              </p>
            </div>
            <div>
              <span className="text-xs uppercase text-muted-foreground">Date Source</span>
              <p className="mt-0.5 text-muted-foreground">{tracking.date_source}</p>
            </div>
            <div>
              <span className="text-xs uppercase text-muted-foreground">AWV Type</span>
              <p className="mt-0.5 text-muted-foreground">
                {tracking.awv_type ? `${tracking.awv_type} (${AWV_CPT_CODES[tracking.awv_type]})` : '—'}
              </p>
            </div>
          </div>

          {tracking.eligibility_reason && (
            <p className="mt-2 text-xs text-muted-foreground">
              <AlertCircle className="mr-1 inline h-3 w-3" />
              {tracking.eligibility_reason}
            </p>
          )}

          {!showEligibilityForm ? (
            canWriteAwv && <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => {
                setEligibilityValue(tracking.eligibility_status);
                setEligibilityReason(tracking.eligibility_reason ?? '');
                setShowEligibilityForm(true);
              }}
            >
              Change Status
            </Button>
          ) : (
            <div className="mt-3 space-y-2 rounded border border-border bg-muted/30 p-3">
              <Select value={eligibilityValue} onValueChange={(v) => setEligibilityValue(v as AwvEligibilityStatus)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending Review">Pending Review</SelectItem>
                  <SelectItem value="Eligible">Eligible</SelectItem>
                  <SelectItem value="Not Eligible">Not Eligible</SelectItem>
                </SelectContent>
              </Select>
              {eligibilityValue === 'Not Eligible' && (
                <Select value={eligibilityReason} onValueChange={setEligibilityReason}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select reason..." />
                  </SelectTrigger>
                  <SelectContent>
                    {ELIGIBILITY_REASONS.map((r) => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <div className="flex gap-2">
                <Button size="sm" onClick={handleEligibilityUpdate} disabled={updateEligibility.isPending}>Save</Button>
                <Button size="sm" variant="ghost" onClick={() => setShowEligibilityForm(false)}>Cancel</Button>
              </div>
            </div>
          )}
        </div>

        {/* Completion Section */}
        <div className="border-b border-border p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Completion</h3>
            <AwvStatusBadge type="completion" status={tracking.completion_status} />
          </div>

          {/* State machine visualization */}
          <div className="mt-3 flex items-center gap-1.5 text-xs">
            {['Not Started', 'Scheduled', 'Completed'].map((step, i) => (
              <div key={step} className="flex items-center gap-1.5">
                {i > 0 && <span className="text-muted-foreground">→</span>}
                <span
                  className={cn(
                    'rounded border px-2 py-0.5',
                    tracking.completion_status === step
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground'
                  )}
                >
                  {step}
                </span>
              </div>
            ))}
          </div>

          {tracking.scheduled_date && (
            <p className="mt-2 text-sm text-muted-foreground">
              <Calendar className="mr-1 inline h-3.5 w-3.5" />
              Scheduled: {tracking.scheduled_date}
            </p>
          )}

          {tracking.completion_date && (
            <p className="mt-1 text-sm text-muted-foreground">
              <CheckCircle className="mr-1 inline h-3.5 w-3.5 text-emerald-400" />
              Completed: {tracking.completion_date}
              {tracking.billed_amount != null && ` — $${tracking.billed_amount}`}
            </p>
          )}

          {/* Action buttons based on current state */}
          {canWriteAwv && tracking.completion_status !== 'Completed' && tracking.completion_status !== 'Refused' && tracking.completion_status !== 'Unable to Complete' && (
            <div className="mt-3 space-y-2">
              {!showScheduleForm && !showCompleteForm && (
                <div className="flex flex-wrap gap-2">
                  {tracking.completion_status === 'Not Started' && (
                    <Button size="sm" onClick={() => setShowScheduleForm(true)}>
                      <Calendar className="mr-1.5 h-3.5 w-3.5" />
                      Schedule AWV
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => setShowCompleteForm(true)}>
                    <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
                    Mark Completed
                  </Button>
                  <Button size="sm" variant="ghost" onClick={handleRefused}>
                    <X className="mr-1.5 h-3.5 w-3.5" />
                    Refused
                  </Button>
                  <Button size="sm" variant="ghost" onClick={handleUnable}>
                    <AlertCircle className="mr-1.5 h-3.5 w-3.5" />
                    Unable
                  </Button>
                </div>
              )}

              {/* Schedule form */}
              {showScheduleForm && (
                <div className="space-y-2 rounded border border-border bg-muted/30 p-3">
                  <div>
                    <label className="text-xs text-muted-foreground">Scheduled Date *</label>
                    <Input type="date" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">AWV Type (optional)</label>
                    <Select value={scheduleAwvType} onValueChange={(v) => setScheduleAwvType(v as AwvType)}>
                      <SelectTrigger><SelectValue placeholder="Select type..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="IPPE">IPPE (G0402)</SelectItem>
                        <SelectItem value="Initial AWV">Initial AWV (G0438)</SelectItem>
                        <SelectItem value="Subsequent AWV">Subsequent AWV (G0439)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSchedule} disabled={!scheduleDate || scheduleAwv.isPending}>Schedule</Button>
                    <Button size="sm" variant="ghost" onClick={() => setShowScheduleForm(false)}>Cancel</Button>
                  </div>
                </div>
              )}

              {/* Complete form */}
              {showCompleteForm && (
                <div className="space-y-2 rounded border border-border bg-muted/30 p-3">
                  <div>
                    <label className="text-xs text-muted-foreground">Completion Date *</label>
                    <Input type="date" value={completeDate} onChange={(e) => setCompleteDate(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">AWV Type *</label>
                    <Select value={completeAwvType} onValueChange={(v) => setCompleteAwvType(v as AwvType)}>
                      <SelectTrigger><SelectValue placeholder="Select type..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="IPPE">IPPE (G0402) — ~$175</SelectItem>
                        <SelectItem value="Initial AWV">Initial AWV (G0438) — ~$270</SelectItem>
                        <SelectItem value="Subsequent AWV">Subsequent AWV (G0439) — ~$230</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">
                      Billed Amount (defaults to{' '}
                      {completeAwvType && `$${DEFAULT_REIMBURSEMENT_RATES[AWV_CPT_CODES[completeAwvType] as keyof typeof DEFAULT_REIMBURSEMENT_RATES]?.amount ?? '—'}`}
                      )
                    </label>
                    <Input
                      type="number"
                      placeholder="Leave blank for default"
                      value={completeBilledAmount}
                      onChange={(e) => setCompleteBilledAmount(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleComplete} disabled={!completeDate || !completeAwvType || completeAwv.isPending}>Complete</Button>
                    <Button size="sm" variant="ghost" onClick={() => setShowCompleteForm(false)}>Cancel</Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Notes Section */}
        <div className="border-b border-border p-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Notes</h3>
          {editingNotes ? (
            <div className="mt-2 space-y-2">
              <Textarea
                value={notesValue}
                onChange={(e) => setNotesValue(e.target.value)}
                rows={3}
                placeholder="Add notes about this patient's AWV..."
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSaveNotes} disabled={updateNotes.isPending}>
                  <Save className="mr-1.5 h-3.5 w-3.5" />
                  Save
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEditingNotes(false)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <>
              <p className="mt-2 min-h-[40px] rounded border border-border bg-muted/30 p-2.5 text-sm text-muted-foreground">
                {tracking.notes ?? 'No notes'}
              </p>
              {canWriteAwv && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => { setNotesValue(tracking.notes ?? ''); setEditingNotes(true); }}
                >
                  Edit Notes
                </Button>
              )}
            </>
          )}
        </div>

        {/* Add-On Services */}
        <AwvAddonsSection trackingId={tracking.id} completionStatus={tracking.completion_status} />

        {/* Revenue (Admin only) */}
        {canViewRevenue && (
          <AwvRevenueSection
            trackingId={tracking.id}
            billedAmount={tracking.billed_amount}
            completionStatus={tracking.completion_status}
          />
        )}

        {/* AWV History */}
        <AwvHistorySection patientId={patient.id} />
      </SheetContent>
    </Sheet>
  );
}
