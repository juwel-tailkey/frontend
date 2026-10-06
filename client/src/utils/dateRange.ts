export type DateRange = {
  start: string;
  end: string;
};

export type DateRangePreset =
  | "this_week"
  | "this_month"
  | "this_year"
  | "last_7_days"
  | "last_30_days"
  | "custom";

export const DATE_RANGE_PRESETS: Array<{ id: DateRangePreset; label: string }> = [
  { id: "this_week", label: "This week" },
  { id: "this_month", label: "This month" },
  { id: "this_year", label: "This year" },
  { id: "last_7_days", label: "Last 7 days" },
  { id: "last_30_days", label: "Last 30 days" },
  { id: "custom", label: "Custom" }
];

function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function startOfWeek(date: Date): Date {
  const copy = new Date(date);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  return copy;
}

export function getDefaultDateRange(reference = new Date()): DateRange {
  const start = new Date(reference.getFullYear(), reference.getMonth(), 1);
  return {
    start: toIsoDate(start),
    end: toIsoDate(reference)
  };
}

export function resolvePreset(preset: DateRangePreset, reference = new Date()): DateRange {
  const end = toIsoDate(reference);

  switch (preset) {
    case "this_week":
      return { start: toIsoDate(startOfWeek(reference)), end };
    case "this_month":
      return {
        start: toIsoDate(new Date(reference.getFullYear(), reference.getMonth(), 1)),
        end
      };
    case "this_year":
      return {
        start: toIsoDate(new Date(reference.getFullYear(), 0, 1)),
        end
      };
    case "last_7_days": {
      const start = new Date(reference);
      start.setDate(start.getDate() - 6);
      return { start: toIsoDate(start), end };
    }
    case "last_30_days": {
      const start = new Date(reference);
      start.setDate(start.getDate() - 29);
      return { start: toIsoDate(start), end };
    }
    case "custom":
    default:
      return getDefaultDateRange(reference);
  }
}

export function formatDateRangeLabel(range: DateRange): string {
  const start = new Date(`${range.start}T00:00:00`);
  const end = new Date(`${range.end}T00:00:00`);
  const formatter = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" });
  return `${formatter.format(start)} – ${formatter.format(end)}`;
}
