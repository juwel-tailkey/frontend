import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { fetchSankey } from "../api";
import { SankeyChart } from "../components/SankeyChart";
import { useActiveProject } from "../context/ActiveProjectContext";
import type { SankeyResponse } from "../types";

export function AudienceFlowReportPage() {
  const { activeProject, loading: activeProjectLoading } = useActiveProject();
  const [sankey, setSankey] = useState<SankeyResponse | null>(null);
  const [chartsError, setChartsError] = useState<string | null>(null);
  const [chartsLoading, setChartsLoading] = useState(false);

  useEffect(() => {
    if (activeProjectLoading) {
      return;
    }

    if (!activeProject?.isConnected) {
      setSankey(null);
      setChartsError(null);
      setChartsLoading(false);
      return;
    }

    let isMounted = true;
    setChartsLoading(true);
    setChartsError(null);
    setSankey(null);

    fetchSankey()
      .then((data) => {
        if (isMounted) {
          setSankey(data);
        }
      })
      .catch((requestError: unknown) => {
        if (isMounted) {
          setChartsError(requestError instanceof Error ? requestError.message : "Unable to load the audience flow report.");
        }
      })
      .finally(() => {
        if (isMounted) {
          setChartsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [activeProject?.id, activeProject?.isConnected, activeProjectLoading]);

  if (activeProjectLoading) {
    return (
      <section className="state-card dashboard-state">
        <h1>Loading audience flow report</h1>
        <p>Fetching data for the current project…</p>
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
          <h1>Audience Flow Report</h1>
          <p>
            Showing data for <strong>{activeProject.name}</strong>. Switch projects from the sidebar.
          </p>
        </div>
      </header>

      {chartsLoading && !sankey ? (
        <section className="state-card dashboard-state">
          <p>Loading audience flow…</p>
        </section>
      ) : chartsError && !sankey ? (
        <section className="state-card dashboard-state">
          <h2>Audience flow failed to load</h2>
          <p>{chartsError}</p>
        </section>
      ) : sankey ? (
        <section className="card sankey-card">
          <div className="card-heading">
            <div>
              <p className="eyebrow">Primary Flow</p>
              <h2>{sankey.title}</h2>
            </div>
            <p>{sankey.subtitle}</p>
          </div>
          <SankeyChart data={sankey} />
        </section>
      ) : null}
    </main>
  );
}
