import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const APPOINTMENT_RECIPIENTS = (process.env.EMAIL_RECIPIENTS_APPOINTMENTS || 'care@hcimed.com').split(',').map(e => e.trim());

interface AppointmentPayload {
  patientType: "new" | "existing";
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  preferredDate: string;
  preferredTime: "morning" | "afternoon" | "no-preference";
  reasonForVisit: string;
  additionalNotes?: string;
  // New patient fields
  streetAddress?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  insuranceProvider?: string;
  insurancePolicyId?: string;
}

const TIME_PREFERENCE_LABELS: Record<string, string> = {
  morning: "Morning (9AM - 12PM)",
  afternoon: "Afternoon (1PM - 5PM)",
  "no-preference": "No Preference",
};

const VISIT_REASON_LABELS: Record<string, string> = {
  "annual-physical": "Annual Physical / Wellness Exam",
  "follow-up": "Follow-up Visit",
  "new-concern": "New Health Concern",
  "chronic-management": "Chronic Condition Management",
  "prescription-refill": "Prescription Refill",
  "lab-review": "Lab Results Review",
  other: "Other (see notes)",
};

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
}

function formatDOB(dateString: string): string {
  try {
    const date = new Date(dateString + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
}

function generateEmailHtml(data: AppointmentPayload): string {
  const isNewPatient = data.patientType === "new";
  const patientTypeLabel = isNewPatient ? "NEW PATIENT" : "EXISTING PATIENT";
  const patientTypeColor = isNewPatient ? "#2563eb" : "#16a34a";
  const patientTypeBgColor = isNewPatient ? "#dbeafe" : "#dcfce7";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
    }
    .header {
      background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%);
      color: white;
      padding: 30px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0 0 8px 0;
      font-size: 24px;
      font-weight: 600;
    }
    .header p {
      margin: 0;
      opacity: 0.9;
      font-size: 14px;
    }
    .patient-badge {
      display: inline-block;
      padding: 8px 20px;
      background: ${patientTypeBgColor};
      color: ${patientTypeColor};
      border-radius: 20px;
      font-weight: 700;
      font-size: 14px;
      letter-spacing: 0.5px;
      margin: 20px auto;
    }
    .content {
      padding: 20px;
    }
    .section {
      margin: 20px 0;
      padding: 20px;
      background: #f9fafb;
      border-radius: 8px;
      border-left: 4px solid #2d8bc9;
    }
    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #1e3a5f;
      margin: 0 0 15px 0;
      padding-bottom: 10px;
      border-bottom: 1px solid #e5e7eb;
    }
    .field {
      margin: 10px 0;
      display: flex;
      flex-wrap: wrap;
    }
    .label {
      font-weight: 600;
      color: #4b5563;
      min-width: 160px;
      flex-shrink: 0;
    }
    .value {
      color: #1f2937;
      flex: 1;
    }
    .highlight-box {
      background: #fef3c7;
      border: 1px solid #f59e0b;
      border-radius: 8px;
      padding: 16px;
      margin: 20px 0;
      text-align: center;
    }
    .highlight-box h3 {
      margin: 0 0 8px 0;
      color: #92400e;
      font-size: 14px;
    }
    .highlight-box .date {
      font-size: 20px;
      font-weight: 700;
      color: #78350f;
    }
    .highlight-box .time {
      font-size: 14px;
      color: #92400e;
      margin-top: 4px;
    }
    .notes-section {
      background: #f0f9ff;
      border-left-color: #0ea5e9;
    }
    .notes-text {
      padding: 12px;
      background: #ffffff;
      border-radius: 4px;
      border: 1px solid #e0f2fe;
      white-space: pre-wrap;
      font-size: 14px;
    }
    .footer {
      margin-top: 30px;
      padding: 20px;
      background: #f3f4f6;
      border-top: 1px solid #e5e7eb;
      font-size: 12px;
      color: #6b7280;
      text-align: center;
    }
    .action-needed {
      background: #fee2e2;
      border: 1px solid #fecaca;
      border-radius: 8px;
      padding: 12px 16px;
      margin: 20px 0;
      color: #991b1b;
      font-weight: 500;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Appointment Request</h1>
      <p>HCI Medical Group</p>
    </div>

    <div class="content">
      <div style="text-align: center;">
        <span class="patient-badge">${patientTypeLabel}</span>
      </div>

      <div class="action-needed">
        Action Required: Please contact the patient to confirm appointment
      </div>

      <div class="highlight-box">
        <h3>Requested Appointment</h3>
        <div class="date">${formatDate(data.preferredDate)}</div>
        <div class="time">${TIME_PREFERENCE_LABELS[data.preferredTime]}</div>
      </div>

      <div class="section">
        <div class="section-title">Patient Information</div>
        <div class="field">
          <span class="label">Name:</span>
          <span class="value">${escapeHtml(data.firstName)} ${escapeHtml(data.lastName)}</span>
        </div>
        <div class="field">
          <span class="label">Date of Birth:</span>
          <span class="value">${formatDOB(data.dateOfBirth)}</span>
        </div>
        <div class="field">
          <span class="label">Email:</span>
          <span class="value"><a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a></span>
        </div>
        <div class="field">
          <span class="label">Phone:</span>
          <span class="value"><a href="tel:${escapeHtml(data.phone)}">${escapeHtml(data.phone)}</a></span>
        </div>
      </div>

      ${isNewPatient ? `
      <div class="section">
        <div class="section-title">Address</div>
        <div class="field">
          <span class="value">
            ${escapeHtml(data.streetAddress || "")}<br>
            ${escapeHtml(data.city || "")}, ${escapeHtml(data.state || "")} ${escapeHtml(data.zipCode || "")}
          </span>
        </div>
      </div>

      ${data.insuranceProvider ? `
      <div class="section">
        <div class="section-title">Insurance Information</div>
        <div class="field">
          <span class="label">Provider:</span>
          <span class="value">${escapeHtml(data.insuranceProvider)}</span>
        </div>
        ${data.insurancePolicyId ? `
        <div class="field">
          <span class="label">Policy/Member ID:</span>
          <span class="value">${escapeHtml(data.insurancePolicyId)}</span>
        </div>
        ` : ""}
      </div>
      ` : ""}
      ` : ""}

      <div class="section">
        <div class="section-title">Visit Details</div>
        <div class="field">
          <span class="label">Reason for Visit:</span>
          <span class="value">${VISIT_REASON_LABELS[data.reasonForVisit] || data.reasonForVisit}</span>
        </div>
      </div>

      ${data.additionalNotes ? `
      <div class="section notes-section">
        <div class="section-title">Additional Notes from Patient</div>
        <div class="notes-text">${escapeHtml(data.additionalNotes)}</div>
      </div>
      ` : ""}
    </div>

    <div class="footer">
      <p>This appointment request was submitted through the HCI Medical Group website.</p>
      <p>Submitted on: ${new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles", dateStyle: "full", timeStyle: "short" })} PT</p>
    </div>
  </div>
</body>
</html>
  `;
}

export async function POST(request: Request) {
  try {
    const data: AppointmentPayload = await request.json();

    // Validate required fields
    if (
      !data.firstName ||
      !data.lastName ||
      !data.email ||
      !data.phone ||
      !data.preferredDate
    ) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const isNewPatient = data.patientType === "new";
    const patientTypeLabel = isNewPatient ? "New Patient" : "Existing Patient";

    const { error } = await resend.emails.send({
      from: "HCI Appointments <onboarding@resend.dev>",
      to: APPOINTMENT_RECIPIENTS,
      replyTo: data.email,
      subject: `Appointment Request - ${patientTypeLabel} - ${data.firstName} ${data.lastName}`,
      html: generateEmailHtml(data),
    });

    if (error) {
      console.error("Resend error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to send appointment request" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
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
