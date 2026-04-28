import { BeehiivError, subscribe } from "./_lib/beehiiv";

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60 * 1000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface SubscribeBody {
  email?: unknown;
  _gotcha?: unknown;
  utm_source?: unknown;
  utm_medium?: unknown;
  utm_campaign?: unknown;
  source?: unknown; // optional human label, e.g. "footer", "blog-section"
}

function asString(v: unknown): string | undefined {
  return typeof v === "string" && v.length > 0 ? v : undefined;
}

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || request.headers.get("x-real-ip")
      || "unknown";

    if (!checkRateLimit(ip)) {
      return new Response(JSON.stringify({ error: "Too many requests. Please try again later." }), {
        status: 429,
        headers: { "Content-Type": "application/json", "Retry-After": "60" },
      });
    }

    const body = (await request.json()) as SubscribeBody;

    // Honeypot check — return success silently
    if (body._gotcha) {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!email || !EMAIL_REGEX.test(email)) {
      return new Response(JSON.stringify({ error: "Please provide a valid email address." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const sourceLabel = asString(body.source) ?? "footer";

    try {
      await subscribe({
        email,
        utmSource: asString(body.utm_source),
        utmMedium: asString(body.utm_medium),
        utmCampaign: asString(body.utm_campaign),
        referringSite: "hcimed.com",
        reactivateExisting: true,
        sendWelcomeEmail: true,
        customFields: [{ name: "signup_source", value: sourceLabel }],
      });
    } catch (err) {
      if (err instanceof BeehiivError) {
        // Treat duplicates as success from the user's perspective
        const msg = err.message?.toLowerCase() ?? "";
        if (err.status === 409 || msg.includes("already exists") || msg.includes("duplicate")) {
          return new Response(JSON.stringify({ success: true, alreadySubscribed: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }
        console.error("Beehiiv subscribe error:", err.status, err.message, err.body);
        return new Response(JSON.stringify({ error: "Newsletter signup is temporarily unavailable. Please try again." }), {
          status: 502,
          headers: { "Content-Type": "application/json" },
        });
      }
      throw err;
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Newsletter subscribe error:", err);
    return new Response(JSON.stringify({ error: "Something went wrong. Please try again." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
