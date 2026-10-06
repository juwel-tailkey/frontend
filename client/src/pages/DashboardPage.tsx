import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { generateAndAwaitReport } from "../api/reportGenerator";
import { fetchSegments } from "../api/segments";
import { BlockView } from "../components/attribution/BlockView";
import { PageImpactTable } from "../components/attribution/PageImpactTable";
import { TopConvertingPaths } from "../components/attribution/TopConvertingPaths";
import { CardLoader } from "../components/ui/CardLoader";
import { DateRangePicker } from "../components/DateRangePicker";
import { useActiveProject } from "../context/ActiveProjectContext";
import { useDateRange } from "../context/DateRangeContext";
import type {
  BlockFlowResponse,
  ConvertingPathsReportResponse,
  PageImpactReportResponse,
  SegmentRecord
} from "../types";

function toSegmentId(value: string): number | null {
  return value ? Number(value) : null;
}

export function DashboardPage() {
  const { activeProject, loading: activeProjectLoading } = useActiveProject();
  const { dateRange, setDateRange } = useDateRange();

  const [activeSegments, setActiveSegments] = useState<SegmentRecord[]>([]);
  const [impactSegmentId, setImpactSegmentId] = useState("");
  const [impactReport, setImpactReport] = useState<PageImpactReportResponse | null>(null);
  const [impactLoading, setImpactLoading] = useState(false);
  const [impactError, setImpactError] = useState<string | null>(null);
  const [impactProgressMessage, setImpactProgressMessage] = useState<string | null>(null);

  const [pathsReport, setPathsReport] = useState<ConvertingPathsReportResponse | null>(null);
  const [pathsLoading, setPathsLoading] = useState(false);
  const [pathsError, setPathsError] = useState<string | null>(null);
  const [pathsProgressMessage, setPathsProgressMessage] = useState<string | null>(null);

  const [blockSegmentId, setBlockSegmentId] = useState("");
  const [blockSourceChannel, setBlockSourceChannel] = useState("");
  const [blockReport, setBlockReport] = useState<BlockFlowResponse | null>(null);
  const [blockLoading, setBlockLoading] = useState(false);
  const [blockError, setBlockError] = useState<string | null>(null);
  const [blockProgressMessage, setBlockProgressMessage] = useState<string | null>(null);

  const impactEnabled = !activeProjectLoading && Boolean(activeProject?.isConnected && activeProject.goal);

  useEffect(() => {
    if (activeProjectLoading || !impactEnabled) {
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
  }, [impactEnabled, activeProjectLoading, activeProject?.id]);

  useEffect(() => {
    if (activeProjectLoading) {
      return;
    }

    if (!impactEnabled || !activeProject) {
      setImpactReport(null);
      setImpactError(null);
      setImpactLoading(false);
      setImpactProgressMessage(null);
      return;
    }

    let isMounted = true;
    const controller = new AbortController();
    setImpactLoading(true);
    setImpactError(null);
    setImpactReport(null);
    setImpactProgressMessage(null);

    generateAndAwaitReport<PageImpactReportResponse>(
      { slug: "page-impact-report" },
      activeProject.id,
      {
        start: dateRange.start,
        end: dateRange.end,
        segmentId: toSegmentId(impactSegmentId)
      },
      {
        signal: controller.signal,
        onProgress: (status) => {
          if (isMounted) {
            setImpactProgressMessage(
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
          setImpactReport(data);
        }
      })
      .catch((requestError: unknown) => {
        const isAbort = requestError instanceof DOMException && requestError.name === "AbortError";
        if (isMounted && !isAbort) {
          setImpactError(requestError instanceof Error ? requestError.message : "Unable to load page impact.");
        }
      })
      .finally(() => {
        if (isMounted) {
          setImpactLoading(false);
          setImpactProgressMessage(null);
        }
      });

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [impactEnabled, activeProjectLoading, activeProject?.id, dateRange, impactSegmentId]);

  useEffect(() => {
    if (activeProjectLoading) {
      return;
    }

    if (!impactEnabled || !activeProject) {
      setPathsReport(null);
      setPathsError(null);
      setPathsLoading(false);
      setPathsProgressMessage(null);
      return;
    }

    let isMounted = true;
    const controller = new AbortController();
    setPathsLoading(true);
    setPathsError(null);
    setPathsReport(null);
    setPathsProgressMessage(null);

    generateAndAwaitReport<ConvertingPathsReportResponse>(
      { slug: "top-converting-paths" },
      activeProject.id,
      {
        start: dateRange.start,
        end: dateRange.end
      },
      {
        signal: controller.signal,
        onProgress: (status) => {
          if (isMounted) {
            setPathsProgressMessage(
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
          setPathsReport(data);
        }
      })
      .catch((requestError: unknown) => {
        const isAbort = requestError instanceof DOMException && requestError.name === "AbortError";
        if (isMounted && !isAbort) {
          setPathsError(requestError instanceof Error ? requestError.message : "Unable to load converting paths.");
        }
      })
      .finally(() => {
        if (isMounted) {
          setPathsLoading(false);
          setPathsProgressMessage(null);
        }
      });

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [impactEnabled, activeProjectLoading, activeProject?.id, dateRange]);

  useEffect(() => {
    if (activeProjectLoading) {
      return;
    }

    if (!impactEnabled || !activeProject) {
      setBlockReport(null);
      setBlockError(null);
      setBlockLoading(false);
      setBlockProgressMessage(null);
      return;
    }

    let isMounted = true;
    const controller = new AbortController();
    setBlockLoading(true);
    setBlockError(null);
    setBlockReport(null);
    setBlockProgressMessage(null);

    generateAndAwaitReport<BlockFlowResponse>(
      { slug: "block-view" },
      activeProject.id,
      {
        start: dateRange.start,
        end: dateRange.end,
        segmentId: toSegmentId(blockSegmentId),
        sourceChannel: blockSourceChannel || undefined
      },
      {
        signal: controller.signal,
        onProgress: (status) => {
          if (isMounted) {
            setBlockProgressMessage(
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
          setBlockReport(data);
        }
      })
      .catch((requestError: unknown) => {
        const isAbort = requestError instanceof DOMException && requestError.name === "AbortError";
        if (isMounted && !isAbort) {
          setBlockError(requestError instanceof Error ? requestError.message : "Unable to load block view.");
        }
      })
      .finally(() => {
        if (isMounted) {
          setBlockLoading(false);
          setBlockProgressMessage(null);
        }
      });

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [impactEnabled, activeProjectLoading, activeProject?.id, dateRange, blockSegmentId, blockSourceChannel]);

  if (activeProjectLoading) {
    return (
      <section className="state-card dashboard-state">
        <CardLoader
          message="Loading analytics dashboard"
          subtitle="Fetching data for the current project…"
        />
      </section>
    );
  }

  if (!activeProject) {
    return (
      <section className="state-card dashboard-state">
        <h1>No project selected</h1>
        <p>Create or select a project to view analytics.</p>
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

  return (
    <main className="dashboard-page">
      <header className="dashboard-page-header">
        <div>
          <p className="eyebrow">Tailkey Analytics</p>
          <h1>Audience and page analytics</h1>
          <p>
            Showing data for <strong>{activeProject.name}</strong>. Switch projects from the sidebar.
          </p>
        </div>
        <DateRangePicker value={dateRange} onChange={setDateRange} />
      </header>

      {activeProject.goal ? (
        <section className="performance-report-section">
          {pathsLoading && !pathsReport ? (
            <section className="card converting-paths-card">
              <CardLoader
                message={pathsProgressMessage ?? "Loading converting paths"}
                subtitle={pathsProgressMessage ? "The custom model is generating your report…" : "Fetching data from BigQuery…"}
              />
            </section>
          ) : pathsError && !pathsReport ? (
            <section className="card converting-paths-card">
              <h2>Top Converting Paths failed to load</h2>
              <p>{pathsError}</p>
            </section>
          ) : pathsReport ? (
            <TopConvertingPaths data={pathsReport} />
          ) : null}
        </section>
      ) : null}

      {activeProject.goal ? (
        <section className="performance-report-section">
          <h2>Block View</h2>
          <p className="attribution-report-description">
            Layered page flow showing onward actions per page with their click-through rate, colored by the page's
            ATB-Impact (Markov removal effect) toward the conversion goal.
          </p>

          {blockLoading && !blockReport ? (
            <section className="card block-view-card">
              <CardLoader
                message={blockProgressMessage ?? "Loading block view"}
                subtitle={blockProgressMessage ? "The custom model is generating your report…" : "Fetching data from BigQuery…"}
              />
            </section>
          ) : blockError && !blockReport ? (
            <section className="card block-view-card">
              <h2>Block View failed to load</h2>
              <p>{blockError}</p>
            </section>
          ) : blockReport ? (
            <BlockView
              data={blockReport}
              segments={activeSegments}
              segmentId={blockSegmentId}
              onSegmentChange={setBlockSegmentId}
              sourceChannel={blockSourceChannel}
              onSourceChannelChange={setBlockSourceChannel}
            />
          ) : null}
        </section>
      ) : null}

      <section className="performance-report-section">
        <h2>Page Impact Report</h2>
        <p className="attribution-report-description">
          Algorithmic attribution scores per page; how much each touchpoint contributes to the conversion goal,
          considering removal effect to rank page impact.
        </p>

        {!activeProject.goal ? (
          <section className="card entry-points-card entry-points-error">
            <h2>Conversion goal not set</h2>
            <p>
              Set a conversion goal for <strong>{activeProject.name}</strong> to view page impact attribution.
            </p>
            <Link className="primary-button" to="/dashboard/projects">
              Configure goal
            </Link>
          </section>
        ) : (
          <>
            <div className="attribution-filters card">
              <label className="attribution-filter">
                <span>Goal Set</span>
                <span className="attribution-filter-value">{activeProject.goal.path}</span>
              </label>
              <label className="attribution-filter">
                <span>Segment</span>
                <select value={impactSegmentId} onChange={(event) => setImpactSegmentId(event.target.value)}>
                  <option value="">All</option>
                  {activeSegments.map((segment) => (
                    <option key={segment.id} value={segment.id}>
                      {segment.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {impactLoading && !impactReport ? (
              <section className="card entry-points-card entry-points-loading">
                <CardLoader
                  message={impactProgressMessage ?? "Loading page impact report"}
                  subtitle={impactProgressMessage ? "The custom model is generating your report…" : "Fetching data from BigQuery…"}
                />
              </section>
            ) : impactError && !impactReport ? (
              <section className="card entry-points-card entry-points-error">
                <h2>Report failed to load</h2>
                <p>{impactError}</p>
              </section>
            ) : impactReport ? (
              <PageImpactTable data={impactReport} />
            ) : null}
          </>
        )}
      </section>
    </main>
  );
}
