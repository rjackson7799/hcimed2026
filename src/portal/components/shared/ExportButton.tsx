import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/portal/lib/supabase';
import { patientsToCSV, downloadBlob } from '@/portal/lib/export';
import type { Patient } from '@/portal/types';

interface ExportButtonProps {
  projectId: string;
  projectName: string;
}

export function ExportButton({ projectId, projectName }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('project_id', projectId)
        .order('last_name', { ascending: true });

      if (error) throw error;

      const patients = (data || []) as Patient[];
      const csv = patientsToCSV(patients);
      const filename = `${projectName.replace(/[^a-zA-Z0-9]/g, '_')}_patients_${new Date().toISOString().split('T')[0]}.csv`;
      downloadBlob(csv, filename);

      // HIPAA audit log: record bulk PHI export
      try {
        await supabase.from('audit_log').insert({
          action: 'EXPORT_CSV',
          table_name: 'patients',
          new_values: { project_id: projectId, project_name: projectName, patient_count: patients.length },
        });
      } catch {
        // Audit failure should not block export
      }

      toast.success(`Exported ${patients.length} patients`);
    } catch {
      toast.error('Failed to export patients');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleExport} disabled={isExporting}>
      {isExporting ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Download className="mr-2 h-4 w-4" />
      )}
      Export CSV
    </Button>
  );
}
