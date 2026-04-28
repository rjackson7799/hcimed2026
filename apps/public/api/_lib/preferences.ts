import {
  type BeehiivCustomField,
  type BeehiivSubscription,
  getSubscriptionById,
  updateSubscription,
} from "./beehiiv";

export const TOPIC_KEYS = [
  "topic_health_tips",
  "topic_programs",
  "topic_practice_updates",
  "topic_ff_promos",
] as const;
export type TopicKey = (typeof TOPIC_KEYS)[number];

export const PATIENT_STATUS_VALUES = ["current", "past", "prospect"] as const;
export type PatientStatusValue = (typeof PATIENT_STATUS_VALUES)[number];

export interface PreferencesView {
  email: string;
  status: string;
  topics: Record<TopicKey, boolean>;
  patientStatus: PatientStatusValue | null;
}

function readField(fields: BeehiivCustomField[] | undefined, name: string): string | undefined {
  return fields?.find((f) => f.name.toLowerCase() === name.toLowerCase())?.value;
}

function isYes(value: string | undefined): boolean {
  if (!value) return true; // default-on if never set
  const v = value.trim().toLowerCase();
  return v === "yes" || v === "true" || v === "1";
}

export function toView(sub: BeehiivSubscription): PreferencesView {
  const fields = sub.custom_fields;
  const topics = {} as Record<TopicKey, boolean>;
  for (const key of TOPIC_KEYS) topics[key] = isYes(readField(fields, key));

  const rawPatient = (readField(fields, "patient_status") || "").trim().toLowerCase();
  const patientStatus = (PATIENT_STATUS_VALUES as readonly string[]).includes(rawPatient)
    ? (rawPatient as PatientStatusValue)
    : null;

  return {
    email: sub.email,
    status: sub.status,
    topics,
    patientStatus,
  };
}

export async function loadPreferences(subscriptionId: string): Promise<PreferencesView> {
  const sub = await getSubscriptionById(subscriptionId);
  return toView(sub);
}

export async function savePreferences(
  subscriptionId: string,
  topics: Record<TopicKey, boolean>,
  patientStatus: PatientStatusValue | null,
): Promise<PreferencesView> {
  const customFields: BeehiivCustomField[] = [];
  for (const key of TOPIC_KEYS) {
    customFields.push({ name: key, value: topics[key] ? "yes" : "no" });
  }
  if (patientStatus) {
    customFields.push({ name: "patient_status", value: patientStatus });
  }
  const updated = await updateSubscription(subscriptionId, { customFields });
  return toView(updated);
}
