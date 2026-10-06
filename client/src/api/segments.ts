import { authFetchJson } from "../auth/api";
import type { SegmentInput, SegmentRecord } from "../types";

function jsonRequest(method: string, body: unknown): RequestInit {
  return {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  };
}

export async function fetchSegments(): Promise<SegmentRecord[]> {
  const data = await authFetchJson<{ segments: SegmentRecord[] }>("/api/segments");
  return data.segments;
}

export async function createSegment(input: SegmentInput): Promise<SegmentRecord> {
  return authFetchJson<SegmentRecord>("/api/segments", jsonRequest("POST", input));
}

export async function updateSegment(id: number, input: SegmentInput): Promise<SegmentRecord> {
  return authFetchJson<SegmentRecord>(`/api/segments/${id}`, jsonRequest("PUT", input));
}

export async function deleteSegment(id: number): Promise<void> {
  await authFetchJson<{ ok: boolean }>(`/api/segments/${id}`, { method: "DELETE" });
}
