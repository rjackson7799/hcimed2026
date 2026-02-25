import { Resend } from 'resend';
import { generateContactConfirmationEmail } from '../lib/email-templates.js';

const resend = new Resend(process.env.RESEND_API_KEY);

const CONTACT_RECIPIENTS = (process.env.EMAIL_RECIPIENTS_CONTACT || 'care@hcimed.com').split(',').map(e => e.trim());

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
    const message = typeof body.message === 'string' ? body.message.trim() : '';
    const preferredDate = typeof body.preferredDate === 'string' ? body.preferredDate.trim() : '';

    // Validate required fields
    if (!name || !email || !phone) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { data, error } = await resend.emails.send({
      from: 'HCI Contact Form <noreply@hcimed.com>',
      to: CONTACT_RECIPIENTS,
      cc: ['admin@hcimed.com'],
      replyTo: email,
      subject: `New Contact Form Message from ${escapeHtml(name)}`,
      html: `
        <h2>New Contact Form Message</h2>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
        ${preferredDate ? `<p><strong>Preferred Date:</strong> ${escapeHtml(preferredDate)}</p>` : ''}
        ${message ? `<p><strong>Message:</strong> ${escapeHtml(message)}</p>` : ''}
        <hr />
        <p style="color: #666; font-size: 12px;">This message was sent from the HCI Medical Group website contact form.</p>
      `
    });

    if (error) {
      console.error('Resend error:', error);
      return new Response(JSON.stringify({ error: 'Failed to send email' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Send confirmation email to user (non-blocking - don't fail if this errors)
    try {
      await resend.emails.send({
        from: 'HCI Medical Group <noreply@hcimed.com>',
        to: [email],
        subject: 'Thank you for contacting HCI Medical Group',
        html: generateContactConfirmationEmail({ name, email, phone, message, preferredDate }),
      });
    } catch (confirmError) {
      console.error('Failed to send confirmation email:', confirmError);
      // Don't fail the request - staff notification was successful
    }

    return new Response(JSON.stringify({ success: true, id: data?.id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('Function error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
