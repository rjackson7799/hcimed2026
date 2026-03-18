import { useCallback, useRef, useState } from 'react';
import { cn } from '@hci/shared/lib/utils';
import { Upload } from 'lucide-react';

interface UploadDropZoneProps {
  onFile: (file: File) => void;
  disabled?: boolean;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function UploadDropZone({ onFile, disabled }: UploadDropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (disabled) return;
      if (file.size > MAX_FILE_SIZE) {
        alert('File exceeds 10MB limit');
        return;
      }
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext !== 'csv' && ext !== 'xlsx') {
        alert('Only CSV and XLSX files are supported');
        return;
      }
      onFile(file);
    },
    [onFile, disabled]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) setIsDragOver(true);
    },
    [disabled]
  );

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
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

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      if (inputRef.current) inputRef.current.value = '';
    },
    [handleFile]
  );

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !disabled && inputRef.current?.click()}
      className={cn(
        'flex cursor-pointer flex-col items-center gap-3 rounded-lg border-2 border-dashed p-10 text-center transition-colors',
        isDragOver ? 'border-blue-400 bg-blue-950/20' : 'border-border hover:border-muted-foreground/50',
        disabled && 'pointer-events-none opacity-50'
      )}
    >
      <Upload className={cn('h-10 w-10', isDragOver ? 'text-blue-400' : 'text-muted-foreground')} />
      <div>
        <p className="text-sm font-medium">Drag & drop CSV file here</p>
        <p className="mt-1 text-xs text-muted-foreground">
          or <span className="text-primary underline">browse</span> to select
        </p>
      </div>
      <p className="text-xs text-muted-foreground/60">CSV or XLSX, max 10MB</p>
      <input
        ref={inputRef}
        type="file"
        accept=".csv,.xlsx"
        className="hidden"
        onChange={handleChange}
        disabled={disabled}
      />
    </div>
  );
}
