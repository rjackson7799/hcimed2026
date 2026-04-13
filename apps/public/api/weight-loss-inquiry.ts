import { Resend } from "resend";

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

const WEIGHT_LOSS_RECIPIENTS = (
  process.env.EMAIL_RECIPIENTS_WEIGHTLOSS ||
  process.env.EMAIL_RECIPIENTS_APPOINTMENTS ||
  "care@hcimed.com"
)
  .split(",")
  .map((e) => e.trim());

interface WeightLossPayload {
  interest: "enroll" | "info";
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  isCurrentPatient?: "new" | "existing";
  message?: string;
  website?: string; // honeypot
}

const INTEREST_LABELS: Record<string, string> = {
  enroll: "Enrolling in the program",
  info: "Getting more information",
};

const PATIENT_STATUS_LABELS: Record<string, string> = {
  new: "New patient",
  existing: "Existing patient",
};

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function generateStaffEmailHtml(data: WeightLossPayload): string {
  const isEnrollment = data.interest === "enroll";
  const badgeLabel = isEnrollment ? "ENROLLMENT REQUEST" : "INFORMATION REQUEST";
  const badgeColor = isEnrollment ? "#16a34a" : "#2563eb";
  const badgeBg = isEnrollment ? "#dcfce7" : "#dbeafe";

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
    .badge { display: inline-block; padding: 8px 20px; background: ${badgeBg}; color: ${badgeColor}; border-radius: 20px; font-weight: 700; font-size: 13px; letter-spacing: 0.5px; margin: 20px auto; }
    .content { padding: 20px; }
    .action-needed { background: #fee2e2; border: 1px solid #fecaca; border-radius: 8px; padding: 12px 16px; margin: 20px 0; color: #991b1b; font-weight: 500; text-align: center; }
    .section { margin: 20px 0; padding: 20px; background: #f9fafb; border-radius: 8px; border-left: 4px solid #2d8bc9; }
    .section-title { font-size: 16px; font-weight: 600; color: #1e3a5f; margin: 0 0 15px; padding-bottom: 10px; border-bottom: 1px solid #e5e7eb; }
    .field { margin: 10px 0; display: flex; flex-wrap: wrap; }
    .label { font-weight: 600; color: #4b5563; min-width: 160px; flex-shrink: 0; }
    .value { color: #1f2937; flex: 1; }
    .notes-section { background: #f0f9ff; border-left-color: #0ea5e9; }
    .notes-text { padding: 12px; background: #fff; border-radius: 4px; border: 1px solid #e0f2fe; white-space: pre-wrap; font-size: 14px; }
    .footer { margin-top: 30px; padding: 20px; background: #f3f4f6; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Medical Weight Loss Inquiry</h1>
      <p>GLP-1 Program — HCI Medical Group</p>
    </div>
    <div class="content">
      <div style="text-align:center"><span class="badge">${badgeLabel}</span></div>
      <div class="action-needed">Action Required: Please contact this ${isEnrollment ? "patient" : "prospective patient"} to ${isEnrollment ? "schedule their initial evaluation" : "provide program information"}</div>
      <div class="section">
        <div class="section-title">Contact Information</div>
        <div class="field"><span class="label">Name:</span><span class="value">${escapeHtml(data.firstName)} ${escapeHtml(data.lastName)}</span></div>
        <div class="field"><span class="label">Email:</span><span class="value"><a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a></span></div>
        <div class="field"><span class="label">Phone:</span><span class="value"><a href="tel:${escapeHtml(data.phone)}">${escapeHtml(data.phone)}</a></span></div>
        <div class="field"><span class="label">Interest:</span><span class="value">${INTEREST_LABELS[data.interest] || data.interest}</span></div>
        ${data.isCurrentPatient ? `<div class="field"><span class="label">Current Patient:</span><span class="value">${PATIENT_STATUS_LABELS[data.isCurrentPatient] || data.isCurrentPatient}</span></div>` : ""}
      </div>
      ${data.message ? `
      <div class="section notes-section">
        <div class="section-title">Message from Patient</div>
        <div class="notes-text">${escapeHtml(data.message)}</div>
      </div>` : ""}
    </div>
    <div class="footer">
      <p>Submitted through the Medical Weight Loss page on hcimed.com</p>
      <p>Submitted on: ${new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles", dateStyle: "full", timeStyle: "short" })} PT</p>
    </div>
  </div>
</body>
</html>`;
}

function generateConfirmationEmailHtml(firstName: string, isEnrollment: boolean): string {
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
    .info-box { background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 16px; margin: 20px 0; }
    .info-box p { margin: 4px 0; font-size: 14px; }
    .footer { padding: 20px; background: #f3f4f6; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>HCI Medical Group</h1>
      <p>Medical Weight Loss Program</p>
    </div>
    <div class="content">
      <h2>Thank you, ${escapeHtml(firstName)}!</h2>
      <p>We've received your ${isEnrollment ? "enrollment request for our Medical Weight Loss Program" : "request for information about our Medical Weight Loss Program"}. A member of our team will contact you within 1 business day.</p>
      ${isEnrollment ? `<p>In the meantime, here's what to expect at your initial evaluation:</p>
      <div class="info-box">
        <p><strong>Duration:</strong> 30–40 minutes</p>
        <p><strong>Includes:</strong> Health history review, physical exam, and baseline lab work</p>
        <p><strong>Cost:</strong> $299 for the initial evaluation</p>
        <p><strong>Location:</strong> 65 N. Madison Ave. #709, Pasadena, CA 91101</p>
      </div>` : ""}
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
        { status: 429, headers: { "Content-Type": "application/json", "Retry-After": "60" } }
      );
    }

    const data: WeightLossPayload = await request.json();

    // Honeypot check
    if (data.website) {
      // Bot detected — return success silently
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Validate required fields
    if (!data.firstName || !data.lastName || !data.email || !data.phone || !data.interest) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const isEnrollment = data.interest === "enroll";
    const subjectPrefix = isEnrollment ? "Weight Loss Enrollment" : "Weight Loss Inquiry";

    const { error } = await resend.emails.send({
      from: "HCI Weight Loss Program <noreply@hcimed.com>",
      to: WEIGHT_LOSS_RECIPIENTS,
      cc: ["admin@hcimed.com"],
      replyTo: data.email,
      subject: `${subjectPrefix} - ${data.firstName} ${data.lastName}`,
      html: generateStaffEmailHtml(data),
    });

    if (error) {
      console.error("Resend error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to send inquiry" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Send confirmation email to patient (non-blocking)
    try {
      await resend.emails.send({
        from: "HCI Medical Group <noreply@hcimed.com>",
        to: [data.email],
        subject: `${isEnrollment ? "Enrollment Request" : "Information Request"} Received - HCI Medical Group`,
        html: generateConfirmationEmailHtml(data.firstName, isEnrollment),
      });
    } catch (confirmError) {
      console.error("Failed to send weight loss confirmation email:", confirmError);
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
