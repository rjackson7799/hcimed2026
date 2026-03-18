import { useState } from 'react';
import { Button } from '@hci/shared/ui/button';
import { Input } from '@hci/shared/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@hci/shared/ui/select';
import { Plus, Save } from 'lucide-react';
import { useAwvAddons, useAddAwvAddon } from '@/hooks/useAwvUpload';
import { DEFAULT_REIMBURSEMENT_RATES } from '@/lib/awv-tracker-constants';
import type { AwvCompletionStatus } from '@/types/awv-tracker';

interface AwvAddonsSectionProps {
  trackingId: string;
  completionStatus: AwvCompletionStatus;
}

// Add-on CPTs only (exclude AWV codes)
const ADDON_CPTS = Object.entries(DEFAULT_REIMBURSEMENT_RATES)
  .filter(([code]) => !['G0402', 'G0438', 'G0439'].includes(code))
  .map(([code, info]) => ({ code, description: info.description, amount: info.amount }));

export function AwvAddonsSection({ trackingId, completionStatus }: AwvAddonsSectionProps) {
  const { data: addons, isLoading } = useAwvAddons(trackingId);
  const addAddon = useAddAwvAddon();

  const [showForm, setShowForm] = useState(false);
  const [selectedCpt, setSelectedCpt] = useState('');
  const [billedAmount, setBilledAmount] = useState('');

  const isCompleted = completionStatus === 'Completed';

  const handleSave = () => {
    if (!selectedCpt) return;
    const addonInfo = ADDON_CPTS.find((a) => a.code === selectedCpt);
    addAddon.mutate(
      {
        tracking_id: trackingId,
        cpt_code: selectedCpt,
        description: addonInfo?.description ?? null,
        billed_amount: billedAmount ? Number(billedAmount) : addonInfo?.amount ?? null,
      },
      {
        onSuccess: () => {
          setShowForm(false);
          setSelectedCpt('');
          setBilledAmount('');
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="border-b border-border p-5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Add-On Services</h3>
        <div className="mt-2 h-6 animate-pulse rounded bg-muted/30" />
      </div>
    );
  }

  return (
    <div className="border-b border-border p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Add-On Services
          {addons && addons.length > 0 && (
            <span className="ml-1.5 rounded-full bg-muted px-1.5 py-0.5 text-[10px]">{addons.length}</span>
          )}
        </h3>
        {isCompleted && !showForm && (
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setShowForm(true)}>
            <Plus className="mr-1 h-3 w-3" />
            Add Service
          </Button>
        )}
      </div>

      {addons && addons.length > 0 ? (
        <ul className="mt-2 space-y-1.5">
          {addons.map((addon) => (
            <li key={addon.id} className="flex items-center justify-between rounded bg-muted/20 px-3 py-1.5 text-sm">
              <span>
                <span className="font-mono text-xs text-muted-foreground">{addon.cpt_code}</span>
                {addon.description && <span className="ml-2 text-muted-foreground">{addon.description}</span>}
              </span>
              {addon.billed_amount != null && (
                <span className="text-xs font-medium">${addon.billed_amount}</span>
              )}
            </li>
          ))}
        </ul>
      ) : (
        !showForm && (
          <p className="mt-2 text-xs text-muted-foreground/60">
            {isCompleted ? 'No add-on services recorded' : 'Available after AWV is completed'}
          </p>
        )
      )}

      {showForm && (
        <div className="mt-3 space-y-2 rounded border border-border bg-muted/30 p-3">
          <div>
            <label className="text-xs text-muted-foreground">Service *</label>
            <Select value={selectedCpt} onValueChange={(v) => {
              setSelectedCpt(v);
              const info = ADDON_CPTS.find((a) => a.code === v);
              setBilledAmount(info ? String(info.amount) : '');
            }}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select add-on service..." />
              </SelectTrigger>
              <SelectContent>
                {ADDON_CPTS.map((a) => (
                  <SelectItem key={a.code} value={a.code}>
                    {a.code} — {a.description} (~${a.amount})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Billed Amount</label>
            <Input
              type="number"
              value={billedAmount}
              onChange={(e) => setBilledAmount(e.target.value)}
              placeholder="Leave blank for default"
            />
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave} disabled={!selectedCpt || addAddon.isPending}>
              <Save className="mr-1.5 h-3.5 w-3.5" />
              Save
            </Button>
            <Button size="sm" variant="ghost" onClick={() => { setShowForm(false); setSelectedCpt(''); setBilledAmount(''); }}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
