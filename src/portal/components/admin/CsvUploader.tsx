import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileText, AlertCircle, CheckCircle, Loader2, Download } from 'lucide-react';
import { toast } from 'sonner';
import { parsePatientCsv, downloadCsvTemplate } from '@/portal/lib/csv';
import { supabase } from '@/portal/lib/supabase';
import { CsvPreviewTable } from './CsvPreviewTable';
import type { CsvParseResult } from '@/portal/schemas/patientCsvSchema';

interface CsvUploaderProps {
  projectId: string;
  onImportComplete?: () => void;
}

export function CsvUploader({ projectId, onImportComplete }: CsvUploaderProps) {
  const [parseResult, setParseResult] = useState<CsvParseResult | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }
    const result = await parsePatientCsv(file);
    setParseResult(result);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleImport = async () => {
    if (!parseResult || parseResult.valid.length === 0) return;

    setIsImporting(true);
    try {
      const rows = parseResult.valid.map((row) => ({
        project_id: projectId,
        first_name: row.first_name,
        last_name: row.last_name,
        date_of_birth: row.date_of_birth,
        phone_primary: row.phone_primary,
        phone_secondary: row.phone_secondary || null,
        address_line1: row.address || null,
        address_city: row.city || null,
        address_zip: row.zip_code || null,
        current_insurance: row.current_insurance || null,
        member_id: row.member_id || null,
        import_notes: row.notes || null,
      }));

      // Insert in batches of 50
      for (let i = 0; i < rows.length; i += 50) {
        const batch = rows.slice(i, i + 50);
        const { error } = await supabase.from('patients').insert(batch);
        if (error) throw error;
      }

      toast.success(`${rows.length} patients imported successfully`);
      setParseResult(null);
      onImportComplete?.();
    } catch (error) {
      toast.error('Failed to import patients. Please try again.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Import Patients</CardTitle>
          <Button variant="outline" size="sm" onClick={downloadCsvTemplate}>
            <Download className="mr-2 h-4 w-4" />
            Download Template
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!parseResult ? (
          <div
            className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
              isDragOver ? 'border-primary bg-primary/5' : 'border-gray-300'
            }`}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
          >
            <Upload className="h-8 w-8 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground mb-2">
              Drag and drop a CSV file, or click to browse
            </p>
            <label>
              <input
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileInput}
              />
              <Button variant="outline" size="sm" asChild>
                <span>Choose File</span>
              </Button>
            </label>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 rounded-md bg-green-50 px-3 py-1.5 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>{parseResult.valid.length} valid rows</span>
              </div>
              {parseResult.errors.length > 0 && (
                <div className="flex items-center gap-2 rounded-md bg-red-50 px-3 py-1.5 text-sm">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span>{parseResult.errors.length} errors</span>
                </div>
              )}
              {parseResult.duplicates.length > 0 && (
                <div className="flex items-center gap-2 rounded-md bg-yellow-50 px-3 py-1.5 text-sm">
                  <FileText className="h-4 w-4 text-yellow-600" />
                  <span>{parseResult.duplicates.length} duplicates</span>
                </div>
              )}
            </div>

            {/* Errors */}
            {parseResult.errors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-medium mb-1">Validation errors:</p>
                  <ul className="list-disc pl-4 text-xs space-y-1">
                    {parseResult.errors.slice(0, 5).map((err, i) => (
                      <li key={i}>
                        Row {err.row}: {err.issues.map(iss => iss.message).join(', ')}
                      </li>
                    ))}
                    {parseResult.errors.length > 5 && (
                      <li>...and {parseResult.errors.length - 5} more errors</li>
                    )}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Preview */}
            {parseResult.valid.length > 0 && (
              <CsvPreviewTable rows={parseResult.valid.slice(0, 10)} />
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                onClick={handleImport}
                disabled={isImporting || parseResult.valid.length === 0}
              >
                {isImporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Import {parseResult.valid.length} Patients
              </Button>
              <Button variant="outline" onClick={() => setParseResult(null)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
