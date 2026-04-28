import { Resend } from "resend";
import { subscribe as beehiivSubscribe } from "./_lib/beehiiv";

const resend = new Resend(process.env.RESEND_API_KEY);

// Simple in-memory rate limiter (5 requests per IP per minute within a warm instance)
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

const ADMIN_EMAIL = "admin@hcimed.com";

const PROGRAMS_RECIPIENTS = Array.from(
  new Set(
    [
      ...(
        process.env.EMAIL_RECIPIENTS_PROGRAMS ||
        process.env.EMAIL_RECIPIENTS_APPOINTMENTS ||
        "care@hcimed.com"
      )
        .split(",")
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean),
      // Always include admin so they get a primary copy, not just CC
      ADMIN_EMAIL,
    ],
  ),
);

type ProgramInterest = "weight-loss" | "trt" | "both" | "unsure";
type PatientStatus = "new" | "existing";
type HciPatient = "yes" | "no";
type NonHciInterest = "primary-care" | "program-only";
type Intent = "info" | "start";

interface ProgramsInquiryPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  patientStatus: PatientStatus;
  isCurrentHciPatient: HciPatient;
  hciPatientName?: string;
  nonHciInterest?: NonHciInterest;
  programInterest: ProgramInterest;
  intent: Intent[];
  message?: string;
  subscribeToUpdates?: boolean;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  website?: string; // honeypot
}

const PROGRAM_INTEREST_LABELS: Record<ProgramInterest, string> = {
  "weight-loss": "Medical Weight Loss",
  trt: "Men's Health & TRT",
  both: "Both Programs",
  unsure: "Not sure yet — help me decide",
};

const PROGRAM_INTEREST_BADGE: Record<
  ProgramInterest,
  { color: string; bg: string; label: string }
> = {
  "weight-loss": { color: "#16a34a", bg: "#dcfce7", label: "WEIGHT LOSS" },
  trt: { color: "#7c3aed", bg: "#ede9fe", label: "MEN'S HEALTH / TRT" },
  both: { color: "#0ea5e9", bg: "#e0f2fe", label: "BOTH PROGRAMS" },
  unsure: { color: "#d97706", bg: "#fef3c7", label: "NEEDS GUIDANCE" },
};

const PATIENT_STATUS_LABELS: Record<PatientStatus, string> = {
  new: "New patient",
  existing: "Current patient",
};

const NON_HCI_INTEREST_LABELS: Record<NonHciInterest, string> = {
  "primary-care": "Open to discussing primary care with HCI",
  "program-only": "Only interested in this program",
};

const INTENT_LABELS: Record<Intent, string> = {
  info: "Wants more information",
  start: "Ready to start now",
};

