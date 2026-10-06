import { authFetchJson } from "../auth/api";
import type {
  BlockFlowResponse,
  ConvertingPathsReportResponse,
  EntryPointRankBy,
  EntryPointsReportResponse,
  ExitPointRankBy,
  ExitPointsReportResponse,
  PageImpactReportResponse,
  SourceTrafficRankBy,
  SourceTrafficReportResponse
} from "../types";
import type { DateRange } from "../utils/dateRange";

function buildParams(
  range: DateRange,
  rankBy: string,
  segmentId?: number | null
): URLSearchParams {
  const params = new URLSearchParams({
    start: range.start,
    end: range.end,
    rankBy
  });

  if (segmentId !== undefined && segmentId !== null) {
    params.set("segmentId", String(segmentId));
  }

  return params;
}

export async function fetchEntryPointsReport(
  range: DateRange,
  rankBy: EntryPointRankBy,
  segmentId?: number | null
): Promise<EntryPointsReportResponse> {
  const params = buildParams(range, rankBy, segmentId);

  return authFetchJson<EntryPointsReportResponse>(`/api/attribution/entry-points?${params.toString()}`);
}

export async function fetchExitPointsReport(
  range: DateRange,
  rankBy: ExitPointRankBy,
  segmentId?: number | null
): Promise<ExitPointsReportResponse> {
  const params = buildParams(range, rankBy, segmentId);

  return authFetchJson<ExitPointsReportResponse>(`/api/attribution/exit-points?${params.toString()}`);
}

export async function fetchSourceTrafficReport(
  range: DateRange,
  rankBy: SourceTrafficRankBy,
  segmentId?: number | null
): Promise<SourceTrafficReportResponse> {
  const params = buildParams(range, rankBy, segmentId);

  return authFetchJson<SourceTrafficReportResponse>(`/api/attribution/source-traffic?${params.toString()}`);
}

export async function fetchPageImpactReport(
  range: DateRange,
  segmentId?: number | null
): Promise<PageImpactReportResponse> {
  const params = new URLSearchParams({
    start: range.start,
    end: range.end
  });

  if (segmentId !== undefined && segmentId !== null) {
    params.set("segmentId", String(segmentId));
  }

  return authFetchJson<PageImpactReportResponse>(`/api/attribution/page-impact?${params.toString()}`);
}

export async function fetchConvertingPathsReport(
  range: DateRange,
  segmentId?: number | null
): Promise<ConvertingPathsReportResponse> {
  const params = new URLSearchParams({
    start: range.start,
    end: range.end
  });

  if (segmentId !== undefined && segmentId !== null) {
    params.set("segmentId", String(segmentId));
  }

  return authFetchJson<ConvertingPathsReportResponse>(`/api/attribution/converting-paths?${params.toString()}`);
}

export async function fetchBlockFlowReport(
  range: DateRange,
  segmentId?: number | null,
  sourceChannel?: string | null
): Promise<BlockFlowResponse> {
  const params = new URLSearchParams({
    start: range.start,
    end: range.end
  });

  if (segmentId !== undefined && segmentId !== null) {
    params.set("segmentId", String(segmentId));
  }

  if (sourceChannel) {
    params.set("sourceChannel", sourceChannel);
  }

  return authFetchJson<BlockFlowResponse>(`/api/attribution/block-flow?${params.toString()}`);
}
