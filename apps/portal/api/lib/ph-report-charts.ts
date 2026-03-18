/**
 * Practice Health Report — SVG Chart Generators
 * Pure functions that return @react-pdf/renderer SVG element props.
 * No DOM dependencies — runs in Node.js serverless environment.
 */

import React from 'react';
import { Svg, Rect, Path, Circle, Text as SvgText, G, Line } from '@react-pdf/renderer';
import type { VisitVolumePoint, ChargesCollectionsPoint, PayerMixEntry } from './ph-report-types';

// ─── Colors ─────────────────────────────────────────────────────────

const COLORS = {
  navy: '#1B3A5C',
  teal: '#2A9D8F',
  lightTeal: '#5EC4B6',
  coral: '#E76F51',
  gold: '#F4A261',
  purple: '#7C3AED',
  slate: '#64748B',
  lightGray: '#E2E8F0',
  textMuted: '#94A3B8',
};

const PIE_COLORS = [
  COLORS.navy,
  COLORS.teal,
  COLORS.coral,
  COLORS.gold,
  COLORS.purple,
  '#3B82F6',
  '#EC4899',
  '#10B981',
  '#F59E0B',
  '#8B5CF6',
];

// ─── Helpers ────────────────────────────────────────────────────────

function formatAxisDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function formatCompactCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

// ─── Stacked Bar Chart (Visit Volume) ───────────────────────────────

interface StackedBarProps {
  data: VisitVolumePoint[];
  width: number;
  height: number;
}

