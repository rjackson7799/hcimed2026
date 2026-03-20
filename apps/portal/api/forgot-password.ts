import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const resendApiKey = process.env.RESEND_API_KEY;

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

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Generate recovery link via Admin API (bypasses GoTrue client endpoint)
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: {
        redirectTo: 'https://portal.hcimed.com/reset-password',
      },
    });

    if (error || !data?.properties?.action_link) {
      // User may not exist — return success anyway to prevent enumeration
      console.error('generateLink error:', error?.message || 'No action link');
      return successResponse;
    }

    // Send the recovery email via Resend
    const resend = new Resend(resendApiKey);
    const resetLink = data.properties.action_link;

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
            This link expires in 24 hours.
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
      // Still return success to prevent enumeration
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
