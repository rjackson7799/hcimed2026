import { Card } from '@/components/ui/card';
import { Users, Phone, PhoneOff, CheckCircle, Send, AlertTriangle } from 'lucide-react';
import type { ProjectSummary } from '@/portal/types';

interface SummaryCardsProps {
  summary: ProjectSummary;
}

const cards = [
  { key: 'total_patients', label: 'Total Patients', icon: Users, color: 'text-blue-600 bg-blue-100' },
  { key: 'called', label: 'Called', icon: Phone, color: 'text-green-600 bg-green-100' },
  { key: 'uncalled', label: 'Uncalled', icon: PhoneOff, color: 'text-gray-600 bg-gray-100' },
  { key: 'will_switch', label: 'Will Switch', icon: CheckCircle, color: 'text-emerald-600 bg-emerald-100' },
  { key: 'forwarded_to_broker', label: 'Forwarded', icon: Send, color: 'text-purple-600 bg-purple-100' },
  { key: 'completed', label: 'Completed', icon: CheckCircle, color: 'text-teal-600 bg-teal-100' },
] as const;

export function SummaryCards({ summary }: SummaryCardsProps) {
  return (
    <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
      {cards.map((card) => {
        const Icon = card.icon;
        const value = summary[card.key as keyof ProjectSummary];
        return (
          <Card key={card.key} className="p-4">
            <div className="flex items-center gap-3">
              <div className={`rounded-lg p-2 ${card.color.split(' ')[1]}`}>
                <Icon className={`h-4 w-4 ${card.color.split(' ')[0]}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs text-muted-foreground">{card.label}</p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
