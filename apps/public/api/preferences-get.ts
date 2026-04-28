import { BeehiivError } from "./_lib/beehiiv";
import { loadPreferences } from "./_lib/preferences";

const SID_REGEX = /^sub_[A-Za-z0-9_-]{8,}$/;

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const sid = url.searchParams.get("sid")?.trim() ?? "";
    if (!SID_REGEX.test(sid)) {
      return json({ error: "Invalid or missing subscriber ID." }, 400);
    }

    const view = await loadPreferences(sid);
    return json(view, 200);
  } catch (err) {
    if (err instanceof BeehiivError) {
      if (err.status === 404) return json({ error: "Subscriber not found." }, 404);
      console.error("preferences-get Beehiiv error:", err.status, err.message);
      return json({ error: "Could not load preferences right now." }, 502);
    }
    console.error("preferences-get error:", err);
    return json({ error: "Internal server error." }, 500);
  }
}

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}
