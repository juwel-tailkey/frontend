import type { ConvertingPathNodeType, ConvertingPathsReportResponse } from "../../types";
import { formatNumber } from "../../utils/format";

type TopConvertingPathsProps = {
  data: ConvertingPathsReportResponse;
};

const LEGEND: Array<{ type: ConvertingPathNodeType; label: string }> = [
  { type: "entry", label: "Entry Point" },
  { type: "touchpoint", label: "Touchpoint" },
  { type: "goal", label: "Goal" }
];

export function TopConvertingPaths({ data }: TopConvertingPathsProps) {
  return (
    <section className="card converting-paths-card">
      <div className="converting-paths-header">
        <div>
          <h2>{data.title}</h2>
          <p className="attribution-report-description">
            Highest converting paths for the current conversion goal.
          </p>
        </div>
        <div className="converting-paths-legend">
          {LEGEND.map((item) => (
            <span key={item.type} className="converting-paths-legend-item">
              <span className={`path-node-dot ${item.type}`} />
              {item.label}
            </span>
          ))}
        </div>
      </div>

      {data.rows.length === 0 ? (
        <p className="converting-paths-empty">No converting paths found for the selected date range.</p>
      ) : (
        <div className="converting-paths-list">
          <div className="converting-paths-row converting-paths-row-head">
            <span className="converting-paths-conversions-head">Conversions</span>
            <span />
          </div>
          {data.rows.map((row) => (
            <div key={row.rank} className="converting-paths-row">
              <span className="converting-paths-conversions">{formatNumber(row.conversions)}</span>
              <div className="converting-paths-flow">
                {row.nodes.map((node, index) => (
                  <span key={`${row.rank}-${index}-${node.label}`} className="converting-paths-step">
                    <span className={`path-node ${node.type}`} title={node.label}>
                      {node.label}
                    </span>
                    {index < row.nodes.length - 1 ? <span className="converting-paths-chevron">›</span> : null}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
