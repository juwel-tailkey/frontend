import type { EntryPointRow, EntryPointsReportResponse } from "../../types";
import { formatNumber, formatPercent } from "../../utils/format";
import { usePagination } from "../../hooks/usePagination";
import { TablePaginationTop, TablePaginationBottom } from "../ui/TablePagination";

type TopEntryPointsTableProps = {
  data: EntryPointsReportResponse;
};

// Truncate text to a maximum length and add ellipsis
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

export function TopEntryPointsTable({ data }: TopEntryPointsTableProps) {
  const pagination = usePagination(data.rows);

  const averageCvr =
    data.rows.length > 0 ? data.rows.reduce((sum, row) => sum + row.cvrToGoal, 0) / data.rows.length : 0;

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
              <th>Traffic Vs. Prior Period</th>
              <th>CVR to Goal</th>
            </tr>
          </thead>
          <tbody>
            {data.rows.length === 0 ? (
              <tr>
                <td colSpan={7}>No entry points found for the selected date range.</td>
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
                    <TrafficChange value={row.trafficChangePercent} />
                  </td>
                  <td>
                    <span className={row.cvrToGoal >= averageCvr ? "cvr-high" : "cvr-low"}>
                      {formatPercent(row.cvrToGoal)}
                    </span>
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

function TopSourcesCell({ sources }: { sources: EntryPointRow["topSources"] }) {
  if (sources.length === 0) {
    return <span className="entry-source-empty">—</span>;
  }

  // Show only top 3 sources
  const displayedSources = sources.slice(0, 3);
  const hasMoreSources = sources.length > 3;

  // Create tooltip text with all sources if there are more than 3
  const tooltipText = hasMoreSources
    ? sources.map(s => `${s.label}: ${formatPercent(s.percentage)}`).join('\n')
    : '';

  return (
    <div className="entry-sources" title={tooltipText || undefined}>
      {displayedSources.map((source) => (
        <div key={source.label} className="entry-source-row">
          <span className="entry-source-label">{source.label}</span>
          <div className="entry-source-bar-wrap">
            <span className="entry-source-bar" style={{ width: `${Math.min(100, source.percentage)}%` }} />
          </div>
          <span className="entry-source-pct">{formatPercent(source.percentage)}</span>
        </div>
      ))}
      {hasMoreSources && (
        <div className="entry-source-more">
          + {sources.length - 3} more source{sources.length - 3 > 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}

function TrafficChange({ value }: { value: number | null }) {
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
