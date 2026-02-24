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
  BROKER: 'broker',
} as const;

export type UserRole = typeof USER_ROLE[keyof typeof USER_ROLE];

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
