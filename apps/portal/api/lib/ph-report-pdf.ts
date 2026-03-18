/**
 * Practice Health Report — PDF Template
 * Uses @react-pdf/renderer to build a branded 2-page LETTER PDF.
 */

import React from 'react';
import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  renderToBuffer,
  Font,
} from '@react-pdf/renderer';
import type { ReportData, KpiSummary, KpiTrend, ProviderRow, PayerMixEntry } from './ph-report-types';
import { StackedBarChart, DualLineChart, DonutChart, PIE_COLORS } from './ph-report-charts';

// ─── Font Registration ──────────────────────────────────────────────

Font.register({
  family: 'Source Sans',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/sourcesans3/v15/nwpBtKy2OAdR1K-IwhWudF-R9QMylBJAV3Bo8Ky461EN_io6npfB.ttf', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/sourcesans3/v15/nwpBtKy2OAdR1K-IwhWudF-R9QMylBJAV3Bo8Kya5FEN_io6npfB.ttf', fontWeight: 600 },
    { src: 'https://fonts.gstatic.com/s/sourcesans3/v15/nwpBtKy2OAdR1K-IwhWudF-R9QMylBJAV3Bo8Kyj5FEN_io6npfB.ttf', fontWeight: 700 },
  ],
});

// ─── Colors ─────────────────────────────────────────────────────────

const C = {
  navy: '#1B3A5C',
  teal: '#2A9D8F',
  text: '#1E293B',
  textMuted: '#64748B',
  bg: '#FFFFFF',
  cardBg: '#F8FAFC',
  border: '#E2E8F0',
  green: '#16A34A',
  red: '#DC2626',
};

// ─── Styles ─────────────────────────────────────────────────────────

const s = StyleSheet.create({
  page: {
    padding: 36,
    fontFamily: 'Source Sans',
    fontSize: 9,
    color: C.text,
    backgroundColor: C.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: C.navy,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: C.navy,
  },
  headerSub: {
    fontSize: 10,
    color: C.textMuted,
    marginTop: 2,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  headerPeriod: {
    fontSize: 11,
    fontWeight: 600,
    color: C.navy,
  },
  headerDate: {
    fontSize: 8,
    color: C.textMuted,
    marginTop: 2,
  },
  // KPI Cards
  kpiRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: C.cardBg,
    borderRadius: 4,
    padding: 10,
    borderWidth: 1,
    borderColor: C.border,
  },
  kpiLabel: {
    fontSize: 7,
    color: C.textMuted,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  kpiValue: {
    fontSize: 16,
    fontWeight: 700,
    color: C.navy,
    marginTop: 2,
  },
  kpiTrend: {
    fontSize: 7,
    marginTop: 3,
  },
  // Sections
  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: C.navy,
    marginBottom: 8,
    marginTop: 4,
  },
  chartContainer: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 4,
    padding: 10,
    backgroundColor: C.cardBg,
  },
  chartLabel: {
    fontSize: 9,
    fontWeight: 600,
    color: C.text,
    marginBottom: 6,
  },
  // Legend
  legendRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 6,
    justifyContent: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 7,
    color: C.textMuted,
  },
  // Table
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: C.navy,
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  tableHeaderCell: {
    fontSize: 7,
    fontWeight: 700,
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: C.border,
  },
  tableRowAlt: {
    backgroundColor: C.cardBg,
  },
  tableCell: {
    fontSize: 8,
    color: C.text,
  },
  // Operational metrics row
  opRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  opCard: {
    flex: 1,
    backgroundColor: C.cardBg,
    borderRadius: 4,
    padding: 10,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
  },
  opLabel: {
    fontSize: 7,
    color: C.textMuted,
    fontWeight: 600,
    textTransform: 'uppercase',
  },
  opValue: {
    fontSize: 14,
    fontWeight: 700,
    color: C.navy,
    marginTop: 2,
  },
  // Payer mix
  payerRow: {
    flexDirection: 'row',
    gap: 20,
    alignItems: 'center',
  },
  payerLegend: {
    flex: 1,
  },
  payerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  payerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  payerName: {
    fontSize: 8,
    color: C.text,
    flex: 1,
  },
  payerPct: {
    fontSize: 8,
    fontWeight: 600,
    color: C.navy,
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 36,
    right: 36,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 0.5,
    borderTopColor: C.border,
    paddingTop: 6,
  },
  footerText: {
    fontSize: 7,
    color: C.textMuted,
  },
});

// ─── Formatters (duplicated from portal to avoid import issues) ─────

function fmtCurrency(val: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(val);
}

function fmtNumber(val: number): string {
  return new Intl.NumberFormat('en-US').format(Math.round(val));
}

function fmtPct(val: number): string {
  const pct = val <= 1 && val >= 0 ? val * 100 : val;
  return `${pct.toFixed(1)}%`;
}

function fmtRvu(val: number): string {
  return val.toFixed(2);
}

