/**
 * AWV Upload Processor — Serverless API
 *
 * POST /api/awv-upload
 * Body: { fileName: string, parsedRows: AwvUploadRow[] }
 * Auth: Bearer token (admin or staff role required)
 *
 * Processes CSV rows by upserting patients and creating tracking records.
 * Returns upload result summary.
 */

import { createClient } from '@supabase/supabase-js';

// ─── Helpers ─────────────────────────────────────────────────────────

const jsonHeaders = { 'Content-Type': 'application/json' };

function getSupabase() {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase configuration');
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function authenticateStaffOrAdmin(
  request: Request,
): Promise<{ userId: string } | Response> {
  const supabase = getSupabase();

  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: jsonHeaders,
    });
  }

  const token = authHeader.replace('Bearer ', '');
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);
  if (error || !user) {
    return new Response(JSON.stringify({ error: 'Invalid token' }), {
      status: 401,
      headers: jsonHeaders,
    });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !['admin', 'staff'].includes(profile.role)) {
    return new Response(
      JSON.stringify({ error: 'Admin or staff access required' }),
      { status: 403, headers: jsonHeaders },
    );
  }

  return { userId: user.id };
}

// ─── Types ───────────────────────────────────────────────────────────

interface UploadRow {
  'Patient Acct No': string;
  'Patient Last Name': string;
  'Rendering Provider': string;
  Facility?: string;
  'Primary Payer Name'?: string;
  'Last AWV Date'?: string;
  'Last AWV CPT'?: string;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

// ─── POST Handler ────────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    // 1. Authenticate
    const auth = await authenticateStaffOrAdmin(request);
    if (auth instanceof Response) return auth;

    const supabase = getSupabase();

    // 2. Parse body
    const body = await request.json();
    const { fileName, parsedRows } = body as {
      fileName: string;
      parsedRows: UploadRow[];
    };

    if (!fileName || !parsedRows || !Array.isArray(parsedRows)) {
      return new Response(
        JSON.stringify({ error: 'fileName and parsedRows are required' }),
        { status: 400, headers: jsonHeaders },
      );
    }

