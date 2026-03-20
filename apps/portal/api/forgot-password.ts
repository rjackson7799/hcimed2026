import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

/**
 * Custom password reset flow that bypasses GoTrue's broken /recover and
 * /admin/generate_link endpoints (both return 405 on this Supabase instance).
 *
 * Strategy: HMAC-signed token with 1-hour expiry, verified by /api/reset-password.
 */

async function hmacSign(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const resendApiKey = process.env.RESEND_API_KEY;

    console.log('ENV check — VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL ? 'set' : 'missing',
      'SUPABASE_URL:', process.env.SUPABASE_URL ? 'set' : 'missing',
      'resolved:', supabaseUrl?.substring(0, 30));

    if (!supabaseUrl || !serviceRoleKey || !resendApiKey) {
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return new Response(JSON.stringify({ error: 'Email is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Always return success to prevent user enumeration
    const successResponse = new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );

    // Look up user by email using admin API
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Look up user via profiles table (PostgREST, not GoTrue)
    // First, verify URL is reachable with a direct fetch
    const testRes = await fetch(`${supabaseUrl}/rest/v1/profiles?email=eq.${encodeURIComponent(email)}&select=id,email&limit=1`, {
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
    });
    console.log('Direct REST test — status:', testRes.status, 'content-type:', testRes.headers.get('content-type'));

    if (!testRes.ok || !testRes.headers.get('content-type')?.includes('json')) {
      const body = await testRes.text();
      console.error('Direct REST failed:', testRes.status, body.substring(0, 200));
      return successResponse;
    }

    const profiles = await testRes.json();
    const profile = Array.isArray(profiles) ? profiles[0] : null;

    if (!profile) {
      console.log('No profile found for email:', email);
      return successResponse;
    }

    console.log('Profile found:', profile.id, profile.email);

    // Generate HMAC-signed reset token (expires in 1 hour)
    const expires = Date.now() + 60 * 60 * 1000; // 1 hour
    const message = `${profile.id}:${email.toLowerCase()}:${expires}`;
    const token = await hmacSign(serviceRoleKey, message);

    const resetLink =
      `https://portal.hcimed.com/reset-password` +
      `?uid=${profile.id}&email=${encodeURIComponent(email)}&t=${expires}&token=${token}`;

    // Send the recovery email via Resend
    const resend = new Resend(resendApiKey);

    const { error: emailError } = await resend.emails.send({
      from: 'HCI Medical Group <noreply@hcimed.com>',
      to: email,
      subject: 'Reset Your Password — HCI Staff Portal',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
          <img src="https://portal.hcimed.com/email/hci-logo.png" alt="HCI Medical Group" style="height: 40px; margin-bottom: 24px;" />
          <h2 style="color: #1e3a5f; margin-bottom: 8px;">Reset Your Password</h2>
          <p style="color: #64748b; line-height: 1.6;">
            We received a request to reset the password for your HCI Staff Portal account.
            Click the button below to set a new password.
          </p>
          <a href="${resetLink}" style="display: inline-block; background: #1e3a5f; color: #ffffff; padding: 12px 32px; border-radius: 6px; text-decoration: none; font-weight: 500; margin: 24px 0;">
            Reset Password
          </a>
          <p style="color: #94a3b8; font-size: 13px; line-height: 1.5;">
            If you didn't request this, you can safely ignore this email.
            This link expires in 1 hour.
          </p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="color: #94a3b8; font-size: 12px;">
            HCI Medical Group &middot; Pasadena, CA
          </p>
        </div>
      `,
    });

    if (emailError) {
      console.error('Resend error:', emailError);
    } else {
      console.log('Reset email sent successfully to:', email);
    }

    return successResponse;
  } catch (err) {
    console.error('Forgot password error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