function computeTrend(current: number, previous: number): KpiTrend {
  if (previous === 0) {
    return { direction: current > 0 ? 'up' : 'flat', percentage: 0, label: 'N/A' };
  }
  const change = ((current - previous) / previous) * 100;
  const abs = Math.abs(change);
  if (abs < 0.5) return { direction: 'flat', percentage: 0, label: '0%' };
  return {
    direction: change > 0 ? 'up' : 'down',
    percentage: abs,
    label: `${abs.toFixed(1)}%`,
  };
}

// ─── Sub-Components ─────────────────────────────────────────────────

function KpiCard({ label, value, trend }: { label: string; value: string; trend: KpiTrend }) {
  const arrow = trend.direction === 'up' ? '\u25B2' : trend.direction === 'down' ? '\u25BC' : '\u2014';
  const trendColor = trend.direction === 'up' ? C.green : trend.direction === 'down' ? C.red : C.textMuted;

  return React.createElement(View, { style: s.kpiCard },
    React.createElement(Text, { style: s.kpiLabel }, label),
    React.createElement(Text, { style: s.kpiValue }, value),
    React.createElement(Text, { style: { ...s.kpiTrend, color: trendColor } },
      `${arrow} ${trend.label} vs prior period`
    )
  );
}

function ProviderTable({ providers }: { providers: ProviderRow[] }) {
  const colWidths = ['28%', '12%', '12%', '14%', '18%', '16%'];

  return React.createElement(View, null,
    // Header
    React.createElement(View, { style: s.tableHeader },
      ['Provider', 'Role', 'Visits', 'wRVU', 'Billed', 'Collection'].map((h, i) =>
        React.createElement(Text, {
          key: h,
          style: { ...s.tableHeaderCell, width: colWidths[i] },
        }, h)
      )
    ),
    // Rows
    ...providers.map((p, i) =>
      React.createElement(View, {
        key: `prov-${i}`,
        style: { ...s.tableRow, ...(i % 2 === 1 ? s.tableRowAlt : {}) },
      },
        React.createElement(Text, { style: { ...s.tableCell, width: colWidths[0], fontWeight: 600 } }, p.providerName),
        React.createElement(Text, { style: { ...s.tableCell, width: colWidths[1] } }, p.role.toUpperCase()),
        React.createElement(Text, { style: { ...s.tableCell, width: colWidths[2] } }, fmtNumber(p.visits)),
        React.createElement(Text, { style: { ...s.tableCell, width: colWidths[3] } }, fmtRvu(p.wrvuTotal)),
        React.createElement(Text, { style: { ...s.tableCell, width: colWidths[4] } }, fmtCurrency(p.billedCharges)),
        React.createElement(Text, { style: { ...s.tableCell, width: colWidths[5] } }, fmtPct(p.collectionRate))
      )
    )
  );
}

function PayerMixSection({ data, entries }: { data: PayerMixEntry[]; entries: PayerMixEntry[] }) {
  return React.createElement(View, { style: s.payerRow },
    React.createElement(DonutChart, { data, size: 140 }),
    React.createElement(View, { style: s.payerLegend },
      ...entries.slice(0, 8).map((entry, i) =>
        React.createElement(View, { key: `payer-${i}`, style: s.payerItem },
          React.createElement(View, { style: { ...s.payerDot, backgroundColor: PIE_COLORS[i % PIE_COLORS.length] } }),
          React.createElement(Text, { style: s.payerName }, entry.payer),
          React.createElement(Text, { style: s.payerPct }, fmtPct(entry.percentage))
        )
      )
    )
  );
}

// ─── Main Document ──────────────────────────────────────────────────

