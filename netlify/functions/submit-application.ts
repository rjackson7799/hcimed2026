import { Resend } from "resend";
import type { Context } from "@netlify/functions";

const resend = new Resend(process.env.RESEND_API_KEY);

interface FileAttachment {
  filename: string;
  content: string; // base64 encoded
  type: string;
}

interface ApplicationPayload {
  // Personal Info
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;

  // Position Details
  positionType: "medical-assistant" | "provider";
  providerSubtype?: "NP" | "PA" | "MD" | "DO" | null;
  employmentType: "full-time" | "part-time" | "open-to-either";
  availableDays?: string[] | null;
  desiredSalary?: string;
  earliestStartDate: string;

  // Qualifications
  yearsOfExperience: string;
  certificationsLicenses: string;
  workExperience: {
    employer: string;
    jobTitle: string;
    city: string;
    state: string;
    duration: string;
    responsibilities?: string;
  }[];
  education: {
    schoolName: string;
    city: string;
    state: string;
    country: string;
    graduationYear: string;
    degree: string;
  }[];

  // Documents
  resume: FileAttachment | null;
  coverLetter?: FileAttachment | null;

  // Final
  referralSource: string;
  additionalComments?: string;
  authorizationCheckbox: boolean;
}

// Position type display labels
const POSITION_LABELS: Record<string, string> = {
  "medical-assistant": "Medical Assistant",
  provider: "Healthcare Provider",
};

const PROVIDER_SUBTYPE_LABELS: Record<string, string> = {
  NP: "Nurse Practitioner (NP)",
  PA: "Physician Assistant (PA)",
  MD: "Medical Doctor (MD)",
  DO: "Doctor of Osteopathy (DO)",
};

const EXPERIENCE_LABELS: Record<string, string> = {
  "less-than-1": "Less than 1 year",
  "1-2": "1-2 years",
  "3-5": "3-5 years",
  "6-10": "6-10 years",
  "10-plus": "10+ years",
};

const REFERRAL_LABELS: Record<string, string> = {
  indeed: "Indeed",
  linkedin: "LinkedIn",
  "company-website": "Company Website",
  "employee-referral": "Employee Referral",
  "job-fair": "Job Fair",
  other: "Other",
};

const EMPLOYMENT_LABELS: Record<string, string> = {
  "full-time": "Full-Time",
  "part-time": "Part-Time",
  "open-to-either": "Open to Either",
};

const DAY_LABELS: Record<string, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
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
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
}

