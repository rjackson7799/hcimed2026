// Beehiiv v2 API client (server-side only).
//
// Files under api/_lib are not exposed as Vercel Functions (the underscore
// prefix excludes them from routing). Import this from any handler in api/.

const BEEHIIV_BASE = "https://api.beehiiv.com/v2";

export type BeehiivStatus = "active" | "validating" | "invalid" | "pending" | "inactive" | "unsubscribed";

export interface BeehiivCustomField {
  name: string;
  value: string;
}

export interface BeehiivSubscription {
  id: string;
  email: string;
  status: BeehiivStatus;
  created: number;
  subscription_tier: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  referring_site?: string;
  custom_fields?: BeehiivCustomField[];
}

export interface SubscribeInput {
  email: string;
  customFields?: BeehiivCustomField[];
  tags?: string[];
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  referringSite?: string;
  reactivateExisting?: boolean;
  sendWelcomeEmail?: boolean;
}

export class BeehiivError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = "BeehiivError";
    this.status = status;
    this.body = body;
  }
}

function getEnv(): { apiKey: string; pubId: string } {
  const apiKey = process.env.BEEHIIV_API_KEY;
  const pubId = process.env.BEEHIIV_PUBLICATION_ID;
  if (!apiKey || !pubId) {
    throw new BeehiivError(
      "Beehiiv environment not configured (BEEHIIV_API_KEY / BEEHIIV_PUBLICATION_ID)",
      500,
      null,
    );
  }
  return { apiKey, pubId };
}

async function beehiivFetch<T>(
  path: string,
  init: RequestInit & { body?: string } = {},
): Promise<T> {
  const { apiKey } = getEnv();
  const res = await fetch(`${BEEHIIV_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(init.headers || {}),
    },
  });

  const text = await res.text();
  let json: unknown = null;
  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      json = text;
    }
  }

  if (!res.ok) {
    const message =
      (json && typeof json === "object" && "errors" in json
        ? JSON.stringify((json as { errors: unknown }).errors)
        : null) ||
      (json && typeof json === "object" && "message" in json
        ? String((json as { message: unknown }).message)
        : null) ||
      `Beehiiv request failed: ${res.status}`;
    throw new BeehiivError(message, res.status, json);
  }

  return json as T;
}

interface CreateSubscriptionResponse {
  data: BeehiivSubscription;
}

interface GetSubscriptionResponse {
  data: BeehiivSubscription;
}

interface BulkStatusResponse {
  message?: string;
}

/**
 * Create or reactivate a subscription. Returns the subscription record.
 * Pass `reactivateExisting: true` to allow re-subscribing previously
 * unsubscribed addresses.
 */
export async function subscribe(input: SubscribeInput): Promise<BeehiivSubscription> {
  const { pubId } = getEnv();
  const body: Record<string, unknown> = {
    email: input.email,
    reactivate_existing: input.reactivateExisting ?? true,
    send_welcome_email: input.sendWelcomeEmail ?? false,
  };
  if (input.customFields?.length) body.custom_fields = input.customFields;
  if (input.utmSource) body.utm_source = input.utmSource;
  if (input.utmMedium) body.utm_medium = input.utmMedium;
  if (input.utmCampaign) body.utm_campaign = input.utmCampaign;
  if (input.referringSite) body.referring_site = input.referringSite;

  const result = await beehiivFetch<CreateSubscriptionResponse>(
    `/publications/${pubId}/subscriptions`,
    { method: "POST", body: JSON.stringify(body) },
  );

  // Tags are applied in a separate call (Beehiiv API design).
  if (input.tags?.length && result.data?.id) {
    await addTags(result.data.id, input.tags);
  }

  return result.data;
}

export async function getSubscriptionById(subscriptionId: string): Promise<BeehiivSubscription> {
  const { pubId } = getEnv();
  const result = await beehiivFetch<GetSubscriptionResponse>(
    `/publications/${pubId}/subscriptions/${encodeURIComponent(subscriptionId)}`,
    { method: "GET" },
  );
  return result.data;
}

export async function getSubscriptionByEmail(email: string): Promise<BeehiivSubscription | null> {
  const { pubId } = getEnv();
  try {
    const result = await beehiivFetch<GetSubscriptionResponse>(
      `/publications/${pubId}/subscriptions/by_email/${encodeURIComponent(email)}`,
      { method: "GET" },
    );
    return result.data;
  } catch (err) {
    if (err instanceof BeehiivError && err.status === 404) return null;
    throw err;
  }
}

/** Update custom fields on an existing subscription. */
export async function updateSubscription(
  subscriptionId: string,
  patch: { customFields?: BeehiivCustomField[] },
): Promise<BeehiivSubscription> {
  const { pubId } = getEnv();
  const body: Record<string, unknown> = {};
  if (patch.customFields) body.custom_fields = patch.customFields;

  const result = await beehiivFetch<{ data: BeehiivSubscription }>(
    `/publications/${pubId}/subscriptions/${encodeURIComponent(subscriptionId)}`,
    { method: "PUT", body: JSON.stringify(body) },
  );
  return result.data;
}

export async function addTags(subscriptionId: string, tags: string[]): Promise<void> {
  const { pubId } = getEnv();
  await beehiivFetch<{ message?: string }>(
    `/publications/${pubId}/subscriptions/${encodeURIComponent(subscriptionId)}/tags`,
    { method: "POST", body: JSON.stringify({ tags }) },
  );
}

async function setStatus(subscriptionId: string, newStatus: "active" | "unsubscribed"): Promise<void> {
  const { pubId } = getEnv();
  await beehiivFetch<BulkStatusResponse>(
    `/publications/${pubId}/bulk_subscription_updates/status`,
    {
      method: "PATCH",
      body: JSON.stringify({
        subscription_ids: [subscriptionId],
        new_status: newStatus,
      }),
    },
  );
}

export async function unsubscribe(subscriptionId: string): Promise<void> {
  await setStatus(subscriptionId, "unsubscribed");
}

export async function resubscribe(subscriptionId: string): Promise<void> {
  await setStatus(subscriptionId, "active");
}
