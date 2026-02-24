import type { OutreachStatus, BrokerStatus, ProjectStatus } from '@/portal/types';

interface StatusConfig {
  color: string;
  bg: string;
  label: string;
}

export const STATUS_CONFIG: Record<OutreachStatus, StatusConfig> = {
  not_called:          { color: 'text-blue-700',    bg: 'bg-blue-100',    label: 'Not Called' },
  no_answer:           { color: 'text-gray-700',    bg: 'bg-gray-100',    label: 'No Answer' },
  needs_more_info:     { color: 'text-yellow-700',  bg: 'bg-yellow-100',  label: 'Needs More Info' },
  not_interested:      { color: 'text-orange-700',  bg: 'bg-orange-100',  label: 'Not Interested' },
  will_switch:         { color: 'text-green-700',   bg: 'bg-green-100',   label: 'Will Switch' },
  forwarded_to_broker: { color: 'text-purple-700',  bg: 'bg-purple-100',  label: 'Forwarded to Broker' },
  wrong_number:        { color: 'text-red-700',     bg: 'bg-red-100',     label: 'Wrong Number' },
  completed:           { color: 'text-emerald-700', bg: 'bg-emerald-100', label: 'Completed' },
  unable_to_complete:  { color: 'text-red-700',     bg: 'bg-red-100',     label: 'Unable to Complete' },
};

export const BROKER_STATUS_CONFIG: Record<BrokerStatus, StatusConfig> = {
  received:            { color: 'text-blue-700',    bg: 'bg-blue-100',    label: 'Received' },
  in_progress:         { color: 'text-yellow-700',  bg: 'bg-yellow-100',  label: 'In Progress' },
  completed:           { color: 'text-emerald-700', bg: 'bg-emerald-100', label: 'Completed' },
  unable_to_complete:  { color: 'text-red-700',     bg: 'bg-red-100',     label: 'Unable to Complete' },
};

export const PROJECT_STATUS_CONFIG: Record<ProjectStatus, StatusConfig> = {
  active:    { color: 'text-green-700',  bg: 'bg-green-100',  label: 'Active' },
  paused:    { color: 'text-yellow-700', bg: 'bg-yellow-100', label: 'Paused' },
  completed: { color: 'text-blue-700',   bg: 'bg-blue-100',   label: 'Completed' },
  archived:  { color: 'text-gray-700',   bg: 'bg-gray-100',   label: 'Archived' },
};

export const DISPOSITION_OPTIONS = [
  { value: 'no_answer',       label: 'No Answer',       color: 'border-gray-300 hover:bg-gray-50' },
  { value: 'voicemail',       label: 'Voicemail',        color: 'border-gray-300 hover:bg-gray-50' },
  { value: 'needs_more_info', label: 'Needs More Info',  color: 'border-yellow-300 hover:bg-yellow-50' },
  { value: 'not_interested',  label: 'Not Interested',   color: 'border-orange-300 hover:bg-orange-50' },
  { value: 'will_switch',     label: 'Will Switch',      color: 'border-green-300 hover:bg-green-50' },
  { value: 'wrong_number',    label: 'Wrong Number',     color: 'border-red-300 hover:bg-red-50' },
  { value: 'disconnected',    label: 'Disconnected',     color: 'border-red-300 hover:bg-red-50' },
] as const;

export const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
export const SESSION_WARNING_MS = 25 * 60 * 1000; // 25 minutes (show warning)
export const MAX_NOTE_LENGTH = 500;
export const MAX_MESSAGE_LENGTH = 1000;
export const SEARCH_DEBOUNCE_MS = 300;
export const PATIENTS_PAGE_SIZE = 50;
