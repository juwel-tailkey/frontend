import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { createProject, fetchProject, updateProject } from "../api/projects";
import { BigQueryConnectionForm } from "../components/projects/BigQueryConnectionForm";
import { BigQueryHelpModal } from "../components/ui/BigQueryHelpModal";
import { CardLoader } from "../components/ui/CardLoader";
import { useActiveProject } from "../context/ActiveProjectContext";
import type { ProjectRecord } from "../types";

export function ProjectFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { refresh: refreshActiveProject } = useActiveProject();

  const [name, setName] = useState("");
  const [project, setProject] = useState<ProjectRecord | null>(null);
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  useEffect(() => {
    if (!isEdit || !id) {
      return;
    }

    let isMounted = true;
    setLoading(true);

    fetchProject(Number(id))
      .then((record) => {
        if (isMounted) {
          setProject(record);
          setName(record.name);
        }
      })
      .catch((loadError: unknown) => {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load project.");
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [id, isEdit]);

  async function handleSubmitConnection(formData: FormData) {
    if (!name.trim()) {
      throw new Error("Project name is required.");
    }

    formData.append("name", name.trim());

    setSaving(true);
    try {
      if (isEdit && id) {
        await updateProject(Number(id), formData);
      } else {
        await createProject(formData);
      }
      await refreshActiveProject();
      navigate("/dashboard/projects");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="setup-page">
        <div className="setup-content connect-step">
          <CardLoader
            message="Loading project"
            subtitle="Fetching project details…"
          />
        </div>
      </main>
    );
  }

  if (error && isEdit && !project) {
    return (
      <main className="setup-page">
        <div className="setup-content connect-step">
          <p className="setup-error">{error}</p>
          <Link to="/dashboard/projects">← Back to projects</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="setup-page">
      <div className="setup-content connect-step">
        <section className="setup-intro">
          <div className="setup-intro-header">
            <h1>{isEdit ? "Edit your project connection" : "Create your project connection"}</h1>
            <button
              type="button"
              className="help-button"
              onClick={() => setShowHelpModal(true)}
              aria-label="Show connection help"
            >
              <span className="help-icon">?</span>
              <span>How to connect</span>
            </button>
          </div>
          <div className="setup-intro-nav">
            <Link to="/dashboard/projects">← Back to projects</Link>
          </div>
          <p>
            {isEdit
              ? "Update your project settings and BigQuery connection. After connecting, you can analyze your GA4 data."
              : "Set up your project workspace. After connecting, you can analyze your GA4 data."}
          </p>
        </section>

        <section className="setup-panel">
          <h2>Project Details</h2>
          <div className="setup-form-grid">
            <label className="full-width">
              <span>Project name</span>
              <input
                value={name}
                placeholder="e.g. Account_Creation_CVR"
                onChange={(event) => setName(event.target.value)}
                required
              />
            </label>
          </div>
        </section>

        <section className="setup-panel">
          <BigQueryConnectionForm
            values={{
              gcpProjectId: project?.gcpProjectId || "",
              datasetId: project?.datasetId || "",
              location: project?.location || "US"
            }}
            existingFilename={project?.serviceAccountFilename}
            isConnected={project?.isConnected}
            selectedReport={project?.selectedReport}
            submitLabel={isEdit ? "Save project" : "Create project"}
            saving={saving}
            onSubmit={handleSubmitConnection}
          />
        </section>
      </div>

      <BigQueryHelpModal isOpen={showHelpModal} onClose={() => setShowHelpModal(false)} />
    </main>
  );
}
