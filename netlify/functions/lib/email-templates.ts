// Shared email template utilities for HCI Medical Group

export const EMAIL_COLORS = {
  primaryDark: '#1e3a5f',
  primaryMedium: '#2d5a87',
  accent: '#2d8bc9',
  textPrimary: '#333333',
  textSecondary: '#666666',
  background: '#f5f5f5',
  white: '#ffffff',
};

export const SITE_CONFIG = {
  name: 'HCI Medical Group',
  url: 'https://hcimed.com',
  logoUrl: 'https://hcimed.com/email/hci-logo.png',
  phone: '(626) 792-4185',
  email: 'care@hcimed.com',
  address: '65 N. Madison Ave. #709, Pasadena, CA 91101',
};

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Wraps email content in a branded template with logo header and footer
 */
export function wrapEmailContent(content: string, preheader?: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: ${EMAIL_COLORS.background}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  ${preheader ? `<div style="display: none; max-height: 0; overflow: hidden;">${escapeHtml(preheader)}</div>` : ''}

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background: ${EMAIL_COLORS.white}; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

          <!-- Logo Header -->
          <tr>
            <td style="background: linear-gradient(135deg, ${EMAIL_COLORS.primaryDark} 0%, ${EMAIL_COLORS.primaryMedium} 100%); padding: 30px; text-align: center;">
              <img src="${SITE_CONFIG.logoUrl}" alt="${SITE_CONFIG.name}" width="220" style="display: block; margin: 0 auto; max-width: 100%;">
            </td>
          </tr>

          <!-- Content Area -->
          <tr>
            <td style="padding: 40px 30px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: #f3f4f6; padding: 30px; text-align: center; font-size: 13px; color: #6b7280; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px 0; font-weight: 600; color: ${EMAIL_COLORS.primaryDark};">${SITE_CONFIG.name}</p>
              <p style="margin: 0 0 8px 0;">${SITE_CONFIG.address}</p>
              <p style="margin: 0 0 8px 0;">
                <a href="tel:${SITE_CONFIG.phone.replace(/[^0-9]/g, '')}" style="color: ${EMAIL_COLORS.accent}; text-decoration: none;">${SITE_CONFIG.phone}</a>
                &nbsp;|&nbsp;
                <a href="mailto:${SITE_CONFIG.email}" style="color: ${EMAIL_COLORS.accent}; text-decoration: none;">${SITE_CONFIG.email}</a>
              </p>
              <p style="margin: 0;">
                <a href="${SITE_CONFIG.url}" style="color: ${EMAIL_COLORS.accent}; text-decoration: none;">www.hcimed.com</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

export interface ContactConfirmationData {
  name: string;
  email: string;
  phone: string;
  message?: string;
  preferredDate?: string;
}

/**
 * Generates a confirmation email for contact form submissions
 */
export function generateContactConfirmationEmail(data: ContactConfirmationData): string {
  const firstName = data.name.split(' ')[0];

  const content = `
    <h2 style="color: ${EMAIL_COLORS.primaryDark}; margin: 0 0 20px; font-size: 24px;">Thank You for Reaching Out</h2>

    <p style="color: ${EMAIL_COLORS.textPrimary}; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
      Dear ${escapeHtml(firstName)},
    </p>

    <p style="color: ${EMAIL_COLORS.textPrimary}; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
      Thank you for contacting HCI Medical Group. We have received your message and a member of our team will get back to you within <strong>1-2 business days</strong>.
    </p>

    <div style="background: #f9fafb; border-left: 4px solid ${EMAIL_COLORS.accent}; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
      <p style="margin: 0 0 12px; font-weight: 600; color: ${EMAIL_COLORS.primaryDark};">Your Submission Details:</p>
      ${data.preferredDate ? `
      <p style="margin: 8px 0; color: #4b5563; font-size: 14px;">
        <strong>Preferred Date:</strong> ${escapeHtml(data.preferredDate)}
      </p>
      ` : ''}
      ${data.message ? `
      <p style="margin: 8px 0; color: #4b5563; font-size: 14px;">
        <strong>Your Message:</strong><br>
        <span style="display: block; margin-top: 4px; padding: 12px; background: white; border-radius: 4px; border: 1px solid #e5e7eb;">${escapeHtml(data.message.length > 200 ? data.message.substring(0, 200) + '...' : data.message)}</span>
      </p>
      ` : ''}
    </div>

    <p style="color: ${EMAIL_COLORS.textPrimary}; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
      If your matter is urgent, please call us directly at <strong><a href="tel:6267924185" style="color: ${EMAIL_COLORS.accent}; text-decoration: none;">(626) 792-4185</a></strong> during our office hours (Mon-Fri, 9AM-5PM PT).
    </p>

    <p style="color: ${EMAIL_COLORS.textPrimary}; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
      We look forward to speaking with you soon.
    </p>

    <p style="color: ${EMAIL_COLORS.textPrimary}; font-size: 16px; line-height: 1.6; margin: 30px 0 0;">
      Warm regards,<br>
      <strong style="color: ${EMAIL_COLORS.primaryDark};">The HCI Medical Group Team</strong>
    </p>
  `;

  return wrapEmailContent(content, 'Thank you for contacting HCI Medical Group. We will respond within 1-2 business days.');
}

export interface ApplicationConfirmationData {
  firstName: string;
  lastName: string;
  email: string;
  positionTitle: string;
  employmentType: string;
}

/**
 * Generates a confirmation email for job application submissions
 */
export function generateApplicationConfirmationEmail(data: ApplicationConfirmationData): string {
  const content = `
    <h2 style="color: ${EMAIL_COLORS.primaryDark}; margin: 0 0 20px; font-size: 24px;">Application Received</h2>

    <p style="color: ${EMAIL_COLORS.textPrimary}; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
      Dear ${escapeHtml(data.firstName)},
    </p>

    <p style="color: ${EMAIL_COLORS.textPrimary}; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
      Thank you for your interest in joining HCI Medical Group. We have successfully received your application for the following position:
    </p>

    <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 24px; margin: 25px 0; text-align: center;">
      <p style="margin: 0 0 8px; font-size: 14px; color: #1e40af; text-transform: uppercase; letter-spacing: 0.5px;">Position Applied For</p>
      <p style="margin: 0; font-size: 22px; font-weight: 700; color: ${EMAIL_COLORS.primaryDark};">
        ${escapeHtml(data.positionTitle)}
      </p>
      <p style="margin: 8px 0 0; color: #6b7280; font-size: 14px;">${escapeHtml(data.employmentType)}</p>
    </div>

    <h3 style="color: ${EMAIL_COLORS.primaryDark}; margin: 30px 0 15px; font-size: 18px;">What Happens Next?</h3>

    <div style="margin: 0 0 25px;">
      <div style="display: flex; margin-bottom: 16px;">
        <div style="width: 32px; height: 32px; background: ${EMAIL_COLORS.accent}; border-radius: 50%; color: white; text-align: center; line-height: 32px; font-weight: 600; flex-shrink: 0;">1</div>
        <div style="margin-left: 16px; padding-top: 4px;">
          <strong style="color: ${EMAIL_COLORS.primaryDark};">Application Review</strong>
          <p style="margin: 4px 0 0; color: ${EMAIL_COLORS.textSecondary}; font-size: 14px;">Our hiring team will carefully review your qualifications and experience.</p>
        </div>
      </div>

      <div style="display: flex; margin-bottom: 16px;">
        <div style="width: 32px; height: 32px; background: ${EMAIL_COLORS.accent}; border-radius: 50%; color: white; text-align: center; line-height: 32px; font-weight: 600; flex-shrink: 0;">2</div>
        <div style="margin-left: 16px; padding-top: 4px;">
          <strong style="color: ${EMAIL_COLORS.primaryDark};">Initial Contact</strong>
          <p style="margin: 4px 0 0; color: ${EMAIL_COLORS.textSecondary}; font-size: 14px;">If your experience matches our needs, we'll reach out within 5-7 business days to schedule an interview.</p>
        </div>
      </div>

      <div style="display: flex;">
        <div style="width: 32px; height: 32px; background: ${EMAIL_COLORS.accent}; border-radius: 50%; color: white; text-align: center; line-height: 32px; font-weight: 600; flex-shrink: 0;">3</div>
        <div style="margin-left: 16px; padding-top: 4px;">
          <strong style="color: ${EMAIL_COLORS.primaryDark};">Interview Process</strong>
          <p style="margin: 4px 0 0; color: ${EMAIL_COLORS.textSecondary}; font-size: 14px;">Selected candidates will participate in interviews with our team to explore mutual fit.</p>
        </div>
      </div>
    </div>

    <p style="color: ${EMAIL_COLORS.textPrimary}; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
      We appreciate your patience during this process. Due to the volume of applications we receive, we may not be able to respond to every applicant individually, but please know that your application is being carefully considered.
    </p>

    <p style="color: ${EMAIL_COLORS.textPrimary}; font-size: 16px; line-height: 1.6; margin: 30px 0 0;">
      Best regards,<br>
      <strong style="color: ${EMAIL_COLORS.primaryDark};">HCI Medical Group Hiring Team</strong>
    </p>
  `;

  return wrapEmailContent(content, `Thank you for applying to ${data.positionTitle} at HCI Medical Group. We will review your application and be in touch.`);
}
