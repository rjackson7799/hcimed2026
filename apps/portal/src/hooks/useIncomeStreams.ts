import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { formatTrend } from '@/utils/practice-health-formatters';
import type { KpiFilters, IncomeStreamData, IncomeStreamValue } from '@/types/practice-health';

/** Map Practice Health service line filter values to AWV/CCM module values */
const SERVICE_LINE_MAP: Record<string, string> = {
  hci_office: 'HCI Office',
  mobile_docs: 'Mobile Docs',
};

const CCM_CPT_CODES = ['99490', '99439', '99491'];
const RPM_CPT_CODES = ['99453', '99454', '99457', '99458'];

function getPreviousPeriod(start: string, end: string) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const durationMs = endDate.getTime() - startDate.getTime();
  const prevEnd = new Date(startDate.getTime() - 1);
  const prevStart = new Date(prevEnd.getTime() - durationMs);
  return {
    start: prevStart.toISOString().split('T')[0],
    end: prevEnd.toISOString().split('T')[0],
  };
}

function buildStreamValue(current: number, previous: number): IncomeStreamValue {
  return {
    current,
    previous,
    trend: formatTrend(current, previous),
  };
}

async function fetchAwvRevenue(
  startDate: string,
  endDate: string,
  serviceLine?: string
): Promise<number> {
  let query = supabase
    .from('awv_tracking')
    .select('billed_amount, awv_patients!inner(service_line)')
    .eq('completion_status', 'Completed')
    .gte('completion_date', startDate)
    .lte('completion_date', endDate)
    .not('billed_amount', 'is', null);

  if (serviceLine) {
    query = query.eq('awv_patients.service_line', serviceLine);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data || []).reduce((sum, row) => sum + (row.billed_amount ?? 0), 0);
}

async function fetchCcmRpmRevenue(
  startDate: string,
  endDate: string,
  serviceLine?: string
): Promise<{ ccm: number; rpm: number }> {
  let query = supabase
    .from('ccm_reimbursement')
    .select('cpt_code, paid_amount, ccm_enrollment!inner(ccm_patients!inner(service_line))')
    .gte('service_month', startDate)
    .lte('service_month', endDate);

  if (serviceLine) {
    query = query.eq('ccm_enrollment.ccm_patients.service_line', serviceLine);
  }

  const { data, error } = await query;
  if (error) throw error;

  let ccm = 0;
  let rpm = 0;
  for (const row of data || []) {
    const amount = row.paid_amount ?? 0;
    if (CCM_CPT_CODES.includes(row.cpt_code)) {
      ccm += amount;
    } else if (RPM_CPT_CODES.includes(row.cpt_code)) {
      rpm += amount;
    }
  }

  return { ccm, rpm };
}

export function useIncomeStreams(
  filters: KpiFilters,
  ecwEstCollections: number = 0,
  ecwEstCollectionsPrevious: number = 0
) {
  const mappedServiceLine = filters.serviceLine !== 'all'
    ? SERVICE_LINE_MAP[filters.serviceLine]
    : undefined;

  return useQuery({
    queryKey: ['income-streams', filters],
    queryFn: async (): Promise<IncomeStreamData> => {
      const prev = getPreviousPeriod(filters.dateRange.start, filters.dateRange.end);

      // Fetch current and previous periods in parallel
      const [awvCurrent, awvPrevious, ccmRpmCurrent, ccmRpmPrevious] = await Promise.all([
        fetchAwvRevenue(filters.dateRange.start, filters.dateRange.end, mappedServiceLine),
        fetchAwvRevenue(prev.start, prev.end, mappedServiceLine),
        fetchCcmRpmRevenue(filters.dateRange.start, filters.dateRange.end, mappedServiceLine),
        fetchCcmRpmRevenue(prev.start, prev.end, mappedServiceLine),
      ]);

      const totalCurrent = ecwEstCollections + awvCurrent + ccmRpmCurrent.ccm + ccmRpmCurrent.rpm;
      const totalPrevious = ecwEstCollectionsPrevious + awvPrevious + ccmRpmPrevious.ccm + ccmRpmPrevious.rpm;

      return {
        awv: buildStreamValue(awvCurrent, awvPrevious),
        ccm: buildStreamValue(ccmRpmCurrent.ccm, ccmRpmPrevious.ccm),
        rpm: buildStreamValue(ccmRpmCurrent.rpm, ccmRpmPrevious.rpm),
        total: buildStreamValue(totalCurrent, totalPrevious),
      };
    },
    staleTime: 30_000,
  });
}