function generateEmailHtml(data: ApplicationPayload): string {
  const positionTitle =
    data.positionType === "provider" && data.providerSubtype
      ? PROVIDER_SUBTYPE_LABELS[data.providerSubtype]
      : POSITION_LABELS[data.positionType];

  const employmentTypeDisplay = EMPLOYMENT_LABELS[data.employmentType] || data.employmentType;

  const availableDaysDisplay = data.availableDays && data.availableDays.length > 0
    ? data.availableDays.map(day => DAY_LABELS[day] || day).join(", ")
    : null;

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
      min-width: 180px;
      flex-shrink: 0;
    }
    .value {
      color: #1f2937;
      flex: 1;
    }
    .text-block {
      margin-top: 8px;
      padding: 12px;
      background: #ffffff;
      border-radius: 4px;
      border: 1px solid #e5e7eb;
      white-space: pre-wrap;
      font-size: 14px;
    }
    .attachments-section {
      background: #ecfdf5;
      border-left-color: #10b981;
    }
    .attachment-item {
      display: inline-block;
      padding: 8px 16px;
      background: #ffffff;
      border-radius: 4px;
      border: 1px solid #d1fae5;
      margin: 4px 8px 4px 0;
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
    .highlight-box {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 8px;
      padding: 16px;
      margin: 20px 0;
    }
    .highlight-box h3 {
      margin: 0 0 8px 0;
      color: #1e40af;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>New Job Application</h1>
      <p>HCI Medical Group Careers Portal</p>
    </div>

    <div class="content">
      <div class="highlight-box">
        <h3>Position Applied For</h3>
        <strong style="font-size: 18px; color: #1e3a5f;">${escapeHtml(positionTitle)}</strong>
        <span style="margin-left: 12px; color: #6b7280;">(${employmentTypeDisplay})</span>
        ${availableDaysDisplay ? `<div style="margin-top: 8px; color: #4b5563;">Available: ${escapeHtml(availableDaysDisplay)}</div>` : ""}
      </div>

      <div class="section">
        <div class="section-title">Applicant Information</div>
        <div class="field">
          <span class="label">Name:</span>
          <span class="value">${escapeHtml(data.firstName)} ${escapeHtml(data.lastName)}</span>
        </div>
        <div class="field">
          <span class="label">Email:</span>
          <span class="value"><a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a></span>
        </div>
        <div class="field">
          <span class="label">Phone:</span>
          <span class="value"><a href="tel:${escapeHtml(data.phone)}">${escapeHtml(data.phone)}</a></span>
        </div>
        <div class="field">
          <span class="label">Address:</span>
          <span class="value">${escapeHtml(data.streetAddress)}<br>${escapeHtml(data.city)}, ${escapeHtml(data.state)} ${escapeHtml(data.zipCode)}</span>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Position Details</div>
        <div class="field">
          <span class="label">Position Type:</span>
          <span class="value">${escapeHtml(positionTitle)}</span>
        </div>
        <div class="field">
          <span class="label">Employment Type:</span>
          <span class="value">${employmentTypeDisplay}</span>
        </div>
        ${availableDaysDisplay ? `
        <div class="field">
          <span class="label">Available Days:</span>
          <span class="value">${escapeHtml(availableDaysDisplay)}</span>
        </div>
        ` : ""}
        ${data.desiredSalary ? `
        <div class="field">
          <span class="label">Desired Salary:</span>
          <span class="value">${escapeHtml(data.desiredSalary)}</span>
        </div>
        ` : ""}
        <div class="field">
          <span class="label">Earliest Start Date:</span>
          <span class="value">${formatDate(data.earliestStartDate)}</span>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Qualifications & Experience</div>
        <div class="field">
          <span class="label">Years of Experience:</span>
          <span class="value">${EXPERIENCE_LABELS[data.yearsOfExperience] || data.yearsOfExperience}</span>
        </div>
        <div class="field">
          <span class="label">Certifications/Licenses:</span>
        </div>
        <div class="text-block">${escapeHtml(data.certificationsLicenses)}</div>

        <div class="field" style="margin-top: 20px;">
          <span class="label" style="font-size: 15px; color: #1e3a5f;">Work Experience:</span>
        </div>
        ${data.workExperience.map((exp, i) => `
        <div style="margin: 10px 0; padding: 12px; background: #ffffff; border-radius: 4px; border: 1px solid #e5e7eb;">
          <div style="font-weight: 600; color: #1e3a5f;">${escapeHtml(exp.jobTitle)} at ${escapeHtml(exp.employer)}</div>
          <div style="color: #6b7280; font-size: 14px;">${escapeHtml(exp.city)}, ${escapeHtml(exp.state)} | ${escapeHtml(exp.duration)}</div>
          ${exp.responsibilities ? `<div style="margin-top: 8px; font-size: 14px;">${escapeHtml(exp.responsibilities)}</div>` : ""}
        </div>
        `).join("")}

        <div class="field" style="margin-top: 20px;">
          <span class="label" style="font-size: 15px; color: #1e3a5f;">Education:</span>
        </div>
        ${data.education.map((edu, i) => `
        <div style="margin: 10px 0; padding: 12px; background: #ffffff; border-radius: 4px; border: 1px solid #e5e7eb;">
          <div style="font-weight: 600; color: #1e3a5f;">${escapeHtml(edu.degree)}</div>
          <div style="color: #6b7280; font-size: 14px;">${escapeHtml(edu.schoolName)}</div>
          <div style="color: #6b7280; font-size: 14px;">${escapeHtml(edu.city)}, ${escapeHtml(edu.state)}, ${escapeHtml(edu.country)} | Graduated ${escapeHtml(edu.graduationYear)}</div>
        </div>
        `).join("")}
      </div>

      <div class="section attachments-section">
        <div class="section-title">Attachments</div>
        <div class="attachment-item">📄 Resume: ${data.resume ? escapeHtml(data.resume.filename) : "Not provided"}</div>
        ${data.coverLetter ? `<div class="attachment-item">📄 Cover Letter: ${escapeHtml(data.coverLetter.filename)}</div>` : ""}
      </div>

      <div class="section">
        <div class="section-title">Additional Information</div>
        <div class="field">
          <span class="label">How They Found Us:</span>
          <span class="value">${REFERRAL_LABELS[data.referralSource] || data.referralSource}</span>
        </div>
        ${data.additionalComments ? `
        <div class="field" style="margin-top: 15px;">
          <span class="label">Additional Comments:</span>
        </div>
        <div class="text-block">${escapeHtml(data.additionalComments)}</div>
        ` : ""}
      </div>
    </div>

    <div class="footer">
      <p>This application was submitted through the HCI Medical Group website careers portal.</p>
      <p>Submitted on: ${new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles", dateStyle: "full", timeStyle: "short" })} PT</p>
    </div>
  </div>
</body>
</html>
  `;
}

export default async (request: Request, context: Context) => {
  // Only allow POST
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const data: ApplicationPayload = await request.json();

    // Validate required fields
    if (
      !data.firstName ||
      !data.lastName ||
      !data.email ||
      !data.phone ||
      !data.resume
    ) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Build attachments array for Resend
    const attachments: { filename: string; content: string }[] = [];

    if (data.resume && data.resume.content) {
      attachments.push({
        filename: data.resume.filename,
        content: data.resume.content,
      });
    }

    if (data.coverLetter && data.coverLetter.content) {
      attachments.push({
        filename: data.coverLetter.filename,
        content: data.coverLetter.content,
      });
    }

    const positionTitle =
      data.positionType === "provider" && data.providerSubtype
        ? PROVIDER_SUBTYPE_LABELS[data.providerSubtype]
        : POSITION_LABELS[data.positionType];

    const { error } = await resend.emails.send({
      from: "HCI Careers <noreply@send.hcimed.com>",
      to: ["admin@hcimed.com", "ryan.jackson.2009@gmail.com"],
      replyTo: data.email,
      subject: `New Application: ${positionTitle} - ${data.firstName} ${data.lastName}`,
      html: generateEmailHtml(data),
      attachments,
    });

    if (error) {
      console.error("Resend error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to send application" }),
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
};

export const config = {
  path: "/api/submit-application",
};
