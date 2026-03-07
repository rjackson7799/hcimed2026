/**
 * Practice Health Upload API — Vercel Serverless Function
 * Receives parsed report data, inserts into Supabase, calculates KPIs.
 */

import { createClient } from '@supabase/supabase-js';

// ─── KPI Constants (mirrored from client constants to avoid import issues) ────

const BILLABLE_CPT_PATTERN = /^(99[0-9]{3}|[A-Z][0-9]{4})$/;
const NEW_PATIENT_CPT_RANGE = { min: 99201, max: 99205 };
const ESTABLISHED_PATIENT_CPT_RANGE = { min: 99211, max: 99215 };
const COMPLETED_VISIT_STATUSES = ['CHK', 'Checked Out', 'checked_out'];
const NO_SHOW_VISIT_STATUSES = ['N/S', 'No Show', 'no_show'];
const CANCELLED_VISIT_STATUSES = ['R/S', 'CAN', 'Cancelled', 'Rescheduled', 'cancelled'];

const BATCH_SIZE = 100;

// ─── Types ──────────────────────────────────────────────────────────

interface UploadRequestBody {
  reportType: string;
  fileName: string;
  fileSizeBytes: number;
  dateRangeStart: string;
  dateRangeEnd: string;
  rows: Record<string, unknown>[];
  rowCount: number;
}

interface Provider {
  id: string;
  normalized_name: string;
}

interface RvuEntry {
  cpt_code: string;
  work_rvu: number;
  total_rvu: number;
}

