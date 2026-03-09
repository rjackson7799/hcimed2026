import { createClient } from '@supabase/supabase-js';

const ALLOWED_ACTIONS = ['LOGIN_FAILED', 'LOGIN_SUCCESS'] as const;

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
    const { action, email } = body;

    if (!action || !ALLOWED_ACTIONS.includes(action)) {
      return new Response(JSON.stringify({ error: 'Invalid action' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!email || typeof email !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing required field: email' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // For LOGIN_SUCCESS, verify the token to get user_id
    let userId: string | null = null;
    const authHeader = request.headers.get('Authorization');
    if (action === 'LOGIN_SUCCESS' && authHeader?.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabaseAdmin.auth.getUser(token);
      userId = user?.id || null;
    }

    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || null;
    const userAgent = request.headers.get('user-agent') || null;

    await supabaseAdmin.from('audit_log').insert({
      user_id: userId,
      action,
      table_name: 'auth',
      new_values: { email },
      ip_address: ipAddress,
      user_agent: userAgent,
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Audit log error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