const FF_DEADLINE_DISPLAY = "May 31, 2026";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function generateStaffEmailHtml(data: ProgramsInquiryPayload): string {
  const badge = PROGRAM_INTEREST_BADGE[data.programInterest];
  const ffEligible = data.isCurrentHciPatient === "yes";
  const primaryCareInterest = data.nonHciInterest === "primary-care";
  const intentLines = data.intent
    .map((i) => `<li>${escapeHtml(INTENT_LABELS[i] || i)}</li>`)
    .join("");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: #fff; }
    .header { background: linear-gradient(135deg, #1e3a5f 0%, #2d8bc9 100%); color: white; padding: 30px 20px; text-align: center; }
    .header h1 { margin: 0 0 8px; font-size: 22px; font-weight: 600; }
    .header p { margin: 0; opacity: 0.9; font-size: 14px; }
    .badge { display: inline-block; padding: 8px 20px; background: ${badge.bg}; color: ${badge.color}; border-radius: 20px; font-weight: 700; font-size: 13px; letter-spacing: 0.5px; margin: 20px auto; }
    .content { padding: 20px; }
    .ff-banner { background: #ecfeff; border: 1px solid #67e8f9; border-left: 4px solid #0891b2; border-radius: 8px; padding: 14px 16px; margin: 16px 0; color: #0e7490; font-weight: 600; text-align: center; font-size: 14px; }
    .pc-banner { background: #ecfdf5; border: 1px solid #6ee7b7; border-left: 4px solid #059669; border-radius: 8px; padding: 14px 16px; margin: 16px 0; color: #065f46; font-weight: 600; text-align: center; font-size: 14px; }
    .action-needed { background: #fee2e2; border: 1px solid #fecaca; border-radius: 8px; padding: 12px 16px; margin: 20px 0; color: #991b1b; font-weight: 500; text-align: center; }
    .section { margin: 20px 0; padding: 20px; background: #f9fafb; border-radius: 8px; border-left: 4px solid #2d8bc9; }
    .section-title { font-size: 16px; font-weight: 600; color: #1e3a5f; margin: 0 0 15px; padding-bottom: 10px; border-bottom: 1px solid #e5e7eb; }
    .field { margin: 10px 0; display: flex; flex-wrap: wrap; }
    .label { font-weight: 600; color: #4b5563; min-width: 160px; flex-shrink: 0; }
    .value { color: #1f2937; flex: 1; }
    .intent-list { margin: 0; padding-left: 20px; color: #1f2937; }
    .notes-section { background: #f0f9ff; border-left-color: #0ea5e9; }
    .notes-text { padding: 12px; background: #fff; border-radius: 4px; border: 1px solid #e0f2fe; white-space: pre-wrap; font-size: 14px; }
    .footer { margin-top: 30px; padding: 20px; background: #f3f4f6; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>New Programs Inquiry</h1>
      <p>Weight Loss + TRT Campaign Landing Page</p>
    </div>
    <div class="content">
      <div style="text-align:center"><span class="badge">${badge.label}</span></div>
      ${ffEligible ? `<div class="ff-banner">★ HCI Patient — Friends &amp; Family Eligible (15% off)${data.hciPatientName ? ` · Patient on file: ${escapeHtml(data.hciPatientName)}` : ""}</div>` : ""}
      ${primaryCareInterest ? `<div class="pc-banner">★ Open to Primary Care — lead would like to discuss HCI handling their primary care needs too</div>` : ""}
      <div class="action-needed">Action Required: Please contact this lead to follow up on their interest in ${escapeHtml(PROGRAM_INTEREST_LABELS[data.programInterest])}</div>
      <div class="section">
        <div class="section-title">Contact Information</div>
        <div class="field"><span class="label">Name:</span><span class="value">${escapeHtml(data.firstName)} ${escapeHtml(data.lastName)}</span></div>
        <div class="field"><span class="label">Email:</span><span class="value"><a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a></span></div>
        <div class="field"><span class="label">Phone:</span><span class="value"><a href="tel:${escapeHtml(data.phone)}">${escapeHtml(data.phone)}</a></span></div>
        <div class="field"><span class="label">Patient Status:</span><span class="value">${PATIENT_STATUS_LABELS[data.patientStatus] || data.patientStatus}</span></div>
        <div class="field"><span class="label">HCI Patient (F&amp;F):</span><span class="value">${ffEligible ? "Yes" : "No"}${data.hciPatientName ? ` — ${escapeHtml(data.hciPatientName)}` : ""}</span></div>
        ${data.nonHciInterest ? `<div class="field"><span class="label">Non-HCI Interest:</span><span class="value">${escapeHtml(NON_HCI_INTEREST_LABELS[data.nonHciInterest])}</span></div>` : ""}
        <div class="field"><span class="label">Program Interest:</span><span class="value">${escapeHtml(PROGRAM_INTEREST_LABELS[data.programInterest])}</span></div>
      </div>
      <div class="section">
        <div class="section-title">How We Can Help</div>
        <ul class="intent-list">${intentLines}</ul>
      </div>
      ${data.message ? `
      <div class="section notes-section">
        <div class="section-title">Message from Lead</div>
        <div class="notes-text">${escapeHtml(data.message)}</div>
      </div>` : ""}
      ${(data.utmSource || data.utmMedium || data.utmCampaign || data.utmContent) ? `
      <div class="section">
        <div class="section-title">Source</div>
        ${data.utmSource ? `<div class="field"><span class="label">utm_source:</span><span class="value">${escapeHtml(data.utmSource)}</span></div>` : ""}
        ${data.utmMedium ? `<div class="field"><span class="label">utm_medium:</span><span class="value">${escapeHtml(data.utmMedium)}</span></div>` : ""}
        ${data.utmCampaign ? `<div class="field"><span class="label">utm_campaign:</span><span class="value">${escapeHtml(data.utmCampaign)}</span></div>` : ""}
        ${data.utmContent ? `<div class="field"><span class="label">utm_content:</span><span class="value">${escapeHtml(data.utmContent)}</span></div>` : ""}
        <div class="field"><span class="label">Newsletter opt-in:</span><span class="value">${data.subscribeToUpdates ? "Yes" : "No"}</span></div>
      </div>` : `
      <div class="section">
        <div class="section-title">Source</div>
        <div class="field"><span class="label">utm:</span><span class="value">(none — direct or organic)</span></div>
        <div class="field"><span class="label">Newsletter opt-in:</span><span class="value">${data.subscribeToUpdates ? "Yes" : "No"}</span></div>
      </div>`}
    </div>
    <div class="footer">
      <p>Submitted through the New Programs campaign page on hcimed.com</p>
      <p>Submitted on: ${new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles", dateStyle: "full", timeStyle: "short" })} PT</p>
    </div>
  </div>
</body>
</html>`;
}

function generateConfirmationEmailHtml(
  firstName: string,
  programInterest: ProgramInterest,
  ffEligible: boolean,
  primaryCareInterest: boolean,
): string {
  const programLabel = PROGRAM_INTEREST_LABELS[programInterest];

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: #fff; }
    .header { background: linear-gradient(135deg, #1e3a5f 0%, #2d8bc9 100%); color: white; padding: 30px 20px; text-align: center; }
    .header h1 { margin: 0 0 8px; font-size: 22px; }
    .header p { margin: 0; opacity: 0.9; font-size: 14px; }
    .content { padding: 30px 20px; }
    .content h2 { color: #1e3a5f; font-size: 18px; margin: 0 0 16px; }
    .content p { color: #4b5563; font-size: 15px; margin: 0 0 12px; }
    .ff-box { background: #ecfeff; border: 1px solid #67e8f9; border-left: 4px solid #0891b2; border-radius: 8px; padding: 16px; margin: 20px 0; }
    .ff-box h3 { color: #0e7490; font-size: 16px; margin: 0 0 8px; }
    .ff-box p { margin: 4px 0; font-size: 14px; color: #155e75; }
    .footer { padding: 20px; background: #f3f4f6; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>HCI Medical Group</h1>
      <p>Medical Weight Loss &amp; Men's Health Programs</p>
    </div>
    <div class="content">
      <h2>Thank you, ${escapeHtml(firstName)}!</h2>
      <p>We've received your request regarding our ${escapeHtml(programLabel)} program${programInterest === "both" ? "s" : ""}. A member of our care team will reach out to you within 1 business day to answer your questions and guide you through the next steps.</p>
      ${ffEligible ? `
      <div class="ff-box">
        <h3>★ Your Friends &amp; Family discount is reserved</h3>
        <p>As a thank-you to our HCI patients, you and the people you care about can save <strong>15% on our new Medical Weight Loss and TRT programs</strong>.</p>
        <p><strong>New patients must register by ${FF_DEADLINE_DISPLAY}</strong> to claim this discount, so we'll prioritize your follow-up.</p>
      </div>` : ""}
      ${primaryCareInterest ? `<p>We'll also be happy to discuss how HCI can support your primary care needs.</p>` : ""}
      <p>If you have any questions in the meantime, please call us at <a href="tel:6267924185" style="color:#2d8bc9;font-weight:600;">(626) 792-4185</a>.</p>
      <p style="margin-top:20px;">Warm regards,<br><strong>HCI Medical Group</strong></p>
    </div>
    <div class="footer">
      <p>HCI Medical Group | 65 N. Madison Ave. #709, Pasadena, CA 91101</p>
      <p>(626) 792-4185 | <a href="https://hcimed.com" style="color:#2d8bc9;">hcimed.com</a></p>
    </div>
  </div>
</body>
</html>`;
}

export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";
    if (!checkRateLimit(ip)) {
      return new Response(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        { status: 429, headers: { "Content-Type": "application/json", "Retry-After": "60" } },
      );
    }

    const data: ProgramsInquiryPayload = await request.json();

    // Honeypot check
    if (data.website) {
      // Bot detected — return success silently
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Validate required fields
    if (
      !data.firstName ||
      !data.lastName ||
      !data.email ||
      !data.phone ||
      !data.patientStatus ||
      !data.isCurrentHciPatient ||
      !data.programInterest ||
      !Array.isArray(data.intent) ||
      data.intent.length === 0
    ) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    if (data.isCurrentHciPatient === "yes" && !data.hciPatientName?.trim()) {
      return new Response(
        JSON.stringify({ error: "HCI patient name is required when claiming Friends & Family eligibility" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    if (data.isCurrentHciPatient === "no" && !data.nonHciInterest) {
      return new Response(
        JSON.stringify({ error: "Please choose one option so we can guide your follow-up" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const ffEligible = data.isCurrentHciPatient === "yes";
    const primaryCareInterest = data.nonHciInterest === "primary-care";
    const programLabel = PROGRAM_INTEREST_LABELS[data.programInterest];
    const subjectTags = [
      ffEligible ? "F&F" : null,
      primaryCareInterest ? "Primary Care" : null,
    ].filter(Boolean);
    const subjectSuffix = subjectTags.length ? ` · ${subjectTags.join(" · ")}` : "";
    const subject = `[New Programs Campaign] ${programLabel}${subjectSuffix} — ${data.firstName} ${data.lastName}`;

    const { error } = await resend.emails.send({
      from: "HCI New Programs <noreply@hcimed.com>",
      to: PROGRAMS_RECIPIENTS,
      replyTo: data.email,
      subject,
      html: generateStaffEmailHtml(data),
    });

    if (error) {
      console.error("Resend error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to send inquiry" }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    // Send confirmation email to patient (non-blocking)
    try {
      await resend.emails.send({
        from: "HCI Medical Group <noreply@hcimed.com>",
        to: [data.email],
        subject: "We received your request — HCI Medical Group",
        html: generateConfirmationEmailHtml(
          data.firstName,
          data.programInterest,
          ffEligible,
          primaryCareInterest,
        ),
      });
    } catch (confirmError) {
      console.error("Failed to send programs inquiry confirmation email:", confirmError);
    }

    // Newsletter opt-in (non-blocking — must never fail the inquiry submission)
    if (data.subscribeToUpdates) {
      try {
        const patientStatusValue =
          data.patientStatus === "existing" ? "current" : "prospect";
        await beehiivSubscribe({
          email: data.email.trim().toLowerCase(),
          tags: ["topic_programs", "lead_programs_page"],
          customFields: [
            { name: "First Name", value: data.firstName },
            { name: "Last Name", value: data.lastName },
            { name: "patient_status", value: patientStatusValue },
            { name: "topic_programs", value: "yes" },
            { name: "topic_health_tips", value: "yes" },
            { name: "topic_practice_updates", value: "yes" },
            { name: "topic_ff_promos", value: "yes" },
            { name: "signup_source", value: "programs-inquiry-form" },
          ],
          utmSource: data.utmSource,
          utmMedium: data.utmMedium,
          utmCampaign: data.utmCampaign,
          referringSite: "hcimed.com",
          reactivateExisting: true,
          sendWelcomeEmail: false,
        });
      } catch (subscribeError) {
        console.error("Beehiiv subscribe (programs-inquiry opt-in) failed:", subscribeError);
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Function error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
