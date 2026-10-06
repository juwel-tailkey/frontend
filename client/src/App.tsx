import { useEffect, useState } from "react";
import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom";

import { GuestRoute } from "./components/GuestRoute";
import { ProtectedAppShell } from "./components/ProtectedAppShell";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { fetchSetupState } from "./api";
import { AdminLayout } from "./layouts/AdminLayout";
import { AudienceFlowReportPage } from "./pages/AudienceFlowReportPage";
import { DashboardPage } from "./pages/DashboardPage";
import { PageLevelAttributionPage } from "./pages/PageLevelAttributionPage";
import { PerformanceDataPage } from "./pages/PerformanceDataPage";
import { LoginPage } from "./pages/LoginPage";
import { PlaceholderPage } from "./pages/PlaceholderPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ProjectFormPage } from "./pages/ProjectFormPage";
import { ProjectsPage } from "./pages/ProjectsPage";
import { SegmentInputsPage } from "./pages/SegmentInputsPage";
import { SetupPage } from "./pages/SetupPage";

export function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route element={<ProtectedAppShell />}>
              <Route path="/" element={<SetupHomeRedirect />} />
              <Route element={<AdminLayout />}>
              <Route path="/setup" element={<SetupPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/dashboard/audience-flow-report" element={<AudienceFlowReportPage />} />
              <Route path="/dashboard/page-level-attribution" element={<PageLevelAttributionPage />} />
              <Route path="/dashboard/performance" element={<PerformanceDataPage />} />
              <Route path="/dashboard/segment-inputs" element={<SegmentInputsPage />} />
              <Route path="/dashboard/projects" element={<ProjectsPage />} />
              <Route path="/dashboard/projects/new" element={<ProjectFormPage />} />
              <Route path="/dashboard/projects/:id/edit" element={<ProjectFormPage />} />
              <Route path="/dashboard/*" element={<PlaceholderPage />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

function SetupHomeRedirect() {
  const [target, setTarget] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    fetchSetupState()
      .then((state) => {
        if (isMounted) {
          setTarget(state.completed ? "/dashboard" : "/setup");
        }
      })
      .catch(() => {
        if (isMounted) {
          setTarget("/setup");
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (!target) {
    return (
      <main className="state-card auth-state">
        <h1>Loading project</h1>
        <p>Checking setup status...</p>
      </main>
    );
  }

  return <Navigate to={target} replace />;
}
