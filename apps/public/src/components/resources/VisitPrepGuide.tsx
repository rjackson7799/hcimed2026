import { CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent } from '@hci/shared/ui/card';
import type { VisitGuide } from '@/data/resources-data';

interface VisitPrepGuideProps {
  guide: VisitGuide;
}

export function VisitPrepGuide({ guide }: VisitPrepGuideProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-lg font-semibold text-foreground">
            {guide.visitType}
          </h3>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{guide.estimatedDuration}</span>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          {guide.description}
        </p>

        <h4 className="text-sm font-semibold text-foreground mb-2">
          What to Bring
        </h4>
        <ul className="space-y-2">
          {guide.checklist.map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-secondary mt-0.5 flex-shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
