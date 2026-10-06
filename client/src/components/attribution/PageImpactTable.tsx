import type { PageImpactLevel, PageImpactReportResponse } from "../../types";
import { formatNumber, formatPercent } from "../../utils/format";
import { usePagination } from "../../hooks/usePagination";
import { TablePaginationTop, TablePaginationBottom } from "../ui/TablePagination";

type PageImpactTableProps = {
  data: PageImpactReportResponse;
};

const IMPACT_LABELS: Record<PageImpactLevel, string> = {
  high: "High",
  medium: "Medium",
  low: "Low"
};

// Truncate text to a maximum length and add ellipsis
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

export function PageImpactTable({ data }: PageImpactTableProps) {
  const pagination = usePagination(data.rows);
  return (
    <section className="card table-card entry-points-card">
      <TablePaginationTop
        itemsPerPage={pagination.itemsPerPage}
        onItemsPerPageChange={pagination.handleItemsPerPageChange}
        startIndex={pagination.startIndex}
        endIndex={pagination.endIndex}
        totalItems={pagination.totalItems}
        itemsPerPageOptions={pagination.ITEMS_PER_PAGE_OPTIONS}
      />

      <div className="table-scroll entry-points-table-wrap">
        <table className="entry-points-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Page Name</th>
              <th>Removal Effect</th>
              <th>Attribution Value</th>
              <th>Impact</th>
              <th>Unique View</th>
              <th>Impact Vs. Prior Period</th>
            </tr>
          </thead>
          <tbody>
            {data.rows.length === 0 ? (
              <tr>
                <td colSpan={7}>No page impact data found for the selected date range.</td>
              </tr>
            ) : (
              pagination.paginatedData.map((row) => (
                <tr key={`${row.rank}-${row.pageName}`}>
                  <td>{row.rank}</td>
                  <td className="entry-page-name" title={row.pageName}>
                    {truncateText(row.pageName, 45)}
                  </td>
                  <td>
                    <ScoreBar value={row.removalEffect} />
                  </td>
                  <td>
                    <ScoreBar value={row.attributionValue} />
                  </td>
                  <td>
                    <span className={`impact-badge ${row.impact}`}>{IMPACT_LABELS[row.impact]}</span>
                  </td>
                  <td>{formatNumber(row.uniqueViews)}</td>
                  <td>
                    <ImpactChange value={row.impactChangePercent} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {data.rows.length > 0 && (
        <TablePaginationBottom
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPrevious={pagination.handlePrevious}
          onNext={pagination.handleNext}
        />
      )}
    </section>
  );
}

function ScoreBar({ value }: { value: number }) {
  const width = Math.max(0, Math.min(100, value * 100));

  return (
    <div className="score-meter">
      <div className="entry-source-bar-wrap">
        <span className="entry-source-bar" style={{ width: `${width}%` }} />
      </div>
      <span className="score-meter-value">{value.toFixed(2)}</span>
    </div>
  );
}

function ImpactChange({ value }: { value: number | null }) {
  if (value === null) {
    return <span className="trend-neutral">— N/A</span>;
  }

  if (value > 0) {
    return <span className="trend-up">▲ + {formatPercent(value)}</span>;
  }

  if (value < 0) {
    return <span className="trend-down">▼ - {formatPercent(Math.abs(value))}</span>;
  }

  return <span className="trend-neutral">— {formatPercent(0)}</span>;
}
