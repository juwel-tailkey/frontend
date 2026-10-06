import { authFetchJson } from "../auth/api";
import type { ActiveProjectSummary } from "../types";

export async function fetchActiveProject(): Promise<ActiveProjectSummary | null> {
  const data = await authFetchJson<{ activeProject: ActiveProjectSummary | null }>("/api/active-project");
  return data.activeProject;
}

export async function activateProject(projectId: number): Promise<ActiveProjectSummary> {
  const data = await authFetchJson<{ activeProject: ActiveProjectSummary }>(`/api/projects/${projectId}/activate`, {
    method: "PUT"
  });
  return data.activeProject;
}
