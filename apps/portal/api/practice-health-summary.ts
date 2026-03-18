/**
 * Practice Health Executive Summary — On-Demand API
 *
 * GET  /api/practice-health-summary?start=YYYY-MM-DD&end=YYYY-MM-DD
 *      → Returns PDF as downloadable attachment
 *
 * POST /api/practice-health-summary
 *      Body: { start, end, recipients: string[] }
 *      → Generates PDF and emails to recipients
 */

import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import {
  fetchIncomeStreamData,
  fetchProviderProductivity,
  fetchOperationalSummary,
  fetchOutreachProjects,
  fetchAiInsights,
} from './lib/ph-report-data';
import { generateExecutiveSummaryPdf } from './lib/ph-report-executive-pdf';
import type { ExecutiveSummaryData } from './lib/ph-report-types';

// ─── Helpers ─────────────────────────────────────────────────────────

function getSupabase() {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase configuration');
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function authenticateAdmin(request: Request): Promise<{ userId: string } | Response> {
  const supabase = getSupabase();
  const jsonHeaders = { 'Content-Type': 'application/json' };

  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: jsonHeaders });
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401, headers: jsonHeaders });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Admin access required' }), { status: 403, headers: jsonHeaders });
  }

  return { userId: user.id };
}

function formatPeriodLabel(start: string, end: string): string {
  const s = new Date(start + 'T00:00:00');
  const e = new Date(end + 'T00:00:00');
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  return `${s.toLocaleDateString('en-US', opts)} – ${e.toLocaleDateString('en-US', { ...opts, year: 'numeric' })}`;
}

async function buildSummaryData(start: string, end: string): Promise<ExecutiveSummaryData> {
  const [hciOffice, mobileDocs, providers, operational, outreachProjects, insights] =
    await Promise.all([
      fetchIncomeStreamData(start, end, 'hci_office'),
      fetchIncomeStreamData(start, end, 'mobile_docs'),
      fetchProviderProductivity(start, end),
      fetchOperationalSummary(start, end),
      fetchOutreachProjects(),
      fetchAiInsights(start, end),
    ]);

  return {
    periodLabel: formatPeriodLabel(start, end),
    generatedAt: new Date().toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
    }),
    dateRange: { start, end },
    insights,
    hciOffice,
    mobileDocs,
    outreachProjects,
    providers,
    operational,
  };
}

// ─── GET: Download PDF ──────────────────────────────────────────────

export async function GET(request: Request) {
  const jsonHeaders = { 'Content-Type': 'application/json' };

  try {
    const auth = await authenticateAdmin(request);
    if (auth instanceof Response) return auth;

    const url = new URL(request.url);
    const start = url.searchParams.get('start');
    const end = url.searchParams.get('end');

    if (!start || !end) {
      return new Response(
        JSON.stringify({ error: 'start and end query params required (YYYY-MM-DD)' }),
        { status: 400, headers: jsonHeaders }
      );
    }

    console.log(`[ph-summary] Generating executive summary PDF for ${start} to ${end}...`);

    const data = await buildSummaryData(start, end);
    const pdfBuffer = await generateExecutiveSummaryPdf(data);

    const safeLabel = data.periodLabel.replace(/[^a-zA-Z0-9-]/g, '-');
    const filename = `HCI-Executive-Summary-${safeLabel}.pdf`;

    console.log(`[ph-summary] PDF generated: ${(pdfBuffer.length / 1024).toFixed(1)} KB`);

    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(pdfBuffer.length),
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[ph-summary] GET error:', message);
    return new Response(
      JSON.stringify({ error: 'Failed to generate summary', message }),
      { status: 500, headers: jsonHeaders }
    );
  }
}

// ─── POST: Email PDF ────────────────────────────────────────────────

export async function POST(request: Request) {
  const jsonHeaders = { 'Content-Type': 'application/json' };

  try {
    const auth = await authenticateAdmin(request);
    if (auth instanceof Response) return auth;

    const body = await request.json();
    const { start, end, recipients } = body;

    if (!start || !end) {
      return new Response(
        JSON.stringify({ error: 'start and end are required' }),
        { status: 400, headers: jsonHeaders }
      );
    }

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return new Response(
        JSON.stringify({ error: 'recipients array is required' }),
        { status: 400, headers: jsonHeaders }
      );
    }

    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      return new Response(
        JSON.stringify({ error: 'RESEND_API_KEY not configured' }),
        { status: 500, headers: jsonHeaders }
      );
    }

    console.log(`[ph-summary] Generating and emailing executive summary for ${start} to ${end}...`);

    const data = await buildSummaryData(start, end);
    const pdfBuffer = await generateExecutiveSummaryPdf(data);

    const safeLabel = data.periodLabel.replace(/[^a-zA-Z0-9-]/g, '-');
    const filename = `HCI-Executive-Summary-${safeLabel}.pdf`;
    const subject = `Practice Health Executive Summary — ${data.periodLabel}`;

    const resend = new Resend(resendKey);

    let sent = 0;
    const errors: string[] = [];

    for (const email of recipients) {
      try {
        await resend.emails.send({
          from: 'HCI Practice Health <noreply@hcimed.com>',
          to: [email],
          subject,
          html: `
            <div style="font-family: 'Source Sans Pro', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="border-bottom: 3px solid #1B3A5C; padding-bottom: 12px; margin-bottom: 20px;">
                <h2 style="color: #1B3A5C; margin: 0;">HCI Medical Group</h2>
                <p style="color: #64748B; margin: 4px 0 0;">Practice Health Executive Summary</p>
              </div>

              <p>Please find attached the <strong>Practice Health Executive Summary</strong> for <strong>${data.periodLabel}</strong>.</p>

              <p>This report includes:</p>
              <ul style="color: #334155;">
                <li>AI-generated key takeaways, opportunities, and causes for concern</li>
                <li>HCI Office income stream breakdown</li>
                <li>Mobile Docs income stream breakdown with facility details</li>
                <li>Patient outreach project progress</li>
                <li>Provider productivity metrics</li>
                <li>Operational indicators</li>
              </ul>

              <p style="color: #64748B; font-size: 13px; margin-top: 24px;">
                This report was generated on-demand from the HCI Portal.
              </p>

              <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 20px 0;" />

              <p style="color: #94A3B8; font-size: 11px;">
                Generated by HCI Portal &bull; Confidential — For Internal Use Only
              </p>
            </div>
          `,
          attachments: [
            {
              filename,
              content: pdfBuffer,
              contentType: 'application/pdf',
            },
          ],
        });
        sent++;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        errors.push(`Failed to send to ${email}: ${msg}`);
        console.error(`[ph-summary] Failed to send to ${email}:`, msg);
      }
    }

    console.log(`[ph-summary] Emails sent: ${sent}, errors: ${errors.length}`);

    return new Response(JSON.stringify({
      sent,
      total: recipients.length,
      errors: errors.length > 0 ? errors : undefined,
      pdfSizeKb: Math.round(pdfBuffer.length / 1024),
    }), { status: 200, headers: jsonHeaders });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[ph-summary] POST error:', message);
    return new Response(
      JSON.stringify({ error: 'Failed to send summary', message }),
      { status: 500, headers: jsonHeaders }
    );
  }
}
