import { authFetch, authFetchJson } from "../auth/api";
import type { GoalEndpoint, ProjectRecord } from "../types";
import type { DateRange } from "../utils/dateRange";

function jsonRequest(method: string, body: unknown): RequestInit {
  return {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  };
}

async function parseError(response: Response, fallback: string): Promise<never> {
  const payload = (await response.json().catch(() => null)) as {
    error?: string;
    errors?: Record<string, string[]>;
  } | null;
  const validationMessage = payload?.errors ? Object.values(payload.errors).flat().join(" ") : null;
  throw new Error(validationMessage || payload?.error || fallback);
}

export async function fetchProjects(): Promise<ProjectRecord[]> {
  const data = await authFetchJson<{ projects: ProjectRecord[] }>("/api/projects");
  return data.projects;
}

export async function fetchProject(id: number): Promise<ProjectRecord> {
  return authFetchJson<ProjectRecord>(`/api/projects/${id}`);
}

export async function createProject(formData: FormData): Promise<ProjectRecord> {
  const response = await authFetch("/api/projects", {
    method: "POST",
    body: formData
  });

  if (!response.ok) {
    await parseError(response, `Create failed: ${response.status}`);
  }

  return response.json() as Promise<ProjectRecord>;
}

export async function updateProject(id: number, formData: FormData): Promise<ProjectRecord> {
  const response = await authFetch(`/api/projects/${id}`, {
    method: "PUT",
    body: formData
  });

  if (!response.ok) {
    await parseError(response, `Update failed: ${response.status}`);
  }

  return response.json() as Promise<ProjectRecord>;
}

export async function deleteProject(id: number): Promise<void> {
  await authFetchJson<{ ok: boolean }>(`/api/projects/${id}`, { method: "DELETE" });
}

export async function fetchProjectGoals(projectId: number, range: DateRange): Promise<GoalEndpoint[]> {
  const params = new URLSearchParams({ start: range.start, end: range.end });
  const data = await authFetchJson<{ goals: GoalEndpoint[] }>(
    `/api/projects/${projectId}/goals?${params.toString()}`
  );
  return data.goals;
}

export async function updateProjectGoal(projectId: number, goal: GoalEndpoint): Promise<ProjectRecord> {
  return authFetchJson<ProjectRecord>(`/api/projects/${projectId}/goal`, jsonRequest("PUT", goal));
}
