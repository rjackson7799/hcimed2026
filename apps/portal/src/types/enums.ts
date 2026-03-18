export const DISPOSITION = {
  NO_ANSWER: 'no_answer',
  VOICEMAIL: 'voicemail',
  NEEDS_MORE_INFO: 'needs_more_info',
  NOT_INTERESTED: 'not_interested',
  WILL_SWITCH: 'will_switch',
  WRONG_NUMBER: 'wrong_number',
  DISCONNECTED: 'disconnected',
} as const;

export type Disposition = typeof DISPOSITION[keyof typeof DISPOSITION];

export const OUTREACH_STATUS = {
  NOT_CALLED: 'not_called',
  NO_ANSWER: 'no_answer',
  NEEDS_MORE_INFO: 'needs_more_info',
  NOT_INTERESTED: 'not_interested',
  WILL_SWITCH: 'will_switch',
  FORWARDED_TO_BROKER: 'forwarded_to_broker',
  WRONG_NUMBER: 'wrong_number',
  COMPLETED: 'completed',
  UNABLE_TO_COMPLETE: 'unable_to_complete',
} as const;

export type OutreachStatus = typeof OUTREACH_STATUS[keyof typeof OUTREACH_STATUS];

export const USER_ROLE = {
  ADMIN: 'admin',
  STAFF: 'staff',
  PROVIDER: 'provider',
  BROKER: 'broker',
} as const;

export type UserRole = typeof USER_ROLE[keyof typeof USER_ROLE];

export const USER_TITLE = {
  ADMINISTRATOR: 'Administrator',
  MEDICAL_DIRECTOR: 'Medical Director',
} as const;

export type UserTitle = typeof USER_TITLE[keyof typeof USER_TITLE];

export const TITLE_OPTIONS_BY_ROLE: Partial<Record<UserRole, { value: string; label: string }[]>> = {
  admin: [
    { value: 'Administrator', label: 'Administrator' },
    { value: 'Medical Director', label: 'Medical Director' },
  ],
};

export const BROKER_STATUS = {
  RECEIVED: 'received',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  UNABLE_TO_COMPLETE: 'unable_to_complete',
} as const;

export type BrokerStatus = typeof BROKER_STATUS[keyof typeof BROKER_STATUS];

export const PROJECT_STATUS = {
  ACTIVE: 'active',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  ARCHIVED: 'archived',
} as const;

export type ProjectStatus = typeof PROJECT_STATUS[keyof typeof PROJECT_STATUS];

// ─── Practice Health Module Enums ──────────────────────────────────

export const PH_REPORT_TYPE = {
  CHARGES: '371.02',
  COLLECTIONS: '36.14',
  PRODUCTIVITY: '4.06',
  RVU: 'rvu',
} as const;

export type PhReportType = typeof PH_REPORT_TYPE[keyof typeof PH_REPORT_TYPE];

export const PH_SERVICE_LINE = {
  HCI_OFFICE: 'hci_office',
  MOBILE_DOCS: 'mobile_docs',
} as const;

export type PhServiceLine = typeof PH_SERVICE_LINE[keyof typeof PH_SERVICE_LINE];

export const PH_UPLOAD_STATUS = {
  PROCESSING: 'processing',
  SUCCESS: 'success',
  ERROR: 'error',
  DUPLICATE: 'duplicate',
} as const;

export type PhUploadStatus = typeof PH_UPLOAD_STATUS[keyof typeof PH_UPLOAD_STATUS];

export const PH_PROVIDER_ROLE = {
  PHYSICIAN: 'physician',
  NP: 'np',
  PA: 'pa',
} as const;

export type PhProviderRole = typeof PH_PROVIDER_ROLE[keyof typeof PH_PROVIDER_ROLE];

export const PH_INSIGHT_TYPE = {
  DAILY_SUMMARY: 'daily_summary',
  RECOMMENDATION: 'recommendation',
  TREND: 'trend',
  ALERT: 'alert',
} as const;

export type PhInsightType = typeof PH_INSIGHT_TYPE[keyof typeof PH_INSIGHT_TYPE];

export const PH_INSIGHT_SEVERITY = {
  CRITICAL: 'critical',
  WARNING: 'warning',
  INFO: 'info',
} as const;

export type PhInsightSeverity = typeof PH_INSIGHT_SEVERITY[keyof typeof PH_INSIGHT_SEVERITY];

export const PH_INSIGHT_CATEGORY = {
  PRODUCTIVITY: 'productivity',
  REVENUE: 'revenue',
  CODING: 'coding',
  EFFICIENCY: 'efficiency',
} as const;

export type PhInsightCategory = typeof PH_INSIGHT_CATEGORY[keyof typeof PH_INSIGHT_CATEGORY];