function PracticeHealthReport({ data }: { data: ReportData }) {
  const { kpiCurrent: cur, kpiPrevious: prev } = data;
  const typeLabel = data.reportType === 'weekly' ? 'Weekly' : 'Monthly';

  return React.createElement(Document, {
    title: `HCI Practice Health ${typeLabel} Report - ${data.periodLabel}`,
    author: 'HCI Medical Group',
  },
    // ── Page 1: KPIs + Charts ──
    React.createElement(Page, { size: 'LETTER', style: s.page },
      // Header
      React.createElement(View, { style: s.header },
        React.createElement(View, null,
          React.createElement(Text, { style: s.headerTitle }, 'HCI Medical Group'),
          React.createElement(Text, { style: s.headerSub }, `Practice Health ${typeLabel} Report`)
        ),
        React.createElement(View, { style: s.headerRight },
          React.createElement(Text, { style: s.headerPeriod }, data.periodLabel),
          React.createElement(Text, { style: s.headerDate }, `Generated ${data.generatedAt}`)
        )
      ),

      // KPI Cards
      React.createElement(View, { style: s.kpiRow },
        React.createElement(KpiCard, {
          label: 'Total Visits',
          value: fmtNumber(cur.totalVisits),
          trend: computeTrend(cur.totalVisits, prev.totalVisits),
        }),
        React.createElement(KpiCard, {
          label: 'Billed Charges',
          value: fmtCurrency(cur.billedCharges),
          trend: computeTrend(cur.billedCharges, prev.billedCharges),
        }),
        React.createElement(KpiCard, {
          label: 'Est. Collections',
          value: fmtCurrency(cur.estCollections),
          trend: computeTrend(cur.estCollections, prev.estCollections),
        }),
        React.createElement(KpiCard, {
          label: 'wRVUs',
          value: fmtRvu(cur.totalWrvu),
          trend: computeTrend(cur.totalWrvu, prev.totalWrvu),
        }),
        React.createElement(KpiCard, {
          label: 'Collection Rate',
          value: fmtPct(cur.collectionRate),
          trend: computeTrend(cur.collectionRate, prev.collectionRate),
        })
      ),

      // Visit Volume Chart
      React.createElement(View, { style: s.chartContainer },
        React.createElement(Text, { style: s.chartLabel }, 'Visit Volume'),
        React.createElement(StackedBarChart, { data: data.visitVolume, width: 520, height: 160 }),
        React.createElement(View, { style: s.legendRow },
          React.createElement(View, { style: s.legendItem },
            React.createElement(View, { style: { ...s.legendDot, backgroundColor: C.teal } }),
            React.createElement(Text, { style: s.legendText }, 'New Patients')
          ),
          React.createElement(View, { style: s.legendItem },
            React.createElement(View, { style: { ...s.legendDot, backgroundColor: C.navy } }),
            React.createElement(Text, { style: s.legendText }, 'Established')
          )
        )
      ),

      // Charges vs Collections Chart
      React.createElement(View, { style: s.chartContainer },
        React.createElement(Text, { style: s.chartLabel }, 'Charges vs. Collections'),
        React.createElement(DualLineChart, { data: data.chargesCollections, width: 520, height: 160 }),
        React.createElement(View, { style: s.legendRow },
          React.createElement(View, { style: s.legendItem },
            React.createElement(View, { style: { ...s.legendDot, backgroundColor: C.navy } }),
            React.createElement(Text, { style: s.legendText }, 'Billed Charges')
          ),
          React.createElement(View, { style: s.legendItem },
            React.createElement(View, { style: { ...s.legendDot, backgroundColor: C.teal } }),
            React.createElement(Text, { style: s.legendText }, 'Est. Collections')
          )
        )
      ),

      // Footer
      React.createElement(View, { style: s.footer },
        React.createElement(Text, { style: s.footerText }, 'Generated by HCI Portal'),
        React.createElement(Text, { style: s.footerText }, 'CONFIDENTIAL — For Internal Use Only'),
        React.createElement(Text, { style: s.footerText }, 'Page 1 of 2')
      )
    ),

    // ── Page 2: Payer Mix + Providers + Operations ──
    React.createElement(Page, { size: 'LETTER', style: s.page },
      // Header (condensed)
      React.createElement(View, { style: { ...s.header, marginBottom: 14 } },
        React.createElement(Text, { style: { ...s.headerTitle, fontSize: 14 } }, `Practice Health ${typeLabel} Report`),
        React.createElement(Text, { style: s.headerPeriod }, data.periodLabel)
      ),

      // Payer Mix
      React.createElement(View, { style: s.chartContainer },
        React.createElement(Text, { style: s.chartLabel }, 'Payer Mix'),
        React.createElement(PayerMixSection, { data: data.payerMix, entries: data.payerMix })
      ),

      // Provider Productivity
      React.createElement(Text, { style: s.sectionTitle }, 'Provider Productivity'),
      React.createElement(View, { style: { marginBottom: 14 } },
        React.createElement(ProviderTable, { providers: data.providers })
      ),

      // Operational Summary
      React.createElement(Text, { style: s.sectionTitle }, 'Operational Summary'),
      React.createElement(View, { style: s.opRow },
        React.createElement(View, { style: s.opCard },
          React.createElement(Text, { style: s.opLabel }, 'No-Show Rate'),
          React.createElement(Text, { style: s.opValue }, fmtPct(data.operational.noShowRate > 1 ? data.operational.noShowRate / 100 : data.operational.noShowRate))
        ),
        React.createElement(View, { style: s.opCard },
          React.createElement(Text, { style: s.opLabel }, 'Avg Wait Time'),
          React.createElement(Text, { style: s.opValue }, `${Math.round(data.operational.avgWaitTime)} min`)
        ),
        React.createElement(View, { style: s.opCard },
          React.createElement(Text, { style: s.opLabel }, 'Schedule Utilization'),
          React.createElement(Text, { style: s.opValue }, fmtPct(data.operational.scheduleUtilization > 1 ? data.operational.scheduleUtilization / 100 : data.operational.scheduleUtilization))
        )
      ),

      // Footer
      React.createElement(View, { style: s.footer },
        React.createElement(Text, { style: s.footerText }, 'Generated by HCI Portal'),
        React.createElement(Text, { style: s.footerText }, 'CONFIDENTIAL — For Internal Use Only'),
        React.createElement(Text, { style: s.footerText }, 'Page 2 of 2')
      )
    )
  );
}

// ─── Public API ─────────────────────────────────────────────────────

export async function generateReportPdf(data: ReportData): Promise<Buffer> {
  const doc = React.createElement(PracticeHealthReport, { data });
  return renderToBuffer(doc);
}
