import type { SourceTrafficChannel, SourceTrafficReportResponse } from "../../types";
import { formatCompact, formatNumber, formatPercent } from "../../utils/format";

type SourceTrafficOverviewProps = {
  data: SourceTrafficReportResponse;
};

const CHANNEL_COLORS: Record<string, string> = {
  Organic: "#8fd4cf",
  CRM: "#22326b",
  Paid: "#3f6df0",
  Other: "#c9d1da"
};

function channelColor(label: string): string {
  return CHANNEL_COLORS[label] ?? "#c9d1da";
}

// Truncate text to a maximum length and add ellipsis
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

export function SourceTrafficOverview({ data }: SourceTrafficOverviewProps) {
  const averageBounce =
    data.rows.length > 0 ? data.rows.reduce((sum, row) => sum + row.bounceRate, 0) / data.rows.length : 0;
  const averageEngagement =
    data.rows.length > 0 ? data.rows.reduce((sum, row) => sum + row.engagementRate, 0) / data.rows.length : 0;

  return (
    <section className="card table-card entry-points-card">
      <div className="source-traffic-layout">
        <aside className="source-traffic-summary">
          <ChannelDonut channels={data.channels} totalUsers={data.totalUsers} />
          <div className="source-channels">
            {data.channels.map((channel) => (
              <div key={channel.label} className="source-channel-row">
                <span className="source-channel-head">
                  <span className="source-channel-dot" style={{ background: channelColor(channel.label) }} />
                  <span>{channel.label}</span>
                  <strong>{formatPercent(channel.percentage)}</strong>
                </span>
                <div className="entry-source-bar-wrap">
                  <span
                    className="entry-source-bar"
                    style={{ width: `${Math.min(100, channel.percentage)}%`, background: channelColor(channel.label) }}
                  />
                </div>
              </div>
            ))}
          </div>
        </aside>

        <div className="table-scroll entry-points-table-wrap">
          <table className="entry-points-table">
            <thead>
              <tr>
                <th>Source</th>
                <th>Unique View</th>
                <th>Sessions</th>
                <th>Bounce Rate</th>
                <th>Engagement Rate</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.length === 0 ? (
                <tr>
                  <td colSpan={5}>No traffic sources found for the selected date range.</td>
                </tr>
              ) : (
                data.rows.map((row) => (
                  <tr key={`${row.rank}-${row.label}`}>
                    <td className="entry-page-name" title={row.label}>
                      {truncateText(row.label, 45)}
                    </td>
                    <td>{formatNumber(row.uniqueViews)}</td>
                    <td>{formatNumber(row.sessions)}</td>
                    <td>
                      <span className={row.bounceRate > averageBounce ? "cvr-low" : "cvr-high"}>
                        {formatPercent(row.bounceRate)}
                      </span>
                    </td>
                    <td>
                      <span className={row.engagementRate >= averageEngagement ? "cvr-high" : "cvr-low"}>
                        {formatPercent(row.engagementRate)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function ChannelDonut({ channels, totalUsers }: { channels: SourceTrafficChannel[]; totalUsers: number }) {
  const size = 168;
  const strokeWidth = 26;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const total = channels.reduce((sum, channel) => sum + channel.sessions, 0);

  let offset = 0;
  const segments = channels.map((channel) => {
    const fraction = total > 0 ? channel.sessions / total : 0;
    const length = fraction * circumference;
    const segment = {
      label: channel.label,
      color: channelColor(channel.label),
      dashArray: `${length} ${circumference - length}`,
      dashOffset: -offset
    };
    offset += length;
    return segment;
  });

  return (
    <div className="source-donut">
      <svg viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Traffic by channel">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#eef1f5"
          strokeWidth={strokeWidth}
        />
        {segments.map((segment) => (
          <circle
            key={segment.label}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={segment.color}
            strokeWidth={strokeWidth}
            strokeDasharray={segment.dashArray}
            strokeDashoffset={segment.dashOffset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        ))}
      </svg>
      <div className="source-donut-center">
        <strong>{formatCompact(totalUsers)}</strong>
        <span>Total Users</span>
      </div>
    </div>
  );
}
