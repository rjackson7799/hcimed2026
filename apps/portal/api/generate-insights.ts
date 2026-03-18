/**
 * Practice Health — AI Insights Generator
 *
 * POST /api/generate-insights
 * Body: { dateRange: { start: string, end: string }, serviceLine?: string }
 *
 * Fetches KPI data, sends to Claude API, and stores structured insights
 * in the ph_ai_insights table.
 */

import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import {
  fetchKpiSummary,
  fetchProviderProductivity,
  fetchOperationalSummary,
  fetchPayerMix,
} from './lib/ph-report-data';

// ─── Supabase Client ─────────────────────────────────────────────────

function getSupabase() {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase configuration');
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// ─── Benchmarks (duplicated to avoid client import issues) ───────────

const BENCHMARKS = {
  visitsPerDay: { np: 6.0 },
  wrvuPerMonth: { np: 120 },
  collectionRate: 85,
  noShowRate: 20,
  avgWaitTimeMinutes: 15,
  revenuePerEncounter: 281,
};

// ─── Types ───────────────────────────────────────────────────────────

interface InsightResponse {
  takeaways: Array<{ title: string; narrative: string }>;
  opportunities: Array<{ title: string; narrative: string; category: string }>;
  concerns: Array<{ title: string; narrative: string; severity: string; category: string }>;
}

// ─── Handler ─────────────────────────────────────────────────────────

export async function POST(request: Request) {
  const jsonHeaders = { 'Content-Type': 'application/json' };

  try {
    // 1. Validate API key
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    if (!anthropicKey) {
      return new Response(
        JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }),
        { status: 500, headers: jsonHeaders }
      );
    }

    // 2. Authenticate caller via Supabase
    const supabase = getSupabase();
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: jsonHeaders }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: jsonHeaders }
      );
    }

    // Check admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: jsonHeaders }
      );
    }

    // 3. Parse request body
    const body = await request.json();
    const { dateRange } = body;
    if (!dateRange?.start || !dateRange?.end) {
      return new Response(
        JSON.stringify({ error: 'dateRange.start and dateRange.end are required' }),
        { status: 400, headers: jsonHeaders }
      );
    }

    const { start, end } = dateRange;

    // 4. Fetch data in parallel
    const [kpi, providers, operational, payerMix] = await Promise.all([
      fetchKpiSummary(start, end),
      fetchProviderProductivity(start, end),
      fetchOperationalSummary(start, end),
      fetchPayerMix(start, end),
    ]);

    // 5. Build prompt
    const dataContext = `
## Practice Health Data for ${start} to ${end}

### KPI Summary (Current Period)
- Total Visits: ${kpi.current.totalVisits}
- Billed Charges: $${kpi.current.billedCharges.toLocaleString()}
- Estimated Collections: $${kpi.current.estCollections.toLocaleString()}
- Total wRVUs: ${kpi.current.totalWrvu.toFixed(2)}
- Collection Rate: ${(kpi.current.collectionRate * 100).toFixed(1)}%

### KPI Summary (Previous Period)
- Total Visits: ${kpi.previous.totalVisits}
- Billed Charges: $${kpi.previous.billedCharges.toLocaleString()}
- Estimated Collections: $${kpi.previous.estCollections.toLocaleString()}
- Total wRVUs: ${kpi.previous.totalWrvu.toFixed(2)}
- Collection Rate: ${(kpi.previous.collectionRate * 100).toFixed(1)}%

### Provider Productivity
${providers.map((p) => `- ${p.providerName} (${p.role.toUpperCase()}): ${p.visits} visits, ${p.wrvuTotal.toFixed(2)} wRVUs, $${p.billedCharges.toLocaleString()} billed, ${(p.collectionRate * 100).toFixed(1)}% collection rate`).join('\n')}

### Operational Metrics
- No-Show Rate: ${operational.noShowRate.toFixed(1)}%
- Average Wait Time: ${operational.avgWaitTime.toFixed(1)} minutes
- Schedule Utilization: ${operational.scheduleUtilization.toFixed(1)}%

### Payer Mix (Top 8)
${payerMix.slice(0, 8).map((p) => `- ${p.payer}: $${p.charges.toLocaleString()} (${(p.percentage * 100).toFixed(1)}%)`).join('\n')}

### Industry Benchmarks
- NP visits/day target: ${BENCHMARKS.visitsPerDay.np}
- NP wRVU/month target: ${BENCHMARKS.wrvuPerMonth.np}
- Collection rate target: ${BENCHMARKS.collectionRate}%
- No-show rate threshold: ${BENCHMARKS.noShowRate}%
- Average wait time target: ${BENCHMARKS.avgWaitTimeMinutes} min
- Revenue per encounter target: $${BENCHMARKS.revenuePerEncounter}
`;

    const systemPrompt = `You are a healthcare practice management analyst for HCI Medical Group, a trusted internal medicine and senior care practice in Pasadena, CA. You analyze practice performance data and generate concise, actionable insights for the medical director.

Your analysis should be grounded in the data provided. Compare metrics against benchmarks and prior periods. Focus on what's most impactful for a small practice.

Respond with valid JSON matching this exact structure:
{
  "takeaways": [
    { "title": "short title", "narrative": "1-2 sentence explanation" }
  ],
  "opportunities": [
    { "title": "short title", "narrative": "1-2 sentence explanation with specific action", "category": "productivity|revenue|coding|efficiency" }
  ],
  "concerns": [
    { "title": "short title", "narrative": "1-2 sentence explanation of the risk", "severity": "critical|warning", "category": "productivity|revenue|coding|efficiency" }
  ]
}

Rules:
- Generate 3-5 takeaways (most important facts from the data)
- Generate 2-3 opportunities (growth areas with specific actions)
- Generate 1-3 concerns (metrics below benchmarks or negative trends)
- Be specific with numbers — cite actual values and percentages
- Keep titles under 8 words
- Keep narratives under 2 sentences
- Only flag concerns that are genuinely below benchmarks or declining
- If metrics are healthy, acknowledge that — don't manufacture concerns`;

    // 6. Call Claude API
    const anthropic = new Anthropic({ apiKey: anthropicKey });

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Analyze this practice health data and generate insights:\n${dataContext}`,
        },
      ],
    });

    // 7. Parse response
    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return new Response(
        JSON.stringify({ error: 'Failed to parse AI response', raw: responseText }),
        { status: 500, headers: jsonHeaders }
      );
    }

    const insights: InsightResponse = JSON.parse(jsonMatch[0]);

    // 8. Clear old insights for this date range, then insert new ones
    await supabase
      .from('ph_ai_insights')
      .delete()
      .gte('insight_date', start)
      .lte('insight_date', end);

    const insightRows = [
      ...insights.takeaways.map((t) => ({
        insight_date: end,
        insight_type: 'daily_summary' as const,
        service_line: null,
        category: null,
        severity: 'info' as const,
        title: t.title,
        narrative: t.narrative,
        supporting_data: null,
        model_version: 'claude-haiku-4-5-20251001',
      })),
      ...insights.opportunities.map((o) => ({
        insight_date: end,
        insight_type: 'recommendation' as const,
        service_line: null,
        category: o.category || 'efficiency',
        severity: 'info' as const,
        title: o.title,
        narrative: o.narrative,
        supporting_data: null,
        model_version: 'claude-haiku-4-5-20251001',
      })),
      ...insights.concerns.map((c) => ({
        insight_date: end,
        insight_type: 'alert' as const,
        service_line: null,
        category: c.category || 'efficiency',
        severity: (c.severity === 'critical' ? 'critical' : 'warning') as 'critical' | 'warning',
        title: c.title,
        narrative: c.narrative,
        supporting_data: null,
        model_version: 'claude-haiku-4-5-20251001',
      })),
    ];

    if (insightRows.length > 0) {
      const { error: insertError } = await supabase.from('ph_ai_insights').insert(insightRows);
      if (insertError) {
        console.error('[generate-insights] Failed to save insights:', insertError.message);
      }
    }

    // 9. Return insights
    return new Response(
      JSON.stringify({
        insights,
        saved: insightRows.length,
        period: { start, end },
      }),
      { status: 200, headers: jsonHeaders }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[generate-insights] Error:', message);
    return new Response(
      JSON.stringify({ error: 'Failed to generate insights', message }),
      { status: 500, headers: jsonHeaders }
    );
  }
}
