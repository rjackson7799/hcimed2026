import { AuditLogViewer } from '@/portal/components/admin/AuditLogViewer';

export function AdminAuditLogPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display">Audit Log</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Track all system actions for HIPAA compliance
        </p>
      </div>

      <AuditLogViewer />
    </div>
  );
}
