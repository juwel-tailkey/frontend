import type { ExitPointRow, ExitPointsReportResponse } from "../../types";
import { formatNumber, formatPercent } from "../../utils/format";
import { usePagination } from "../../hooks/usePagination";
import { TablePaginationTop, TablePaginationBottom } from "../ui/TablePagination";

type TopExitPointsTableProps = {
  data: ExitPointsReportResponse;
};

// Truncate text to a maximum length and add ellipsis
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

export function TopExitPointsTable({ data }: TopExitPointsTableProps) {
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
              <th>Unique View</th>
              <th>Sessions</th>
              <th>Top Source</th>
              <th>Exit Rate Vs. Prior Period</th>
            </tr>
          </thead>
          <tbody>
            {data.rows.length === 0 ? (
              <tr>
                <td colSpan={6}>No exit points found for the selected date range.</td>
              </tr>
            ) : (
              pagination.paginatedData.map((row) => (
                <tr key={`${row.rank}-${row.pageName}`}>
                  <td>{row.rank}</td>
                  <td className="entry-page-name" title={row.pageName}>
                    {truncateText(row.pageName, 50)}
                  </td>
                  <td>{formatNumber(row.uniqueViews)}</td>
                  <td>{formatNumber(row.sessions)}</td>
                  <td>
                    <TopSourcesCell sources={row.topSources} />
                  </td>
                  <td>
                    <ExitRateChange value={row.exitRateChangePercent} />
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

function TopSourcesCell({ sources }: { sources: ExitPointRow["topSources"] }) {
  if (sources.length === 0) {
    return <span className="entry-source-empty">—</span>;
  }

  return (
    <div className="entry-sources">
      {sources.map((source) => (
        <div key={source.label} className="entry-source-row">
          <span className="entry-source-label">{source.label}</span>
          <div className="entry-source-bar-wrap">
            <span className="entry-source-bar" style={{ width: `${Math.min(100, source.percentage)}%` }} />
          </div>
          <span className="entry-source-pct">{formatPercent(source.percentage)}</span>
        </div>
      ))}
    </div>
  );
}

function ExitRateChange({ value }: { value: number | null }) {
  if (value === null) {
    return <span className="trend-neutral">— N/A</span>;
  }

  if (value > 0) {
    return <span className="trend-down">▲ + {formatPercent(value)}</span>;
  }

  if (value < 0) {
    return <span className="trend-up">▼ - {formatPercent(Math.abs(value))}</span>;
  }

  return <span className="trend-neutral">— {formatPercent(0)}</span>;
}
