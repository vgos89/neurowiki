import React, { useMemo, useState } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type {
  BoxPlotSummary,
  DistributionSegment,
  ForestPlotRow,
  GrottaBarVisualization,
  KaplanMeierPoint,
  KaplanMeierVisualization,
  LongitudinalBoxPlotVisualization,
  SubgroupForestPlotVisualization,
  TICIBarVisualization,
  TrialVisualization,
} from '../../data/trialVisualizations';
import { MRS_SEGMENTS, TICI_SEGMENTS } from '../../data/trialVisualizations';

const tooltipShadow = '0 18px 40px rgba(15, 23, 42, 0.18)';

interface HoveredSegment {
  x: number;
  y: number;
  title: string;
  description: string;
  value: number;
  color: string;
}

function getTextColor(segment: DistributionSegment): string {
  return segment.textColor ?? '#ffffff';
}

function formatPercent(value: number): string {
  return `${value.toFixed(1).replace(/\.0$/, '')}%`;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function DistributionChart({
  treatmentName,
  controlName,
  treatmentData,
  controlData,
  segments,
  showConnectors,
}: {
  treatmentName: string;
  controlName: string;
  treatmentData: number[];
  controlData: number[];
  segments: DistributionSegment[];
  showConnectors: boolean;
}) {
  const [tooltip, setTooltip] = useState<HoveredSegment | null>(null);

  const normalizedTreatment = useMemo(() => {
    const sum = treatmentData.reduce((acc, value) => acc + value, 0);
    return treatmentData.map((value) => (sum === 0 ? 0 : (value / sum) * 100));
  }, [treatmentData]);

  const normalizedControl = useMemo(() => {
    const sum = controlData.reduce((acc, value) => acc + value, 0);
    return controlData.map((value) => (sum === 0 ? 0 : (value / sum) * 100));
  }, [controlData]);

  const leftPad = 170;
  const rightPad = 24;
  const barWidth = 760;
  const barHeight = 36;
  const topY = 40;
  const bottomY = 116;
  const connectorStartY = topY + barHeight;
  const connectorEndY = bottomY;
  const totalWidth = leftPad + barWidth + rightPad;
  const totalHeight = 172;

  const handleSegmentHover = (
    event: React.MouseEvent<SVGRectElement>,
    segment: DistributionSegment,
    value: number,
  ) => {
    setTooltip({
      x: event.clientX + 12,
      y: event.clientY + 12,
      title: segment.label,
      description: segment.description,
      value,
      color: segment.color,
    });
  };

  const renderBar = (values: number[], y: number) => {
    let cursor = 0;
    return values.map((value, index) => {
      const width = (value / 100) * barWidth;
      const segment = segments[index];
      const x = leftPad + cursor;
      cursor += width;
      if (!segment) {
        return null;
      }

      return (
        <g key={`${segment.key}-${y}`}>
          <rect
            x={x}
            y={y}
            width={width}
            height={barHeight}
            rx={index === 0 || index === values.length - 1 ? 6 : 0}
            fill={segment.color}
            stroke="#ffffff"
            strokeWidth={1.5}
            onMouseMove={(event) => handleSegmentHover(event, segment, value)}
            onMouseLeave={() => setTooltip(null)}
          >
            <title>{`${segment.label}: ${formatPercent(value)}. ${segment.description}`}</title>
          </rect>
          {width > 38 ? (
            <text
              x={x + width / 2}
              y={y + barHeight / 2 + 4}
              textAnchor="middle"
              fontSize="11"
              fontWeight="700"
              fill={getTextColor(segment)}
            >
              {formatPercent(value)}
            </text>
          ) : null}
        </g>
      );
    });
  };

  const connectorLines = segments.slice(0, -1).map((segment, index) => {
    const treatmentOffset = normalizedTreatment
      .slice(0, index + 1)
      .reduce((acc, value) => acc + value, 0);
    const controlOffset = normalizedControl
      .slice(0, index + 1)
      .reduce((acc, value) => acc + value, 0);

    return (
      <line
        key={`connector-${segment.key}`}
        x1={leftPad + (treatmentOffset / 100) * barWidth}
        y1={connectorStartY}
        x2={leftPad + (controlOffset / 100) * barWidth}
        y2={connectorEndY}
        stroke="#94a3b8"
        strokeWidth={1.5}
        strokeDasharray="5 5"
        opacity={0.8}
      />
    );
  });

  return (
    <div className="relative">
      <div className="rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 p-3 sm:p-4 overflow-x-auto">
        <svg viewBox={`0 0 ${totalWidth} ${totalHeight}`} className="w-full min-w-[720px]">
          <text x={0} y={topY + 23} fontSize="15" fontWeight="700" fill="#0f172a" className="dark:fill-white">
            {treatmentName}
          </text>
          <text x={0} y={bottomY + 23} fontSize="15" fontWeight="700" fill="#0f172a" className="dark:fill-white">
            {controlName}
          </text>

          <rect x={leftPad} y={topY} width={barWidth} height={barHeight} rx={8} fill="#e2e8f0" />
          <rect x={leftPad} y={bottomY} width={barWidth} height={barHeight} rx={8} fill="#e2e8f0" />
          {showConnectors ? connectorLines : null}
          {renderBar(normalizedTreatment, topY)}
          {renderBar(normalizedControl, bottomY)}
        </svg>
      </div>

      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {segments.map((segment) => (
          <div
            key={segment.key}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/70 px-3 py-2"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="h-3 w-3 rounded-full border border-slate-300 dark:border-slate-600" style={{ backgroundColor: segment.color }} />
              <span className="text-xs font-semibold text-slate-900 dark:text-white">{segment.label}</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">{segment.description}</p>
          </div>
        ))}
      </div>

      {tooltip ? (
        <div
          className="pointer-events-none fixed z-50 max-w-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2"
          style={{ left: tooltip.x, top: tooltip.y, boxShadow: tooltipShadow }}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: tooltip.color }} />
            <span className="text-xs font-semibold text-slate-900 dark:text-white">{tooltip.title}</span>
          </div>
          <div className="text-xs font-medium text-slate-900 dark:text-white">{formatPercent(tooltip.value)}</div>
          <div className="text-xs text-slate-600 dark:text-slate-400">{tooltip.description}</div>
        </div>
      ) : null}
    </div>
  );
}

