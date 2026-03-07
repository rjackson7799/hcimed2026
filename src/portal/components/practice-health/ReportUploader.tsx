/**
 * ReportUploader — Smart drag-and-drop upload for eCW reports.
 * Handles PHI scanning, auto-detection, validation preview, and upload.
 */

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Upload,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Loader2,
  FileText,
  ShieldAlert,
  RefreshCw,
} from 'lucide-react';
import { parseReportClientSide, usePracticeHealthUpload } from '@/portal/hooks/usePracticeHealthUpload';
import { PH_REPORT_TYPE_LABELS } from '@/portal/lib/practice-health-constants';
import type { ReportParseResult } from '@/portal/lib/report-parsers';
import type { UploadResult } from '@/portal/types/practice-health';

interface ReportUploaderProps {
  onUploadComplete?: (result: UploadResult) => void;
}

type UploaderState = 'idle' | 'parsing' | 'phi_error' | 'detection_error' | 'preview' | 'uploading' | 'success' | 'error';

export function ReportUploader({ onUploadComplete }: ReportUploaderProps) {
  const [state, setState] = useState<UploaderState>('idle');
  const [isDragOver, setIsDragOver] = useState(false);
  const [parseResult, setParseResult] = useState<ReportParseResult | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [showAllErrors, setShowAllErrors] = useState(false);

  // Period date inputs for 36.14 collections reports
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');

  const uploadMutation = usePracticeHealthUpload();

  const reset = useCallback(() => {
    setState('idle');
    setParseResult(null);
    setErrorMessage('');
    setUploadResult(null);
    setShowAllErrors(false);
    setPeriodStart('');
    setPeriodEnd('');
  }, []);

  const handleFile = useCallback(async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['csv', 'xlsx', 'xls'].includes(ext || '')) {
      setErrorMessage('Please upload a CSV or Excel (.xlsx/.xls) file.');
      setState('detection_error');
      return;
    }

    setState('parsing');
    try {
      const result = await parseReportClientSide(file);

      if (result.phiScan.hasPhi) {
        setParseResult(result);
        setState('phi_error');
        return;
      }

      setParseResult(result);
      setState('preview');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to parse file.');
      setState('detection_error');
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleUpload = async () => {
    if (!parseResult || parseResult.validRows.length === 0) return;

    setState('uploading');
    try {
      const result = await uploadMutation.mutateAsync({
        parseResult,
        periodStart: periodStart || undefined,
        periodEnd: periodEnd || undefined,
      });
      setUploadResult(result);
      setState('success');
      onUploadComplete?.(result);
    } catch {
      setState('error');
      setErrorMessage(uploadMutation.error?.message || 'Upload failed.');
    }
  };

  const isCollections = parseResult?.detection.reportType === '36.14';
  const needsPeriodDates = isCollections && (!periodStart || !periodEnd);

  // Preview columns for the first 10 rows
  const previewRows = parseResult?.validRows.slice(0, 10) || [];
  const previewColumns = previewRows.length > 0 ? Object.keys(previewRows[0]).slice(0, 6) : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload eCW Report
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* ─── IDLE: Drop zone ─── */}
        {state === 'idle' && (
          <div
            className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
              isDragOver ? 'border-primary bg-primary/5' : 'border-gray-300'
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
          >
            <Upload className="h-8 w-8 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground mb-1">
              Drag and drop a report file, or click to browse
            </p>
            <p className="text-xs text-muted-foreground mb-3">
              Supports CSV and Excel (.xlsx/.xls) — Max 10 MB
            </p>
            <label>
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                className="hidden"
                onChange={handleFileInput}
              />
              <Button variant="outline" size="sm" asChild>
                <span>Choose File</span>
              </Button>
            </label>
          </div>
        )}

        {/* ─── PARSING: Loading ─── */}
        {state === 'parsing' && (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
            <p className="text-sm text-muted-foreground">Scanning and validating file...</p>
          </div>
        )}

        {/* ─── PHI ERROR: Protected Health Information detected ─── */}
        {state === 'phi_error' && parseResult && (
          <div className="space-y-4">
            <Alert variant="destructive">
              <ShieldAlert className="h-4 w-4" />
              <AlertTitle>Protected Health Information Detected</AlertTitle>
              <AlertDescription>
                <p className="mb-2">
                  This file contains columns with patient-identifiable information and cannot be uploaded.
                  Please use the custom eCW report that excludes PHI fields.
                </p>
                <p className="font-medium mb-1">PHI columns found:</p>
                <ul className="list-disc pl-4 text-xs space-y-0.5">
                  {parseResult.phiScan.phiColumns.map((col, i) => (
                    <li key={i}>{col}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
            <Button variant="outline" onClick={reset}>
              Try Another File
            </Button>
          </div>
        )}

        {/* ─── DETECTION ERROR: Can't identify report ─── */}
        {state === 'detection_error' && (
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
            <Button variant="outline" onClick={reset}>
              Try Another File
            </Button>
          </div>
        )}

        {/* ─── PREVIEW: Show detection + validation + data preview ─── */}
        {state === 'preview' && parseResult && (
          <div className="space-y-4">
            {/* Detection badge */}
            <div className="flex items-center gap-2 rounded-md bg-blue-50 px-3 py-2">
              <FileText className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">
                Detected: {PH_REPORT_TYPE_LABELS[parseResult.detection.reportType] || parseResult.detection.reportType}
              </span>
              <span className="text-xs text-muted-foreground">
                ({Math.round(parseResult.detection.confidence * 100)}% confidence)
              </span>
            </div>

            {/* Validation summary */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 rounded-md bg-green-50 px-3 py-1.5 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>{parseResult.validRows.length} valid rows</span>
              </div>
              {parseResult.errors.length > 0 && (
                <div className="flex items-center gap-2 rounded-md bg-red-50 px-3 py-1.5 text-sm">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span>{parseResult.errors.length} errors</span>
                </div>
              )}
              {parseResult.duplicateCount > 0 && (
                <div className="flex items-center gap-2 rounded-md bg-yellow-50 px-3 py-1.5 text-sm">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span>{parseResult.duplicateCount} duplicates skipped</span>
                </div>
              )}
            </div>

            {/* Date range (charges/productivity) */}
            {parseResult.dateRangeStart && parseResult.dateRangeEnd && (
              <p className="text-sm text-muted-foreground">
                Date range: {parseResult.dateRangeStart} to {parseResult.dateRangeEnd}
              </p>
            )}

            {/* Period date picker (collections reports only) */}
            {isCollections && (
              <div className="rounded-md border p-4 space-y-3">
                <p className="text-sm font-medium">
                  Financial Analysis reports require a reporting period:
                </p>
                <div className="flex gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="period-start" className="text-xs">Period Start</Label>
                    <Input
                      id="period-start"
                      type="date"
                      value={periodStart}
                      onChange={(e) => setPeriodStart(e.target.value)}
                      className="w-40"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="period-end" className="text-xs">Period End</Label>
                    <Input
                      id="period-end"
                      type="date"
                      value={periodEnd}
                      onChange={(e) => setPeriodEnd(e.target.value)}
                      className="w-40"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Errors (first 5, expandable) */}
            {parseResult.errors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-medium mb-1">Validation errors:</p>
                  <ul className="list-disc pl-4 text-xs space-y-1">
                    {parseResult.errors
                      .slice(0, showAllErrors ? undefined : 5)
                      .map((err, i) => (
                        <li key={i}>
                          Row {err.row}: [{err.field}] {err.message}
                        </li>
                      ))}
                  </ul>
                  {parseResult.errors.length > 5 && !showAllErrors && (
                    <button
                      className="text-xs underline mt-1"
                      onClick={() => setShowAllErrors(true)}
                    >
                      Show all {parseResult.errors.length} errors
                    </button>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {/* Preview table */}
            {previewRows.length > 0 && (
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {previewColumns.map((col) => (
                        <TableHead key={col} className="text-xs whitespace-nowrap">
                          {col}
                        </TableHead>
                      ))}
                      {Object.keys(previewRows[0]).length > 6 && (
                        <TableHead className="text-xs">...</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewRows.map((row, i) => (
                      <TableRow key={i}>
                        {previewColumns.map((col) => (
                          <TableCell key={col} className="text-xs whitespace-nowrap max-w-[150px] truncate">
                            {String(row[col] ?? '')}
                          </TableCell>
                        ))}
                        {Object.keys(row).length > 6 && (
                          <TableCell className="text-xs text-muted-foreground">...</TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {parseResult.validRows.length > 10 && (
                  <p className="text-xs text-muted-foreground px-3 py-2">
                    Showing first 10 of {parseResult.validRows.length} rows
                  </p>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                onClick={handleUpload}
                disabled={parseResult.validRows.length === 0 || (isCollections && needsPeriodDates)}
              >
                Upload {parseResult.validRows.length} Rows
              </Button>
              <Button variant="outline" onClick={reset}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* ─── UPLOADING ─── */}
        {state === 'uploading' && (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
            <p className="text-sm text-muted-foreground">Uploading and processing data...</p>
          </div>
        )}

        {/* ─── SUCCESS ─── */}
        {state === 'success' && uploadResult && (
          <div className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle>Upload Successful</AlertTitle>
              <AlertDescription>
                {uploadResult.rowCount} rows imported.
                {uploadResult.kpiDatesUpdated.length > 0 && (
                  <span>
                    {' '}KPIs updated for {uploadResult.kpiDatesUpdated.length} date(s).
                  </span>
                )}
              </AlertDescription>
            </Alert>
            <Button variant="outline" onClick={reset}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Upload Another
            </Button>
          </div>
        )}

        {/* ─── ERROR ─── */}
        {state === 'error' && (
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage || 'Upload failed. Please try again.'}</AlertDescription>
            </Alert>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setState('preview')}>
                Retry
              </Button>
              <Button variant="outline" onClick={reset}>
                Start Over
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
