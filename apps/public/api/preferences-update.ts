import { BeehiivError } from "./_lib/beehiiv";
import {
  PATIENT_STATUS_VALUES,
  TOPIC_KEYS,
  type PatientStatusValue,
  type TopicKey,
  savePreferences,
} from "./_lib/preferences";

const SID_REGEX = /^sub_[A-Za-z0-9_-]{8,}$/;

interface UpdateBody {
  sid?: unknown;
  topics?: unknown;
  patientStatus?: unknown;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as UpdateBody;
    const sid = typeof body.sid === "string" ? body.sid.trim() : "";
    if (!SID_REGEX.test(sid)) {
      return json({ error: "Invalid or missing subscriber ID." }, 400);
    }

    const topics = parseTopics(body.topics);
    if (!topics) return json({ error: "Invalid topics payload." }, 400);

    const patientStatus = parsePatientStatus(body.patientStatus);

    const view = await savePreferences(sid, topics, patientStatus);
    return json(view, 200);
  } catch (err) {
    if (err instanceof BeehiivError) {
      if (err.status === 404) return json({ error: "Subscriber not found." }, 404);
      console.error("preferences-update Beehiiv error:", err.status, err.message);
      return json({ error: "Could not save preferences right now." }, 502);
    }
    console.error("preferences-update error:", err);
    return json({ error: "Internal server error." }, 500);
  }
}

function parseTopics(raw: unknown): Record<TopicKey, boolean> | null {
  if (!raw || typeof raw !== "object") return null;
  const out = {} as Record<TopicKey, boolean>;
  for (const key of TOPIC_KEYS) {
    const value = (raw as Record<string, unknown>)[key];
    if (typeof value !== "boolean") return null;
    out[key] = value;
  }
  return out;
}

function parsePatientStatus(raw: unknown): PatientStatusValue | null {
  if (typeof raw !== "string") return null;
  const v = raw.trim().toLowerCase();
  return (PATIENT_STATUS_VALUES as readonly string[]).includes(v) ? (v as PatientStatusValue) : null;
}

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}
