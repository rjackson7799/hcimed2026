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

    // 2. Verify caller is admin or Medical Director
    const { data: callerProfile } = await supabase
      .from('profiles')
      .select('role, title, full_name')
      .eq('id', callerUser.id)
      .single();

    if (!callerProfile) {
      return new Response(JSON.stringify({ error: 'Profile not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const isAdmin = callerProfile.role === 'admin';
    const isDirector = callerProfile.title === 'Medical Director';

    if (!isAdmin && !isDirector) {
      return new Response(JSON.stringify({ error: 'Admin or Medical Director access required' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();
    const { request_id, decision, reviewer_type, reviewer_notes, requester_name } = body;

    if (!request_id || !decision || !reviewer_type) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 3. Fetch the request + requester email
    const { data: timeOffRequest } = await supabase
      .from('cal_time_off_requests')
      .select('*, profiles:requester_id(email, full_name)')
      .eq('id', request_id)
      .single();

    if (!timeOffRequest) {
      return new Response(JSON.stringify({ error: 'Request not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const requesterEmail = (timeOffRequest as any).profiles?.email;
    if (!requesterEmail) {
      return new Response(JSON.stringify({ error: 'Requester email not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 4. Send decision email to requester
    const decisionLabel = decision === 'approved' ? 'Approved' : 'Denied';
    const reviewerLabel = reviewer_type === 'admin' ? 'Administrator' : 'Medical Director';
    const notesHtml = reviewer_notes
      ? `<p><strong>Notes:</strong> ${escapeHtml(reviewer_notes)}</p>`
      : '';

    const { error: emailError } = await resend.emails.send({
      from: 'HCI Portal <noreply@hcimed.com>',
      to: [requesterEmail],
      subject: `Time Off ${decisionLabel} by ${reviewerLabel}`,
      html: `
        <h2>Time Off Request ${decisionLabel}</h2>
        <p>Your time off request has been <strong>${decisionLabel.toLowerCase()}</strong> by the ${escapeHtml(reviewerLabel)} (${escapeHtml(callerProfile.full_name)}).</p>

        <table style="border-collapse: collapse; width: 100%; max-width: 500px;">
          <tr><td style="padding: 6px 12px; font-weight: bold;">Dates</td><td style="padding: 6px 12px;">${escapeHtml(timeOffRequest.start_date)} — ${escapeHtml(timeOffRequest.end_date)}</td></tr>
          <tr><td style="padding: 6px 12px; font-weight: bold;">Type</td><td style="padding: 6px 12px;">${escapeHtml(timeOffRequest.time_off_type)}</td></tr>
          <tr><td style="padding: 6px 12px; font-weight: bold;">Decision</td><td style="padding: 6px 12px;">${escapeHtml(decisionLabel)}</td></tr>
        </table>

        ${notesHtml}

        <p style="margin-top: 12px; color: #666; font-size: 13px;">
          Note: Both Administrator and Medical Director approval is required. Check your portal for the full status.
        </p>

        <p style="margin-top: 20px;">
          <a href="https://portal.hcimed.com/admin/calendar" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px;">
            View in Portal
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
      // Non-blocking — decision is already saved in DB by the mutation hook
    }

    // 5. Audit log
    await supabase.from('audit_log').insert({
      user_id: callerUser.id,
      action: decision === 'approved' ? 'TIME_OFF_APPROVED' : 'TIME_OFF_DENIED',
      table_name: 'cal_time_off_requests',
      record_id: request_id,
      old_values: { reviewer_type },
      new_values: { decision, reviewer_notes, requester_name },
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
