import { useState } from 'react';
import { ChevronDown, ExternalLink, AlertCircle } from 'lucide-react';
import { cn } from '@hci/shared/lib/utils';
import type { InsuranceInfo } from '@/data/resources-data';

interface InsuranceDetailCardProps {
  insurance: InsuranceInfo;
}

export function InsuranceDetailCard({ insurance }: InsuranceDetailCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          <span className="font-display font-semibold text-foreground">
            {insurance.name}
          </span>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-secondary/10 text-secondary">
            {insurance.type}
          </span>
        </div>
        <ChevronDown
          className={cn(
            'h-5 w-5 text-muted-foreground transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {isOpen && (
        <div className="px-4 pb-4 space-y-3">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {insurance.coverageNotes}
          </p>

          {insurance.referralRequired && (
            <div className="flex items-start gap-2 text-sm text-amber-600 bg-amber-50 rounded-lg p-3">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>Referral required for specialist visits</span>
            </div>
          )}

          {insurance.website && (
            <a
              href={insurance.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-secondary hover:text-secondary/80 font-medium transition-colors"
            >
              Visit {insurance.name} website
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      )}
    </div>
  );
}
