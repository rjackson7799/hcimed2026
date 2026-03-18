/**
 * Practice Health Executive Summary — PDF Template
 * Uses @react-pdf/renderer to build a branded 4-page LETTER PDF
 * with AI insights, income stream breakdowns, and project stats.
 */

import React from 'react';
import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
  renderToBuffer,
  Font,
} from '@react-pdf/renderer';
import type {
  ExecutiveSummaryData,
  IncomeStreamData,
  KpiSummary,
  KpiTrend,
  ProviderRow,
  PayerMixEntry,
  FacilityRow,
  OutreachProjectRow,
} from './ph-report-types';
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
  amber: '#D97706',
  lightGreen: '#F0FDF4',
  lightAmber: '#FFFBEB',
  lightRed: '#FEF2F2',
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
  // Cover header
  coverHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 3,
    borderBottomColor: C.navy,
  },
  logo: {
    width: 160,
    height: 40,
  },
  coverTitle: {
    fontSize: 22,
    fontWeight: 700,
    color: C.navy,
  },
  coverSub: {
    fontSize: 11,
    color: C.textMuted,
    marginTop: 2,
  },
  coverRight: {
    alignItems: 'flex-end',
  },
  coverPeriod: {
    fontSize: 12,
    fontWeight: 600,
    color: C.navy,
  },
  coverDate: {
    fontSize: 8,
    color: C.textMuted,
    marginTop: 2,
  },
  // Page header (pages 2-4)
  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 14,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: C.navy,
  },
  pageTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: C.navy,
  },
  pagePeriod: {
    fontSize: 10,
    fontWeight: 600,
    color: C.navy,
  },
  // Insight sections
  insightSection: {
    marginBottom: 14,
    padding: 12,
    borderRadius: 4,
    borderLeftWidth: 4,
  },
  insightSectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    marginBottom: 6,
  },
  insightItem: {
    marginBottom: 5,
    flexDirection: 'row',
  },
  insightBullet: {
    fontSize: 9,
    marginRight: 6,
    marginTop: 1,
  },
  insightContent: {
    flex: 1,
  },
  insightItemTitle: {
    fontSize: 9,
    fontWeight: 700,
    color: C.text,
  },
  insightItemNarrative: {
    fontSize: 8,
    color: C.textMuted,
    marginTop: 1,
  },
  // KPI Cards
  kpiRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: C.cardBg,
    borderRadius: 4,
    padding: 8,
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
    fontSize: 14,
    fontWeight: 700,
    color: C.navy,
    marginTop: 2,
  },
  kpiTrend: {
    fontSize: 7,
    marginTop: 2,
  },
  // Section
  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: C.navy,
    marginBottom: 8,
    marginTop: 4,
  },
  // Charts
  chartContainer: {
    marginBottom: 12,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 4,
    padding: 8,
    backgroundColor: C.cardBg,
  },
  chartLabel: {
    fontSize: 9,
    fontWeight: 600,
    color: C.text,
    marginBottom: 4,
  },
  legendRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 4,
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
    marginBottom: 3,
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
  // Tables
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
  // Operational
  opRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  opCard: {
    flex: 1,
    backgroundColor: C.cardBg,
    borderRadius: 4,
    padding: 8,
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

// ─── Formatters ─────────────────────────────────────────────────────

function fmtCurrency(val: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD',
    minimumFractionDigits: 0, maximumFractionDigits: 0,
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
  if (previous === 0) return { direction: current > 0 ? 'up' : 'flat', percentage: 0, label: 'N/A' };
  const change = ((current - previous) / previous) * 100;
  const abs = Math.abs(change);
  if (abs < 0.5) return { direction: 'flat', percentage: 0, label: '0%' };
  return { direction: change > 0 ? 'up' : 'down', percentage: abs, label: `${abs.toFixed(1)}%` };
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

function InsightSection({ title, items, bgColor, borderColor, titleColor }: {
  title: string;
  items: Array<{ title: string; narrative: string; severity?: string }>;
  bgColor: string;
  borderColor: string;
  titleColor: string;
}) {
  if (items.length === 0) return null;

  return React.createElement(View, {
    style: { ...s.insightSection, backgroundColor: bgColor, borderLeftColor: borderColor },
  },
    React.createElement(Text, { style: { ...s.insightSectionTitle, color: titleColor } }, title),
    ...items.map((item, i) =>
      React.createElement(View, { key: `insight-${i}`, style: s.insightItem },
        React.createElement(Text, { style: { ...s.insightBullet, color: borderColor } }, '\u2022'),
        React.createElement(View, { style: s.insightContent },
          React.createElement(Text, { style: s.insightItemTitle }, item.title),
          React.createElement(Text, { style: s.insightItemNarrative }, item.narrative)
        )
      )
    )
  );
}

function IncomeStreamPage({ title, data, pageNum, totalPages, periodLabel }: {
  title: string;
  data: IncomeStreamData;
  pageNum: number;
  totalPages: number;
  periodLabel: string;
}) {
  const cur = data.kpiCurrent;
  const prev = data.kpiPrevious;

  return React.createElement(Page, { size: 'LETTER', style: s.page },
    // Header
    React.createElement(View, { style: s.pageHeader },
      React.createElement(Text, { style: s.pageTitle }, title),
      React.createElement(Text, { style: s.pagePeriod }, periodLabel)
    ),

    // KPI Cards
    React.createElement(View, { style: s.kpiRow },
      React.createElement(KpiCard, {
        label: 'Total Visits', value: fmtNumber(cur.totalVisits),
        trend: computeTrend(cur.totalVisits, prev.totalVisits),
      }),
      React.createElement(KpiCard, {
        label: 'Billed Charges', value: fmtCurrency(cur.billedCharges),
        trend: computeTrend(cur.billedCharges, prev.billedCharges),
      }),
      React.createElement(KpiCard, {
        label: 'Est. Collections', value: fmtCurrency(cur.estCollections),
        trend: computeTrend(cur.estCollections, prev.estCollections),
      }),
      React.createElement(KpiCard, {
        label: 'wRVUs', value: fmtRvu(cur.totalWrvu),
        trend: computeTrend(cur.totalWrvu, prev.totalWrvu),
      })
    ),

    // Charts side by side
    React.createElement(View, { style: { flexDirection: 'row', gap: 8, marginBottom: 12 } },
      // Visit Volume
      React.createElement(View, { style: { ...s.chartContainer, flex: 1 } },
        React.createElement(Text, { style: s.chartLabel }, 'Visit Volume'),
        React.createElement(StackedBarChart, { data: data.visitVolume, width: 240, height: 130 }),
        React.createElement(View, { style: s.legendRow },
          React.createElement(View, { style: s.legendItem },
            React.createElement(View, { style: { ...s.legendDot, backgroundColor: C.teal } }),
            React.createElement(Text, { style: s.legendText }, 'New')
          ),
          React.createElement(View, { style: s.legendItem },
            React.createElement(View, { style: { ...s.legendDot, backgroundColor: C.navy } }),
            React.createElement(Text, { style: s.legendText }, 'Established')
          )
        )
      ),
      // Charges vs Collections
      React.createElement(View, { style: { ...s.chartContainer, flex: 1 } },
        React.createElement(Text, { style: s.chartLabel }, 'Charges vs. Collections'),
        React.createElement(DualLineChart, { data: data.chargesCollections, width: 240, height: 130 }),
        React.createElement(View, { style: s.legendRow },
          React.createElement(View, { style: s.legendItem },
            React.createElement(View, { style: { ...s.legendDot, backgroundColor: C.navy } }),
            React.createElement(Text, { style: s.legendText }, 'Charges')
          ),
          React.createElement(View, { style: s.legendItem },
            React.createElement(View, { style: { ...s.legendDot, backgroundColor: C.teal } }),
            React.createElement(Text, { style: s.legendText }, 'Collections')
          )
        )
      )
    ),

    // Payer Mix
    React.createElement(View, { style: s.chartContainer },
      React.createElement(Text, { style: s.chartLabel }, 'Payer Mix'),
      React.createElement(View, { style: s.payerRow },
        React.createElement(DonutChart, { data: data.payerMix, size: 120 }),
        React.createElement(View, { style: s.payerLegend },
          ...data.payerMix.slice(0, 8).map((entry, i) =>
            React.createElement(View, { key: `payer-${i}`, style: s.payerItem },
              React.createElement(View, { style: { ...s.payerDot, backgroundColor: PIE_COLORS[i % PIE_COLORS.length] } }),
              React.createElement(Text, { style: s.payerName }, entry.payer),
              React.createElement(Text, { style: s.payerPct }, fmtPct(entry.percentage))
            )
          )
        )
      )
    ),

    // Facility Breakdown (Mobile Docs only)
    ...(data.facilities && data.facilities.length > 0 ? [
      React.createElement(Text, { key: 'fac-title', style: s.sectionTitle }, 'Facility Breakdown'),
      React.createElement(View, { key: 'fac-table' },
        React.createElement(View, { style: s.tableHeader },
          React.createElement(Text, { style: { ...s.tableHeaderCell, width: '50%' } }, 'Facility'),
          React.createElement(Text, { style: { ...s.tableHeaderCell, width: '25%' } }, 'Visits'),
          React.createElement(Text, { style: { ...s.tableHeaderCell, width: '25%' } }, 'Charges')
        ),
        ...data.facilities.map((f: FacilityRow, i: number) =>
          React.createElement(View, {
            key: `fac-row-${i}`,
            style: { ...s.tableRow, ...(i % 2 === 1 ? s.tableRowAlt : {}) },
          },
            React.createElement(Text, { style: { ...s.tableCell, width: '50%', fontWeight: 600 } }, f.facilityName),
            React.createElement(Text, { style: { ...s.tableCell, width: '25%' } }, fmtNumber(f.visits)),
            React.createElement(Text, { style: { ...s.tableCell, width: '25%' } }, fmtCurrency(f.charges))
          )
        )
      ),
    ] : []),

    // Footer
    React.createElement(View, { style: s.footer },
      React.createElement(Text, { style: s.footerText }, 'Generated by HCI Portal'),
      React.createElement(Text, { style: s.footerText }, 'CONFIDENTIAL — For Internal Use Only'),
      React.createElement(Text, { style: s.footerText }, `Page ${pageNum} of ${totalPages}`)
    )
  );
}

function ProviderTable({ providers }: { providers: ProviderRow[] }) {
  const colWidths = ['28%', '12%', '12%', '14%', '18%', '16%'];

  return React.createElement(View, null,
    React.createElement(View, { style: s.tableHeader },
      ['Provider', 'Role', 'Visits', 'wRVU', 'Billed', 'Collection'].map((h, i) =>
        React.createElement(Text, {
          key: h, style: { ...s.tableHeaderCell, width: colWidths[i] },
        }, h)
      )
    ),
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

function OutreachProjectsTable({ projects }: { projects: OutreachProjectRow[] }) {
  const colWidths = ['30%', '14%', '14%', '14%', '14%', '14%'];

  return React.createElement(View, null,
    React.createElement(View, { style: s.tableHeader },
      ['Project', 'Total', 'Called', 'Will Switch', 'Forwarded', 'Completed'].map((h, i) =>
        React.createElement(Text, {
          key: h, style: { ...s.tableHeaderCell, width: colWidths[i] },
        }, h)
      )
    ),
    ...projects.map((p, i) =>
      React.createElement(View, {
        key: `proj-${i}`,
        style: { ...s.tableRow, ...(i % 2 === 1 ? s.tableRowAlt : {}) },
      },
        React.createElement(Text, { style: { ...s.tableCell, width: colWidths[0], fontWeight: 600 } }, p.projectName),
        React.createElement(Text, { style: { ...s.tableCell, width: colWidths[1] } }, fmtNumber(p.totalPatients)),
        React.createElement(Text, { style: { ...s.tableCell, width: colWidths[2] } }, fmtNumber(p.called)),
        React.createElement(Text, { style: { ...s.tableCell, width: colWidths[3] } }, fmtNumber(p.willSwitch)),
        React.createElement(Text, { style: { ...s.tableCell, width: colWidths[4] } }, fmtNumber(p.forwarded)),
        React.createElement(Text, { style: { ...s.tableCell, width: colWidths[5] } }, fmtNumber(p.completed))
      )
    )
  );
}

// ─── Main Document ──────────────────────────────────────────────────

function ExecutiveSummaryReport({ data }: { data: ExecutiveSummaryData }) {
  const totalPages = 4;
  const logoUrl = 'https://hcimed.com/email/hci-logo.png';

  return React.createElement(Document, {
    title: `HCI Practice Health Executive Summary - ${data.periodLabel}`,
    author: 'HCI Medical Group',
  },
    // ── Page 1: Cover + AI Insights ──
    React.createElement(Page, { size: 'LETTER', style: s.page },
      // Cover Header with Logo
      React.createElement(View, { style: s.coverHeader },
        React.createElement(View, null,
          React.createElement(Image, { src: logoUrl, style: s.logo }),
          React.createElement(Text, { style: { ...s.coverSub, marginTop: 6 } }, 'Practice Health Executive Summary')
        ),
        React.createElement(View, { style: s.coverRight },
          React.createElement(Text, { style: s.coverPeriod }, data.periodLabel),
          React.createElement(Text, { style: s.coverDate }, `Generated ${data.generatedAt}`)
        )
      ),

      // AI Insights
      React.createElement(InsightSection, {
        title: 'Key Takeaways',
        items: data.insights.takeaways,
        bgColor: C.lightGreen,
        borderColor: C.green,
        titleColor: C.green,
      }),

      React.createElement(InsightSection, {
        title: 'Opportunities',
        items: data.insights.opportunities,
        bgColor: C.lightAmber,
        borderColor: C.amber,
        titleColor: C.amber,
      }),

      React.createElement(InsightSection, {
        title: 'Causes for Concern',
        items: data.insights.concerns,
        bgColor: C.lightRed,
        borderColor: C.red,
        titleColor: C.red,
      }),

      // If no insights yet, show placeholder
      ...(data.insights.takeaways.length === 0 && data.insights.opportunities.length === 0 && data.insights.concerns.length === 0
        ? [React.createElement(View, {
            key: 'no-insights',
            style: { ...s.insightSection, backgroundColor: C.cardBg, borderLeftColor: C.border },
          },
            React.createElement(Text, {
              style: { ...s.insightSectionTitle, color: C.textMuted },
            }, 'AI insights not yet generated. Use the "Regenerate Insights" button on the dashboard.')
          )]
        : []
      ),

      // Footer
      React.createElement(View, { style: s.footer },
        React.createElement(Text, { style: s.footerText }, 'Generated by HCI Portal'),
        React.createElement(Text, { style: s.footerText }, 'CONFIDENTIAL — For Internal Use Only'),
        React.createElement(Text, { style: s.footerText }, `Page 1 of ${totalPages}`)
      )
    ),

    // ── Page 2: HCI Office Income Stream ──
    React.createElement(IncomeStreamPage, {
      title: 'HCI Office',
      data: data.hciOffice,
      pageNum: 2,
      totalPages,
      periodLabel: data.periodLabel,
    }),

    // ── Page 3: Mobile Docs Income Stream ──
    React.createElement(IncomeStreamPage, {
      title: 'Mobile Docs',
      data: data.mobileDocs,
      pageNum: 3,
      totalPages,
      periodLabel: data.periodLabel,
    }),

    // ── Page 4: Projects & Providers ──
    React.createElement(Page, { size: 'LETTER', style: s.page },
      // Header
      React.createElement(View, { style: s.pageHeader },
        React.createElement(Text, { style: s.pageTitle }, 'Projects & Providers'),
        React.createElement(Text, { style: s.pagePeriod }, data.periodLabel)
      ),

      // Outreach Projects
      React.createElement(Text, { style: s.sectionTitle }, 'Patient Outreach Projects'),
      ...(data.outreachProjects.length > 0
        ? [React.createElement(View, { key: 'proj-table', style: { marginBottom: 16 } },
            React.createElement(OutreachProjectsTable, { projects: data.outreachProjects })
          )]
        : [React.createElement(Text, {
            key: 'no-projects',
            style: { fontSize: 9, color: C.textMuted, marginBottom: 16 },
          }, 'No active outreach projects.')]
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
          React.createElement(Text, { style: s.opValue },
            fmtPct(data.operational.noShowRate > 1 ? data.operational.noShowRate / 100 : data.operational.noShowRate)
          )
        ),
        React.createElement(View, { style: s.opCard },
          React.createElement(Text, { style: s.opLabel }, 'Avg Wait Time'),
          React.createElement(Text, { style: s.opValue }, `${Math.round(data.operational.avgWaitTime)} min`)
        ),
        React.createElement(View, { style: s.opCard },
          React.createElement(Text, { style: s.opLabel }, 'Schedule Utilization'),
          React.createElement(Text, { style: s.opValue },
            fmtPct(data.operational.scheduleUtilization > 1 ? data.operational.scheduleUtilization / 100 : data.operational.scheduleUtilization)
          )
        )
      ),

      // Footer
      React.createElement(View, { style: s.footer },
        React.createElement(Text, { style: s.footerText }, 'Generated by HCI Portal'),
        React.createElement(Text, { style: s.footerText }, 'CONFIDENTIAL — For Internal Use Only'),
        React.createElement(Text, { style: s.footerText }, `Page 4 of ${totalPages}`)
      )
    )
  );
}

// ─── Public API ─────────────────────────────────────────────────────

export async function generateExecutiveSummaryPdf(data: ExecutiveSummaryData): Promise<Buffer> {
  const doc = React.createElement(ExecutiveSummaryReport, { data });
  return renderToBuffer(doc);
}
