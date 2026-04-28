import { BeehiivError, resubscribe, unsubscribe } from "./_lib/beehiiv";

const SID_REGEX = /^sub_[A-Za-z0-9_-]{8,}$/;

interface Body {
  sid?: unknown;
  action?: unknown; // "unsubscribe" (default) | "resubscribe"
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as Body;
    const sid = typeof body.sid === "string" ? body.sid.trim() : "";
    if (!SID_REGEX.test(sid)) {
      return json({ error: "Invalid or missing subscriber ID." }, 400);
    }

    const action = body.action === "resubscribe" ? "resubscribe" : "unsubscribe";

    if (action === "resubscribe") {
      await resubscribe(sid);
    } else {
      await unsubscribe(sid);
    }

    return json({ success: true, status: action === "resubscribe" ? "active" : "unsubscribed" }, 200);
  } catch (err) {
    if (err instanceof BeehiivError) {
      if (err.status === 404) return json({ error: "Subscriber not found." }, 404);
      console.error("unsubscribe Beehiiv error:", err.status, err.message);
      return json({ error: "Could not update subscription right now." }, 502);
    }
    console.error("unsubscribe error:", err);
    return json({ error: "Internal server error." }, 500);
  }
}

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}
