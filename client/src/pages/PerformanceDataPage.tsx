import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { generateAndAwaitReport } from "../api/reportGenerator";
import { fetchSegments } from "../api/segments";
import { SourceTrafficOverview } from "../components/attribution/SourceTrafficOverview";
import { TopEntryPointsTable } from "../components/attribution/TopEntryPointsTable";
import { TopExitPointsTable } from "../components/attribution/TopExitPointsTable";
import { CardLoader } from "../components/ui/CardLoader";
import { DateRangePicker } from "../components/DateRangePicker";
import { useActiveProject } from "../context/ActiveProjectContext";
import { useDateRange } from "../context/DateRangeContext";
import type {
  EntryPointRankBy,
  EntryPointsReportResponse,
  ExitPointRankBy,
  ExitPointsReportResponse,
  SegmentRecord,
  SourceTrafficRankBy,
  SourceTrafficReportResponse
} from "../types";

function toSegmentId(value: string): number | null {
  return value ? Number(value) : null;
}

const SOURCE_RANK_BY_OPTIONS: Array<{ value: SourceTrafficRankBy; label: string }> = [
  { value: "unique_views", label: "Unique Views" },
  { value: "sessions", label: "Sessions" },
  { value: "bounce_rate", label: "Bounce Rate" },
  { value: "engagement_rate", label: "Engagement Rate" }
];

const ENTRY_RANK_BY_OPTIONS: Array<{ value: EntryPointRankBy; label: string }> = [
  { value: "unique_views", label: "Unique Views" },
  { value: "sessions", label: "Sessions" },
  { value: "cvr_to_goal", label: "CVR to Goal" }
];

const EXIT_RANK_BY_OPTIONS: Array<{ value: ExitPointRankBy; label: string }> = [
  { value: "unique_views", label: "Unique Views" },
  { value: "sessions", label: "Sessions" },
  { value: "exit_rate", label: "Exit Rate" }
];

