import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const TIME_OFF_LABELS: Record<string, string> = {
  vacation: 'Vacation',
  sick: 'Sick Leave',
  personal: 'Personal',
  cme: 'CME',
};

export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
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
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: { user: callerUser }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !callerUser) {
      return new Response(JSON.stringify({ error: 'Invalid authentication' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 2. Verify caller role
    const { data: callerProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', callerUser.id)
      .single();

    if (!callerProfile || !['admin', 'staff', 'provider'].includes(callerProfile.role)) {
      return new Response(JSON.stringify({ error: 'Access denied' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();
    const { request_id, requester_name, start_date, end_date, time_off_type, notes } = body;

    if (!request_id || !requester_name || !start_date || !end_date || !time_off_type) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 3. Find approvers: all admins + Medical Director
    const { data: approvers } = await supabase
      .from('profiles')
      .select('email, full_name, role, title')
      .eq('is_active', true)
      .or('role.eq.admin,title.eq.Medical Director');

    const approverEmails = (approvers || [])
      .map((a: { email: string }) => a.email)
      .filter(Boolean);

    if (approverEmails.length === 0) {
      return new Response(JSON.stringify({ error: 'No approvers found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 4. Send notification email
    const typeLabel = TIME_OFF_LABELS[time_off_type] || time_off_type;
    const notesHtml = notes
      ? `<tr><td style="padding: 6px 12px; font-weight: bold;">Notes</td><td style="padding: 6px 12px;">${escapeHtml(notes)}</td></tr>`
      : '';

    const { error: emailError } = await resend.emails.send({
      from: 'HCI Portal <noreply@hcimed.com>',
      to: approverEmails,
      subject: `Time Off Request: ${escapeHtml(requester_name)} — ${typeLabel}`,
      html: `
        <h2>New Time Off Request</h2>
        <p><strong>${escapeHtml(requester_name)}</strong> has submitted a time off request that requires your approval.</p>

        <table style="border-collapse: collapse; width: 100%; max-width: 500px;">
          <tr><td style="padding: 6px 12px; font-weight: bold;">Type</td><td style="padding: 6px 12px;">${escapeHtml(typeLabel)}</td></tr>
          <tr><td style="padding: 6px 12px; font-weight: bold;">Start Date</td><td style="padding: 6px 12px;">${escapeHtml(start_date)}</td></tr>
          <tr><td style="padding: 6px 12px; font-weight: bold;">End Date</td><td style="padding: 6px 12px;">${escapeHtml(end_date)}</td></tr>
          ${notesHtml}
        </table>

        <p style="margin-top: 20px;">
          <a href="https://portal.hcimed.com/admin/calendar" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px;">
            Review in Portal
          </a>
        </p>

        <hr />
        <p style="color: #666; font-size: 12px;">
          This is an automated message from the HCI Staff Calendar system.
        </p>
      `,
    });

    if (emailError) {
      console.error('Resend error:', emailError);
      return new Response(JSON.stringify({ error: 'Failed to send email' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 5. Audit log
    await supabase.from('audit_log').insert({
      user_id: callerUser.id,
      action: 'TIME_OFF_REQUESTED',
      table_name: 'cal_time_off_requests',
      record_id: request_id,
      new_values: { requester_name, start_date, end_date, time_off_type, notes },
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Function error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
