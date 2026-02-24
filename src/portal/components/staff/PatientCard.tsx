import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Phone, ChevronDown, ChevronUp } from 'lucide-react';
import { StatusBadge } from '@/portal/components/shared/StatusBadge';
import { CallLogger } from './CallLogger';
import { CallHistory } from './CallHistory';
import { BrokerForward } from './BrokerForward';
import { formatPhone, formatPatientName, formatRelativeTime } from '@/portal/utils/formatters';
import type { Patient } from '@/portal/types';

interface PatientCardProps {
  patient: Patient;
}

export function PatientCard({ patient }: PatientCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showCallLogger, setShowCallLogger] = useState(false);

  return (
    <Card className="overflow-hidden">
      {/* Summary row */}
      <div
        className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm truncate">
              {formatPatientName(patient.first_name, patient.last_name)}
            </span>
            <StatusBadge status={patient.outreach_status} />
          </div>
          <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
            <span>{formatPhone(patient.phone_primary)}</span>
            {patient.member_id && <span>ID: {patient.member_id}</span>}
            {patient.total_attempts > 0 && (
              <span>{patient.total_attempts} attempt{patient.total_attempts !== 1 ? 's' : ''}</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Click-to-call */}
          <a
            href={`tel:${patient.phone_primary}`}
            onClick={(e) => e.stopPropagation()}
            className="rounded-md p-2 hover:bg-muted transition-colors"
            title="Call patient"
          >
            <Phone className="h-4 w-4 text-primary" />
          </a>

          {/* Log Call button */}
          <Button
            size="sm"
            variant={patient.outreach_status === 'not_called' ? 'default' : 'outline'}
            onClick={(e) => {
              e.stopPropagation();
              setShowCallLogger(!showCallLogger);
              if (!showCallLogger) setIsExpanded(true);
            }}
          >
            Log Call
          </Button>

          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Expanded detail */}
      {isExpanded && (
        <div className="border-t p-4 space-y-4">
          {/* Patient details */}
          <div className="grid gap-2 text-sm sm:grid-cols-2">
            {patient.current_insurance && (
              <div>
                <span className="text-muted-foreground">Insurance: </span>
                {patient.current_insurance}
              </div>
            )}
            {patient.last_contacted_at && (
              <div>
                <span className="text-muted-foreground">Last contact: </span>
                {formatRelativeTime(patient.last_contacted_at)}
              </div>
            )}
            {patient.address_line1 && (
              <div className="sm:col-span-2">
                <span className="text-muted-foreground">Address: </span>
                {[patient.address_line1, patient.address_city, patient.address_state, patient.address_zip]
                  .filter(Boolean)
                  .join(', ')}
              </div>
            )}
          </div>

          {/* Broker forward */}
          <BrokerForward patient={patient} />

          {/* Call logger */}
          {showCallLogger && (
            <div className="rounded-lg border bg-muted/30 p-4">
              <CallLogger
                patient={patient}
                onComplete={() => setShowCallLogger(false)}
              />
            </div>
          )}

          {/* Call history */}
          <CallHistory patientId={patient.id} />
        </div>
      )}
    </Card>
  );
}
