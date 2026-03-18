import { useCallback, useState } from 'react';
import Papa from 'papaparse';
import { Button } from '@hci/shared/ui/button';
import { AlertCircle, CheckCircle, Loader2, RotateCcw, ShieldAlert } from 'lucide-react';
import { cn } from '@hci/shared/lib/utils';
import { ccmUploadRowSchema, validateCcmUploadHeaders, type CcmUploadRow } from '@/schemas/ccmUploadSchema';
import { CCM_UPLOAD_REQUIRED_COLUMNS, CCM_UPLOAD_OPTIONAL_COLUMNS } from '@/lib/ccm-rpm-constants';
import { useCcmUpload } from '@/hooks/useCcmUpload';
import { UploadDropZone } from './UploadDropZone';
import { UploadResultsSummary } from './UploadResultsSummary';
import { UploadHistoryTable } from './UploadHistoryTable';
import type { CcmValidationError } from '@/types/ccm-rpm';

type UploadState = 'idle' | 'parsing' | 'phi_error' | 'preview' | 'uploading' | 'success' | 'error';

const ALL_COLUMNS = [...CCM_UPLOAD_REQUIRED_COLUMNS, ...CCM_UPLOAD_OPTIONAL_COLUMNS];
const PREVIEW_ROWS = 10;
const PREVIEW_COLS = 6;

