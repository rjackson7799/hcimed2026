import { Lightbulb, TrendingUp, AlertTriangle, RefreshCw, Sparkles } from 'lucide-react';
import { Button } from '@hci/shared/ui/button';
import { useAiInsights, useGenerateInsights } from '@/hooks/usePracticeHealthInsights';
import { useToast } from '@hci/shared/hooks/use-toast';
import type { KpiFilters } from '@/types/practice-health';

interface AiInsightsCardProps {
  filters: KpiFilters;
}

export function AiInsightsCard({ filters }: AiInsightsCardProps) {
  const { data: insights, isLoading } = useAiInsights(filters);
  const generateMutation = useGenerateInsights();
  const { toast } = useToast();

  const handleRegenerate = () => {
    generateMutation.mutate(filters.dateRange, {
      onSuccess: () => {
        toast({ title: 'Insights generated', description: 'AI analysis complete.' });
      },
      onError: (err) => {
        toast({
          title: 'Failed to generate insights',
          description: err.message,
          variant: 'destructive',
        });
      },
    });
  };

  const isEmpty = !insights ||
    (insights.takeaways.length === 0 &&
     insights.opportunities.length === 0 &&
     insights.concerns.length === 0);

  return (
    <div className="rounded-lg border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="text-sm font-semibold">AI Insights</h3>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={handleRegenerate}
          disabled={generateMutation.isPending}
        >
          <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${generateMutation.isPending ? 'animate-spin' : ''}`} />
          {generateMutation.isPending ? 'Analyzing...' : 'Regenerate'}
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 rounded bg-muted animate-pulse" />
          ))}
        </div>
      ) : isEmpty ? (
        <div className="text-center py-8 text-muted-foreground">
          <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">No insights generated yet.</p>
          <p className="text-xs mt-1">Click "Regenerate" to analyze your practice data with AI.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Key Takeaways */}
          {insights.takeaways.length > 0 && (
            <InsightGroup
              title="Key Takeaways"
              icon={<Lightbulb className="h-4 w-4" />}
              items={insights.takeaways}
              borderColor="border-l-emerald-500"
              bgColor="bg-emerald-50/50 dark:bg-emerald-950/20"
              iconColor="text-emerald-600"
            />
          )}

          {/* Opportunities */}
          {insights.opportunities.length > 0 && (
            <InsightGroup
              title="Opportunities"
              icon={<TrendingUp className="h-4 w-4" />}
              items={insights.opportunities}
              borderColor="border-l-amber-500"
              bgColor="bg-amber-50/50 dark:bg-amber-950/20"
              iconColor="text-amber-600"
            />
          )}

          {/* Causes for Concern */}
          {insights.concerns.length > 0 && (
            <InsightGroup
              title="Causes for Concern"
              icon={<AlertTriangle className="h-4 w-4" />}
              items={insights.concerns}
              borderColor="border-l-red-500"
              bgColor="bg-red-50/50 dark:bg-red-950/20"
              iconColor="text-red-600"
            />
          )}
        </div>
      )}
    </div>
  );
}

function InsightGroup({
  title,
  icon,
  items,
  borderColor,
  bgColor,
  iconColor,
}: {
  title: string;
  icon: React.ReactNode;
  items: Array<{ title: string; narrative: string }>;
  borderColor: string;
  bgColor: string;
  iconColor: string;
}) {
  return (
    <div className={`rounded-md border-l-4 ${borderColor} ${bgColor} p-3`}>
      <div className={`flex items-center gap-1.5 mb-2 ${iconColor}`}>
        {icon}
        <span className="text-xs font-semibold uppercase tracking-wide">{title}</span>
      </div>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="text-sm">
            <span className="font-medium">{item.title}</span>
            <span className="text-muted-foreground"> — {item.narrative}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
