import { createClient } from '@supabase/supabase-js';

/**
 * Verifies the HMAC-signed reset token and updates the user's password
 * via Supabase Admin API.
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

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();
    const { uid, email, t, token, password } = body;

    if (!uid || !email || !t || !token || !password) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Verify token hasn't expired
    const expires = Number(t);
    if (isNaN(expires) || Date.now() > expires) {
      return new Response(JSON.stringify({ error: 'Reset link has expired. Please request a new one.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Verify HMAC signature
    const message = `${uid}:${email.toLowerCase()}:${t}`;
    const expectedToken = await hmacSign(serviceRoleKey, message);

    if (token !== expectedToken) {
      return new Response(JSON.stringify({ error: 'Invalid reset link. Please request a new one.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Update password via admin API
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(uid, {
      password,
    });

    if (updateError) {
      console.error('updateUser error:', updateError.message);
      return new Response(JSON.stringify({ error: 'Failed to update password. Please try again.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Reset password error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
