import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { fetchCountrySessions, fetchPagePaths, fetchPageviews } from "../api";
import { CountrySessions } from "../components/CountrySessions";
import { DateRangePicker } from "../components/DateRangePicker";
import { PagePathTable } from "../components/PagePathTable";
import { PageviewsChart } from "../components/PageviewsChart";
import { useActiveProject } from "../context/ActiveProjectContext";
import { useDateRange } from "../context/DateRangeContext";
import type { CountrySessionsResponse, PagePathsResponse, PageviewsResponse } from "../types";

export function PageLevelAttributionPage() {
  const { activeProject, loading: activeProjectLoading } = useActiveProject();
  const { dateRange, setDateRange } = useDateRange();
  const [pageviews, setPageviews] = useState<PageviewsResponse | null>(null);
  const [countries, setCountries] = useState<CountrySessionsResponse | null>(null);
  const [pagePaths, setPagePaths] = useState<PagePathsResponse | null>(null);
  const [pageviewsError, setPageviewsError] = useState<string | null>(null);
  const [countriesError, setCountriesError] = useState<string | null>(null);
  const [pagePathsError, setPagePathsError] = useState<string | null>(null);
  const [pageviewsLoading, setPageviewsLoading] = useState(false);
  const [countriesLoading, setCountriesLoading] = useState(false);
  const [pagePathsLoading, setPagePathsLoading] = useState(false);

  useEffect(() => {
    if (activeProjectLoading || !activeProject?.isConnected) {
      return;
    }

    let isMounted = true;
    setPageviewsLoading(true);
    setPageviewsError(null);
    setPageviews(null);

    fetchPageviews(dateRange)
      .then((data) => {
        if (isMounted) {
          setPageviews(data);
        }
      })
      .catch((requestError: unknown) => {
        if (isMounted) {
          setPageviewsError(requestError instanceof Error ? requestError.message : "Unable to load pageviews.");
        }
      })
      .finally(() => {
        if (isMounted) {
          setPageviewsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [activeProject?.id, activeProject?.isConnected, activeProjectLoading, dateRange]);

  useEffect(() => {
    if (activeProjectLoading || !activeProject?.isConnected) {
      return;
    }

    let isMounted = true;
    setCountriesLoading(true);
    setCountriesError(null);
    setCountries(null);

    fetchCountrySessions(dateRange)
      .then((data) => {
        if (isMounted) {
          setCountries(data);
        }
      })
      .catch((requestError: unknown) => {
        if (isMounted) {
          setCountriesError(
            requestError instanceof Error ? requestError.message : "Unable to load sessions by country."
          );
        }
      })
      .finally(() => {
        if (isMounted) {
          setCountriesLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [activeProject?.id, activeProject?.isConnected, activeProjectLoading, dateRange]);

  useEffect(() => {
    if (activeProjectLoading || !activeProject?.isConnected) {
      return;
    }

    let isMounted = true;
    setPagePathsLoading(true);
    setPagePathsError(null);
    setPagePaths(null);

    fetchPagePaths()
      .then((data) => {
        if (isMounted) {
          setPagePaths(data);
        }
      })
      .catch((requestError: unknown) => {
        if (isMounted) {
          setPagePathsError(requestError instanceof Error ? requestError.message : "Unable to load page path performance.");
        }
      })
      .finally(() => {
        if (isMounted) {
          setPagePathsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [activeProject?.id, activeProject?.isConnected, activeProjectLoading]);

  if (activeProjectLoading) {
    return (
      <section className="state-card dashboard-state">
        <h1>Loading page level attribution</h1>
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
          <h1>Page level attribution</h1>
          <p>
            Showing data for <strong>{activeProject.name}</strong>. Switch projects from the sidebar.
          </p>
        </div>
        <DateRangePicker value={dateRange} onChange={setDateRange} />
      </header>

      <section className="dashboard-grid">
        {pageviewsLoading ? (
          <section className="card pageviews-card chart-card-loading">
            <p>Loading pageviews…</p>
          </section>
        ) : pageviewsError ? (
          <section className="card pageviews-card chart-card-error">
            <h2>Pageviews — Market Analysis</h2>
            <p>{pageviewsError}</p>
          </section>
        ) : pageviews ? (
          <PageviewsChart data={pageviews} />
        ) : null}

        {countriesLoading ? (
          <section className="card country-card country-card-loading">
            <p>Loading sessions by country…</p>
          </section>
        ) : countriesError ? (
          <section className="card country-card country-card-error">
            <h2>Session by Country</h2>
            <p>{countriesError}</p>
          </section>
        ) : countries ? (
          <CountrySessions data={countries} />
        ) : null}
      </section>

      {pagePathsLoading ? (
        <section className="state-card dashboard-state">
          <p>Loading page path performance…</p>
        </section>
      ) : pagePathsError ? (
        <section className="state-card dashboard-state">
          <h2>Page Path Performance — Market Analysis</h2>
          <p>{pagePathsError}</p>
        </section>
      ) : pagePaths ? (
        <PagePathTable data={pagePaths} />
      ) : null}
    </main>
  );
}
