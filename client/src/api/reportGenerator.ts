import { authFetchJson } from "../auth/api";

export type ReportGeneratorStatus = "init" | "processing" | "completed" | "failed";

export type ReportCatalogEntry = {
  id: number;
  title: string;
  slug: string;
  description: string | null;
};

export type GenerateReportResult<T> =
  | ({ source: "bigquery"; report_generator_id?: number } & T)
  | ({ source: "cached"; report_generator_id: number } & T)
  | {
      source: "custom_model";
      report_generator_id: number;
      status: ReportGeneratorStatus;
      progress_percentage: number;
    };

export type ReportGeneratorStatusResponse<T> = {
  report_generator_id: number;
  status: ReportGeneratorStatus;
  progress_percentage: number;
  response_object: T | null;
};

export async function fetchReportCatalog(): Promise<ReportCatalogEntry[]> {
  return authFetchJson<ReportCatalogEntry[]>("/api/reports/catalog");
}

export async function generateReport<T>(
  identifier: { reportId: number } | { slug: string },
  projectId: number,
  payload: Record<string, unknown>
): Promise<GenerateReportResult<T>> {
  const body: Record<string, unknown> = {
    project_id: projectId,
    payload
  };

  if ("reportId" in identifier) {
    body.report_id = identifier.reportId;
  } else {
    body.slug = identifier.slug;
  }

  return authFetchJson<GenerateReportResult<T>>("/api/reports/generate", {
    method: "POST",
    body: JSON.stringify(body)
  });
}

export async function fetchReportGeneratorStatus<T>(
  reportGeneratorId: number
): Promise<ReportGeneratorStatusResponse<T>> {
  return authFetchJson<ReportGeneratorStatusResponse<T>>(`/api/reports/generate/${reportGeneratorId}`);
}

/**
 * Runs the generate -> (poll until completed) flow for a report that may be
 * produced either directly from BigQuery or by the async custom-model
 * pipeline, depending on the project's `report_source` setting.
 *
 * `onProgress` fires with the generator status while a custom-model report is
 * still being produced, so callers can show "generating..." UI.
 */
export async function generateAndAwaitReport<T>(
  identifier: { reportId: number } | { slug: string },
  projectId: number,
  payload: Record<string, unknown>,
  options?: {
    pollIntervalMs?: number;
    signal?: AbortSignal;
    onProgress?: (status: ReportGeneratorStatusResponse<T>) => void;
  }
): Promise<T> {
  const result = await generateReport<T>(identifier, projectId, payload);

  if (result.source !== "custom_model") {
    const { source: _source, report_generator_id: _reportGeneratorId, ...data } = result;
    return data as unknown as T;
  }

  const pollIntervalMs = options?.pollIntervalMs ?? 1000;

  return new Promise<T>((resolve, reject) => {
    const poll = async () => {
      if (options?.signal?.aborted) {
        reject(new DOMException("Aborted", "AbortError"));
        return;
      }

      try {
        const statusResponse = await fetchReportGeneratorStatus<T>(result.report_generator_id);
        options?.onProgress?.(statusResponse);

        if (statusResponse.status === "completed" && statusResponse.response_object) {
          resolve(statusResponse.response_object);
          return;
        }

        if (statusResponse.status === "failed") {
          reject(new Error("Report generation failed."));
          return;
        }

        setTimeout(poll, pollIntervalMs);
      } catch (error) {
        reject(error);
      }
    };

    void poll();
  });
}