export function StackedBarChart({ data, width, height }: StackedBarProps) {
  if (data.length === 0) {
    return React.createElement(
      Svg,
      { width, height, viewBox: `0 0 ${width} ${height}` },
      React.createElement(SvgText, {
        x: width / 2,
        y: height / 2,
        style: { fontSize: 10, fontFamily: 'Helvetica', fill: COLORS.textMuted },
        textAnchor: 'middle',
      }, 'No data available')
    );
  }

  const padding = { top: 10, right: 10, bottom: 30, left: 40 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const maxVal = Math.max(...data.map(d => d.newPatients + d.established)) * 1.1 || 1;
  const barW = Math.max(4, (chartW / data.length) * 0.7);
  const gap = (chartW / data.length) * 0.3;

  const elements: React.ReactElement[] = [];

  // Y-axis gridlines
  for (let i = 0; i <= 4; i++) {
    const y = padding.top + chartH - (i / 4) * chartH;
    const val = Math.round((i / 4) * maxVal);
    elements.push(
      React.createElement(Line, {
        key: `grid-${i}`,
        x1: padding.left,
        y1: y,
        x2: width - padding.right,
        y2: y,
        stroke: COLORS.lightGray,
        strokeWidth: 0.5,
      }),
      React.createElement(SvgText, {
        key: `ylab-${i}`,
        x: padding.left - 4,
        y: y + 3,
        style: { fontSize: 7, fontFamily: 'Helvetica', fill: COLORS.textMuted },
        textAnchor: 'end',
      }, String(val))
    );
  }

  // Bars
  data.forEach((d, i) => {
    const x = padding.left + i * (barW + gap) + gap / 2;
    const estH = (d.established / maxVal) * chartH;
    const newH = (d.newPatients / maxVal) * chartH;

    // Established (bottom)
    elements.push(
      React.createElement(Rect, {
        key: `est-${i}`,
        x,
        y: padding.top + chartH - estH,
        width: barW,
        height: Math.max(0, estH),
        fill: COLORS.navy,
      })
    );

    // New patients (top, stacked)
    elements.push(
      React.createElement(Rect, {
        key: `new-${i}`,
        x,
        y: padding.top + chartH - estH - newH,
        width: barW,
        height: Math.max(0, newH),
        fill: COLORS.teal,
      })
    );

    // X-axis label (every Nth)
    const labelInterval = Math.max(1, Math.floor(data.length / 7));
    if (i % labelInterval === 0) {
      elements.push(
        React.createElement(SvgText, {
          key: `xlab-${i}`,
          x: x + barW / 2,
          y: padding.top + chartH + 14,
          style: { fontSize: 6, fontFamily: 'Helvetica', fill: COLORS.textMuted },
          textAnchor: 'middle',
        }, formatAxisDate(d.date))
      );
    }
  });

  return React.createElement(
    Svg,
    { width, height, viewBox: `0 0 ${width} ${height}` },
    ...elements
  );
}

// ─── Dual Line Chart (Charges vs Collections) ───────────────────────

interface DualLineProps {
  data: ChargesCollectionsPoint[];
  width: number;
  height: number;
}

export function DualLineChart({ data, width, height }: DualLineProps) {
  if (data.length === 0) {
    return React.createElement(
      Svg,
      { width, height, viewBox: `0 0 ${width} ${height}` },
      React.createElement(SvgText, {
        x: width / 2,
        y: height / 2,
        style: { fontSize: 10, fontFamily: 'Helvetica', fill: COLORS.textMuted },
        textAnchor: 'middle',
      }, 'No data available')
    );
  }

  const padding = { top: 10, right: 10, bottom: 30, left: 50 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const allVals = data.flatMap(d => [d.billed, d.collections]);
  const maxVal = Math.max(...allVals) * 1.1 || 1;

  const xScale = (i: number) => padding.left + (i / Math.max(1, data.length - 1)) * chartW;
  const yScale = (val: number) => padding.top + chartH - (val / maxVal) * chartH;

  const elements: React.ReactElement[] = [];

  // Y-axis gridlines
  for (let i = 0; i <= 4; i++) {
    const y = padding.top + chartH - (i / 4) * chartH;
    const val = (i / 4) * maxVal;
    elements.push(
      React.createElement(Line, {
        key: `grid-${i}`,
        x1: padding.left,
        y1: y,
        x2: width - padding.right,
        y2: y,
        stroke: COLORS.lightGray,
        strokeWidth: 0.5,
      }),
      React.createElement(SvgText, {
        key: `ylab-${i}`,
        x: padding.left - 4,
        y: y + 3,
        style: { fontSize: 7, fontFamily: 'Helvetica', fill: COLORS.textMuted },
        textAnchor: 'end',
      }, formatCompactCurrency(val))
    );
  }

  // Build path strings
  const billedPath = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${xScale(i)},${yScale(d.billed)}`).join(' ');
  const collectionsPath = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${xScale(i)},${yScale(d.collections)}`).join(' ');

  elements.push(
    React.createElement(Path, {
      key: 'billed-line',
      d: billedPath,
      stroke: COLORS.navy,
      strokeWidth: 2,
      fill: 'none',
    }),
    React.createElement(Path, {
      key: 'collections-line',
      d: collectionsPath,
      stroke: COLORS.teal,
      strokeWidth: 2,
      fill: 'none',
    })
  );

  // Data point markers
  data.forEach((d, i) => {
    elements.push(
      React.createElement(Circle, {
        key: `billed-dot-${i}`,
        cx: xScale(i),
        cy: yScale(d.billed),
        r: 2,
        fill: COLORS.navy,
      }),
      React.createElement(Circle, {
        key: `coll-dot-${i}`,
        cx: xScale(i),
        cy: yScale(d.collections),
        r: 2,
        fill: COLORS.teal,
      })
    );

    // X-axis labels
    const labelInterval = Math.max(1, Math.floor(data.length / 7));
    if (i % labelInterval === 0) {
      elements.push(
        React.createElement(SvgText, {
          key: `xlab-${i}`,
          x: xScale(i),
          y: padding.top + chartH + 14,
          style: { fontSize: 6, fontFamily: 'Helvetica', fill: COLORS.textMuted },
          textAnchor: 'middle',
        }, formatAxisDate(d.date))
      );
    }
  });

  return React.createElement(
    Svg,
    { width, height, viewBox: `0 0 ${width} ${height}` },
    ...elements
  );
}

// ─── Donut Chart (Payer Mix) ────────────────────────────────────────

interface DonutProps {
  data: PayerMixEntry[];
  size: number;
}

export function DonutChart({ data, size }: DonutProps) {
  if (data.length === 0) {
    return React.createElement(
      Svg,
      { width: size, height: size, viewBox: `0 0 ${size} ${size}` },
      React.createElement(SvgText, {
        x: size / 2,
        y: size / 2,
        style: { fontSize: 10, fontFamily: 'Helvetica', fill: COLORS.textMuted },
        textAnchor: 'middle',
      }, 'No data available')
    );
  }

  const cx = size / 2;
  const cy = size / 2;
  const outerR = size / 2 - 5;
  const innerR = outerR * 0.55;

  // Limit to top 8 payers, group rest as "Other"
  let entries = data.slice(0, 8);
  if (data.length > 8) {
    const otherPct = data.slice(8).reduce((s, d) => s + d.percentage, 0);
    const otherCharges = data.slice(8).reduce((s, d) => s + d.charges, 0);
    entries.push({ payer: 'Other', charges: otherCharges, percentage: otherPct });
  }

  const elements: React.ReactElement[] = [];
  let currentAngle = -Math.PI / 2; // Start at top

  entries.forEach((entry, i) => {
    const angle = entry.percentage * 2 * Math.PI;
    const endAngle = currentAngle + angle;

    const x1 = cx + outerR * Math.cos(currentAngle);
    const y1 = cy + outerR * Math.sin(currentAngle);
    const x2 = cx + outerR * Math.cos(endAngle);
    const y2 = cy + outerR * Math.sin(endAngle);
    const x3 = cx + innerR * Math.cos(endAngle);
    const y3 = cy + innerR * Math.sin(endAngle);
    const x4 = cx + innerR * Math.cos(currentAngle);
    const y4 = cy + innerR * Math.sin(currentAngle);

    const largeArc = angle > Math.PI ? 1 : 0;

    const d = [
      `M ${x1} ${y1}`,
      `A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2} ${y2}`,
      `L ${x3} ${y3}`,
      `A ${innerR} ${innerR} 0 ${largeArc} 0 ${x4} ${y4}`,
      'Z',
    ].join(' ');

    elements.push(
      React.createElement(Path, {
        key: `slice-${i}`,
        d,
        fill: PIE_COLORS[i % PIE_COLORS.length],
      })
    );

    currentAngle = endAngle;
  });

  return React.createElement(
    Svg,
    { width: size, height: size, viewBox: `0 0 ${size} ${size}` },
    ...elements
  );
}

export { PIE_COLORS };
