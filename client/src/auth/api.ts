import type { AuthUser } from "../types";

let csrfInitialized = false;

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[2]) : null;
}

function apiUrl(path: string): string {
  if (import.meta.env.DEV) {
    return path;
  }

  const base = String(import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");
  return base ? `${base}${path}` : path;
}

export async function ensureCsrf(): Promise<void> {
  if (csrfInitialized) {
    return;
  }

  await fetch(apiUrl("/sanctum/csrf-cookie"), { credentials: "include" });
  csrfInitialized = true;
}

export async function authFetch(path: string, init?: RequestInit): Promise<Response> {
  const method = (init?.method ?? "GET").toUpperCase();

  if (method !== "GET" && method !== "HEAD") {
    await ensureCsrf();
  }

  const headers = new Headers(init?.headers);
  headers.set("Accept", "application/json");

  if (init?.body && !headers.has("Content-Type")) {
    const isFormData = typeof FormData !== "undefined" && init.body instanceof FormData;
    if (!isFormData) {
      headers.set("Content-Type", "application/json");
    }
  }

  const xsrf = getCookie("XSRF-TOKEN");
  if (xsrf) {
    headers.set("X-XSRF-TOKEN", xsrf);
  }

  return fetch(apiUrl(path), {
    ...init,
    credentials: "include",
    headers
  });
}

export async function authFetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await authFetch(path, init);

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string; errors?: Record<string, string[]> } | null;
    const validationMessage = payload?.errors
      ? Object.values(payload.errors).flat().join(" ")
      : null;
    throw new Error(validationMessage || payload?.error || `Request failed for ${path}: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function fetchCurrentUser(): Promise<AuthUser | null> {
  const response = await authFetch("/api/user");

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Request failed for /api/user: ${response.status}`);
  }

  const data = (await response.json()) as { user: AuthUser };
  return data.user;
}

export type RegisterPayload = {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  password_confirmation: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export async function register(payload: RegisterPayload): Promise<AuthUser> {
  await ensureCsrf();
  const data = await authFetchJson<{ user: AuthUser }>("/api/register", {
    method: "POST",
    body: JSON.stringify(payload)
  });

  return data.user;
}

export async function login(payload: LoginPayload): Promise<AuthUser> {
  await ensureCsrf();
  const data = await authFetchJson<{ user: AuthUser }>("/api/login", {
    method: "POST",
    body: JSON.stringify(payload)
  });

  return data.user;
}

export async function logout(): Promise<void> {
  await authFetchJson<{ ok: boolean }>("/api/logout", { method: "POST" });
  csrfInitialized = false;
}
