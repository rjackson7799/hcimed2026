/**
 * Practice Health Report — Vercel Cron Endpoint
 *
 * Triggered by Vercel Cron Jobs:
 *   Weekly:  GET /api/cron/practice-health-report?type=weekly  (Mondays 7am PT)
 *   Monthly: GET /api/cron/practice-health-report?type=monthly (1st of month 7am PT)
 *
 * Fetches KPI data from Supabase, generates a branded PDF, and emails it
 * to all active admin users with the "Medical Director" title.
 */

import type { ReportData } from '../lib/ph-report-types';
import {
  fetchKpiSummary,
  fetchVisitVolume,
  fetchChargesCollections,
  fetchPayerMix,
  fetchProviderProductivity,
  fetchOperationalSummary,
  fetchRecipients,
} from '../lib/ph-report-data';
import { generateReportPdf } from '../lib/ph-report-pdf';
import { sendReportEmails } from '../lib/ph-report-email';

// ─── Date Range Computation ─────────────────────────────────────────

function computeDateRange(type: 'weekly' | 'monthly'): { start: string; end: string; label: string } {
  const now = new Date();

  if (type === 'weekly') {
    // Previous Monday through Sunday
    const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon, ...
    const lastSunday = new Date(now);
    lastSunday.setDate(now.getDate() - (dayOfWeek === 0 ? 7 : dayOfWeek));
    const lastMonday = new Date(lastSunday);
    lastMonday.setDate(lastSunday.getDate() - 6);

    return {
      start: toDateStr(lastMonday),
      end: toDateStr(lastSunday),
      label: formatRange(lastMonday, lastSunday),
    };
  } else {
    // Previous calendar month
    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);

    return {
      start: toDateStr(prevMonth),
      end: toDateStr(lastDay),
      label: formatMonth(prevMonth),
    };
  }
}

function toDateStr(d: Date): string {
  return d.toISOString().split('T')[0];
}

function formatRange(start: Date, end: Date): string {
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  const s = start.toLocaleDateString('en-US', opts);
  const e = end.toLocaleDateString('en-US', { ...opts, year: 'numeric' });
  return `${s} – ${e}`;
}

function formatMonth(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

// ─── Main Handler ───────────────────────────────────────────────────

export async function GET(request: Request) {
  const jsonHeaders = { 'Content-Type': 'application/json' };

  try {
    // 1. Authenticate — Vercel Cron sends CRON_SECRET in Authorization header
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret) {
      return new Response(JSON.stringify({ error: 'CRON_SECRET not configured' }), {
        status: 500,
        headers: jsonHeaders,
      });
    }
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${cronSecret}`) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: jsonHeaders,
      });
    }

    // 2. Determine report type
    const url = new URL(request.url);
    const type = (url.searchParams.get('type') || 'weekly') as 'weekly' | 'monthly';
    if (type !== 'weekly' && type !== 'monthly') {
      return new Response(JSON.stringify({ error: 'Invalid type. Use "weekly" or "monthly".' }), {
        status: 400,
        headers: jsonHeaders,
      });
    }

    console.log(`[ph-report] Starting ${type} report generation...`);

    // 3. Compute date range
    const { start, end, label } = computeDateRange(type);
    console.log(`[ph-report] Date range: ${start} to ${end} (${label})`);

    // 4. Fetch all report data in parallel
    const [kpi, visitVolume, chargesCollections, payerMix, providers, operational, recipients] =
      await Promise.all([
        fetchKpiSummary(start, end),
        fetchVisitVolume(start, end),
        fetchChargesCollections(start, end),
        fetchPayerMix(start, end),
        fetchProviderProductivity(start, end),
        fetchOperationalSummary(start, end),
        fetchRecipients(),
      ]);

    console.log(`[ph-report] Data fetched. Recipients: ${recipients.length}, Visit data points: ${visitVolume.length}`);

    // 5. Check for recipients
    if (recipients.length === 0) {
      console.warn('[ph-report] No Medical Director recipients found. Skipping email.');
      return new Response(JSON.stringify({
        type,
        period: label,
        sent: 0,
        warning: 'No active Medical Director recipients found',
      }), { status: 200, headers: jsonHeaders });
    }

    // 6. Build report data
    const reportData: ReportData = {
      reportType: type,
      periodLabel: label,
      generatedAt: new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short',
      }),
      dateRange: { start, end },
      kpiCurrent: kpi.current,
      kpiPrevious: kpi.previous,
      visitVolume,
      chargesCollections,
      payerMix,
      providers,
      operational,
    };

    // 7. Generate PDF
    console.log('[ph-report] Generating PDF...');
    const pdfBuffer = await generateReportPdf(reportData);
    console.log(`[ph-report] PDF generated: ${(pdfBuffer.length / 1024).toFixed(1)} KB`);

    // 8. Send emails
    console.log(`[ph-report] Sending to ${recipients.length} recipient(s)...`);
    const result = await sendReportEmails({
      recipients,
      pdfBuffer,
      reportType: type,
      periodLabel: label,
    });

    console.log(`[ph-report] Done. Sent: ${result.sent}, Errors: ${result.errors.length}`);

    return new Response(JSON.stringify({
      type,
      period: label,
      sent: result.sent,
      recipients: recipients.map(r => r.email),
      errors: result.errors.length > 0 ? result.errors : undefined,
      pdfSizeKb: Math.round(pdfBuffer.length / 1024),
    }), { status: 200, headers: jsonHeaders });

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[ph-report] Fatal error:', message);
    return new Response(JSON.stringify({
      error: 'Report generation failed',
      message,
    }), { status: 500, headers: jsonHeaders });
  }
}
