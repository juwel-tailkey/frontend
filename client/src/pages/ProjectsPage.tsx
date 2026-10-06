import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  deleteProject,
  fetchProjectGoals,
  fetchProjects,
  updateProjectGoal
} from "../api/projects";
import { GoalEndpointModal, reconcileGoalSelection } from "../components/setup/GoalEndpointModal";
import { CardLoader } from "../components/ui/CardLoader";
import { useActiveProject } from "../context/ActiveProjectContext";
import { useDateRange } from "../context/DateRangeContext";
import type { GoalEndpoint, ProjectRecord } from "../types";

export function ProjectsPage() {
  const { switchProject, refresh: refreshActiveProject, activeProject } = useActiveProject();
  const { dateRange } = useDateRange();
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [goalModalProject, setGoalModalProject] = useState<ProjectRecord | null>(null);
  const [availableGoals, setAvailableGoals] = useState<GoalEndpoint[]>([]);
  const [pendingGoal, setPendingGoal] = useState<GoalEndpoint | null>(null);
  const [goalError, setGoalError] = useState<string | null>(null);
  const [goalSaving, setGoalSaving] = useState(false);
  const [goalsLoading, setGoalsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    fetchProjects()
      .then((data) => {
        if (isMounted) {
          setProjects(data);
        }
      })
      .catch((loadError: unknown) => {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load projects.");
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
  }, []);

  async function handleDelete(project: ProjectRecord) {
    if (!window.confirm(`Delete project "${project.name}"?`)) {
      return;
    }

    try {
      await deleteProject(project.id);
      setProjects((current) => current.filter((item) => item.id !== project.id));
      await refreshActiveProject();
    } catch (deleteError: unknown) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete project.");
    }
  }

  async function handleOpenGoalModal(project: ProjectRecord) {
    if (!project.isConnected) {
      window.alert("Connect this project to BigQuery before selecting a goal.");
      return;
    }

    setGoalError(null);
    setGoalModalProject(project);
    setPendingGoal(project.goal);
    setGoalsLoading(true);
    setAvailableGoals([]);

    try {
      const goals = await fetchProjectGoals(project.id, dateRange);
      setAvailableGoals(goals);
      setPendingGoal(reconcileGoalSelection(project.goal, goals));
    } catch (loadError: unknown) {
      setGoalError(loadError instanceof Error ? loadError.message : "Unable to load goals.");
      setAvailableGoals([]);
    } finally {
      setGoalsLoading(false);
    }
  }

  function handleCloseGoalModal() {
    setGoalModalProject(null);
    setAvailableGoals([]);
    setPendingGoal(null);
    setGoalError(null);
    setGoalSaving(false);
    setGoalsLoading(false);
  }

  async function handleUseProject(project: ProjectRecord) {
    try {
      await switchProject(project.id);
      setProjects((current) =>
        current.map((item) => ({
          ...item,
          isCurrent: item.id === project.id
        }))
      );
    } catch (switchError: unknown) {
      setError(switchError instanceof Error ? switchError.message : "Unable to switch project.");
    }
  }

  async function handleConfirmGoal(goal: GoalEndpoint) {
    if (!goalModalProject) {
      return;
    }

    setGoalSaving(true);
    setGoalError(null);

    try {
      const updated = await updateProjectGoal(goalModalProject.id, goal);
      setProjects((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      if (activeProject?.id === updated.id) {
        await refreshActiveProject();
      }
    } catch (saveError: unknown) {
      setGoalError(saveError instanceof Error ? saveError.message : "Unable to save goal.");
      setGoalSaving(false);
      throw saveError;
    }
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-page-header">
        <div>
          <h1>Projects</h1>
          <p>Manage BigQuery connections for your organisation.</p>
        </div>
        <Link className="primary-button" to="/dashboard/projects/new">
          New project
        </Link>
      </header>

      {error && <p className="setup-error">{error}</p>}

      {loading ? (
        <CardLoader
          message="Loading projects"
          subtitle="Fetching your projects…"
        />
      ) : projects.length === 0 ? (
        <section className="placeholder-card card">
          <h2>No projects yet</h2>
          <p>Create a project to connect it to BigQuery.</p>
          <button type="button" className="primary-button" onClick={() => navigate("/dashboard/projects/new")}>
            Create project
          </button>
        </section>
      ) : (
        <section className="card projects-table-card">
          <table className="projects-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>GCP Project ID</th>
                <th>Dataset</th>
                <th>Location</th>
                <th>Status</th>
                <th>Goal</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.id}>
                  <td>
                    {project.name}
                    {project.isCurrent && <span className="current-project-badge">Current</span>}
                  </td>
                  <td>{project.gcpProjectId || "—"}</td>
                  <td>{project.datasetId || "—"}</td>
                  <td>{project.location}</td>
                  <td>{project.isConnected ? "Connected" : "Not connected"}</td>
                  <td>{project.goal?.path ?? "—"}</td>
                  <td className="projects-actions">
                    {!project.isCurrent && (
                      <button type="button" className="link-button" onClick={() => void handleUseProject(project)}>
                        Use this project
                      </button>
                    )}
                    <button
                      type="button"
                      className="link-button"
                      disabled={!project.isConnected}
                      onClick={() => void handleOpenGoalModal(project)}
                    >
                      Goal
                    </button>
                    <Link className="link-button" to={`/dashboard/projects/${project.id}/edit`}>Edit</Link>
                    <button type="button" className="link-button" onClick={() => handleDelete(project)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {goalModalProject && (
        <GoalEndpointModal
          goals={availableGoals}
          selectedGoal={pendingGoal}
          onSelect={setPendingGoal}
          onConfirm={handleConfirmGoal}
          onClose={handleCloseGoalModal}
          saving={goalSaving}
          loading={goalsLoading}
          error={goalError}
        />
      )}
    </div>
  );
}