    if (parsedRows.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No rows to process' }),
        { status: 400, headers: jsonHeaders },
      );
    }

    // 3. Create upload record (Processing)
    const { data: uploadRecord, error: uploadErr } = await supabase
      .from('awv_uploads')
      .insert({
        uploaded_by: auth.userId,
        file_name: fileName,
        status: 'Processing',
        row_count: parsedRows.length,
        new_patients: 0,
        updated_patients: 0,
        flagged_patients: 0,
      })
      .select()
      .single();

    if (uploadErr) throw uploadErr;

    // 4. Build provider + facility lookup maps
    const [{ data: providers }, { data: facilities }] = await Promise.all([
      supabase.from('ph_providers').select('id, name').eq('is_active', true),
      supabase.from('facilities_directory').select('id, name').eq('is_archived', false),
    ]);

    const providerByName = new Map<string, string>();
    for (const p of providers ?? []) {
      providerByName.set((p as { id: string; name: string }).name.toLowerCase(), (p as { id: string; name: string }).id);
    }

    const facilityByName = new Map<string, string>();
    for (const f of facilities ?? []) {
      facilityByName.set((f as { id: string; name: string }).name.toLowerCase(), (f as { id: string; name: string }).id);
    }

    // 5. Process rows
    let newCount = 0;
    let updatedCount = 0;
    const errors: ValidationError[] = [];
    const uploadedEcwIds = new Set<string>();

    for (let idx = 0; idx < parsedRows.length; idx++) {
      const row = parsedRows[idx];
      const ecwId = row['Patient Acct No'];
      const rowNum = idx + 2; // 1-indexed + header row

      // Check for duplicate within file
      if (uploadedEcwIds.has(ecwId)) {
        errors.push({
          row: rowNum,
          field: 'Patient Acct No',
          message: `Duplicate Patient Acct No: ${ecwId}`,
        });
        continue;
      }
      uploadedEcwIds.add(ecwId);

      // Resolve provider
      const providerName = row['Rendering Provider'];
      const providerId = providerByName.get(providerName.toLowerCase());
      if (!providerId) {
        errors.push({
          row: rowNum,
          field: 'Rendering Provider',
          message: `Provider not found: "${providerName}"`,
        });
      }

      // Resolve facility (optional)
      const facilityName = row['Facility'];
      let facilityId: string | null = null;
      if (facilityName) {
        facilityId = facilityByName.get(facilityName.toLowerCase()) ?? null;
        if (!facilityId) {
          errors.push({
            row: rowNum,
            field: 'Facility',
            message: `Facility not found: "${facilityName}"`,
          });
        }
      }

      const isMobileDocs = !!facilityId;
      const lastAwvDate = row['Last AWV Date'] || null;
      const lastAwvCpt = row['Last AWV CPT'] || null;

      // Check if patient already exists
      const { data: existing } = await supabase
        .from('awv_patients')
        .select('id')
        .eq('ecw_patient_id', ecwId)
        .limit(1)
        .single();

      if (existing) {
        // Update existing patient
        const updateFields: Record<string, unknown> = {
          last_name: row['Patient Last Name'],
        };
        if (providerId) updateFields.assigned_provider_id = providerId;
        if (facilityName && facilityId) updateFields.facility_id = facilityId;
        if (row['Primary Payer Name']) updateFields.payer_name = row['Primary Payer Name'];

        await supabase
          .from('awv_patients')
          .update(updateFields)
          .eq('id', (existing as { id: string }).id);

        updatedCount++;
      } else {
        // Create new patient
        const { data: newPatient, error: pErr } = await supabase
          .from('awv_patients')
          .insert({
            ecw_patient_id: ecwId,
            last_name: row['Patient Last Name'],
            assigned_provider_id: providerId ?? 'UNMATCHED',
            service_line: isMobileDocs ? 'Mobile Docs' : 'HCI Office',
            facility_id: facilityId,
            payer_name: row['Primary Payer Name'] || null,
            medicare_status: 'Active',
            is_active: true,
            last_awv_date: lastAwvDate,
            last_awv_type: lastAwvCpt ? cptToType(lastAwvCpt) : null,
          })
          .select('id')
          .single();

        if (pErr) {
          errors.push({
            row: rowNum,
            field: 'Patient Acct No',
            message: `Insert failed: ${pErr.message}`,
          });
          continue;
        }

        // Compute next eligible date
        let nextEligibleDate: string | null = null;
        if (lastAwvDate) {
          const d = new Date(lastAwvDate);
          d.setFullYear(d.getFullYear() + 1);
          nextEligibleDate = d.toISOString().split('T')[0];
        }

        // Create tracking record
        await supabase.from('awv_tracking').insert({
          patient_id: (newPatient as { id: string }).id,
          eligibility_status: 'Pending Review',
          completion_status: 'Not Started',
          last_awv_date: lastAwvDate,
          next_eligible_date: nextEligibleDate,
          cpt_code: lastAwvCpt,
          date_source: 'Upload',
          updated_by: auth.userId,
        });

        newCount++;
      }
    }

    // 6. Count flagged patients (active patients not in this upload)
    const { count: totalActive } = await supabase
      .from('awv_patients')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    const flaggedCount = Math.max(0, (totalActive ?? 0) - uploadedEcwIds.size);

    // 7. Update upload record with final counts
    const finalStatus =
      errors.length > 0 ? 'Completed with Warnings' : 'Completed';

    const { data: finalUpload, error: finalErr } = await supabase
      .from('awv_uploads')
      .update({
        status: finalStatus,
        row_count: parsedRows.length,
        new_patients: newCount,
        updated_patients: updatedCount,
        flagged_patients: flaggedCount,
        validation_errors: errors.length > 0 ? errors : null,
      })
      .eq('id', (uploadRecord as { id: string }).id)
      .select()
      .single();

    if (finalErr) throw finalErr;

    return new Response(
      JSON.stringify({
        newPatients: newCount,
        updatedPatients: updatedCount,
        flaggedPatients: flaggedCount,
        errors,
        totalRows: parsedRows.length,
        uploadRecord: finalUpload,
      }),
      { status: 200, headers: jsonHeaders },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[awv-upload] POST error:', message);
    return new Response(
      JSON.stringify({ error: 'Upload processing failed', message }),
      { status: 500, headers: jsonHeaders },
    );
  }
}

// ─── Utilities ───────────────────────────────────────────────────────

function cptToType(cpt: string): string | null {
  const map: Record<string, string> = {
    G0402: 'IPPE',
    G0438: 'Initial AWV',
    G0439: 'Subsequent AWV',
  };
  return map[cpt] ?? null;
}
