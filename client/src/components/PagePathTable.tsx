import type { PagePathsResponse } from "../types";
import { formatCurrency, formatNumber, formatPercent } from "../utils/format";

type PagePathTableProps = {
  data: PagePathsResponse;
};

export function PagePathTable({ data }: PagePathTableProps) {
  return (
    <section className="card table-card">
      <div className="chart-toolbar">
        <div>
          <p className="eyebrow">ATB Goal</p>
          <h2>{data.title}</h2>
        </div>
        <div className="range-tabs">
          <strong>All</strong>
          <span>Page</span>
          <span>Block</span>
          <span>Segment</span>
          <span>Source</span>
        </div>
      </div>

      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Page Path</th>
              <th>Pageviews</th>
              <th>Unique pageviews</th>
              <th>Avg. time on page</th>
              <th>Entrances</th>
              <th>% Exit</th>
              <th>Page value</th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row) => (
              <tr key={row.path}>
                <td>
                  <span className="rank">{row.rank}.</span> {row.path}
                </td>
                <td>
                  <MetricCell value={formatNumber(row.pageviews)} share={row.pageviewsShare} sparkline={row.sparkline} />
                </td>
                <td>
                  <MetricCell value={formatNumber(row.uniquePageviews)} share={row.uniquePageviewsShare} />
                </td>
                <td>{row.averageTimeOnPage}</td>
                <td>
                  <MetricCell value={formatNumber(row.entrances)} share={row.entrancesShare} />
                </td>
                <td>{formatPercent(row.exitRate)}</td>
                <td>{formatCurrency(row.pageValue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function MetricCell({ value, share, sparkline }: { value: string; share: number; sparkline?: number[] }) {
  return (
    <span className="metric-cell">
      <span>
        {value} <small>({formatPercent(share)})</small>
      </span>
      {sparkline && <Sparkline values={sparkline} />}
    </span>
  );
}

function Sparkline({ values }: { values: number[] }) {
  const width = 86;
  const height = 28;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const points = values
    .map((value, index) => {
      const x = (index / Math.max(1, values.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg className="sparkline" viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      <polyline points={points} />
    </svg>
  );
}