export function PerformanceDataPage() {
  const { activeProject, loading: activeProjectLoading } = useActiveProject();
  const { dateRange, setDateRange } = useDateRange();

  const [activeSegments, setActiveSegments] = useState<SegmentRecord[]>([]);

  const [sourceRankBy, setSourceRankBy] = useState<SourceTrafficRankBy>("unique_views");
  const [sourceSegmentId, setSourceSegmentId] = useState("");
  const [sourceReport, setSourceReport] = useState<SourceTrafficReportResponse | null>(null);
  const [sourceLoading, setSourceLoading] = useState(false);
  const [sourceError, setSourceError] = useState<string | null>(null);
  const [sourceProgressMessage, setSourceProgressMessage] = useState<string | null>(null);

  const [entryRankBy, setEntryRankBy] = useState<EntryPointRankBy>("unique_views");
  const [entrySegmentId, setEntrySegmentId] = useState("");
  const [entryReport, setEntryReport] = useState<EntryPointsReportResponse | null>(null);
  const [entryLoading, setEntryLoading] = useState(false);
  const [entryError, setEntryError] = useState<string | null>(null);
  const [entryProgressMessage, setEntryProgressMessage] = useState<string | null>(null);

  const [exitRankBy, setExitRankBy] = useState<ExitPointRankBy>("unique_views");
  const [exitSegmentId, setExitSegmentId] = useState("");
  const [exitReport, setExitReport] = useState<ExitPointsReportResponse | null>(null);
  const [exitLoading, setExitLoading] = useState(false);
  const [exitError, setExitError] = useState<string | null>(null);
  const [exitProgressMessage, setExitProgressMessage] = useState<string | null>(null);

  const reportsEnabled = !activeProjectLoading && Boolean(activeProject?.isConnected && activeProject.goal);

  useEffect(() => {
    if (activeProjectLoading || !reportsEnabled) {
      setActiveSegments([]);
      return;
    }

    let isMounted = true;

    fetchSegments()
      .then((data) => {
        if (isMounted) {
          setActiveSegments(data.filter((segment) => segment.status === "active"));
        }
      })
      .catch(() => {
        if (isMounted) {
          setActiveSegments([]);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [reportsEnabled, activeProjectLoading, activeProject?.id]);

  useEffect(() => {
    if (activeProjectLoading) {
      return;
    }

    if (!reportsEnabled || !activeProject) {
      setSourceReport(null);
      setSourceError(null);
      setSourceLoading(false);
      setSourceProgressMessage(null);
      return;
    }

    let isMounted = true;
    const controller = new AbortController();
    setSourceLoading(true);
    setSourceError(null);
    setSourceReport(null);
    setSourceProgressMessage(null);

    generateAndAwaitReport<SourceTrafficReportResponse>(
      { slug: "source-traffic" },
      activeProject.id,
      {
        start: dateRange.start,
        end: dateRange.end,
        rankBy: sourceRankBy,
        segmentId: toSegmentId(sourceSegmentId)
      },
      {
        signal: controller.signal,
        onProgress: (status) => {
          if (isMounted) {
            setSourceProgressMessage(
              status.status === "completed" || status.status === "failed"
                ? null
                : `Generating report… ${status.progress_percentage}%`
            );
          }
        }
      }
    )
      .then((data) => {
        if (isMounted) {
          setSourceReport(data);
        }
      })
      .catch((requestError: unknown) => {
        const isAbort = requestError instanceof DOMException && requestError.name === "AbortError";
        if (isMounted && !isAbort) {
          setSourceError(requestError instanceof Error ? requestError.message : "Unable to load source traffic report.");
        }
      })
      .finally(() => {
        if (isMounted) {
          setSourceLoading(false);
          setSourceProgressMessage(null);
        }
      });

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [reportsEnabled, activeProjectLoading, activeProject?.id, dateRange, sourceRankBy, sourceSegmentId]);

  useEffect(() => {
    if (activeProjectLoading) {
      return;
    }

    if (!reportsEnabled || !activeProject) {
      setEntryReport(null);
      setEntryError(null);
      setEntryLoading(false);
      setEntryProgressMessage(null);
      return;
    }

    let isMounted = true;
    const controller = new AbortController();
    setEntryLoading(true);
    setEntryError(null);
    setEntryReport(null);
    setEntryProgressMessage(null);

    generateAndAwaitReport<EntryPointsReportResponse>(
      { slug: "top-entry-points-to-conversion" },
      activeProject.id,
      {
        start: dateRange.start,
        end: dateRange.end,
        rankBy: entryRankBy,
        segmentId: toSegmentId(entrySegmentId)
      },
      {
        signal: controller.signal,
        onProgress: (status) => {
          if (isMounted) {
            setEntryProgressMessage(
              status.status === "completed" || status.status === "failed"
                ? null
                : `Generating report… ${status.progress_percentage}%`
            );
          }
        }
      }
    )
      .then((data) => {
        if (isMounted) {
          setEntryReport(data);
        }
      })
      .catch((requestError: unknown) => {
        const isAbort = requestError instanceof DOMException && requestError.name === "AbortError";
        if (isMounted && !isAbort) {
          setEntryError(requestError instanceof Error ? requestError.message : "Unable to load entry points report.");
        }
      })
      .finally(() => {
        if (isMounted) {
          setEntryLoading(false);
          setEntryProgressMessage(null);
        }
      });

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [reportsEnabled, activeProjectLoading, activeProject?.id, dateRange, entryRankBy, entrySegmentId]);

  useEffect(() => {
    if (activeProjectLoading) {
      return;
    }

    if (!reportsEnabled || !activeProject) {
      setExitReport(null);
      setExitError(null);
      setExitLoading(false);
      setExitProgressMessage(null);
      return;
    }

    let isMounted = true;
    const controller = new AbortController();
    setExitLoading(true);
    setExitError(null);
    setExitReport(null);
    setExitProgressMessage(null);

    generateAndAwaitReport<ExitPointsReportResponse>(
      { slug: "exit-report-from-conversion-path" },
      activeProject.id,
      {
        start: dateRange.start,
        end: dateRange.end,
        rankBy: exitRankBy,
        segmentId: toSegmentId(exitSegmentId)
      },
      {
        signal: controller.signal,
        onProgress: (status) => {
          if (isMounted) {
            setExitProgressMessage(
              status.status === "completed" || status.status === "failed"
                ? null
                : `Generating report… ${status.progress_percentage}%`
            );
          }
        }
      }
    )
      .then((data) => {
        if (isMounted) {
          setExitReport(data);
        }
      })
      .catch((requestError: unknown) => {
        const isAbort = requestError instanceof DOMException && requestError.name === "AbortError";
        if (isMounted && !isAbort) {
          setExitError(requestError instanceof Error ? requestError.message : "Unable to load exit points report.");
        }
      })
      .finally(() => {
        if (isMounted) {
          setExitLoading(false);
          setExitProgressMessage(null);
        }
      });

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [reportsEnabled, activeProjectLoading, activeProject?.id, dateRange, exitRankBy, exitSegmentId]);

  if (activeProjectLoading) {
    return (
      <section className="state-card dashboard-state">
        <h1>Loading performance data</h1>
        <p>Fetching data for the current project…</p>
      </section>
    );
  }

  if (!activeProject) {
    return (
      <section className="state-card dashboard-state">
        <h1>No project selected</h1>
        <p>Create or select a project to view performance data.</p>
        <Link className="primary-button" to="/dashboard/projects">
          Go to projects
        </Link>
      </section>
    );
  }

  if (!activeProject.isConnected) {
    return (
      <section className="state-card dashboard-state">
        <h1>BigQuery not connected</h1>
        <p>
          Connect <strong>{activeProject.name}</strong> to BigQuery before viewing reports.
        </p>
        <Link className="primary-button" to={`/dashboard/projects/${activeProject.id}/edit`}>
          Connect BigQuery
        </Link>
      </section>
    );
  }

  if (!activeProject.goal) {
    return (
      <section className="state-card dashboard-state">
        <h1>Conversion goal not set</h1>
        <p>Set a conversion goal for <strong>{activeProject.name}</strong> to view performance data.</p>
        <Link className="primary-button" to="/dashboard/projects">
          Configure goal
        </Link>
      </section>
    );
  }

  return (
    <main className="dashboard-page attribution-page">
      <header className="dashboard-page-header attribution-report-header">
        <div>
          <h1>Performance data</h1>
          <p className="attribution-report-description">
            Entry and exit performance for the conversion path. Period data (Vs. Prior Period), based on data collected
            in the same period in the preceding year.
          </p>
        </div>
        <DateRangePicker value={dateRange} onChange={setDateRange} />
      </header>

      <p className="attribution-goal-hint performance-goal-hint">
        Goal: <strong>{activeProject.goal.path}</strong> ({activeProject.goal.type})
      </p>

      <section className="performance-report-section">
        <h2>Source Traffic Overview</h2>
        <p className="attribution-report-description">
          Traffic sources driving users into paths that lead to the conversion goal. All sessions are scoped to
          journeys that include at least one step toward the goal.
        </p>

        <div className="attribution-filters card">
          <label className="attribution-filter">
            <span>Rank By</span>
            <select value={sourceRankBy} onChange={(event) => setSourceRankBy(event.target.value as SourceTrafficRankBy)}>
              {SOURCE_RANK_BY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="attribution-filter">
            <span>Segment</span>
            <select value={sourceSegmentId} onChange={(event) => setSourceSegmentId(event.target.value)}>
              <option value="">All</option>
              {activeSegments.map((segment) => (
                <option key={segment.id} value={segment.id}>
                  {segment.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        {sourceLoading && !sourceReport ? (
          <section className="card entry-points-card entry-points-loading">
            <CardLoader
              message={sourceProgressMessage ?? "Loading source traffic overview"}
              subtitle={sourceProgressMessage ? "The custom model is generating your report…" : "Fetching data from BigQuery…"}
            />
          </section>
        ) : sourceError && !sourceReport ? (
          <section className="card entry-points-card entry-points-error">
            <h2>Report failed to load</h2>
            <p>{sourceError}</p>
          </section>
        ) : sourceReport ? (
          <SourceTrafficOverview data={sourceReport} />
        ) : null}
      </section>

      <section className="performance-report-section">
        <h2>Top Entry Points to Conversion</h2>
        <p className="attribution-report-description">
          Pages where user sessions begin, ranked by volume and conversion contribution.
        </p>

        <div className="attribution-filters card">
          <label className="attribution-filter">
            <span>Rank By</span>
            <select value={entryRankBy} onChange={(event) => setEntryRankBy(event.target.value as EntryPointRankBy)}>
              {ENTRY_RANK_BY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="attribution-filter">
            <span>Segment</span>
            <select value={entrySegmentId} onChange={(event) => setEntrySegmentId(event.target.value)}>
              <option value="">All</option>
              {activeSegments.map((segment) => (
                <option key={segment.id} value={segment.id}>
                  {segment.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        {entryLoading && !entryReport ? (
          <section className="card entry-points-card entry-points-loading">
            <CardLoader
              message={entryProgressMessage ?? "Loading top entry points"}
              subtitle={entryProgressMessage ? "The custom model is generating your report…" : "Fetching data from BigQuery…"}
            />
          </section>
        ) : entryError && !entryReport ? (
          <section className="card entry-points-card entry-points-error">
            <h2>Report failed to load</h2>
            <p>{entryError}</p>
          </section>
        ) : entryReport ? (
          <TopEntryPointsTable data={entryReport} />
        ) : null}
      </section>

      <section className="performance-report-section">
        <h2>Exit Report From Conversion Path</h2>
        <p className="attribution-report-description">
          Pages where users leave without converting, ranked by exit volume.
        </p>

        <div className="attribution-filters card">
          <label className="attribution-filter">
            <span>Rank By</span>
            <select value={exitRankBy} onChange={(event) => setExitRankBy(event.target.value as ExitPointRankBy)}>
              {EXIT_RANK_BY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="attribution-filter">
            <span>Segment</span>
            <select value={exitSegmentId} onChange={(event) => setExitSegmentId(event.target.value)}>
              <option value="">All</option>
              {activeSegments.map((segment) => (
                <option key={segment.id} value={segment.id}>
                  {segment.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        {exitLoading && !exitReport ? (
          <section className="card entry-points-card entry-points-loading">
            <CardLoader
              message={exitProgressMessage ?? "Loading top exit points"}
              subtitle={exitProgressMessage ? "The custom model is generating your report…" : "Fetching data from BigQuery…"}
            />
          </section>
        ) : exitError && !exitReport ? (
          <section className="card entry-points-card entry-points-error">
            <h2>Report failed to load</h2>
            <p>{exitError}</p>
          </section>
        ) : exitReport ? (
          <TopExitPointsTable data={exitReport} />
        ) : null}
      </section>
    </main>
  );
}
