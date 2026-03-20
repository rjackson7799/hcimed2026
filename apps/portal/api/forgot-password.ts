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

    // Call Supabase GoTrue Admin API directly (bypasses JS client JSON parsing bug)
    const generateLinkRes = await fetch(
      `${supabaseUrl}/auth/v1/admin/generate_link`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${serviceRoleKey}`,
          apikey: serviceRoleKey,
        },
        body: JSON.stringify({
          type: 'recovery',
          email,
          redirect_to: 'https://portal.hcimed.com/reset-password',
        }),
      },
    );

    if (!generateLinkRes.ok) {
      const errText = await generateLinkRes.text();
      console.error('generateLink HTTP error:', generateLinkRes.status, errText);
      // Temporarily return debug info
      return new Response(
        JSON.stringify({ debug: true, status: generateLinkRes.status, body: errText }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const linkData = await generateLinkRes.json();
    const actionLink = linkData?.action_link;

    if (!actionLink) {
      console.error('No action_link in response:', JSON.stringify(linkData));
      return new Response(
        JSON.stringify({ debug: true, error: 'No action_link', keys: Object.keys(linkData || {}) }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    }

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
          <a href="${actionLink}" style="display: inline-block; background: #1e3a5f; color: #ffffff; padding: 12px 32px; border-radius: 6px; text-decoration: none; font-weight: 500; margin: 24px 0;">
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