export function GrottaBarChart({ visualization }: { visualization: GrottaBarVisualization }) {
  return (
    <DistributionChart
      treatmentName={visualization.treatmentName}
      controlName={visualization.controlName}
      treatmentData={visualization.treatmentData}
      controlData={visualization.controlData}
      segments={visualization.segments ?? MRS_SEGMENTS}
      showConnectors
    />
  );
}

export function TICIBarChart({ visualization }: { visualization: TICIBarVisualization }) {
  const segments = TICI_SEGMENTS;
  const [tooltip, setTooltip] = useState<HoveredSegment | null>(null);
  const leftPad = 190;
  const rightPad = 24;
  const barWidth = 700;
  const barHeight = 34;
  const rowGap = 28;
  const totalWidth = leftPad + barWidth + rightPad;
  const totalHeight = visualization.rows.length * (barHeight + rowGap) + 20;

  return (
    <div className="relative">
      <div className="rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 p-3 sm:p-4 overflow-x-auto">
        <svg viewBox={`0 0 ${totalWidth} ${totalHeight}`} className="w-full min-w-[720px]">
          {visualization.rows.map((row, rowIndex) => {
            const normalized = (() => {
              const sum = row.data.reduce((acc, value) => acc + value, 0);
              return row.data.map((value) => (sum === 0 ? 0 : (value / sum) * 100));
            })();

            let cursor = 0;
            const y = 18 + rowIndex * (barHeight + rowGap);

            return (
              <g key={row.label}>
                <text x={0} y={y + 22} fontSize="15" fontWeight="700" fill="#0f172a" className="dark:fill-white">
                  {row.label}
                </text>
                <rect x={leftPad} y={y} width={barWidth} height={barHeight} rx={8} fill="#e2e8f0" />
                {normalized.map((value, segmentIndex) => {
                  const segment = segments[segmentIndex];
                  const width = (value / 100) * barWidth;
                  const x = leftPad + cursor;
                  cursor += width;

                  if (!segment) {
                    return null;
                  }

                  return (
                    <g key={`${row.label}-${segment.key}`}>
                      <rect
                        x={x}
                        y={y}
                        width={width}
                        height={barHeight}
                        fill={segment.color}
                        stroke="#ffffff"
                        strokeWidth={1.5}
                        onMouseMove={(event) =>
                          setTooltip({
                            x: event.clientX + 12,
                            y: event.clientY + 12,
                            title: segment.label,
                            description: segment.description,
                            value,
                            color: segment.color,
                          })
                        }
                        onMouseLeave={() => setTooltip(null)}
                      >
                        <title>{`${row.label} · ${segment.label}: ${formatPercent(value)}. ${segment.description}`}</title>
                      </rect>
                      {width > 38 ? (
                        <text
                          x={x + width / 2}
                          y={y + barHeight / 2 + 4}
                          textAnchor="middle"
                          fontSize="11"
                          fontWeight="700"
                          fill={getTextColor(segment)}
                        >
                          {formatPercent(value)}
                        </text>
                      ) : null}
                    </g>
                  );
                })}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {segments.map((segment) => (
          <div
            key={segment.key}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/70 px-3 py-2"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="h-3 w-3 rounded-full border border-slate-300 dark:border-slate-600" style={{ backgroundColor: segment.color }} />
              <span className="text-xs font-semibold text-slate-900 dark:text-white">{segment.label}</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">{segment.description}</p>
          </div>
        ))}
      </div>

      {tooltip ? (
        <div
          className="pointer-events-none fixed z-50 max-w-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2"
          style={{ left: tooltip.x, top: tooltip.y, boxShadow: tooltipShadow }}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: tooltip.color }} />
            <span className="text-xs font-semibold text-slate-900 dark:text-white">{tooltip.title}</span>
          </div>
          <div className="text-xs font-medium text-slate-900 dark:text-white">{formatPercent(tooltip.value)}</div>
          <div className="text-xs text-slate-600 dark:text-slate-400">{tooltip.description}</div>
        </div>
      ) : null}
    </div>
  );
}

function ForestRow({
  row,
  axisMin,
  axisMax,
  estimateType,
}: {
  row: ForestPlotRow;
  axisMin: number;
  axisMax: number;
  estimateType: string;
}) {
  const width = 260;
  const height = 26;
  const scale = (value: number) => ((value - axisMin) / (axisMax - axisMin)) * width;
  const nullX = scale(1);
  const ciLeft = clamp(scale(row.ciLower), 0, width);
  const ciRight = clamp(scale(row.ciUpper), 0, width);
  const pointX = clamp(scale(row.pointEstimate), 0, width);
  const squareSize = clamp(
    row.sampleSize ? 8 + Math.sqrt(row.sampleSize) / 3.2 : 10,
    9,
    18,
  );

  return (
    <div
      className="grid items-center gap-3"
      style={{ gridTemplateColumns: 'minmax(0, 2.1fr) 90px 90px minmax(260px, 1.7fr) 110px' }}
    >
      <div className="text-sm font-medium text-slate-900 dark:text-white">{row.label}</div>
      <div className="text-xs text-slate-600 dark:text-slate-400">{row.treatmentText ?? '—'}</div>
      <div className="text-xs text-slate-600 dark:text-slate-400">{row.controlText ?? '—'}</div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-7">
        <line x1={nullX} y1={1} x2={nullX} y2={height - 1} stroke="#94a3b8" strokeDasharray="3 3" />
        <line x1={ciLeft} y1={height / 2} x2={ciRight} y2={height / 2} stroke="#1e293b" strokeWidth={2} />
        <line x1={ciLeft} y1={6} x2={ciLeft} y2={height - 6} stroke="#1e293b" strokeWidth={1.5} />
        <line x1={ciRight} y1={6} x2={ciRight} y2={height - 6} stroke="#1e293b" strokeWidth={1.5} />
        <rect
          x={pointX - squareSize / 2}
          y={height / 2 - squareSize / 2}
          width={squareSize}
          height={squareSize}
          fill="#2563eb"
          opacity={0.92}
          rx={2}
        >
          <title>{`${estimateType} ${row.pointEstimate.toFixed(2)} (${row.ciLower.toFixed(2)}-${row.ciUpper.toFixed(2)})`}</title>
        </rect>
      </svg>
      <div className="text-xs font-semibold text-slate-900 dark:text-white">
        {row.pointEstimate.toFixed(2)} ({row.ciLower.toFixed(2)}-{row.ciUpper.toFixed(2)})
      </div>
    </div>
  );
}

export function SubgroupForestPlot({ visualization }: { visualization: SubgroupForestPlotVisualization }) {
  const axisMin = visualization.axisMin ?? 0.4;
  const axisMax = visualization.axisMax ?? 2.5;

  return (
    <div className="space-y-4">
      <div
        className="grid items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400"
        style={{ gridTemplateColumns: 'minmax(0, 2.1fr) 90px 90px minmax(260px, 1.7fr) 110px' }}
      >
        <div>Subgroup</div>
        <div>{visualization.treatmentName}</div>
        <div>{visualization.controlName}</div>
        <div>{visualization.estimateType} (95% CI)</div>
        <div>Value</div>
      </div>

      <div className="space-y-3">
        {visualization.rows.map((row) => (
          <ForestRow
            key={row.label}
            row={row}
            axisMin={axisMin}
            axisMax={axisMax}
            estimateType={visualization.estimateType}
          />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 pt-2 text-xs font-medium text-slate-500 dark:text-slate-400">
        <div>{visualization.favorsLeftLabel ?? `Favors ${visualization.controlName}`}</div>
        <div className="text-right">{visualization.favorsRightLabel ?? `Favors ${visualization.treatmentName}`}</div>
      </div>
    </div>
  );
}

function buildKaplanDataset(
  treatmentSeries: KaplanMeierPoint[],
  controlSeries: KaplanMeierPoint[],
) {
  const times = Array.from(
    new Set([...treatmentSeries.map((point) => point.time), ...controlSeries.map((point) => point.time)]),
  ).sort((a, b) => a - b);

  let treatmentProbability = treatmentSeries[0]?.probability ?? 100;
  let controlProbability = controlSeries[0]?.probability ?? 100;
  let treatmentIndex = 0;
  let controlIndex = 0;

  return times.map((time) => {
    while (treatmentSeries[treatmentIndex + 1] && treatmentSeries[treatmentIndex + 1].time <= time) {
      treatmentIndex += 1;
      treatmentProbability = treatmentSeries[treatmentIndex].probability;
    }
    while (controlSeries[controlIndex + 1] && controlSeries[controlIndex + 1].time <= time) {
      controlIndex += 1;
      controlProbability = controlSeries[controlIndex].probability;
    }

    return {
      time,
      treatment: treatmentProbability,
      control: controlProbability,
    };
  });
}

function CrossMarker(props: { cx?: number; cy?: number; fill?: string }) {
  const { cx = 0, cy = 0, fill = '#0f172a' } = props;
  return (
    <g>
      <line x1={cx - 5} y1={cy - 5} x2={cx + 5} y2={cy + 5} stroke={fill} strokeWidth={1.5} />
      <line x1={cx - 5} y1={cy + 5} x2={cx + 5} y2={cy - 5} stroke={fill} strokeWidth={1.5} />
    </g>
  );
}

export function KaplanMeierCurve({ visualization }: { visualization: KaplanMeierVisualization }) {
  const data = useMemo(
    () => buildKaplanDataset(visualization.treatmentSeries, visualization.controlSeries),
    [visualization.controlSeries, visualization.treatmentSeries],
  );

  return (
    <div className="space-y-4">
      <div className="h-80 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 p-3 sm:p-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 12, right: 16, left: 0, bottom: 12 }}>
            <CartesianGrid strokeDasharray="4 4" stroke="#cbd5e1" />
            <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={false} label={{ value: visualization.xLabel, position: 'insideBottom', offset: -4, fill: '#64748b' }} />
            <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={false} label={{ value: 'Cumulative probability (%)', angle: -90, position: 'insideLeft', fill: '#64748b' }} />
            <RechartsTooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
            <Legend />
            <ReferenceLine y={50} stroke="#e2e8f0" strokeDasharray="3 3" />
            <Line type="stepAfter" dataKey="treatment" stroke="#2563eb" strokeWidth={3} dot={false} name={visualization.treatmentName} />
            <Line type="stepAfter" dataKey="control" stroke="#0f172a" strokeWidth={3} dot={false} name={visualization.controlName} />
            {visualization.treatmentCensored?.length ? (
              <Scatter data={visualization.treatmentCensored} dataKey="probability" xAxisId={0} yAxisId={0} fill="#2563eb" shape={<CrossMarker fill="#2563eb" />} />
            ) : null}
            {visualization.controlCensored?.length ? (
              <Scatter data={visualization.controlCensored} dataKey="probability" xAxisId={0} yAxisId={0} fill="#0f172a" shape={<CrossMarker fill="#0f172a" />} />
            ) : null}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {visualization.hazardRatioText || visualization.logRankPValueText ? (
        <div className="rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
          {visualization.hazardRatioText ? <div><strong>HR:</strong> {visualization.hazardRatioText}</div> : null}
          {visualization.logRankPValueText ? <div><strong>Log-rank p:</strong> {visualization.logRankPValueText}</div> : null}
        </div>
      ) : null}
    </div>
  );
}

function getYBounds(points: LongitudinalBoxPlotVisualization['points'], fallbackMin?: number, fallbackMax?: number) {
  const values = points.flatMap((point) => [
    point.treatment.min,
    point.treatment.max,
    point.control.min,
    point.control.max,
  ]);
  const min = fallbackMin ?? Math.min(...values);
  const max = fallbackMax ?? Math.max(...values);
  return { min, max };
}

function drawBoxSummary(
  summary: BoxPlotSummary,
  xCenter: number,
  yScale: (value: number) => number,
  color: string,
) {
  const boxWidth = 22;
  const minY = yScale(summary.min);
  const q1Y = yScale(summary.q1);
  const medianY = yScale(summary.median);
  const q3Y = yScale(summary.q3);
  const maxY = yScale(summary.max);

  return (
    <g>
      <line x1={xCenter} y1={minY} x2={xCenter} y2={maxY} stroke={color} strokeWidth={1.5} />
      <line x1={xCenter - 7} y1={minY} x2={xCenter + 7} y2={minY} stroke={color} strokeWidth={1.5} />
      <line x1={xCenter - 7} y1={maxY} x2={xCenter + 7} y2={maxY} stroke={color} strokeWidth={1.5} />
      <rect
        x={xCenter - boxWidth / 2}
        y={q3Y}
        width={boxWidth}
        height={Math.max(q1Y - q3Y, 2)}
        fill={color}
        fillOpacity={0.2}
        stroke={color}
        strokeWidth={1.5}
        rx={3}
      />
      <line x1={xCenter - boxWidth / 2} y1={medianY} x2={xCenter + boxWidth / 2} y2={medianY} stroke={color} strokeWidth={2} />
    </g>
  );
}

export function LongitudinalBoxPlot({ visualization }: { visualization: LongitudinalBoxPlotVisualization }) {
  const width = 720;
  const height = 300;
  const paddingLeft = 58;
  const paddingRight = 24;
  const paddingTop = 18;
  const paddingBottom = 42;
  const chartHeight = height - paddingTop - paddingBottom;
  const chartWidth = width - paddingLeft - paddingRight;
  const { min, max } = getYBounds(visualization.points, visualization.yMin, visualization.yMax);
  const yScale = (value: number) => paddingTop + ((max - value) / (max - min || 1)) * chartHeight;
  const ticks = 5;

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 p-3 sm:p-4">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[720px]">
        {Array.from({ length: ticks + 1 }).map((_, index) => {
          const value = min + ((max - min) / ticks) * index;
          const y = yScale(value);
          return (
            <g key={value}>
              <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} stroke="#cbd5e1" strokeDasharray="4 4" />
              <text x={paddingLeft - 10} y={y + 4} textAnchor="end" fontSize="11" fill="#64748b">
                {value.toFixed(0)}
              </text>
            </g>
          );
        })}

        <text x={18} y={height / 2} transform={`rotate(-90 18 ${height / 2})`} fontSize="12" fill="#64748b">
          {visualization.yLabel}
        </text>

        {visualization.points.map((point, index) => {
          const groupWidth = chartWidth / visualization.points.length;
          const center = paddingLeft + groupWidth * index + groupWidth / 2;
          return (
            <g key={point.label}>
              {drawBoxSummary(point.treatment, center - 16, yScale, '#2563eb')}
              {drawBoxSummary(point.control, center + 16, yScale, '#0f172a')}
              <text x={center} y={height - 16} textAnchor="middle" fontSize="12" fill="#475569">
                {point.label}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-600 dark:text-slate-400">
        <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-blue-600" />{visualization.treatmentName}</span>
        <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-slate-900 dark:bg-slate-300" />{visualization.controlName}</span>
      </div>
    </div>
  );
}

function VisualizationCard({
  title,
  subtitle,
  interpretation,
  source,
  children,
}: React.PropsWithChildren<{
  title: string;
  subtitle?: string;
  interpretation?: string;
  source: TrialVisualization['source'];
}>) {
  return (
    <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 sm:p-6">
      <div className="mb-5">
        <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">{title}</h3>
        {subtitle ? <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{subtitle}</p> : null}
      </div>

      {children}

      {interpretation ? (
        <div className="mt-5 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 px-4 py-3">
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700 dark:text-blue-300 mb-1">Clinical Read</div>
          <p className="text-sm text-slate-700 dark:text-slate-300">{interpretation}</p>
        </div>
      ) : null}

      <div className="mt-4 text-xs text-slate-500 dark:text-slate-400">
        <div><strong>Source:</strong> {source.reference}</div>
        {source.endpoint ? <div><strong>Endpoint:</strong> {source.endpoint}</div> : null}
        {source.note ? <div><strong>Note:</strong> {source.note}</div> : null}
      </div>
    </section>
  );
}

export function TrialVisualizationSection({ visualizations }: { visualizations: TrialVisualization[] }) {
  if (visualizations.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="mb-5">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Visual Data</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Published outcome figures and subgroup structures rendered in a reusable chart system.
        </p>
      </div>

      <div className="space-y-6">
        {visualizations.map((visualization) => {
          switch (visualization.type) {
            case 'grotta-bar':
              return (
                <VisualizationCard key={visualization.title} {...visualization}>
                  <GrottaBarChart visualization={visualization} />
                </VisualizationCard>
              );
            case 'forest-plot':
              return (
                <VisualizationCard key={visualization.title} {...visualization}>
                  <SubgroupForestPlot visualization={visualization} />
                </VisualizationCard>
              );
            case 'tici-bar':
              return (
                <VisualizationCard key={visualization.title} {...visualization}>
                  <TICIBarChart visualization={visualization} />
                </VisualizationCard>
              );
            case 'kaplan-meier':
              return (
                <VisualizationCard key={visualization.title} {...visualization}>
                  <KaplanMeierCurve visualization={visualization} />
                </VisualizationCard>
              );
            case 'longitudinal-box-plot':
              return (
                <VisualizationCard key={visualization.title} {...visualization}>
                  <LongitudinalBoxPlot visualization={visualization} />
                </VisualizationCard>
              );
            default:
              return null;
          }
        })}
      </div>
    </div>
  );
}
