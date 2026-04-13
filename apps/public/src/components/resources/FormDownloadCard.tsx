import { FileDown } from 'lucide-react';
import { Card, CardContent } from '@hci/shared/ui/card';
import type { PatientForm } from '@/data/resources-data';

interface FormDownloadCardProps {
  form: PatientForm;
}

export function FormDownloadCard({ form }: FormDownloadCardProps) {
  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-secondary/20 transition-colors">
            <FileDown className="h-5 w-5 text-secondary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-semibold text-foreground mb-1">
              {form.title}
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              {form.description}
            </p>
            <a
              href={`/forms/${form.filename}`}
              download
              className="inline-flex items-center gap-1 text-sm font-medium text-secondary hover:text-secondary/80 transition-colors"
            >
              <FileDown className="h-4 w-4" />
              Download PDF
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
