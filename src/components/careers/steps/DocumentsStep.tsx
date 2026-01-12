import { useCallback, useState } from "react";
import { useFormContext } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Upload, FileText, X, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ApplicationFormData,
  MAX_FILE_SIZE,
  ACCEPTED_FILE_EXTENSIONS,
  ACCEPTED_FILE_TYPES,
} from "@/lib/schemas/applicationSchema";

interface FileUploadProps {
  value: File | null | undefined;
  onChange: (file: File | null) => void;
  accept: string;
  maxSize: number;
  label: string;
  required?: boolean;
}

function FileUpload({
  value,
  onChange,
  accept,
  maxSize,
  label,
  required,
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
      return "Please upload a PDF, DOC, or DOCX file";
    }
    if (file.size > maxSize) {
      return `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`;
    }
    return null;
  };

  const handleFile = useCallback(
    (file: File) => {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }
      setError(null);
      onChange(file);
    },
    [onChange]
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFile(e.dataTransfer.files[0]);
      }
    },
    [handleFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        handleFile(e.target.files[0]);
      }
    },
    [handleFile]
  );

  const handleRemove = useCallback(() => {
    onChange(null);
    setError(null);
  }, [onChange]);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1024 / 1024).toFixed(1) + " MB";
  };

  return (
    <div className="space-y-2">
      {value ? (
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg border">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-secondary" />
            <div>
              <p className="font-medium text-sm text-foreground">{value.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(value.size)}
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleRemove}
            className="text-muted-foreground hover:text-destructive"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Remove file</span>
          </Button>
        </div>
      ) : (
        <div
          className={cn(
            "relative border-2 border-dashed rounded-lg p-8 transition-colors",
            dragActive
              ? "border-secondary bg-secondary/5"
              : "border-muted-foreground/25 hover:border-muted-foreground/50",
            error && "border-destructive"
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept={accept}
            onChange={handleChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="flex flex-col items-center text-center">
            <Upload
              className={cn(
                "h-10 w-10 mb-3",
                dragActive ? "text-secondary" : "text-muted-foreground"
              )}
            />
            <p className="text-sm font-medium text-foreground mb-1">
              {dragActive ? "Drop your file here" : `Upload ${label}`}
            </p>
            <p className="text-xs text-muted-foreground">
              Drag and drop or click to browse
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              PDF, DOC, or DOCX (max 5MB)
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}
    </div>
  );
}

export function DocumentsStep() {
  const { control } = useFormContext<ApplicationFormData>();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-1">
          Documents
        </h3>
        <p className="text-sm text-muted-foreground">
          Upload your resume and optional cover letter.
        </p>
      </div>

      <FormField
        control={control}
        name="resume"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Resume / CV <span className="text-destructive">*</span>
            </FormLabel>
            <FormControl>
              <FileUpload
                value={field.value}
                onChange={field.onChange}
                accept={ACCEPTED_FILE_EXTENSIONS}
                maxSize={MAX_FILE_SIZE}
                label="Resume"
                required
              />
            </FormControl>
            <FormDescription>
              Please upload your current resume or CV.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="coverLetter"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Cover Letter</FormLabel>
            <FormControl>
              <FileUpload
                value={field.value}
                onChange={field.onChange}
                accept={ACCEPTED_FILE_EXTENSIONS}
                maxSize={MAX_FILE_SIZE}
                label="Cover Letter"
              />
            </FormControl>
            <FormDescription>
              Optional. A cover letter helps us learn more about you.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
