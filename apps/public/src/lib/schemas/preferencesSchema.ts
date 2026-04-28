import { z } from "zod";

export const TOPIC_KEYS = [
  "topic_health_tips",
  "topic_programs",
  "topic_practice_updates",
  "topic_ff_promos",
] as const;

export type TopicKey = (typeof TOPIC_KEYS)[number];

export const TOPIC_LABELS: Record<TopicKey, string> = {
  topic_health_tips: "Health tips & wellness",
  topic_programs: "Programs (Weight Loss & TRT)",
  topic_practice_updates: "Practice updates (new providers, insurance changes)",
  topic_ff_promos: "Friends & Family promotions",
};

export const PATIENT_STATUS_VALUES = ["current", "past", "prospect"] as const;
export type PatientStatusValue = (typeof PATIENT_STATUS_VALUES)[number];

export const PATIENT_STATUS_LABELS: Record<PatientStatusValue, string> = {
  current: "I am a current HCI patient",
  past: "I am a past HCI patient",
  prospect: "I am not yet an HCI patient",
};

export const preferencesUpdateSchema = z.object({
  sid: z.string().min(1),
  topics: z.record(z.enum(TOPIC_KEYS), z.boolean()),
  patientStatus: z.enum(PATIENT_STATUS_VALUES).optional(),
});

export type PreferencesUpdatePayload = z.infer<typeof preferencesUpdateSchema>;

export interface PreferencesView {
  email: string;
  status: string;
  topics: Record<TopicKey, boolean>;
  patientStatus: PatientStatusValue | null;
}