export function UploadTab() {
  const [state, setState] = useState<UploadState>('idle');
  const [fileName, setFileName] = useState('');
  const [phiColumns, setPhiColumns] = useState<string[]>([]);
  const [missingColumns, setMissingColumns] = useState<string[]>([]);
  const [parsedRows, setParsedRows] = useState<Record<string, string>[]>([]);
  const [validCount, setValidCount] = useState(0);
  const [invalidCount, setInvalidCount] = useState(0);
  const [rawPreview, setRawPreview] = useState<Record<string, string>[]>([]);
  const [uploadResult, setUploadResult] = useState<{
    newPatients: number;
    updatedPatients: number;
    flaggedPatients: number;
    errors: CcmValidationError[];
    totalRows: number;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const uploadMutation = useCcmUpload();

  const reset = useCallback(() => {
    setState('idle');
    setFileName('');
    setPhiColumns([]);
    setMissingColumns([]);
    setParsedRows([]);
    setValidCount(0);
    setInvalidCount(0);
    setRawPreview([]);
    setUploadResult(null);
    setErrorMessage('');
  }, []);

  const handleFile = useCallback((file: File) => {
    setFileName(file.name);
    setState('parsing');

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const headers = results.meta.fields ?? [];
          const validation = validateCcmUploadHeaders(headers);

          if (validation.phiColumns.length > 0) {
            setPhiColumns(validation.phiColumns);
            setState('phi_error');
            return;
          }

          if (validation.missingColumns.length > 0) {
            setMissingColumns(validation.missingColumns);
            setErrorMessage(`Missing required columns: ${validation.missingColumns.join(', ')}`);
            setState('error');
            return;
          }

          if (results.data.length === 0) {
            setErrorMessage('File contains no data rows');
            setState('error');
            return;
          }

          if (results.data.length > 10000) {
            setErrorMessage(`File has ${results.data.length} rows — maximum is 10,000`);
            setState('error');
            return;
          }

          // Validate each row
          const validRows: Record<string, string>[] = [];
          let invalid = 0;

          for (const row of results.data as Record<string, string>[]) {
            const result = ccmUploadRowSchema.safeParse(row);
            if (result.success) {
              validRows.push(row);
            } else {
              invalid++;
            }
          }

          setParsedRows(validRows);
          setValidCount(validRows.length);
          setInvalidCount(invalid);
          setRawPreview((results.data as Record<string, string>[]).slice(0, PREVIEW_ROWS));
          setState('preview');
        } catch (err) {
          setErrorMessage(err instanceof Error ? err.message : 'Failed to parse file');
          setState('error');
        }
      },
      error: (err) => {
        setErrorMessage(err.message);
        setState('error');
      },
    });
  }, []);

  const handleUpload = useCallback(async () => {
    setState('uploading');
    try {
      const result = await uploadMutation.mutateAsync({ fileName, parsedRows });
      setUploadResult(result);
      setState('success');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Upload failed');
      setState('error');
    }
  }, [uploadMutation, fileName, parsedRows]);

  const previewColumns = rawPreview.length > 0
    ? Object.keys(rawPreview[0]).slice(0, PREVIEW_COLS)
    : [];

  return (
    <div className="space-y-6">
      {state === 'idle' && (
        <>
          <UploadDropZone onFile={handleFile} />
          <div>
            <h3 className="mb-3 text-sm font-semibold">Upload History</h3>
            <UploadHistoryTable />
          </div>
        </>
      )}

      {state === 'parsing' && (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border p-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Parsing {fileName}...</p>
        </div>
      )}

      {state === 'phi_error' && (
        <div className="rounded-lg border border-red-900/50 bg-red-950/20 p-6">
          <div className="flex items-start gap-3">
            <ShieldAlert className="h-6 w-6 shrink-0 text-red-400" />
            <div>
              <h3 className="text-sm font-semibold text-red-300">Protected Health Information Detected</h3>
              <p className="mt-1 text-sm text-red-200/80">
                This file contains columns that may contain PHI. Remove these columns from your eCW export and try again:
              </p>
              <ul className="mt-2 space-y-1">
                {phiColumns.map((col) => (
                  <li key={col} className="text-sm font-medium text-red-300">• {col}</li>
                ))}
              </ul>
              <Button variant="outline" size="sm" className="mt-4" onClick={reset}>
                <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                Try Another File
              </Button>
            </div>
          </div>
        </div>
      )}

      {state === 'preview' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">{fileName}</h3>
              <p className="text-xs text-muted-foreground">
                {validCount + invalidCount} rows parsed —{' '}
                <span className="text-emerald-400">{validCount} valid</span>
                {invalidCount > 0 && (
                  <>, <span className="text-red-400">{invalidCount} invalid (will be skipped)</span></>
                )}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={reset}>Cancel</Button>
              <Button size="sm" onClick={handleUpload} disabled={validCount === 0}>
                Upload {validCount} Patients
              </Button>
            </div>
          </div>

          {missingColumns.length > 0 && (
            <div className="rounded border border-amber-900/50 bg-amber-950/20 p-3 text-xs text-amber-300">
              <AlertCircle className="mr-1 inline h-3 w-3" />
              Missing optional columns: {missingColumns.join(', ')}
            </div>
          )}

          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/20">
                  {previewColumns.map((col) => (
                    <th key={col} className="px-3 py-2 text-left font-medium text-muted-foreground">
                      <span className={cn(
                        (ALL_COLUMNS as readonly string[]).includes(col) ? 'text-foreground' : 'text-muted-foreground/60'
                      )}>
                        {col}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rawPreview.map((row, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    {previewColumns.map((col) => (
                      <td key={col} className="max-w-[150px] truncate px-3 py-1.5 text-muted-foreground">
                        {row[col] || '—'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {rawPreview.length < validCount + invalidCount && (
              <p className="border-t border-border bg-muted/10 px-3 py-1.5 text-xs text-muted-foreground/60">
                Showing {rawPreview.length} of {validCount + invalidCount} rows
              </p>
            )}
          </div>
        </div>
      )}

      {state === 'uploading' && (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Processing {validCount} patients...</p>
        </div>
      )}

      {state === 'success' && uploadResult && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-emerald-400" />
            <h3 className="text-sm font-semibold">Upload Complete</h3>
          </div>
          <UploadResultsSummary result={uploadResult} />
          <Button variant="outline" size="sm" onClick={reset}>
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
            Upload Another File
          </Button>
        </div>
      )}

      {state === 'error' && (
        <div className="rounded-lg border border-red-900/50 bg-red-950/20 p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
            <div>
              <h3 className="text-sm font-semibold text-red-300">Upload Failed</h3>
              <p className="mt-1 text-sm text-red-200/80">{errorMessage}</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={reset}>
                <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                Try Again
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
