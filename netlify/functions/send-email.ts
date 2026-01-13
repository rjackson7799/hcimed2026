import { Resend } from 'resend';
import type { Context } from '@netlify/functions';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async (request: Request, context: Context) => {
  // Only allow POST requests
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { name, email, phone, message, preferredDate } = await request.json();

    // Validate required fields
    if (!name || !email || !phone) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { data, error } = await resend.emails.send({
      from: 'HCI Contact Form <noreply@send.hcimed.com>',
      to: ['care@hcimed.com', 'admin@hcimed.com', 'ryan.jackson.2009@gmail.com'],
      replyTo: email,
      subject: `New Appointment Request from ${name}`,
      html: `
        <h2>New Appointment Request</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        ${preferredDate ? `<p><strong>Preferred Date:</strong> ${preferredDate}</p>` : ''}
        ${message ? `<p><strong>Message:</strong> ${message}</p>` : ''}
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
};

export const config = {
  path: '/api/send-email'
};
