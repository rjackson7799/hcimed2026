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

    // 2. Verify caller is staff or admin
    const { data: callerProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', callerUser.id)
      .single();

    if (!callerProfile || !['admin', 'staff'].includes(callerProfile.role)) {
      return new Response(JSON.stringify({ error: 'Staff or admin access required' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();
    const { patient_id, project_id } = body;

    if (!patient_id || !project_id) {
      return new Response(JSON.stringify({ error: 'Missing patient_id or project_id' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Fetch patient details
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select('*')
      .eq('id', patient_id)
      .single();

    if (patientError || !patient) {
      return new Response(JSON.stringify({ error: 'Patient not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Fetch project to get broker email
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('name, broker_email')
      .eq('id', project_id)
      .single();

    if (projectError || !project || !project.broker_email) {
      return new Response(JSON.stringify({ error: 'Project or broker email not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Fetch recent outreach logs for context
    const { data: logs } = await supabase
      .from('outreach_logs')
      .select('disposition, notes, call_timestamp')
      .eq('patient_id', patient_id)
      .order('call_timestamp', { ascending: false })
      .limit(5);

    const logsHtml = (logs || [])
      .map(
        (log: any) =>
          `<li>${escapeHtml(new Date(log.call_timestamp).toLocaleDateString())} — ${escapeHtml(log.disposition)}${log.notes ? `: ${escapeHtml(log.notes)}` : ''}</li>`
      )
      .join('');

    // Send email to broker
    const { data, error: emailError } = await resend.emails.send({
      from: 'HCI Patient Outreach <noreply@hcimed.com>',
      to: [project.broker_email],
      subject: `Patient Forwarded: ${escapeHtml(patient.first_name)} ${escapeHtml(patient.last_name)} — ${escapeHtml(project.name)}`,
      html: `
        <h2>Patient Forwarded for Broker Assistance</h2>
        <p>A patient has been forwarded to you from the <strong>${escapeHtml(project.name)}</strong> outreach project.</p>

        <h3>Patient Information</h3>
        <table style="border-collapse: collapse; width: 100%; max-width: 500px;">
          <tr><td style="padding: 6px 12px; font-weight: bold;">Name</td><td style="padding: 6px 12px;">${escapeHtml(patient.first_name)} ${escapeHtml(patient.last_name)}</td></tr>
          <tr><td style="padding: 6px 12px; font-weight: bold;">Phone</td><td style="padding: 6px 12px;">${escapeHtml(patient.phone_primary)}</td></tr>
          ${patient.member_id ? `<tr><td style="padding: 6px 12px; font-weight: bold;">Member ID</td><td style="padding: 6px 12px;">${escapeHtml(patient.member_id)}</td></tr>` : ''}
          ${patient.current_insurance ? `<tr><td style="padding: 6px 12px; font-weight: bold;">Current Insurance</td><td style="padding: 6px 12px;">${escapeHtml(patient.current_insurance)}</td></tr>` : ''}
          ${patient.target_insurance ? `<tr><td style="padding: 6px 12px; font-weight: bold;">Target Insurance</td><td style="padding: 6px 12px;">${escapeHtml(patient.target_insurance)}</td></tr>` : ''}
        </table>

        ${logsHtml ? `<h3>Recent Outreach History</h3><ul>${logsHtml}</ul>` : ''}

        <hr />
        <p style="color: #666; font-size: 12px;">
          This is an automated message from the HCI Patient Outreach system.
          Please log in to the <a href="https://hcimed.com/partner-login">Partner Portal</a> to manage this patient.
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

    // Update outreach log with email sent timestamp
    await supabase
      .from('outreach_logs')
      .update({ broker_email_sent_at: new Date().toISOString() })
      .eq('patient_id', patient_id)
      .eq('forwarded_to_broker', true)
      .is('broker_email_sent_at', null);

    return new Response(JSON.stringify({ success: true, id: data?.id }), {
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
