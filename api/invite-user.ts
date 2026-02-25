import { createClient } from '@supabase/supabase-js';

function generateTemporaryPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  const specials = '!@#$%&*';
  const randomBytes = new Uint8Array(14);
  crypto.getRandomValues(randomBytes);
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(randomBytes[i] % chars.length);
  }
  password += specials.charAt(randomBytes[12] % specials.length);
  password += randomBytes[13] % 10;
  return password;
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

    // 1. Verify caller is authenticated
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: { user: callerUser }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !callerUser) {
      return new Response(JSON.stringify({ error: 'Invalid authentication' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 2. Verify caller is admin
    const { data: callerProfile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', callerUser.id)
      .single();

    if (!callerProfile || callerProfile.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 3. Validate input
    const body = await request.json();
    const { email, full_name, role } = body;

    if (!email || !full_name || !role) {
      return new Response(JSON.stringify({ error: 'Missing required fields: email, full_name, role' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const validRoles = ['admin', 'staff', 'provider', 'broker'];
    if (!validRoles.includes(role)) {
      return new Response(JSON.stringify({ error: `Invalid role. Must be one of: ${validRoles.join(', ')}` }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 4. Check for existing user
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id, email')
      .eq('email', email)
      .single();

    if (existingProfile) {
      return new Response(JSON.stringify({ error: 'A user with this email already exists' }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 5. Create user via Supabase Auth Admin API
    const temporaryPassword = generateTemporaryPassword();

    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: temporaryPassword,
      email_confirm: true,
      user_metadata: { full_name, role },
    });

    if (createError) {
      console.error('Create user error:', createError);
      if (createError.message?.includes('already been registered')) {
        return new Response(JSON.stringify({ error: 'This email is already registered' }), {
          status: 409,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ error: 'Failed to create user' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 6. Record in audit log
    await supabaseAdmin.from('audit_log').insert({
      user_id: callerUser.id,
      action: 'INVITE_USER',
      table_name: 'profiles',
      record_id: newUser.user.id,
      new_values: { email, full_name, role },
    });

    return new Response(JSON.stringify({
      success: true,
      user: {
        id: newUser.user.id,
        email: newUser.user.email,
        full_name,
        role,
      },
      temporary_password: temporaryPassword,
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Invite user error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
