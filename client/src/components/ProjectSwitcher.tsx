import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { fetchProjects } from "../api/projects";
import { useActiveProject } from "../context/ActiveProjectContext";
import type { ProjectRecord } from "../types";

export function ProjectSwitcher() {
  const { activeProject, loading, switchProject } = useActiveProject();
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [open, setOpen] = useState(false);
  const [switching, setSwitching] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    let isMounted = true;

    fetchProjects()
      .then((data) => {
        if (isMounted) {
          setProjects(data);
        }
      })
      .catch(() => {
        if (isMounted) {
          setProjects([]);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [open]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  async function handleSelect(projectId: number) {
    if (activeProject?.id === projectId) {
      setOpen(false);
      return;
    }

    setSwitching(true);
    try {
      await switchProject(projectId);
      setOpen(false);
    } finally {
      setSwitching(false);
    }
  }

  const displayName = loading ? "Loading…" : activeProject?.name || "No project";
  const initial = displayName.charAt(0).toUpperCase() || "?";
  const statusLabel = activeProject
    ? activeProject.isConnected
      ? "BigQuery connected"
      : "Not connected"
    : "Create a project";

  return (
    <div className="project-switcher-wrap" ref={containerRef}>
      <button
        type="button"
        className="project-switcher"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="listbox"
        disabled={loading || switching}
      >
        <span className="project-avatar">{initial}</span>
        <div>
          <strong>{displayName}</strong>
          <small>{statusLabel}</small>
        </div>
        <span className="project-switcher-chevron" aria-hidden>
          ▾
        </span>
      </button>

      {open && (
        <div className="project-switcher-menu" role="listbox" aria-label="Switch project">
          {projects.length === 0 ? (
            <p className="project-switcher-empty">No projects yet.</p>
          ) : (
            projects.map((project) => (
              <button
                key={project.id}
                type="button"
                role="option"
                aria-selected={project.id === activeProject?.id}
                className={project.id === activeProject?.id ? "selected" : undefined}
                onClick={() => void handleSelect(project.id)}
                disabled={switching}
              >
                <span className="project-switcher-item-name">{project.name}</span>
                {project.isCurrent && <span className="project-switcher-check">✓</span>}
              </button>
            ))
          )}
          <Link className="project-switcher-manage" to="/dashboard/projects" onClick={() => setOpen(false)}>
            Manage projects
          </Link>
        </div>
      )}
    </div>
  );
}
