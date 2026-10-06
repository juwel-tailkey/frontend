import { area, curveMonotoneX, extent, line, max, scaleLinear, scaleTime, timeFormat } from "d3";

import type { PageviewPoint, PageviewsResponse } from "../types";
import { formatCurrency, formatNumber } from "../utils/format";

type PageviewsChartProps = {
  data: PageviewsResponse;
};

const chartWidth = 760;
const chartHeight = 280;
const margin = { top: 24, right: 28, bottom: 34, left: 52 };

export function PageviewsChart({ data }: PageviewsChartProps) {
  const points = data.series.map((point) => ({
    ...point,
    parsedDate: new Date(`${point.date}T00:00:00`)
  }));

  const [minDate, maxDate] = extent(points, (point) => point.parsedDate);
  const maxValue = max(points, (point) => Math.max(point.pageviews, point.uniquePageviews)) ?? 0;
  const xScale = scaleTime()
    .domain([minDate ?? new Date(), maxDate ?? new Date()])
    .range([margin.left, chartWidth - margin.right]);
  const yScale = scaleLinear()
    .domain([0, maxValue * 1.12])
    .nice()
    .range([chartHeight - margin.bottom, margin.top]);

  const pageviewsLine = line<(typeof points)[number]>()
    .x((point) => xScale(point.parsedDate))
    .y((point) => yScale(point.pageviews))
    .curve(curveMonotoneX);
  const uniqueLine = line<(typeof points)[number]>()
    .x((point) => xScale(point.parsedDate))
    .y((point) => yScale(point.uniquePageviews))
    .curve(curveMonotoneX);
  const pageviewsArea = area<(typeof points)[number]>()
    .x((point) => xScale(point.parsedDate))
    .y0(chartHeight - margin.bottom)
    .y1((point) => yScale(point.pageviews))
    .curve(curveMonotoneX);
  const highlight = points[Math.floor(points.length * 0.45)] ?? points[0];

  return (
    <section className="card pageviews-card">
      <div className="chart-toolbar">
        <h2>{data.title}</h2>
      </div>

      <div className="chart-with-summary">
        <aside className="metric-stack">
          <Metric label="Pageviews" value={formatNumber(data.summary.pageviews)} color="#8fc7ff" />
          <Metric label="Unique pageviews" value={formatNumber(data.summary.uniquePageviews)} color="#a9e8ee" />
          <Metric label="Avg. time on page" value={data.summary.averageTimeOnPage} />
          <Metric label="Page value" value={formatCurrency(data.summary.pageValue)} />
        </aside>

        <svg className="pageviews-svg" viewBox={`0 0 ${chartWidth} ${chartHeight}`} role="img" aria-label={data.title}>
          <g className="grid-lines">
            {yScale.ticks(5).map((tick) => (
              <g key={tick}>
                <line x1={margin.left} x2={chartWidth - margin.right} y1={yScale(tick)} y2={yScale(tick)} />
                <text x={margin.left - 10} y={yScale(tick) + 4} textAnchor="end">
                  {formatNumber(tick)}
                </text>
              </g>
            ))}
          </g>
          <path className="area-fill" d={pageviewsArea(points) ?? undefined} />
          <path className="line pageviews-line" d={pageviewsLine(points) ?? undefined} />
          <path className="line unique-line" d={uniqueLine(points) ?? undefined} />

          {points
            .filter((_, index) => index % 3 === 0)
            .map((point) => (
              <text key={point.date} className="date-tick" x={xScale(point.parsedDate)} y={chartHeight - 10}>
                {timeFormat("%b %-d")(point.parsedDate)}
              </text>
            ))}

          {highlight && <Highlight point={highlight} x={xScale(highlight.parsedDate)} y={yScale(highlight.pageviews)} />}
        </svg>
      </div>
    </section>
  );
}

function Metric({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="metric-row">
      <span className="metric-dot" style={{ background: color || "transparent" }} />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Highlight({ point, x, y }: { point: PageviewPoint; x: number; y: number }) {
  return (
    <g className="chart-highlight">
      <line x1={x} x2={x} y1={26} y2={chartHeight - margin.bottom} />
      <circle cx={x} cy={y} r={5} />
      <g transform={`translate(${Math.max(88, x - 78)}, ${Math.max(42, y - 78)})`}>
        <rect width={156} height={58} rx={8} />
        <text x={14} y={20}>
          Pageviews: {formatNumber(point.pageviews)}
        </text>
        <text x={14} y={38}>
          Unique: {formatNumber(point.uniquePageviews)}
        </text>
      </g>
    </g>
  );
}
