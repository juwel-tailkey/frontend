import { authFetch, authFetchJson } from "./auth/api";
import type {
  CountrySessionsResponse,
  GoalEndpoint,
  PagePathsResponse,
  PageviewsResponse,
  ProjectUpdate,
  SankeyResponse,
  SetupState
} from "./types";
import type { DateRange } from "./utils/dateRange";

function jsonRequest(method: "POST" | "PUT", body?: unknown): RequestInit {
  return {
    method,
    headers: {
      "Content-Type": "application/json"
    },
    body: body === undefined ? undefined : JSON.stringify(body)
  };
}

export async function fetchCountrySessions(range: DateRange): Promise<CountrySessionsResponse> {
  const params = new URLSearchParams({ start: range.start, end: range.end });
  return authFetchJson<CountrySessionsResponse>(`/api/charts/country-sessions?${params.toString()}`);
}

export async function fetchPageviews(range: DateRange): Promise<PageviewsResponse> {
  const params = new URLSearchParams({ start: range.start, end: range.end });
  return authFetchJson<PageviewsResponse>(`/api/charts/pageviews?${params.toString()}`);
}

export function fetchSankey(): Promise<SankeyResponse> {
  return authFetchJson<SankeyResponse>("/api/charts/sankey");
}

export function fetchPagePaths(): Promise<PagePathsResponse> {
  return authFetchJson<PagePathsResponse>("/api/tables/page-paths");
}

export function fetchSetupState(): Promise<SetupState> {
  return authFetchJson<SetupState>("/api/setup");
}

export function updateProjectSetup(update: ProjectUpdate): Promise<SetupState> {
  return authFetchJson<SetupState>("/api/setup/project", jsonRequest("PUT", update));
}

export async function connectBigQuery(formData: FormData): Promise<SetupState> {
  const response = await authFetch("/api/setup/connect", {
    method: "POST",
    body: formData
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      error?: string;
      errors?: Record<string, string[]>;
    } | null;
    const validationMessage = payload?.errors ? Object.values(payload.errors).flat().join(" ") : null;
    throw new Error(validationMessage || payload?.error || `Connect failed: ${response.status}`);
  }

  return response.json() as Promise<SetupState>;
}

export function fetchSetupGoals(range: DateRange): Promise<GoalEndpoint[]> {
  const params = new URLSearchParams({ start: range.start, end: range.end });
  return authFetchJson<{ goals: GoalEndpoint[] }>(`/api/setup/goals?${params.toString()}`).then(
    (data) => data.goals
  );
}

export function updateGoal(goal: GoalEndpoint): Promise<SetupState> {
  return authFetchJson<SetupState>("/api/setup/goal", jsonRequest("PUT", goal));
}

export function completeSetup(): Promise<SetupState> {
  return authFetchJson<SetupState>("/api/setup/complete", jsonRequest("POST"));
}