// ─── Helpers ────────────────────────────────────────────────────────

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function normalizeForMatch(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function matchProvider(renderingProvider: string, providers: Provider[]): string | null {
  const normalized = normalizeForMatch(renderingProvider);
  for (const p of providers) {
    if (normalizeForMatch(p.normalized_name) === normalized) {
      return p.id;
    }
  }
  return null;
}

// ─── KPI Calculation ────────────────────────────────────────────────

interface KpiAccumulator {
  visits: number;
  no_shows: number;
  cancellations: number;
  televisits: number;
  new_patients: number;
  established_patients: number;
  billed_amount: number;
  rvu_total: number;
  wrvu_total: number;
  total_encounters: number;
  quality_code_encounters: number;
  total_icd_codes: number;
  encounter_count_for_icd: number;
  visit_durations: number[];
  wait_times: number[];
  clinician_times: number[];
  total_scheduled: number;
}

function newKpiAccumulator(): KpiAccumulator {
  return {
    visits: 0,
    no_shows: 0,
    cancellations: 0,
    televisits: 0,
    new_patients: 0,
    established_patients: 0,
    billed_amount: 0,
    rvu_total: 0,
    wrvu_total: 0,
    total_encounters: 0,
    quality_code_encounters: 0,
    total_icd_codes: 0,
    encounter_count_for_icd: 0,
    visit_durations: [],
    wait_times: [],
    clinician_times: [],
    total_scheduled: 0,
  };
}

function avg(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

async function calculateAndUpsertKpis(
  supabase: ReturnType<typeof createClient>,
  reportType: string,
  dateRangeStart: string,
  dateRangeEnd: string
): Promise<string[]> {
  // Determine affected dates from the data we just inserted
  const kpiMap = new Map<string, KpiAccumulator>();
  const kpiKey = (date: string, providerId: string | null, serviceLine: string) =>
    `${date}|${providerId || '_all_'}|${serviceLine}`;

  const getOrCreate = (date: string, providerId: string | null, serviceLine: string) => {
    const key = kpiKey(date, providerId, serviceLine);
    if (!kpiMap.has(key)) kpiMap.set(key, newKpiAccumulator());
    return kpiMap.get(key)!;
  };

  // Query charges data for financial KPIs
  if (reportType === '371.02' || reportType === 'all') {
    const { data: charges } = await supabase
      .from('ph_charges')
      .select('service_date, provider_id, service_line, cpt_code, billed_charge, units, is_billable, work_rvu, total_rvu, icd_codes')
      .gte('service_date', dateRangeStart)
      .lte('service_date', dateRangeEnd);

    if (charges) {
      for (const c of charges) {
        const acc = getOrCreate(c.service_date, c.provider_id, c.service_line);

        if (c.is_billable) {
          acc.billed_amount += c.billed_charge;
          acc.total_encounters++;

          // New vs established patient
          const cptNum = parseInt(c.cpt_code);
          if (!isNaN(cptNum)) {
            if (cptNum >= NEW_PATIENT_CPT_RANGE.min && cptNum <= NEW_PATIENT_CPT_RANGE.max) {
              acc.new_patients++;
            } else if (cptNum >= ESTABLISHED_PATIENT_CPT_RANGE.min && cptNum <= ESTABLISHED_PATIENT_CPT_RANGE.max) {
              acc.established_patients++;
            }
          }
        }

        // Quality codes
        if (c.cpt_code.startsWith('G')) {
          acc.quality_code_encounters++;
        }

        // RVU
        acc.rvu_total += (c.total_rvu || 0) * (c.units || 1);
        acc.wrvu_total += (c.work_rvu || 0) * (c.units || 1);

        // ICD code count
        const icdCount = Array.isArray(c.icd_codes) ? c.icd_codes.filter(Boolean).length : 0;
        if (icdCount > 0) {
          acc.total_icd_codes += icdCount;
          acc.encounter_count_for_icd++;
        }
      }
    }
  }

  // Query productivity data for operational KPIs
  if (reportType === '4.06' || reportType === 'all') {
    const { data: productivity } = await supabase
      .from('ph_productivity')
      .select('appointment_date, provider_id, service_line, visit_status, is_televisit, actual_duration_min, wait_time_min, clinician_time_min')
      .gte('appointment_date', dateRangeStart)
      .lte('appointment_date', dateRangeEnd);

    if (productivity) {
      for (const p of productivity) {
        const acc = getOrCreate(p.appointment_date, p.provider_id, p.service_line);
        acc.total_scheduled++;

        const statusLower = (p.visit_status || '').toLowerCase().trim();
        const isCompleted = COMPLETED_VISIT_STATUSES.some((s) => s.toLowerCase() === statusLower);
        const isNoShow = NO_SHOW_VISIT_STATUSES.some((s) => s.toLowerCase() === statusLower);
        const isCancelled = CANCELLED_VISIT_STATUSES.some((s) => s.toLowerCase() === statusLower);

        if (isCompleted) {
          acc.visits++;
          if (p.is_televisit) acc.televisits++;
          if (p.actual_duration_min != null) acc.visit_durations.push(p.actual_duration_min);
          if (p.wait_time_min != null) acc.wait_times.push(p.wait_time_min);
          if (p.clinician_time_min != null) acc.clinician_times.push(p.clinician_time_min);
        } else if (isNoShow) {
          acc.no_shows++;
        } else if (isCancelled) {
          acc.cancellations++;
        }
      }
    }
  }

  // Upsert KPI rows
  const kpiRows = [];
  const affectedDates = new Set<string>();

  for (const [key, acc] of kpiMap) {
    const [date, providerId, serviceLine] = key.split('|');
    affectedDates.add(date);

    const totalRelevant = acc.visits + acc.no_shows + acc.cancellations;
    const scheduleUtil = totalRelevant > 0 ? acc.visits / totalRelevant : 0;

    kpiRows.push({
      date,
      provider_id: providerId === '_all_' ? null : providerId,
      service_line: serviceLine,
      visits: acc.visits,
      no_shows: acc.no_shows,
      cancellations: acc.cancellations,
      televisits: acc.televisits,
      new_patients: acc.new_patients,
      established_patients: acc.established_patients,
      billed_amount: acc.billed_amount,
      est_collections: acc.billed_amount * 0.85, // Estimated at benchmark collection rate
      revenue_per_visit: acc.visits > 0 ? acc.billed_amount / acc.visits : 0,
      rvu_total: acc.rvu_total,
      wrvu_total: acc.wrvu_total,
      avg_visit_duration_min: avg(acc.visit_durations),
      avg_wait_time_min: avg(acc.wait_times),
      avg_clinician_time_min: avg(acc.clinician_times),
      schedule_utilization: scheduleUtil,
      avg_diagnoses_per_encounter: acc.encounter_count_for_icd > 0 ? acc.total_icd_codes / acc.encounter_count_for_icd : 0,
      quality_code_encounters: acc.quality_code_encounters,
      total_encounters: acc.total_encounters,
    });
  }

  // Upsert using the UNIQUE(date, provider_id, service_line) constraint
  if (kpiRows.length > 0) {
    for (let i = 0; i < kpiRows.length; i += BATCH_SIZE) {
      const batch = kpiRows.slice(i, i + BATCH_SIZE);
      await supabase
        .from('ph_kpi_daily')
        .upsert(batch, { onConflict: 'date,provider_id,service_line' });
    }
  }

  return Array.from(affectedDates).sort();
}

// ─── Main Handler ───────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return jsonResponse({ error: 'Server configuration error' }, 500);
    }

    // 1. Auth verification
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return jsonResponse({ error: 'Invalid authentication' }, 401);
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return jsonResponse({ error: 'Admin access required' }, 403);
    }

    // 2. Parse request body
    const body: UploadRequestBody = await request.json();
    const { reportType, fileName, fileSizeBytes, dateRangeStart, dateRangeEnd, rows, rowCount } = body;

    if (!reportType || !fileName || !rows || rows.length === 0) {
      return jsonResponse({ error: 'Missing required fields' }, 400);
    }

    // 3. Create upload record
    const { data: upload, error: uploadError } = await supabase
      .from('ph_uploads')
      .insert({
        uploaded_by: user.id,
        report_type: reportType,
        file_name: fileName,
        file_size_bytes: fileSizeBytes,
        status: 'processing',
        row_count: rowCount,
        date_range_start: dateRangeStart || null,
        date_range_end: dateRangeEnd || null,
      })
      .select('id')
      .single();

    if (uploadError || !upload) {
      return jsonResponse({ error: 'Failed to create upload record' }, 500);
    }

    const uploadId = upload.id;

    try {
      // 4. Duplicate check against existing data
      if (reportType === '371.02' && dateRangeStart && dateRangeEnd) {
        const { count } = await supabase
          .from('ph_charges')
          .select('id', { count: 'exact', head: true })
          .gte('service_date', dateRangeStart)
          .lte('service_date', dateRangeEnd);

        if (count && count > 0) {
          await supabase
            .from('ph_uploads')
            .update({ status: 'duplicate', error_message: `Data already exists for date range ${dateRangeStart} to ${dateRangeEnd}. ${count} existing rows found.` })
            .eq('id', uploadId);
          return jsonResponse({
            success: false,
            error: `Data already exists for this date range (${count} existing rows). Delete the previous upload first or contact admin.`,
            uploadId,
          }, 409);
        }
      }

      if (reportType === '4.06' && dateRangeStart && dateRangeEnd) {
        const { count } = await supabase
          .from('ph_productivity')
          .select('id', { count: 'exact', head: true })
          .gte('appointment_date', dateRangeStart)
          .lte('appointment_date', dateRangeEnd);

        if (count && count > 0) {
          await supabase
            .from('ph_uploads')
            .update({ status: 'duplicate', error_message: `Productivity data already exists for date range ${dateRangeStart} to ${dateRangeEnd}.` })
            .eq('id', uploadId);
          return jsonResponse({
            success: false,
            error: `Productivity data already exists for this date range (${count} existing rows).`,
            uploadId,
          }, 409);
        }
      }

      // 5. Provider matching & RVU lookup (for applicable report types)
      const { data: providers } = await supabase
        .from('ph_providers')
        .select('id, normalized_name')
        .eq('is_active', true);

      const providerList: Provider[] = providers || [];

      let rvuMap: Map<string, RvuEntry> | undefined;
      if (reportType === '371.02') {
        const { data: rvuData } = await supabase
          .from('ph_rvu_lookup')
          .select('cpt_code, work_rvu, total_rvu');
        rvuMap = new Map();
        if (rvuData) {
          for (const r of rvuData) {
            rvuMap.set(r.cpt_code, r);
          }
        }
      }

      // 6. Enrich rows with provider_id, RVU values, and upload_id
      const enrichedRows = rows.map((row) => {
        const enriched: Record<string, unknown> = { ...row, upload_id: uploadId };

        // Provider matching
        const providerField = (row.rendering_provider as string) || '';
        if (providerField) {
          enriched.provider_id = matchProvider(providerField, providerList);
        }

        // RVU lookup (charges only)
        if (reportType === '371.02' && rvuMap) {
          const cptCode = row.cpt_code as string;
          const units = (row.units as number) || 1;
          const rvu = rvuMap.get(cptCode);
          if (rvu) {
            enriched.work_rvu = rvu.work_rvu * units;
            enriched.total_rvu = rvu.total_rvu * units;
          } else {
            enriched.work_rvu = 0;
            enriched.total_rvu = 0;
          }
        }

        return enriched;
      });

      // 7. Batch insert into the appropriate table
      const tableMap: Record<string, string> = {
        '371.02': 'ph_charges',
        '36.14': 'ph_collections',
        '4.06': 'ph_productivity',
      };

      const tableName = tableMap[reportType];
      if (!tableName) {
        throw new Error(`Unknown report type: ${reportType}`);
      }

      let insertedCount = 0;
      for (let i = 0; i < enrichedRows.length; i += BATCH_SIZE) {
        const batch = enrichedRows.slice(i, i + BATCH_SIZE);
        const { error: insertError } = await supabase.from(tableName).insert(batch);
        if (insertError) {
          throw new Error(`Insert error at batch ${Math.floor(i / BATCH_SIZE) + 1}: ${insertError.message}`);
        }
        insertedCount += batch.length;
      }

      // 8. Calculate KPIs
      let kpiDatesUpdated: string[] = [];
      if (dateRangeStart && dateRangeEnd) {
        kpiDatesUpdated = await calculateAndUpsertKpis(
          supabase,
          reportType,
          dateRangeStart,
          dateRangeEnd
        );
      }

      // 9. Update upload status to success
      await supabase
        .from('ph_uploads')
        .update({
          status: 'success',
          row_count: insertedCount,
        })
        .eq('id', uploadId);

      return jsonResponse({
        success: true,
        uploadId,
        rowCount: insertedCount,
        kpiDatesUpdated,
      }, 201);
    } catch (processingError) {
      // Update upload status to error
      const errorMessage = processingError instanceof Error ? processingError.message : 'Unknown processing error';
      await supabase
        .from('ph_uploads')
        .update({
          status: 'error',
          error_message: errorMessage,
        })
        .eq('id', uploadId);

      return jsonResponse({ success: false, error: errorMessage, uploadId }, 500);
    }
  } catch (err) {
    console.error('Practice health upload error:', err);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
}
